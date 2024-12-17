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
        message: 'Enter command argumentcas (space separated):',
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

const hostCmd = program
  .command('host')
  .description('Manage your MCP hosts like Claude App');

hostCmd
  .command('scan')
  .description('Scan for supported hosts')
  .action(() => {
    console.log('Scanning Claude');

    claudeSrv
      .listMCPServers()
      .then(config => {
        console.log(JSON.stringify(config, null, 2));
      })
      .catch(error => {
        console.error(error);
      });
  });

program.parse(process.argv);
