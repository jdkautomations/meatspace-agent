import { Task, TaskStatus } from '../types/task';
import { Worker } from '../types/worker';
import { AuditLog } from '../types/audit';
import { searchHumans, createBounty, getBountyApplications, acceptApplication } from '../integrations/rentahuman';
import { runSafetyCheck } from './safety';
import { planTask } from './planner';
import { collectEvidence } from '../evidence/collector';
import { releaseEscrow, holdEscrow } from '../payments/escrow';
import { v4 as uuidv4 } from 'uuid';

export interface OrchestratorConfig {
  maxRetries: number;
  timeoutMs: number;
  requireEvidence: boolean;
  autoRelease: boolean;
}

const DEFAULT_CONFIG: OrchestratorConfig = {
  maxRetries: 2,
  timeoutMs: 3_600_000, // 1 hour
  requireEvidence: true,
  autoRelease: false,
};

export async function orchestrateTask(
  task: Omit<Task, 'id' | 'status' | 'createdAt' | 'updatedAt'>,
  config: Partial<OrchestratorConfig> = {}
): Promise<{ task: Task; audit: AuditLog[] }> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const audit: AuditLog[] = [];
  const taskId = uuidv4();

  const fullTask: Task = {
    ...task,
    id: taskId,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const log = (action: string, detail: unknown) => {
    audit.push({
      id: uuidv4(),
      taskId,
      action,
      detail,
      timestamp: new Date(),
      actor: 'orchestrator',
    });
  };

  log('task_created', { task: fullTask });

  // Safety gate
  const safetyResult = await runSafetyCheck(fullTask);
  log('safety_check', safetyResult);
  if (!safetyResult.approved) {
    fullTask.status = 'rejected';
    fullTask.updatedAt = new Date();
    log('task_rejected', { reason: safetyResult.reason });
    return { task: fullTask, audit };
  }

  // Plan the task
  const plan = await planTask(fullTask);
  log('task_planned', { plan });

  // Search for eligible workers
  const workers: Worker[] = await searchHumans({
    skills: task.requiredSkills,
    location: task.location,
    maxHourlyRate: task.budget / (task.estimatedHours ?? 1),
  });
  log('workers_found', { count: workers.length });

  if (workers.length === 0) {
    fullTask.status = 'no_workers';
    fullTask.updatedAt = new Date();
    log('task_failed', { reason: 'no_eligible_workers' });
    return { task: fullTask, audit };
  }

  // Create bounty
  const bounty = await createBounty({
    title: task.title,
    description: task.description,
    budget: task.budget,
    skills: task.requiredSkills,
    location: task.location,
    dueDate: task.dueDate,
    deliverables: plan.deliverables,
  });
  log('bounty_created', { bountyId: bounty.id });

  fullTask.bountyId = bounty.id;
  fullTask.status = 'posted';
  fullTask.updatedAt = new Date();

  // Hold escrow
  await holdEscrow(taskId, task.budget);
  log('escrow_held', { amount: task.budget });

  // Wait for applications (polling stub - production uses webhooks)
  const applications = await getBountyApplications(bounty.id);
  log('applications_received', { count: applications.length });

  if (applications.length === 0) {
    fullTask.status = 'no_applicants';
    fullTask.updatedAt = new Date();
    log('task_failed', { reason: 'no_applications' });
    return { task: fullTask, audit };
  }

  // Accept best applicant (lowest rate, highest rating)
  const best = applications.sort(
    (a, b) => b.worker.rating - a.worker.rating || a.worker.hourlyRate - b.worker.hourlyRate
  )[0];

  await acceptApplication(bounty.id, best.id);
  fullTask.assignedWorkerId = best.worker.id;
  fullTask.status = 'assigned';
  fullTask.updatedAt = new Date();
  log('application_accepted', { workerId: best.worker.id });

  // Collect evidence
  if (cfg.requireEvidence) {
    const evidence = await collectEvidence(taskId, plan.evidenceSpec);
    log('evidence_collected', { evidenceItems: evidence.length });
    fullTask.evidenceIds = evidence.map((e) => e.id);
  }

  // Release payment
  if (cfg.autoRelease) {
    await releaseEscrow(taskId);
    fullTask.status = 'completed';
    log('escrow_released', { taskId });
  } else {
    fullTask.status = 'awaiting_approval';
    log('awaiting_human_approval', { taskId });
  }

  fullTask.updatedAt = new Date();
  return { task: fullTask, audit };
}
