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

export async function startBridge(options: { sync?: boolean } = {}): Promise<void> {
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

  // console.log(`Using MCP-Bridge path: ${mcpBridgePath}`);

  // Store current directory
  const currentDir = process.cwd();

  await syncDependencies(mcpBridgePath, currentDir);

  // TODO: Start the MCP-Bridge Python process

  console.log('MCP-Bridge started (placeholder implementation)');
  console.log(await getEnabledMCPServersAsJson());
}
