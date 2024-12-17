import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ClaudeHostService } from './services/claude.js';
import { version } from './utils/version.js';

// Initialize Claude Host Service
const claudeSrv = new ClaudeHostService();

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
        name: 'add-server',
        description: 'Add a new MCP server',
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
        name: 'remove-server',
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
        name: 'enable-server',
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
        name: 'disable-server',
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
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async request => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'add-server': {
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

      case 'remove-server': {
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

      case 'enable-server': {
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

      case 'disable-server': {
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
