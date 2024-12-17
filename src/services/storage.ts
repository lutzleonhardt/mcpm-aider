import fs from 'fs';
import path from 'path';
import os from 'os';
import { MCPServer } from './claude.js';

export interface MCPServerConfig {
  claudeId?: string;
  args: MCPServer;
  enabled?: boolean;
}

export interface Config {
  lastUpdated?: string;
  apiKey?: string;
  claudeMcpServers?: {
    [key: string]: MCPServerConfig;
  };
}

export class StorageService {
  private static instance: StorageService;
  private configDir: string;
  private configPath: string;
  private config: Config = {};

  private constructor() {
    this.configDir = path.join(os.homedir(), '.mcpm');
    this.configPath = path.join(this.configDir, 'config.json');
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
