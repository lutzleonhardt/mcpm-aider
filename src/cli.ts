import { Command } from 'commander';
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
  .description('Add a new MCP host')
  .action(() => {
    console.log('Add a new MCP host');
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
