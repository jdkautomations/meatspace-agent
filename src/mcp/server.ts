/**
 * MCP Server for meatspace-agent
 * Exposes task orchestration tools to MCP-compatible AI clients (Claude, etc.)
 * Protocol: Model Context Protocol (MCP) over stdio or HTTP/SSE
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { TOOLS, handleToolCall } from './tools';

const SERVER_NAME = 'meatspace-agent';
const SERVER_VERSION = '0.1.0';

export async function startMcpServer(): Promise<void> {
  const server = new Server(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOLS };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      const result = await handleToolCall(name, args ?? {});
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [{ type: 'text', text: `Error: ${message}` }],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[meatspace-agent] MCP server running (${SERVER_NAME} v${SERVER_VERSION})`);
}

// Entry point when run directly
startMcpServer().catch((err) => {
  console.error('[meatspace-agent] Fatal error:', err);
  process.exit(1);
});
