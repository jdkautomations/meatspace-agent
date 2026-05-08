# meatspace-agent

MCP-native orchestration for compliant local verification on RentAHuman.ai. Assigns, verifies, and settles human gig work with auditable controls.

## Overview

This repo provides the skeleton for an autonomous agent bot that leverages RentAHuman.ai's MCP server and REST API to:

- **Discover** humans by skill, location, and availability
- **Post bounties** for bounded, low-liability physical tasks
- **Verify evidence** (photos, checklists, geofencing) before payout
- **Manage escrow & payouts** with full audit trails
- **Enforce safety policies** before any task is published

Designed for Sacramento 95815 as the primary launch market.

## Architecture

See the [Architecture Doc](docs/architecture.md) for full system design.

### High-Level Flow

1. Agent receives a task request via MCP tool
2. Policy gate checks allowed task types and risk level
3. Task is posted as a bounty on RentAHuman.ai
4. Workers apply; agent scores and selects
5. Worker completes task, submits evidence
6. Evidence service validates proof
7. Escrow releases payout; audit log records everything

## RentAHuman.ai Integration

This agent uses the [RentAHuman MCP server](https://rentahuman.ai/mcp) (`npx rentahuman-mcp`) and REST API (`https://rentahuman.ai/api`).

### Required Setup

1. Sign up and verify at [rentahuman.ai](https://rentahuman.ai) ($9.99/mo)
2. Generate an API key from your dashboard
3. Set `RENTAHUMAN_API_KEY` in your environment

### MCP Tools Used

- `search_humans` - Find humans by skill, location, rate
- `create_bounty` - Post tasks for humans to apply
- `accept_application` - Score and select workers
- `get_bounty_applications` - Review applicants
- `update_bounty` - Manage task lifecycle
- `start_conversation` / `send_message` - Human-in-the-loop coordination

### REST API Endpoints Used

- `POST /api/bounties` - Create a task bounty
- `GET /api/humans` - Browse available humans
- `GET /api/bookings` - Track active bookings
- `PATCH /api/bookings/:id` - Confirm completion, release payment

## Project Structure

```
meatspace-agent/
├─ README.md
├─ LICENSE
├─ .env.example
├─ .gitignore
├─ docs/           # Architecture, market research, policies
├─ src/            # TypeScript source
│  ├─ agent/       # Orchestrator, planner, policy, verifier
│  ├─ mcp/         # MCP client, server, tool registry
│  ├─ marketplace/ # Worker discovery, bidding, assignment
│  ├─ evidence/    # Checklist, media, geofence validation
│  ├─ payments/    # Escrow, payout, dispute handling
│  ├─ integrations/# RentAHuman, maps, SMS, storage
│  └─ types/       # TypeScript interfaces
├─ policies/       # YAML policy definitions
├─ prompts/        # System and agent prompts
├─ workflows/      # intake, assignment, verification, payout
├─ tests/          # Unit, integration, fixtures
└─ examples/       # Example task flows for 95815
```

## Initial MVP Scope

1. Post tasks in Sacramento 95815
2. Worker selection by tags, latency, rating, distance
3. Photo + checklist evidence pipeline
4. Single escrow/payout rule
5. Admin review console
6. Risk-policy gate before publishing

## Installation

```bash
git clone https://github.com/jdkautomations/meatspace-agent
cd meatspace-agent
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
```

## MCP Configuration

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

## Safety & Policy

All tasks must pass the policy gate before publishing. Prohibited: illegal, deceptive, surveillance, trespass, minors, sensitive data collection, high-risk labor, medical/legal/emergency tasks. See [Safety Policy](docs/safety-policy.md) and [Policy YAMLs](policies/).

## License

MIT - see [LICENSE](LICENSE)
