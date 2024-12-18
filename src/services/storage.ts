import fs from 'fs';
import path from 'path';
import os from 'os';
import { MCPServerBootConfig } from './claude.js';

export enum MCPServerConfigSource {
  LOCAL = 'local',
  REMOTE = 'remote',
  SELF = 'self',
}

export interface MCPServerConfig {
  name: string;
  claudeId?: string;
  appConfig: MCPServerBootConfig;
  from?: MCPServerConfigSource;
}

export interface Config {
  lastUpdated?: string;
  apiKey?: string;
}

export interface MCPServerMap {
  [key: string]: MCPServerConfig;
}

export type MCPServerConfigStorage = {
  mcpServersMap?: MCPServerMap;
};

export class StorageService {
  private static instance: StorageService;
  private configDir: string;
  private configPath: string;
  private serversPath: string;
  private config: Config = {};
  private mcpServersConfig: MCPServerConfigStorage = {};

  private constructor() {
    this.configDir = path.join(os.homedir(), '.mcpm');
    this.configPath = path.join(this.configDir, 'config.json');
    this.serversPath = path.join(this.configDir, 'servers.json');
    this.ensureConfigExists();
    this.loadConfig();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private ensureConfigExists(): void {
    if (!fs.existsSync(this.configDir)) {
      fs.mkdirSync(this.configDir, { recursive: true });
    }
    if (!fs.existsSync(this.configPath)) {
      fs.writeFileSync(this.configPath, JSON.stringify({}, null, 2));
    }
    if (!fs.existsSync(this.serversPath)) {
      fs.writeFileSync(this.serversPath, JSON.stringify({}, null, 2));
    }
  }

  private loadConfig(): void {
    try {
      const configContent = fs.readFileSync(this.configPath, 'utf-8');
      this.config = JSON.parse(configContent);
    } catch (error) {
      console.error('Error loading config:', error);
      this.config = {};
    }
  }

  private saveConfig(): void {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  private loadServersStorage(): void {
    try {
      const serversContent = fs.readFileSync(this.serversPath, 'utf-8');
      this.mcpServersConfig = JSON.parse(serversContent);
    } catch (error) {
      console.error('Error loading servers storage:', error);
      this.mcpServersConfig = {};
    }
  }

  private saveServersStorage(): void {
    try {
      fs.writeFileSync(
        this.serversPath,
        JSON.stringify(this.mcpServersConfig, null, 2)
      );
    } catch (error) {
      console.error('Error saving servers storage:', error);
    }
  }

  public getMCPServer(name: string): MCPServerConfig | undefined {
    this.loadServersStorage();
    return this.mcpServersConfig.mcpServersMap?.[name];
  }

  public getAllMCPServers(): MCPServerConfig[] {
    this.loadServersStorage();
    return Object.values(this.mcpServersConfig.mcpServersMap || {});
  }

  public addMCPServers(servers: MCPServerConfig[]): void {
    this.loadServersStorage();
    this.mcpServersConfig.mcpServersMap = {
      ...this.mcpServersConfig.mcpServersMap,
      ...Object.fromEntries(servers.map(server => [server.name, server])),
    };
    this.saveServersStorage();
  }

  public removeMCPServer(name: string): void {
    this.loadServersStorage();
    delete this.mcpServersConfig.mcpServersMap?.[name];
    this.saveServersStorage();
  }

  public addIfNotExistedMCPServer(server: MCPServerConfig): void {
    this.loadServersStorage();
    if (!this.mcpServersConfig.mcpServersMap?.[server.name]) {
      this.mcpServersConfig.mcpServersMap = {
        ...(this.mcpServersConfig.mcpServersMap || {}),
        [server.name]: server,
      };
      this.saveServersStorage();
    }
  }

  public get<K extends keyof Config>(key: K): Config[K] | undefined {
    return this.config[key];
  }

  public set<K extends keyof Config>(key: K, value: Config[K]): void {
    this.config[key] = value;
    this.saveConfig();
  }

  public delete<K extends keyof Config>(key: K): void {
    delete this.config[key];
    this.saveConfig();
  }

  public getAll(): Config {
    return { ...this.config };
  }

  public clear(): void {
    this.config = {};
    this.saveConfig();
  }
}
