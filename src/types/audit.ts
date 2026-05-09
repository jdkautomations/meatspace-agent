// Audit ledger type definitions — immutable event trail

export type AuditEventType =
  | 'task.created'
  | 'task.policy_check'
  | 'task.posted'
  | 'task.worker_selected'
  | 'task.assigned'
  | 'task.evidence_submitted'
  | 'task.evidence_verified'
  | 'task.evidence_rejected'
  | 'task.approved'
  | 'task.paid'
  | 'task.disputed'
  | 'task.cancelled'
  | 'payment.authorized'
  | 'payment.released'
  | 'payment.held'
  | 'worker.scored'
  | 'worker.blocked'
  | 'policy.blocked'
  | 'policy.override'
  | 'admin.reviewed'
  | 'dispute.opened'
  | 'dispute.resolved';

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  taskId?: string;
  workerId?: string;
  agentId: string;
  payload: Record<string, unknown>;
  outcome: 'success' | 'failure' | 'blocked' | 'pending';
  message?: string;
  createdAt: string;            // ISO 8601
  source: 'agent' | 'admin' | 'worker' | 'system';
}

export interface AuditLog {
  taskId: string;
  events: AuditEvent[];
  createdAt: string;
  updatedAt: string;
}
