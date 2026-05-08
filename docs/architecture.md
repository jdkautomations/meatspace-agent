# Architecture

MCP-native orchestration for compliant local verification on RentAHuman.ai.

## System Overview

The meatspace-agent is built as a control-plane / execution-plane split:

- **Control Plane**: Autonomous agent that decides when to post a task, select a worker, verify evidence, and settle payment. Runs the policy checks, routing logic, and retry strategies.
- **Execution Plane**: Ledger for marketplace actions, messaging, evidence capture, and payment reconciliation. Backed by RentAHuman.ai's MCP server and REST API.

## Core Services

### Agent Orchestrator
Coordinates task lifecycle. Receives incoming task requests, runs policy gates, calls marketplace tools, monitors evidence submissions, and triggers payout. Implements retry logic and escalation paths.

### MCP Gateway
Wraps RentAHuman.ai's MCP server (`rentahuman-mcp`) and REST API into agent-accessible tools. Maps internal task/workflow states to RentAHuman's booking, bounty, and conversation APIs.

### Worker Registry
Maintains local cache of worker profiles discovered via `search_humans`. Tracks skills, location, rates, latency, and reputation scores for Sacramento 95815.

### Task Factory
GeneratesRentAHuman-ready bounty postings from structured task requests. Handles task templating for Sacramento-specific gig types.

### Evidence Service
Validates submitted evidence: photos with geofencing checks, checklist compliance, receipt parsing, media authenticity. Blocks payout until evidence passes.

### Escrow & Payouts
Manages payment state: authorize on bounty post, hold on completion, release on verification. Integrates with RentAHuman's booking payment flow.

### Audit Ledger
Immutable event trail for every assignment and payout. Written to local storage and synced to a durable backend. Supports compliance review and debugging.

## Data Flow

```
Task Request -> Policy Gate -> Bounty Post (RentAHuman)
          -> Worker Discovery -> Application Review
          -> Task Assignment -> Evidence Submission
          -> Evidence Verification -> Payout Release
          -> Audit Log Entry
```

## Technology Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **MCP Server**: `npx rentahuman-mcp`
- **LLM Provider**: Nebius (configurable)
- **Storage**: S3-compatible for evidence artifacts
- **Maps**: Google Maps API for geofencing
