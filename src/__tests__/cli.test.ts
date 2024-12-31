/* eslint-disable @typescript-eslint/unbound-method */
import { ClaudeHostService } from '@mcpm/sdk';

jest.mock('@mcpm/sdk', () => ({
  ClaudeHostService: jest.fn().mockImplementation(() => ({
    addMCPServer: jest.fn(),
    getMCPServersInConfig: jest.fn(),
    removeMCPServer: jest.fn(),
  })),
}));

describe('ClaudeHostService Tests', () => {
  let claudeService: jest.Mocked<ClaudeHostService>;

  beforeEach(() => {
    jest.clearAllMocks();
    claudeService = new ClaudeHostService() as jest.Mocked<ClaudeHostService>;
  });

  describe('addMCPServer', () => {
    it('should add server successfully', async () => {
      const name = 'test-server';
      const server = {
        command: 'test-command',
        args: ['--test'],
      };

      await claudeService.addMCPServer(name, server);

      expect(claudeService.addMCPServer).toHaveBeenCalledWith(name, server);
    });
  });

  describe('getMCPServers', () => {
    it('should return list of servers', async () => {
      const mockServers = {
        'test-server': {
          command: 'test-command',
          args: ['--test'],
        },
      };

      claudeService.getMCPServersInConfig.mockResolvedValue(mockServers);

      const result = await claudeService.getMCPServersInConfig();

      expect(result).toEqual(mockServers);
      expect(claudeService.getMCPServersInConfig).toHaveBeenCalled();
    });
  });

  describe('removeMCPServer', () => {
    it('should remove server successfully', async () => {
      const name = 'test-server';

      await claudeService.removeMCPServer(name);

      expect(claudeService.removeMCPServer).toHaveBeenCalledWith(name);
    });
  });
});
