import { Task } from '../types/task';

export interface SafetyCheckResult {
  approved: boolean;
  reason?: string;
  flags: string[];
}

// Prohibited task keywords - tasks containing these will be rejected
const PROHIBITED_KEYWORDS = [
  'trespass', 'break in', 'enter without permission', 'illegal',
  'surveillance', 'spy', 'stalk', 'track person', 'follow individual',
  'minor', 'child', 'underage',
  'medical', 'legal advice', 'prescribe', 'diagnose',
  'weapon', 'firearm', 'explosive',
  'adult content', 'sexual', 'nude',
  'emergency', '911', 'ambulance', 'fire department',
  'financial advice', 'invest', 'stock tip',
  'impersonate', 'fraud', 'deceive',
];

// Maximum allowed budget (safety cap to prevent runaway spend)
const MAX_BUDGET_USD = 500;

// Maximum task duration
const MAX_HOURS = 8;

// Required fields for property inspection tasks
const PROPERTY_INSPECTION_REQUIRED = ['location', 'budget', 'dueDate'];

export async function runSafetyCheck(task: Task): Promise<SafetyCheckResult> {
  const flags: string[] = [];

  // 1. Budget cap check
  if (task.budget > MAX_BUDGET_USD) {
    flags.push(`budget_exceeds_cap: ${task.budget} > ${MAX_BUDGET_USD}`);
    return {
      approved: false,
      reason: `Budget $${task.budget} exceeds maximum allowed $${MAX_BUDGET_USD}`,
      flags,
    };
  }

  // 2. Duration cap check
  if (task.estimatedHours && task.estimatedHours > MAX_HOURS) {
    flags.push(`duration_exceeds_cap: ${task.estimatedHours}h > ${MAX_HOURS}h`);
    return {
      approved: false,
      reason: `Estimated ${task.estimatedHours}h exceeds maximum ${MAX_HOURS}h`,
      flags,
    };
  }

  // 3. Prohibited keyword check on title + description
  const combined = `${task.title} ${task.description}`.toLowerCase();
  for (const keyword of PROHIBITED_KEYWORDS) {
    if (combined.includes(keyword)) {
      flags.push(`prohibited_keyword: "${keyword}"`);
      return {
        approved: false,
        reason: `Task contains prohibited term: "${keyword}"`,
        flags,
      };
    }
  }

  // 4. Category-specific checks
  if (task.category === 'property_inspection') {
    for (const field of PROPERTY_INSPECTION_REQUIRED) {
      if (!task[field as keyof Task]) {
        flags.push(`missing_required_field: ${field}`);
      }
    }
    if (flags.length > 0) {
      return {
        approved: false,
        reason: `Property inspection missing required fields: ${flags.join(', ')}`,
        flags,
      };
    }

    // Must be exterior only - check description doesn't request interior access
    const interiorTerms = ['interior', 'inside', 'enter', 'indoor', 'room', 'bedroom', 'bathroom'];
    for (const term of interiorTerms) {
      if (combined.includes(term)) {
        flags.push(`interior_access_requested: "${term}"`);
        return {
          approved: false,
          reason: `Property inspection tasks must be exterior-only. Found term: "${term}"`,
          flags,
        };
      }
    }
  }

  // 5. Location validation - must have a real address for location-based tasks
  if (task.location && task.location.length < 5) {
    flags.push('location_too_short');
    return {
      approved: false,
      reason: 'Location field appears invalid (too short)',
      flags,
    };
  }

  // 6. Due date validation - must be in the future
  if (task.dueDate && new Date(task.dueDate) < new Date()) {
    flags.push('due_date_in_past');
    return {
      approved: false,
      reason: 'Task due date is in the past',
      flags,
    };
  }

  return {
    approved: true,
    flags,
  };
}

export function formatSafetyFlags(flags: string[]): string {
  if (flags.length === 0) return 'No flags';
  return flags.map((f) => `• ${f}`).join('\n');
}
