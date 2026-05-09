/**
 * Escrow Module
 * Manages payment holds and releases for meatspace-agent tasks.
 *
 * In production this integrates with RentAHuman.ai's payment system.
 * Funds are held in escrow when a task is assigned and released
 * only after the client approves the completed evidence.
 *
 * IMPORTANT: Never release funds automatically without evidence validation.
 */

interface EscrowRecord {
  taskId: string;
  amount: number;
  status: 'held' | 'released' | 'refunded' | 'disputed';
  heldAt: Date;
  releasedAt?: Date;
  notes?: string;
}

// In-memory store (replace with database in production)
const escrowStore = new Map<string, EscrowRecord>();

export async function holdEscrow(taskId: string, amount: number): Promise<void> {
  if (amount <= 0) {
    throw new Error(`Invalid escrow amount: ${amount}`);
  }
  if (escrowStore.has(taskId)) {
    throw new Error(`Escrow already held for task ${taskId}`);
  }

  const record: EscrowRecord = {
    taskId,
    amount,
    status: 'held',
    heldAt: new Date(),
  };

  escrowStore.set(taskId, record);

  // In production: call RentAHuman.ai payment API to hold funds
  console.log(`[escrow] Held $${amount} for task ${taskId}`);
}

export async function releaseEscrow(taskId: string, notes?: string): Promise<void> {
  const record = escrowStore.get(taskId);
  if (!record) {
    throw new Error(`No escrow record found for task ${taskId}`);
  }
  if (record.status !== 'held') {
    throw new Error(`Cannot release escrow in status "${record.status}" for task ${taskId}`);
  }

  record.status = 'released';
  record.releasedAt = new Date();
  record.notes = notes;

  // In production: call RentAHuman.ai payment API to release funds to worker
  console.log(`[escrow] Released $${record.amount} for task ${taskId}`);
}

export async function refundEscrow(taskId: string, reason: string): Promise<void> {
  const record = escrowStore.get(taskId);
  if (!record) {
    throw new Error(`No escrow record found for task ${taskId}`);
  }
  if (record.status !== 'held') {
    throw new Error(`Cannot refund escrow in status "${record.status}" for task ${taskId}`);
  }

  record.status = 'refunded';
  record.releasedAt = new Date();
  record.notes = reason;

  // In production: call RentAHuman.ai payment API to refund to client
  console.log(`[escrow] Refunded $${record.amount} for task ${taskId}: ${reason}`);
}

export async function disputeEscrow(taskId: string, reason: string): Promise<void> {
  const record = escrowStore.get(taskId);
  if (!record) {
    throw new Error(`No escrow record found for task ${taskId}`);
  }

  record.status = 'disputed';
  record.notes = reason;

  // In production: escalate to RentAHuman.ai dispute resolution team
  console.log(`[escrow] Disputed $${record.amount} for task ${taskId}: ${reason}`);
}

export function getEscrowStatus(taskId: string): EscrowRecord | null {
  return escrowStore.get(taskId) ?? null;
}

export function getEscrowSummary(): {
  totalHeld: number;
  totalReleased: number;
  totalRefunded: number;
  totalDisputed: number;
} {
  let totalHeld = 0;
  let totalReleased = 0;
  let totalRefunded = 0;
  let totalDisputed = 0;

  for (const record of escrowStore.values()) {
    if (record.status === 'held') totalHeld += record.amount;
    else if (record.status === 'released') totalReleased += record.amount;
    else if (record.status === 'refunded') totalRefunded += record.amount;
    else if (record.status === 'disputed') totalDisputed += record.amount;
  }

  return { totalHeld, totalReleased, totalRefunded, totalDisputed };
}
