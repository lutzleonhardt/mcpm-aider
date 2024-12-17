import path from 'path';
import os from 'os';
import { promises as fsp } from 'fs';

export interface MCPServer {
  command: string;
  args: string[];
}

export interface MCPServerMap {
  [key: string]: MCPServer;
}

export interface ClaudeConfig {
  mcpServers?: MCPServerMap;
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
      console.log('Claude config not found');
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
    console.log('Claude config created');
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
        'Local',
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
    public readonly fileSrv: ClaudeFileService = new ClaudeFileService()
  ) {}

  private addMCPServerToConfig(
    config: ClaudeConfig,
    name: string,
    server: MCPServer
  ): ClaudeConfig {
    config.mcpServers = config.mcpServers || {};
    config.mcpServers[name] = server;
    return config;
  }

  private removeMCPServerFromConfig(
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

  async addMCPServer(name: string, server: MCPServer): Promise<ClaudeConfig> {
    return await this.fileSrv.modifyClaudeConfigFile(config =>
      this.addMCPServerToConfig(config, name, server)
    );
  }

  async removeMCPServer(name: string): Promise<void> {
    const config = await this.fileSrv.getClaudeConfig();
    if (!config?.mcpServers?.[name]) {
      throw new Error(`MCP server '${name}' not found`);
    }
    delete config.mcpServers[name];
    await this.fileSrv.saveClaudeConfig(config);
  }

  async getMCPServers(): Promise<MCPServerMap> {
    const config = await this.fileSrv.getClaudeConfig();
    return config?.mcpServers || {};
  }
}
