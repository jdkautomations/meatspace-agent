import { EvidenceItem } from '../types/evidence';
import { EvidenceSpec } from '../agent/planner';
import { getBountyApplications } from '../integrations/rentahuman';
import { v4 as uuidv4 } from 'uuid';

/**
 * Evidence Collector
 * Polls RentAHuman.ai for submitted evidence (photos, forms, geotags)
 * and packages them into structured EvidenceItem records.
 *
 * In production this would listen to webhooks. For now it polls.
 */

const POLL_INTERVAL_MS = 30_000; // 30 seconds
const MAX_POLL_ATTEMPTS = 120;   // 1 hour total

export async function collectEvidence(
  taskId: string,
  specs: EvidenceSpec[]
): Promise<EvidenceItem[]> {
  // In production: set up webhook listener and wait for evidence submission
  // For now: simulate collection with a polling stub
  const collected: EvidenceItem[] = [];

  for (const spec of specs) {
    const item = await pollForEvidence(taskId, spec);
    if (item) {
      collected.push(item);
    }
  }

  return collected;
}

async function pollForEvidence(
  taskId: string,
  spec: EvidenceSpec
): Promise<EvidenceItem | null> {
  // Stub: in production, poll the RentAHuman.ai API for evidence uploads
  // For now, return a placeholder indicating evidence is expected
  const item: EvidenceItem = {
    id: uuidv4(),
    taskId,
    label: spec.label,
    type: spec.type,
    status: 'pending',
    instructions: spec.instructions,
    required: spec.required,
    submittedAt: null,
    url: null,
    metadata: null,
  };

  return item;
}

export async function pollUntilComplete(
  taskId: string,
  specs: EvidenceSpec[],
  onProgress?: (completed: number, total: number) => void
): Promise<EvidenceItem[]> {
  let attempts = 0;
  const required = specs.filter((s) => s.required);
  const collected: EvidenceItem[] = [];

  while (attempts < MAX_POLL_ATTEMPTS) {
    const items = await collectEvidence(taskId, specs);
    const completedRequired = items.filter(
      (i) => i.required && i.status === 'submitted'
    );

    if (onProgress) {
      onProgress(completedRequired.length, required.length);
    }

    if (completedRequired.length >= required.length) {
      return items;
    }

    attempts++;
    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(`Evidence collection timed out after ${MAX_POLL_ATTEMPTS} attempts for task ${taskId}`);
}

export function summarizeEvidence(items: EvidenceItem[]): string {
  const submitted = items.filter((i) => i.status === 'submitted');
  const pending = items.filter((i) => i.status === 'pending');
  const missing = items.filter((i) => i.required && i.status === 'pending');

  return [
    `Evidence summary for task:`,
    `  Total items: ${items.length}`,
    `  Submitted: ${submitted.length}`,
    `  Pending: ${pending.length}`,
    `  Missing required: ${missing.length}`,
    missing.length > 0
      ? `  Missing: ${missing.map((m) => m.label).join(', ')}`
      : '  All required evidence received',
  ].join('\n');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
