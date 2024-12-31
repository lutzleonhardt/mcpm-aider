import chalk from 'chalk';
import type { MCPServerWithStatus } from '@mcpm/sdk';

export function formatMCPServers(servers: MCPServerWithStatus[]): string {
  if (servers.length === 0) {
    return chalk.yellow('No MCP servers found');
  }

  const lines: string[] = [];
  lines.push(chalk.bold('Your MCP Servers:'));
  lines.push('');

  servers.forEach(server => {
    const statusColor = server.enabled ? chalk.green : chalk.red;
    const status = server.enabled ? '✓ Enabled' : '✗ Disabled';

    lines.push(chalk.bold(server.info.name));
    lines.push(`  ${statusColor(status)}`);
    lines.push(`  ${chalk.blue('Command:')} ${server.info.appConfig.command}`);
    if (server.info.appConfig.args && server.info.appConfig.args.length > 0) {
      lines.push(
        `  ${chalk.blue('Args:')} ${server.info.appConfig.args.join(' ')}`
      );
    }
    if (server.info.from) {
      lines.push(`  ${chalk.gray(`Source: ${server.info.from}`)}`);
    }
    lines.push('');
  });

  return lines.join('\n');
}
