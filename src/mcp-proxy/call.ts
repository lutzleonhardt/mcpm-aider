import { HostService, HostType } from '@mcpm/sdk';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

export async function callToolFunction(
  tool: string,
  functionName: string,
  parameters: any
): Promise<void> {
  const claudeSrv = HostService.getInstanceByType(HostType.CLAUDE);
  const server = await claudeSrv.getMCPServerWithStatus(tool);
  if (!server || !server.enabled) {
    throw new Error(`MCP server with identifier '${tool}' is not available or not enabled.`);
  }

  // Setup the transport using the server's configuration
  const transport = new StdioClientTransport({
    command: server.info.appConfig.command,
    args: server.info.appConfig.args || [],
    env: server.info.appConfig.env ? { ...server.info.appConfig.env } : {}
  });

  try {
    // Start the transport and connect the client
    await transport.start();
    const client = new Client({ name: tool, version: '1.0.0' });
    await client.connect(transport);

    // Call the tool function.
    // NOTE: The params structure here is a placeholder and should be adjusted to match your server's API.
    const result = await client.callTool({ name: functionName, arguments:parameters });
    console.log('Tool call result:', result);
  } catch (error) {
    console.error(
      `Error calling function '${functionName}' on MCP server '${tool}':`,
      error instanceof Error ? error.message : error
    );
    throw error;
  } finally {
    await transport.close();
  }
}
