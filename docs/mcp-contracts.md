# MCP Contracts

Defines the MCP tool surface for the meatspace-agent. These are the tools the agent is authorized to call against RentAHuman.ai's MCP server (`npx rentahuman-mcp`).

## MCP Server Setup

```json
{
  "mcpServers": {
    "rentahuman": {
      "command": "npx",
      "args": ["rentahuman-mcp"],
      "env": {
        "RENTAHUMAN_API_KEY": "rah_your_key_here"
      }
    }
  }
}
```

MCP Endpoint: `POST https://rentahuman.ai/api/mcp`
Header: `X-API-Key: rah_your_key_here`

## Authorized Tools

### Discovery
| Tool | Arguments | Description |
|------|-----------|-------------|
| `search_humans` | `{ skill, maxRate, location, limit }` | Find workers by skill/location |
| `get_human` | `{ humanId }` | Full profile, availability, wallets |
| `list_skills` | `{}` | All available skills on platform |
| `get_reviews` | `{ humanId }` | Worker ratings and reviews |

### Bounty Management
| Tool | Arguments | Description |
|------|-----------|-------------|
| `create_bounty` | `{ title, description, budget, location, tags }` | Post a task |
| `list_bounties` | `{ location?, skill? }` | Browse open bounties |
| `get_bounty` | `{ bountyId }` | Bounty details |
| `get_bounty_applications` | `{ bountyId }` | Applications list |
| `accept_application` | `{ applicationId }` | Accept a worker |
| `update_bounty` | `{ bountyId, status }` | Modify/cancel bounty |

### Messaging
| Tool | Arguments | Description |
|------|-----------|-------------|
| `start_conversation` | `{ humanId, subject, message }` | Open a conversation |
| `send_message` | `{ conversationId, message }` | Send in conversation |
| `get_conversation` | `{ conversationId }` | Full message history |
| `list_conversations` | `{}` | All active conversations |

### Account
| Tool | Arguments | Description |
|------|-----------|-------------|
| `get_agent_identity` | `{}` | Agent's cryptographic identity |
| `check_account_status` | `{}` | Account capabilities |
| `get_pairing_code` | `{}` | Generate pairing code (e.g. RENT-A3B7) |
| `check_pairing_status` | `{ code }` | Poll pairing status |

## Rate Limits

- `GET` requests: 100/min
- `POST/PATCH` requests: 20/min
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

## Example: Create a Property Verification Bounty

```json
{
  "tool": "create_bounty",
  "arguments": {
    "title": "Rental Property Condition Check - 95815",
    "description": "Take 6 photos of property at [ADDRESS]: front yard, backyard, each side, front door, and street view. Note any visible damage. Takes ~20 min.",
    "budget": 25,
    "location": "Sacramento, CA 95815",
    "tags": ["photography", "verification", "real-estate"]
  }
}
```

## Example: Search for Nearby Workers

```json
{
  "tool": "search_humans",
  "arguments": {
    "skill": "Photography",
    "maxRate": 50,
    "location": "sacramento",
    "limit": 10
  }
}
```
