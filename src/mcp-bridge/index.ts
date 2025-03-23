/**
 * Copyright (C) 2024 PoAI (Lutz Leonhardt)
 * This file is part of mcpm, based on work by MCP Club
 * Licensed under the GNU AGPL v3.0
 * See LICENSE file for details
 */

import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Checks if UV is installed on the system
 * @returns Promise that resolves to true if UV is installed, false otherwise
 */
async function isUVInstalled(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const uvProcess = spawn('uv', ['--version']);

    uvProcess.on('error', () => {
      // Command not found
      resolve(false);
    });

    uvProcess.on('close', (code) => {
      // If exit code is 0, UV is installed
      resolve(code === 0);
    });
  });
}

/**
 * Starts the MCP-Bridge Python service
 * @param options Command options
 */
/**
 * Syncs Python dependencies using UV
 * @param mcpBridgePath Path to the mcp-bridge directory
 * @param currentDir Current working directory
 */
async function syncDependencies(mcpBridgePath: string, currentDir: string): Promise<void> {
  try {
    // Change to mcp-bridge directory
    process.chdir(mcpBridgePath);

    // Handle existing lock file by removing it and creating a new one
    if (fs.existsSync(path.join(mcpBridgePath, 'uv.lock'))) {
      // console.log('Existing uv.lock , removing and regenerating...');
      try {
        fs.unlinkSync(path.join(mcpBridgePath, 'uv.lock'));
        // console.log('Removed existing uv.lock file');
      } catch (e) {
        console.warn(`Failed to remove lock file: ${(e as Error).message}`);
      }

      // Now generate a new lock file
      await new Promise<void>((resolve) => {
        const lockProcess = spawn('uv', ['lock'], { stdio: 'inherit' });

        lockProcess.on('error', (err) => {
          console.warn(`Warning: Failed to create new lock file: ${err.message}`);
          resolve();
        });

        lockProcess.on('close', (code) => {
          if (code === 0) {
            // console.log('✓ Lock file created successfully');
          } else {
            console.warn(`Warning: Lock file creation exited with code ${code}`);
          }
          resolve();
        });
      });
    }

    // Now run uv sync
    await new Promise<void>((resolve) => {
      const syncProcess = spawn('uv', ['sync'], { stdio: 'inherit' });

      syncProcess.on('error', (err) => {
        console.warn(`Warning: Failed to run uv sync: ${err.message}`);
        // Just warn and continue
        resolve();
      });

      syncProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✓ Python dependencies synced successfully');
          resolve();
        } else {
          console.warn(`Warning: uv sync exited with code ${code}`);
          // Just warn and continue
          resolve();
        }
      });
    });
  } catch (error) {
    console.warn(`Warning during dependency sync: ${(error as Error).message}`);
    // Continue with bridge starting process anyway
  } finally {
    // Change back to original directory
    process.chdir(currentDir);
  }
}

import { HostService, HostType } from '@mcpm/sdk';

/**
 * Gets enabled MCP servers in a simplified format as a JSON string
 * @returns A JSON string of server names to their command and args
 */
export async function getEnabledMCPServersAsJson(): Promise<string> {
  const claudeSrv = HostService.getInstanceByType(HostType.CLAUDE);
  const enabledServers = await claudeSrv.getEnabledMCPServers();

  const result: Record<string, { command: string; args: string[] }> = {};

  for (const [name, serverInfo] of Object.entries(enabledServers)) {
    result[name] = {
      command: serverInfo.appConfig.command,
      args: serverInfo.appConfig.args || []
    };
  }

  return JSON.stringify(result, null, 2);
}

export async function startBridge(options: { server?: string } = {}): Promise<void> {
  const serverUrl = options.server || 'https://api.anthropic.com/v1/';
  console.log('Starting MCP-Bridge...');

  // Check if UV is installed
  const uvInstalled = await isUVInstalled();
  if (!uvInstalled) {
    console.error('\nError: UV package manager not found.');
    console.log('\nPlease install UV by following the instructions at:');
    console.log('https://github.com/astral-sh/uv#installation');
    console.log('\nFor example, on most systems you can install UV with:');
    console.log('curl -LsSf https://astral.sh/uv/install.sh | sh');

    throw new Error('UV package manager is required to run MCP-Bridge');
  }

  console.log('✓ UV is installed');

  // Always run uv sync
  console.log('Syncing Python dependencies...');

  // Determine if we're in development or production mode
  const isDev = fs.existsSync(path.join(process.cwd(), 'src'));

  // Set the appropriate path to mcp-bridge directory
  const mcpBridgePath = isDev
    ? path.join(process.cwd(), 'python', 'mcp-bridge')
    : path.join(process.cwd(), 'lib', 'python', 'mcp-bridge');

  // Store current directory
  const currentDir = process.cwd();

  await syncDependencies(mcpBridgePath, currentDir);

  // Get the enabled MCP servers as JSON
  const mcpServersJson = await getEnabledMCPServersAsJson();
  
  console.log(`Starting MCP-Bridge with server: ${serverUrl}`);
  
  // Change to mcp-bridge directory to run the bridge
  process.chdir(mcpBridgePath);
  
  try {
    // Start the MCP-Bridge Python process with inherited stdio to forward all output
    const bridgeProcess = spawn('uv', [
      'run',
      'mcp_bridge/main.py',
      '--inference_server.base_url', serverUrl,
      '--mcp_servers', mcpServersJson
    ], { 
      stdio: 'inherit',
      // Use shell option on Windows to handle special characters in the JSON string
      shell: process.platform === 'win32'
    });

    // Set up proper handling for process exit
    bridgeProcess.on('error', (error) => {
      console.error(`Error starting MCP-Bridge: ${error.message}`);
      process.chdir(currentDir); // Return to original directory
    });
    
    // Handle SIGINT (Ctrl+C) to gracefully terminate the bridge
    process.on('SIGINT', () => {
      console.log('\nTerminating MCP-Bridge...');
      bridgeProcess.kill();
      process.chdir(currentDir);
      // Give the process a moment to clean up before exiting
      setTimeout(() => process.exit(0), 500);
    });
    
    // We don't have a return statement here, so the CLI process will remain open
    // until the bridge process terminates
  } catch (error) {
    // Change back to original directory if an error occurs
    process.chdir(currentDir);
    throw error;
  }
}
