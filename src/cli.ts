import { Command } from 'commander';
import prompts from 'prompts';
import { ClaudeHostService } from './services/claude';

const packageJson = require('../package.json');
const version: string = packageJson.version;

const program = new Command();

const claudeSrv = new ClaudeHostService();

program
  .version(version)
  .name('mcpm')
  .option('-d, --debug', 'enables verbose logging', false);

// program
//   .command('install')
//   .description('Install a new MCP project')
//   .action(() => {
//     console.log('Install a new MCP project');
//   });

program
  .command('add')
  .description(
    `
Add a new MCP server to your Claude App

Usage:
    mcpm add
    mcpm add <name>
    mcpm add <name> -c <command> -a <args...>
  `.trim()
  )
  .action(async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const questions = await prompts([
      {
        type: 'text',
        name: 'name',
        message: 'Enter a name for the MCP server:',
        validate: value => (value.length > 0 ? true : 'Name cannot be empty'),
      },
      {
        type: 'text',
        name: 'command',
        message: 'Enter the command to run the server:',
        validate: value =>
          value.length > 0 ? true : 'Command cannot be empty',
      },
      {
        type: 'text',
        name: 'args',
        message: 'Enter command arguments (space separated):',
        initial: '',
      },
    ]);

    if (!questions.name || !questions.command) {
      console.log('Operation cancelled');
      return;
    }

    const hostService = new ClaudeHostService();
    await hostService.addMCPServer(questions.name, {
      command: questions.command,
      args: questions.args
        ? (questions.args as string)
            .split(' ')
            .filter((arg: any) => arg.length > 0)
        : [],
    });
    console.log(`MCP server '${questions.name}' added successfully`);
  });

program
  .command('remove')
  .description(
    `
Remove a MCP server from your Claude App

Usage:
    mcpm remove
    mcpm remove <name>
  `.trim()
  )
  .action(async args => {
    const hostService = new ClaudeHostService();

    let name = args.name;

    // If name not provided, show selection prompt
    if (!name) {
      const servers = await hostService.getMCPServers();
      const choices = Object.entries(servers).map(([name, server]) => ({
        title: `${name} (${server.command} ${server.args.join(' ')})`,
        value: name,
      }));

      if (choices.length === 0) {
        console.log('No MCP servers found');
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
  .description(
    `
Disable an MCP server (moves it from Claude to storage)

Usage:
    mcpm disable
    mcpm disable <name>
  `.trim()
  )
  .action(async args => {
    const hostService = new ClaudeHostService();
    let name = args.name;

    if (!name) {
      const servers = await hostService.getMCPServers();
      const choices = Object.entries(servers).map(([name, server]) => ({
        title: `${name} (${server.command} ${server.args.join(' ')})`,
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
  .description(
    `
Enable a disabled MCP server (moves it from storage to Claude)

Usage:
    mcpm enable
    mcpm enable <name>
  `.trim()
  )
  .action(async args => {
    const hostService = new ClaudeHostService();
    let name = args.name;

    if (!name) {
      const servers = await hostService.getDisabledMCPServers();
      const choices = Object.entries(servers).map(([name, server]) => ({
        title: `${name} (${server.command} ${server.args.join(' ')})`,
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

const hostCmd = program
  .command('host')
  .description('Manage your MCP hosts like Claude App');

hostCmd
  .command('scan')
  .description('Scan for supported hosts')
  .action(() => {
    console.log('Scanning Claude');

    claudeSrv
      .getMCPServers()
      .then(config => {
        console.log(JSON.stringify(config, null, 2));
      })
      .catch(error => {
        console.error(error);
      });
  });

program.parse(process.argv);
