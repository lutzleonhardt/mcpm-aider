import { Client, StdioClientTransport } from '@modelcontextprotocol/sdk';
import type { MCPServerWithStatus } from '@mcpm/sdk';

export async function generateToolPrompt(
  servers: MCPServerWithStatus[]
): Promise<string> {
  const enabledServers = servers.filter(s => s.enabled);
  
  const serverSections = await Promise.all(
    enabledServers.map(async (server) => {
      const transport = new StdioClientTransport({
        command: server.info.appConfig.command,
        args: server.info.appConfig.args || [],
        env: server.info.appConfig.env
      });

      let section = `## Server: ${server.info.name}\n`;
      
      try {
        const client = new Client({ name: 'ToolPromptGen', version: '1.0.0' });
        await client.connect(transport);
        const { tools } = await client.listTools();

        if (tools.length === 0) {
          section += "*No tools available*\n";
        }

        for (const tool of tools) {
          section += `### ${tool.name}\n${
            tool.description?.trim() ? `${tool.description}\n` : ''
          }`;

          if (tool.inputSchema?.properties) {
            section += "**Parameters**:\n";
            for (const [param, schema] of Object.entries(tool.inputSchema.properties)) {
              const type = (schema as any)._def?.typeName.replace('Zod', '') || 'any';
              // @ts-expect-error - Zod schema desc from practical use
              const desc = schema.description ? ` - ${schema.description}` : '';
              section += `- \`${param}\` (${type})${desc}\n`;
            }
          }
          section += '\n';
        }
      } catch (error) {
        section += `\n**ERROR**: ${error instanceof Error ? error.message : 'Failed to retrieve tools'}\n`;
      } finally {
        await transport.close();
      }

      return section;
    })
  );

  return `# Available AI Tools\n\n${serverSections.join('\n---\n')}`;
}
