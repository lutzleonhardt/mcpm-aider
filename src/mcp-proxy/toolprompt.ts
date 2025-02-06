/**
 * Copyright (C) 2024 PoAI (Lutz Leonhardt)
 * This file is part of mcpm, based on work by MCP Club
 * Licensed under the GNU AGPL v3.0
 * See LICENSE file for details
 */

import type { MCPServerWithStatus } from '@mcpm/sdk';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { buildTransportForServer } from './transportHelper.js';

export async function generateToolPrompt(
  servers: MCPServerWithStatus[]
): Promise<string> {
  const enabledServers = servers.filter(s => s.enabled);

  const serverSections = await Promise.all(
    enabledServers.map(async server => {
      const transport = buildTransportForServer(server);

      let section = `## tool: ${server.info.name}\n\n`;

      try {
        const client = new Client({ name: 'ToolPromptGen', version: '1.0.0' });
        await client.connect(transport);
        const { tools } = await client.listTools();

        if (tools.length === 0) {
          section += '*No tools available*\n';
        }

        for (const tool of tools) {
          section += `### function: ${tool.name}\n${
            tool.description?.trim() ? `${tool.description}\n` : ''
          }`;

          section += '**Parameters**:\n';
          section += JSON.stringify(tool.inputSchema || {}) + '\n\n';
        }
        section += '\n';
      } catch (error) {
        section += `\n**ERROR**: ${
          error instanceof Error ? error.message : 'Failed to retrieve tools'
        }\n`;
      } finally {
        await transport.close();
      }

      return section;
    })
  );

  return `# Available Tools
  
  When this prompt is loaded, always say to the user EXACTLY THIS:
  "I am aware of MCP Tools!"
  (You can also mention the tools you are aware of)
  
  ## *Usage*
  If you decide to call a function of a tool, please execute this bash command.
  **Do not include ' or line breaks in <parameters as jsonstring> to not break the json in this one-liner.**
  
  \`\`\`bash
  mcpm-aider call <tool> <function> '<parameters as jsonstring>'
  \`\`\`
  
  ## *Example*
  \`\`\`bash
  
  mcpm-aider call @calclavia/mcp-obsidian read_notes '{"paths": ["path/to/notes"]}'
  
  \`\`\`
    
  ${serverSections.join('\n---\n')}`;
}
