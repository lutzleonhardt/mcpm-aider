import { Command } from 'commander';

const packageJson = require('../package.json');
const version: string = packageJson.version;

const program = new Command();

program
  .version(version)
  .name('my-command')
  .option('-d, --debug', 'enables verbose logging', false)
  .parse(process.argv);

// Function code for CLI goes here
