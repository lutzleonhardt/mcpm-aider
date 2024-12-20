/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Command } from 'commander';
import prompts from 'prompts';
import { ClaudeHostService } from './services/claude.js';
import { version } from './utils/version.js';
import { stringifyServerToTitle } from './utils/display.js';
import { formatMCPServers } from './utils/formatter.js';

const program = new Command();

const claudeSrv = new ClaudeHostService();

program
  .version(version)
  .name('mcpm')
  .option('-d, --debug', 'enables verbose logging', false);

program
  .command('add')
  .description('Add a new MCP server to your Claude App')
  .argument('[name]', 'name of the MCP server')
  .option('-c, --command <command>', 'command to run the server')
  .option('-a, --args <args...>', 'arguments for the command')
  .option('--self', 'add the MCPM CLI as a MCP server')
  .action(
    async (
      name: string | undefined,
      options: { command?: string; args?: string[]; self?: boolean }
    ) => {
      if (options.self) {
        await claudeSrv.addMCPMSelfMCPServer();
        console.log('MCPM CLI added successfully');
        return;
      }

      if (!name || !options.command) {
        const questions: prompts.PromptObject<string>[] = [];

        if (!name) {
          questions.push({
            type: 'text',
            name: 'name',
            message: 'Enter a name for the MCP server:',
            validate: (value: string | any[]) =>
              value.length > 0 ? true : 'Name cannot be empty',
          });
        }

        if (!options.command) {
          questions.push({
            type: 'text',
            name: 'command',
            message: 'Enter the command to run the server:',
            validate: (value: string | any[]) =>
              value.length > 0 ? true : 'Command cannot be empty',
          });
        }

        if (!options.args) {
          questions.push({
            type: 'text',
            name: 'args',
            message: 'Enter command arguments (space separated):',
            initial: '',
          });
        }

        const responses = await prompts(questions);

        name = name || responses.name;
        if (!name || (!responses.command && !options.command)) {
          console.log('Operation cancelled');
          return;
        }

        options.command = options.command || responses.command;
        options.args =
          options.args ||
          (responses.args
            ? responses.args
                .split(' ')
                .filter((arg: string | any[]) => arg.length > 0)
            : []);
      }

      if (!options.command) {
        console.log('Operation cancelled');
        return;
      }

      const hostService = new ClaudeHostService();
      await hostService.addMCPServer(name, {
        command: options.command,
        args: options.args || [],
      });
      console.log(`MCP server '${name}' added successfully`);
    }
  );

program
  .command('remove')
  .description('Remove a MCP server from your Claude App')
  .argument('[name]', 'name of the MCP server to remove')
  .action(async name => {
    const hostService = new ClaudeHostService();

    // If name not provided, show selection prompt
    if (!name) {
      const servers = await hostService.getMCPServersInConfig();
      const choices = Object.entries(servers).map(([name, server]) => ({
        title: `${name} (${server.command} ${server.args?.join(' ') || ''})`,
        value: name,
      }));

      if (choices.length === 0) {
        console.log('No MCP servers found');
        return;
      }

      const response = await prompts({
        type: 'select',
        name: 'server',
        message: 'Select a server to remove:',
        choices,
      });

      if (!response.server) {
        console.log('Operation cancelled');
        return;
      }

      name = response.server;
    }

    if (!name) {
      console.log('Operation cancelled');
      return;
    }

    try {
      await hostService.removeMCPServer(name);
      console.log(`MCP server '${name}' removed successfully`);
    } catch (error) {
      console.error(`Failed to remove server '${name}':`, error);
    }
  });

program
  .command('disable')
  .description('Disable an MCP server (moves it from Claude to storage)')
  .argument('[name]', 'name of the MCP server to disable')
  .action(async name => {
    const hostService = new ClaudeHostService();

    if (!name) {
      const servers = await hostService.getEnabledMCPServers();
      const choices = Object.entries(servers).map(([name, info]) => ({
        title: stringifyServerToTitle(info),
        value: name,
      }));

      if (choices.length === 0) {
        console.log('No MCP servers found');
        return;
      }

      const response = await prompts({
        type: 'select',
        name: 'server',
        message: 'Select a server to disable:',
        choices,
      });

      if (!response.server) {
        console.log('Operation cancelled');
        return;
      }

      name = response.server;
    }

    if (!name) {
      console.log('Operation cancelled');
      return;
    }

    try {
      await hostService.disableMCPServer(name);
      console.log(`MCP server '${name}' disabled successfully`);
    } catch (error) {
      console.error(`Failed to disable server '${name}':`, error);
    }
  });

program
  .command('enable')
  .description('Enable a disabled MCP server (moves it from storage to Claude)')
  .argument('[name]', 'name of the MCP server to enable')
  .action(async name => {
    const hostService = new ClaudeHostService();

    if (!name) {
      const servers = await hostService.getDisabledMCPServers();
      const choices = Object.entries(servers).map(([name, info]) => ({
        title: stringifyServerToTitle(info),
        value: name,
      }));

      if (choices.length === 0) {
        console.log('No disabled MCP servers found');
        return;
      }

      const response = await prompts({
        type: 'select',
        name: 'server',
        message: 'Select a server to enable:',
        choices,
      });

      if (!response.server) {
        console.log('Operation cancelled');
        return;
      }

      name = response.server;
    }

    if (!name) {
      console.log('Operation cancelled');
      return;
    }

    try {
      await hostService.enableMCPServer(name);
      console.log(`MCP server '${name}' enabled successfully`);
    } catch (error) {
      console.error(`Failed to enable server '${name}':`, error);
    }
  });

program
  .command('list')
  .description('List all your MCP servers')
  .option('--json', 'Output in JSON format')
  .action(async (options: { json?: boolean }) => {
    const servers = await claudeSrv.getAllMCPServersWithStatus();
    if (options.json) {
      console.log(JSON.stringify(servers, null, 2));
    } else {
      console.log(formatMCPServers(servers));
    }
  });

// listCmd
//   .command('remote')
//   .description('List all your disabled MCP servers')
//   .action(async () => {
//     const servers = await claudeSrv.getDisabledMCPServers();
//     console.log(JSON.stringify(servers, null, 2));
//   });

const hostCmd = program
  .command('host')
  .description('Manage your MCP hosts like Claude App');

hostCmd
  .command('scan')
  .description('Scan for supported hosts')
  .action(() => {
    console.log('Scanning Claude');

    claudeSrv
      .getMCPServersInConfig()
      .then(config => {
        console.log(JSON.stringify(config, null, 2));
      })
      .catch(error => {
        console.error(error);
      });
  });

program
  .command('mcp')
  .description('Start the MCPM MCP server')
  .action(async () => {
    const { startMCPServer } = await import('./mcp.js');
    await startMCPServer();
  });

const debugCmd = program
  .command('debug', { hidden: true })
  .description('Only for Debug');

debugCmd
  .command('clear')
  .description('Clear all data')
  .action(() => {
    console.log('Clearing all data');
    claudeSrv.clearAllData();
  });

program
  .command('restart')
  .description('Restart Claude.app')
  .action(async () => {
    try {
      console.log('Restarting Claude.app...');
      await claudeSrv.restartClaude();
      console.log('Claude.app has been restarted');
    } catch (error: any) {
      console.error('Failed to restart Claude.app:', error.message);
    }
  });

program.command('prepare').description('Prepare Claude.app for MCPM');

program.parse(process.argv);
