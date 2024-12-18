import { MCPServerConfig } from '../services/storage.js';

export const stringifyServerToTitle = (server: MCPServerConfig): string => {
  return `${server.name} (${[
    server.appConfig.command,
    ...(server.appConfig.args ?? []),
  ]
    .filter(Boolean)
    .join(' ')})`;
};
