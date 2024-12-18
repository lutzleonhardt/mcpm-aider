/* eslint-disable @typescript-eslint/unbound-method */
import {
  ClaudeFileService,
  ClaudeHostService,
  MCPServerBootConfig,
  ClaudeConfig,
} from '../services/claude.js';

describe('ClaudeHostService', () => {
  let claudeHostService: ClaudeHostService;
  let mockFileService: jest.Mocked<ClaudeFileService>;

  const mockServer: MCPServerBootConfig = {
    command: 'test-command',
    args: ['--test'],
  };

  beforeEach(() => {
    mockFileService = {
      getClaudeConfig: jest.fn(),
      saveClaudeConfig: jest.fn(),
      getClaudeConfigPath: jest.fn(),
      modifyClaudeConfigFile: jest.fn(),
    } as unknown as jest.Mocked<ClaudeFileService>;

    claudeHostService = new ClaudeHostService(mockFileService);
  });

  describe('addMCPServer', () => {
    it('should add a new MCP server to config', async () => {
      const mockConfig: ClaudeConfig = { mcpServers: {} };
      mockFileService.modifyClaudeConfigFile.mockImplementation(
        async callback => {
          const result = callback(mockConfig);
          return result;
        }
      );

      const result = await claudeHostService.addMCPServer(
        'test-server',
        mockServer
      );

      expect(mockFileService.modifyClaudeConfigFile).toHaveBeenCalled();
      expect(result.mcpServers?.['test-server']).toEqual(mockServer);
    });

    it('should throw error if server already exists', async () => {
      const mockConfig: ClaudeConfig = {
        mcpServers: {
          'test-server': mockServer,
        },
      };
      mockFileService.modifyClaudeConfigFile.mockImplementation(
        async callback => {
          return callback(mockConfig);
        }
      );

      await expect(
        claudeHostService.addMCPServer('test-server', mockServer)
      ).rejects.toThrow('Server already exists');
    });
  });

  describe('getMCPServers', () => {
    it('should return all MCP servers', async () => {
      const mockConfig: ClaudeConfig = {
        mcpServers: {
          'test-server': mockServer,
        },
      };
      mockFileService.getClaudeConfig.mockResolvedValue(mockConfig);

      const result = await claudeHostService.getMCPServersInConfig();

      expect(result).toEqual({
        'test-server': mockServer,
      });
    });

    it('should return empty object if no servers exist', async () => {
      mockFileService.getClaudeConfig.mockResolvedValue({ mcpServers: {} });

      const result = await claudeHostService.getMCPServersInConfig();

      expect(result).toEqual({});
    });
  });
});
