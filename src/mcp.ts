import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ClaudeHostService } from './services/claude.js';
import { RegistryService } from './services/registry.js';
import { version } from './utils/version.js';

// Initialize services
const claudeSrv = new ClaudeHostService();
const registrySrv = new RegistryService();

// Define Zod schemas for MCP server management
const MCPServerConfigSchema = z.object({
  command: z.string(),
  args: z.array(z.string()),
});

const AddServerArgumentsSchema = z.object({
  name: z.string(),
  config: MCPServerConfigSchema,
});

const RemoveServerArgumentsSchema = z.object({
  name: z.string(),
});

const EnableDisableServerArgumentsSchema = z.object({
  name: z.string(),
});

const SearchPackagesArgumentsSchema = z.object({
  query: z.string().optional(),
});

const InstallPackageArgumentsSchema = z.object({
  name: z.string(),
  parameters: z.record(z.string()).optional(),
});

// Create server instance
const server = new Server(
  {
    name: 'mcpm',
    version,
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  await Promise.resolve();
  return {
    tools: [
      {
        name: 'search-mcp-server',
        description: 'Search for MCP Server packages in the registry',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query (optional)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'install-mcp-server',
        description:
          'Install a MCP package from the registry (automated configuration)',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Package ID to install',
            },
            parameters: {
              type: 'object',
              additionalProperties: {
                type: 'string',
              },
              description: 'Package parameters (optional)',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'add-mcp-server',
        description: 'Manually add a new MCP server (for advanced users)',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the MCP server',
            },
            config: {
              type: 'object',
              properties: {
                command: {
                  type: 'string',
                  description: 'Command to run the server',
                },
                args: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  description: 'Arguments for the command',
                },
              },
              required: ['command', 'args'],
            },
          },
          required: ['name', 'config'],
        },
      },
      {
        name: 'remove-mcp-server',
        description: 'Remove an MCP server',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the MCP server to remove',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'enable-mcp-server',
        description: 'Enable a disabled MCP server',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the MCP server to enable',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'disable-mcp-server',
        description: 'Disable an MCP server',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the MCP server to disable',
            },
          },
          required: ['name'],
        },
      },
      {
        name: 'list-mcp-servers',
        description: 'List all MCP servers',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
      {
        name: 'restart-claude',
        description: 'Restart Claude.app',
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list-mcp-servers': {
        try {
          const servers = await claudeSrv.getAllMCPServersWithStatus();
          return {
            result: JSON.stringify(servers, null, 2),
          };
        } catch (error) {
          throw new Error(`Failed to list servers: ${error}`);
        }
      }

      case 'add-mcp-server': {
        const { name, config } = AddServerArgumentsSchema.parse(args);
        try {
          await claudeSrv.addMCPServer(name, config);
          return {
            result: `MCP server '${name}' added successfully`,
          };
        } catch (error) {
          throw new Error(`Failed to add server '${name}': ${error}`);
        }
      }

      case 'remove-mcp-server': {
        const { name } = RemoveServerArgumentsSchema.parse(args);
        try {
          await claudeSrv.removeMCPServer(name);
          return {
            result: `MCP server '${name}' removed successfully`,
          };
        } catch (error) {
          throw new Error(`Failed to remove server '${name}': ${error}`);
        }
      }

      case 'enable-mcp-server': {
        const { name } = EnableDisableServerArgumentsSchema.parse(args);
        try {
          await claudeSrv.enableMCPServer(name);
          return {
            result: `MCP server '${name}' enabled successfully`,
          };
        } catch (error) {
          throw new Error(`Failed to enable server '${name}': ${error}`);
        }
      }

      case 'disable-mcp-server': {
        const { name } = EnableDisableServerArgumentsSchema.parse(args);
        try {
          await claudeSrv.disableMCPServer(name);
          return {
            result: `MCP server '${name}' disabled successfully`,
          };
        } catch (error) {
          throw new Error(`Failed to disable server '${name}': ${error}`);
        }
      }

      case 'search-mcp-server': {
        const { query } = SearchPackagesArgumentsSchema.parse(args);
        try {
          const packages = query
            ? await registrySrv.searchPackages(query)
            : await registrySrv.listPackages();

          if (packages.length === 0) {
            return {
              result: 'No packages found.',
            };
          }

          const results = packages.map(pkg => {
            let result = `${pkg.title} (${pkg.id})\n`;
            result += `  ${pkg.description}\n`;
            if (pkg.tags?.length) {
              result += `  Tags: ${pkg.tags.join(', ')}\n`;
            }
            return result;
          });

          return {
            result: results.join('\n'),
          };
        } catch (error) {
          throw new Error(`Failed to search packages: ${error}`);
        }
      }

      case 'install-mcp-server': {
        const { name, parameters } = InstallPackageArgumentsSchema.parse(args);
        try {
          await claudeSrv.installPackage(name, parameters || {});
          return {
            result: `Package '${name}' installed successfully`,
          };
        } catch (error) {
          throw new Error(`Failed to install package '${name}': ${error}`);
        }
      }

      case 'restart-claude': {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          await claudeSrv.restartClaude();
          return {
            result: 'Claude.app has been restarted successfully',
          };
        } catch (error) {
          throw new Error(`Failed to restart Claude.app: ${error}`);
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid arguments: ${error.errors
          .map(e => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`
      );
    }
    throw error;
  }
});

// Start the server
export async function startMCPServer(): Promise<Server> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('MCPM MCP Server running on stdio');
  return server;
}
