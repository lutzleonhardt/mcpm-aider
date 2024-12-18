import path from 'path';
import os from 'os';
import { promises as fsp } from 'fs';
import {
  MCPServerConfig,
  MCPServerConfigSource,
  StorageService,
} from './storage.js';
import { logger } from '../utils/logger.js';

export interface MCPServerBootConfig {
  command: string;
  args: string[];
}

export interface MCPServerMap {
  [key: string]: MCPServerBootConfig;
}

export interface ClaudeConfig {
  mcpServers?: MCPServerMap;
}

export interface MCPServerWithStatus {
  info: MCPServerConfig;
  enabled: boolean;
}

export class ClaudeFileService {
  constructor(private readonly fs: typeof fsp = fsp) {}

  async getClaudeConfig(): Promise<ClaudeConfig | null> {
    try {
      const configPath = ClaudeFileService.getClaudeConfigPath();
      if (!configPath) return null;
      const content = await this.fs.readFile(configPath, 'utf8');
      return JSON.parse(content) as ClaudeConfig;
    } catch {
      logger.error('Claude config not found');
      return null;
    }
  }

  private createDefaultClaudeConfig(): ClaudeConfig {
    return {
      mcpServers: {},
    };
  }

  private stringifyClaudeConfig(config: ClaudeConfig): string {
    return JSON.stringify(config, null, 2);
  }

  async createClaudeConfigFile(): Promise<ClaudeConfig> {
    const defaultConfig = this.createDefaultClaudeConfig();
    const configPath = ClaudeFileService.getClaudeConfigPath();
    if (!configPath) throw new Error('Unsupported platform');
    await this.fs.writeFile(
      configPath,
      this.stringifyClaudeConfig(defaultConfig)
    );
    logger.info('Claude config created');
    return defaultConfig;
  }

  async getOrCreateClaudeConfig(): Promise<ClaudeConfig> {
    const content = await this.getClaudeConfig();
    if (content) {
      return content;
    }
    return await this.createClaudeConfigFile();
  }

  async writeClaudeConfigFile(config: ClaudeConfig): Promise<void> {
    const configPath = ClaudeFileService.getClaudeConfigPath();
    if (!configPath) throw new Error('Unsupported platform');
    await this.fs.writeFile(configPath, this.stringifyClaudeConfig(config));
  }

  async modifyClaudeConfigFile(
    modifier: (config: ClaudeConfig) => Promise<ClaudeConfig> | ClaudeConfig
  ): Promise<ClaudeConfig> {
    const config = await this.getOrCreateClaudeConfig();
    const newConfig = await modifier(config);
    await this.writeClaudeConfigFile(newConfig);
    return newConfig;
  }

  async saveClaudeConfig(config: ClaudeConfig): Promise<void> {
    await this.writeClaudeConfigFile(config);
  }

  static getClaudeConfigPath(): string {
    // process.platform Posible values：
    // 'aix' - IBM AIX
    // 'darwin' - macOS
    // 'freebsd' - FreeBSD
    // 'linux' - Linux
    // 'openbsd' - OpenBSD
    // 'sunos' - SunOS
    // 'win32' - Windows(32-bit or 64-bit)

    const home = os.homedir();

    if (process.platform === 'win32') {
      // Windows Path
      return path.join(
        home,
        'AppData',
        'Roaming', // $env:AppData
        'Claude',
        'claude_desktop_config.json'
      );
    } else if (process.platform === 'darwin') {
      // macOS Path
      return path.join(
        home,
        'Library',
        'Application Support',
        'Claude',
        'claude_desktop_config.json'
      );
    } else {
      // Linux/Unix Path
      return path.join(home, '.config', 'claude', 'claude_desktop_config.json');
    }
  }
}

export class ClaudeHostService {
  constructor(
    public readonly fileSrv: ClaudeFileService = new ClaudeFileService(),
    private readonly storageSrv: StorageService = StorageService.getInstance()
  ) {}

  private addMCPServerToConfigJSON(
    config: ClaudeConfig,
    name: string,
    server: MCPServerBootConfig
  ): ClaudeConfig {
    config.mcpServers = config.mcpServers || {};
    if (config.mcpServers[name]) {
      throw new Error('Server already exists');
    }
    config.mcpServers[name] = server;
    return config;
  }

  private removeMCPServerFromConfigJSON(
    config: ClaudeConfig,
    serverName: string
  ): ClaudeConfig {
    config.mcpServers = config.mcpServers || {};
    if (!config.mcpServers[serverName]) {
      throw new Error(`Server ${serverName} not found`);
    }
    delete config.mcpServers[serverName];
    return config;
  }

  async addMCPServer(
    name: string,
    server: MCPServerBootConfig
  ): Promise<ClaudeConfig> {
    this.storageSrv.addMCPServers([
      {
        name,
        appConfig: server,
        from: MCPServerConfigSource.LOCAL,
      },
    ]);
    return await this.fileSrv.modifyClaudeConfigFile(config =>
      this.addMCPServerToConfigJSON(config, name, server)
    );
  }

  async removeMCPServer(name: string): Promise<void> {
    await this.fileSrv.modifyClaudeConfigFile(config =>
      this.removeMCPServerFromConfigJSON(config, name)
    );
    this.storageSrv.removeMCPServer(name);
  }

  async getMCPServersInConfig(): Promise<MCPServerMap> {
    const config = await this.fileSrv.getClaudeConfig();
    return config?.mcpServers || {};
  }

  async getAllMCPServersWithStatus(): Promise<MCPServerWithStatus[]> {
    const enabledServers = await this.getMCPServersInConfig();
    let installedServers = this.storageSrv.getAllMCPServers();
    // Add new enabled servers (not in storage)
    const newEnabledServers = Object.entries(enabledServers).reduce(
      (acc, [name, server]) => {
        if (!name) {
          return acc;
        }
        const isEnabled =
          installedServers.some(
            installedServer => installedServer.claudeId === name
          ) ||
          installedServers.some(
            installedServer => installedServer.name === name
          );
        if (!isEnabled) {
          acc = [
            ...acc,
            {
              name,
              claudeId: name,
              appConfig: server,
              from: MCPServerConfigSource.LOCAL,
            },
          ];
        }
        return acc;
      },
      [] as MCPServerConfig[]
    );
    this.storageSrv.addMCPServers(newEnabledServers);
    installedServers = [...installedServers, ...newEnabledServers];
    return installedServers.map(server => ({
      info: server,
      enabled: !!enabledServers[server.name],
    }));
  }

  async disableMCPServer(name: string): Promise<void> {
    await this.fileSrv.modifyClaudeConfigFile(config => {
      if (!config?.mcpServers?.[name]) {
        throw new Error(`MCP server '${name}' not found`);
      }

      const server = config.mcpServers[name];

      this.storageSrv.addIfNotExistedMCPServer({
        name,
        appConfig: server,
        from: MCPServerConfigSource.LOCAL,
      });

      delete config.mcpServers[name];
      return config;
    });
  }

  async enableMCPServer(name: string): Promise<void> {
    const storaged = this.storageSrv.getMCPServer(name);

    if (!storaged) {
      throw new Error(`MCP server '${name}' not found`);
    }

    await this.fileSrv.modifyClaudeConfigFile(config => {
      if (config?.mcpServers?.[name]) {
        throw new Error(`MCP server '${name}' already exists`);
      }
      config.mcpServers = config.mcpServers || {};
      config.mcpServers[name] = storaged.appConfig;
      return config;
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getDisabledMCPServers(): Promise<{
    [key: string]: MCPServerConfig;
  }> {
    const servers = await this.getAllMCPServersWithStatus();
    return servers
      .filter(server => !server.enabled)
      .reduce(
        (acc, server) => ({ ...acc, [server.info.name]: server.info }),
        {}
      );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async getEnabledMCPServers(): Promise<{
    [key: string]: MCPServerConfig;
  }> {
    const servers = await this.getAllMCPServersWithStatus();
    return servers
      .filter(server => server.enabled)
      .reduce(
        (acc, server) => ({ ...acc, [server.info.name]: server.info }),
        {}
      );
  }

  public clearAllData(): void {
    this.storageSrv.clear();
  }

  public async restartClaude(): Promise<void> {
    const { exec } = await import('child_process');
    return new Promise((resolve, reject) => {
      if (process.platform === 'win32') {
        // Windows commands
        // First get the path of Claude.exe from running processes
        exec(
          'powershell -Command "Get-Process Claude -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Path"',
          (error, stdout) => {
            let claudePath = stdout.toString().trim();

            // Get First path
            claudePath = claudePath.split('\n')[0];

            if (!claudePath && error) {
              reject(new Error(`Failed to get Claude path: ${error.message}`));
              return;
            }

            // If Claude is not running, try to find it in Program Files
            if (!claudePath) {
              const defaultPaths = [
                'C:\\Program Files\\Claude\\Claude.exe',
                'C:\\Program Files (x86)\\Claude\\Claude.exe',
                `${process.env.LOCALAPPDATA}\\Programs\\Claude\\Claude.exe`,
              ];

              // Use Promise.all to check all paths
              void Promise.all(
                defaultPaths.map(path =>
                  import('fs').then(fs =>
                    fs.promises
                      .access(path)
                      .then(() => path)
                      .catch(() => null)
                  )
                )
              ).then(results => {
                claudePath = results.find(path => path !== null) || '';

                if (!claudePath) {
                  reject(
                    new Error(
                      'Could not find Claude.exe. Please make sure Claude is installed.'
                    )
                  );
                  return;
                }

                // Kill Claude process
                exec('taskkill /F /IM "Claude.exe"', error => {
                  if (error && error.code !== 128) {
                    // code 128 means no process found
                    reject(
                      new Error(`Failed to kill Claude: ${error.message}`)
                    );
                    return;
                  }

                  // Wait for 2 seconds before starting Claude
                  setTimeout(() => {
                    // Start Claude using the full path
                    exec(`"${claudePath}"`, error => {
                      if (error) {
                        reject(
                          new Error(`Failed to start Claude: ${error.message}`)
                        );
                        return;
                      }
                    });
                    // Resolve immediately after starting the process
                    resolve();
                  }, 2000);
                });
              });
            } else {
              // If claudePath was found directly, proceed with killing and restarting
              exec('taskkill /F /IM "Claude.exe"', error => {
                if (error && error.code !== 128) {
                  reject(new Error(`Failed to kill Claude: ${error.message}`));
                  return;
                }

                setTimeout(() => {
                  const claudeProcess = exec(`"${claudePath}"`, error => {
                    if (error) {
                      reject(
                        new Error(`Failed to start Claude: ${error.message}`)
                      );
                      return;
                    }
                  });
                  // Resolve immediately after starting the process
                  resolve();
                }, 2000);
              });
            }
          }
        );
      } else {
        // macOS commands
        exec('killall "Claude"', error => {
          if (error && error.code !== 1) {
            // code 1 means no process found
            reject(new Error(`Failed to kill Claude: ${error.message}`));
            return;
          }

          // Wait for 2 seconds before starting Claude.app
          setTimeout(() => {
            // Start Claude.app
            exec('open -a Claude', error => {
              if (error) {
                reject(new Error(`Failed to start Claude: ${error.message}`));
                return;
              }
              resolve();
            });
          }, 2000);
        });
      }
    });
  }

  public async addMCPMSelfMCPServer(): Promise<void> {
    const selfConfig: MCPServerConfig = {
      name: 'mcpm',
      appConfig: {
        command: 'mcpm',
        args: ['mcp'],
      },
      from: MCPServerConfigSource.SELF,
    };
    this.storageSrv.addMCPServers([selfConfig]);
    await this.fileSrv.modifyClaudeConfigFile(config =>
      this.addMCPServerToConfigJSON(
        config,
        selfConfig.name,
        selfConfig.appConfig
      )
    );
  }
}
