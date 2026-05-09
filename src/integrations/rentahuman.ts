/**
 * RentAHuman.ai integration — wraps REST API and MCP server
 * API docs: https://rentahuman.ai/api-docs
 * MCP docs: https://rentahuman.ai/mcp
 */

const BASE_URL = process.env.RENTAHUMAN_MCP_URL || 'https://rentahuman.ai/api/mcp';
const REST_URL = 'https://rentahuman.ai/api';
const API_KEY = process.env.RENTAHUMAN_API_KEY || '';

interface MCPRequest {
  jsonrpc: '2.0';
  method: string;
  params?: { name: string; arguments: Record<string, unknown> };
  id: number;
}

interface MCPResponse<T = unknown> {
  jsonrpc: '2.0';
  result?: T;
  error?: { code: number; message: string };
  id: number;
}

// ── MCP tool caller ──────────────────────────────────────────────────────────

let _reqId = 1;

export async function callTool<T = unknown>(
  toolName: string,
  args: Record<string, unknown> = {}
): Promise<T> {
  const body: MCPRequest = {
    jsonrpc: '2.0',
    method: 'tools/call',
    params: { name: toolName, arguments: args },
    id: _reqId++,
  };

  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': API_KEY,
    },
    body: JSON.stringify(body),
  });

  const json: MCPResponse<T> = await res.json();
  if (json.error) throw new Error(`MCP error ${json.error.code}: ${json.error.message}`);
  return json.result as T;
}

// ── Discovery ────────────────────────────────────────────────────────────────

export async function searchHumans(args: {
  skill?: string;
  location?: string;
  maxRate?: number;
  limit?: number;
}) {
  return callTool('search_humans', args);
}

export async function getHuman(humanId: string) {
  return callTool('get_human', { humanId });
}

// ── Bounties ─────────────────────────────────────────────────────────────────

export async function createBounty(args: {
  title: string;
  description: string;
  budget: number;
  location: string;
  tags?: string[];
}) {
  return callTool('create_bounty', args);
}

export async function getBountyApplications(bountyId: string) {
  return callTool('get_bounty_applications', { bountyId });
}

export async function acceptApplication(applicationId: string) {
  return callTool('accept_application', { applicationId });
}

export async function updateBounty(bountyId: string, status: string) {
  return callTool('update_bounty', { bountyId, status });
}

// ── Messaging ────────────────────────────────────────────────────────────────

export async function startConversation(humanId: string, subject: string, message: string) {
  return callTool('start_conversation', { humanId, subject, message });
}

export async function sendMessage(conversationId: string, message: string) {
  return callTool('send_message', { conversationId, message });
}

// ── REST API (direct) ────────────────────────────────────────────────────────

export async function restGet(path: string) {
  const res = await fetch(`${REST_URL}${path}`, {
    headers: { 'X-API-Key': API_KEY },
  });
  return res.json();
}

export async function restPost(path: string, body: unknown) {
  const res = await fetch(`${REST_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify(body),
  });
  return res.json();
}
