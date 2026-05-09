import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { orchestrateTask } from '../agent/orchestrator';
import { runSafetyCheck } from '../agent/safety';

// MCP Tool definitions
export const TOOLS: Tool[] = [
  {
    name: 'create_property_inspection',
    description:
      'Post a rental property condition verification task to RentAHuman.ai. A vetted local worker will photograph the property exterior (front, back, sides, yards) and submit a condition report.',
    inputSchema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'Full property address to inspect (e.g. "1234 Main St, Sacramento, CA 95815")',
        },
        client_name: {
          type: 'string',
          description: 'Name of the real estate agent or property manager ordering the inspection',
        },
        due_date: {
          type: 'string',
          description: 'ISO 8601 date/time by which the inspection must be completed (e.g. "2025-08-01T17:00:00Z")',
        },
        budget_usd: {
          type: 'number',
          description: 'Maximum budget in USD (default: 75, max: 200)',
          default: 75,
        },
        notes: {
          type: 'string',
          description: 'Any special instructions for the inspector (optional)',
        },
      },
      required: ['address', 'client_name', 'due_date'],
    },
  },
  {
    name: 'check_safety',
    description: 'Run a safety check on a proposed task description before posting. Returns approved/rejected with reason.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Task title' },
        description: { type: 'string', description: 'Full task description' },
        category: { type: 'string', description: 'Task category (e.g. property_inspection, errand, delivery)' },
        budget: { type: 'number', description: 'Budget in USD' },
        location: { type: 'string', description: 'Task location address' },
      },
      required: ['title', 'description'],
    },
  },
  {
    name: 'create_errand_task',
    description: 'Post a general errand task to RentAHuman.ai (e.g. picking up an item, dropping off documents).',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short task title' },
        description: { type: 'string', description: 'Full errand description' },
        location: { type: 'string', description: 'Where the errand takes place' },
        due_date: { type: 'string', description: 'ISO 8601 due date' },
        budget_usd: { type: 'number', description: 'Budget in USD', default: 50 },
      },
      required: ['title', 'description', 'location', 'due_date'],
    },
  },
];

// Tool call dispatcher
export async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case 'create_property_inspection':
      return handleCreatePropertyInspection(args);
    case 'check_safety':
      return handleCheckSafety(args);
    case 'create_errand_task':
      return handleCreateErrandTask(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function handleCreatePropertyInspection(args: Record<string, unknown>) {
  const address = String(args.address ?? '');
  const clientName = String(args.client_name ?? '');
  const dueDate = String(args.due_date ?? '');
  const budget = Number(args.budget_usd ?? 75);
  const notes = args.notes ? String(args.notes) : '';

  const task = {
    title: `Property Condition Verification: ${address}`,
    description: `Exterior condition inspection for ${address}. Client: ${clientName}.${notes ? ` Notes: ${notes}` : ''}
    
Required photos: front, back, left side, right side, front yard, back yard, mailbox/address numbers, any damage.
DO NOT enter the property. Exterior only from public areas.`,
    category: 'property_inspection' as const,
    location: address,
    requiredSkills: ['photography', 'local_knowledge'],
    budget,
    estimatedHours: 1,
    dueDate: new Date(dueDate),
    clientReference: clientName,
  };

  const { task: result, audit } = await orchestrateTask(task);

  return {
    success: result.status !== 'rejected' && result.status !== 'no_workers',
    task_id: result.id,
    status: result.status,
    bounty_id: result.bountyId,
    assigned_worker: result.assignedWorkerId,
    audit_events: audit.length,
    message: getStatusMessage(result.status),
  };
}

async function handleCheckSafety(args: Record<string, unknown>) {
  const mockTask = {
    id: 'safety-check',
    title: String(args.title ?? ''),
    description: String(args.description ?? ''),
    category: String(args.category ?? 'default') as 'property_inspection' | 'errand' | 'delivery' | 'default',
    location: args.location ? String(args.location) : undefined,
    budget: Number(args.budget ?? 100),
    requiredSkills: [],
    status: 'pending' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await runSafetyCheck(mockTask);
  return result;
}

async function handleCreateErrandTask(args: Record<string, unknown>) {
  const task = {
    title: String(args.title ?? ''),
    description: String(args.description ?? ''),
    category: 'errand' as const,
    location: String(args.location ?? ''),
    requiredSkills: ['errand_running'],
    budget: Number(args.budget_usd ?? 50),
    estimatedHours: 1,
    dueDate: new Date(String(args.due_date)),
  };

  const { task: result } = await orchestrateTask(task);
  return {
    success: result.status !== 'rejected',
    task_id: result.id,
    status: result.status,
    message: getStatusMessage(result.status),
  };
}

function getStatusMessage(status: string): string {
  const messages: Record<string, string> = {
    pending: 'Task created and pending safety review',
    posted: 'Task posted to RentAHuman.ai marketplace',
    assigned: 'Worker assigned, awaiting completion',
    awaiting_approval: 'Task completed, awaiting your approval to release payment',
    completed: 'Task completed and payment released',
    rejected: 'Task rejected by safety gate',
    no_workers: 'No eligible workers found in area',
    no_applicants: 'No workers applied for this task',
  };
  return messages[status] ?? `Status: ${status}`;
}
