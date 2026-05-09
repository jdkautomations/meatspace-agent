import { Task } from '../types/task';

export interface TaskPlan {
  steps: PlanStep[];
  deliverables: Deliverable[];
  evidenceSpec: EvidenceSpec[];
  estimatedMinutes: number;
  workerInstructions: string;
}

export interface PlanStep {
  order: number;
  action: string;
  detail: string;
  requiredTool?: string;
}

export interface Deliverable {
  name: string;
  description: string;
  format: 'photo' | 'video' | 'text' | 'form' | 'signature';
  required: boolean;
}

export interface EvidenceSpec {
  label: string;
  type: 'photo' | 'video' | 'document' | 'geotag';
  required: boolean;
  instructions: string;
}

// Task category → plan template mapping
const PLAN_TEMPLATES: Record<string, (task: Task) => TaskPlan> = {
  property_inspection: buildPropertyInspectionPlan,
  errand: buildErrandPlan,
  delivery: buildDeliveryPlan,
  default: buildDefaultPlan,
};

export async function planTask(task: Task): Promise<TaskPlan> {
  const category = task.category ?? 'default';
  const builder = PLAN_TEMPLATES[category] ?? PLAN_TEMPLATES.default;
  return builder(task);
}

function buildPropertyInspectionPlan(task: Task): TaskPlan {
  return {
    steps: [
      { order: 1, action: 'arrive', detail: 'Arrive at property address and confirm location via geotag' },
      { order: 2, action: 'photo_front', detail: 'Photograph front of property from street, full width visible' },
      { order: 3, action: 'photo_back', detail: 'Photograph rear of property from yard edge' },
      { order: 4, action: 'photo_left_side', detail: 'Photograph left exterior side of property' },
      { order: 5, action: 'photo_right_side', detail: 'Photograph right exterior side of property' },
      { order: 6, action: 'photo_front_yard', detail: 'Photograph front yard condition: lawn, landscaping, driveway' },
      { order: 7, action: 'photo_back_yard', detail: 'Photograph back yard condition: fencing, grass, structures' },
      { order: 8, action: 'photo_mailbox', detail: 'Photograph mailbox and address numbers' },
      { order: 9, action: 'photo_any_damage', detail: 'Photograph any visible damage, deferred maintenance, or violations' },
      { order: 10, action: 'submit_form', detail: 'Complete condition checklist and submit with all photos' },
    ],
    deliverables: [
      { name: 'front_photo', description: 'Full-width front exterior photo', format: 'photo', required: true },
      { name: 'back_photo', description: 'Rear exterior photo', format: 'photo', required: true },
      { name: 'left_side_photo', description: 'Left side exterior photo', format: 'photo', required: true },
      { name: 'right_side_photo', description: 'Right side exterior photo', format: 'photo', required: true },
      { name: 'front_yard_photo', description: 'Front yard condition photo', format: 'photo', required: true },
      { name: 'back_yard_photo', description: 'Back yard condition photo', format: 'photo', required: true },
      { name: 'mailbox_photo', description: 'Mailbox / address number photo', format: 'photo', required: true },
      { name: 'damage_photos', description: 'Photos of any damage (0 or more)', format: 'photo', required: false },
      { name: 'condition_form', description: 'Completed condition checklist', format: 'form', required: true },
      { name: 'arrival_geotag', description: 'GPS coordinates at time of arrival', format: 'form', required: true },
    ],
    evidenceSpec: [
      { label: 'front_photo', type: 'photo', required: true, instructions: 'Stand at street, capture full front of structure' },
      { label: 'back_photo', type: 'photo', required: true, instructions: 'Stand at back fence line, capture full rear' },
      { label: 'left_side_photo', type: 'photo', required: true, instructions: 'Left side from front corner looking back' },
      { label: 'right_side_photo', type: 'photo', required: true, instructions: 'Right side from front corner looking back' },
      { label: 'front_yard_photo', type: 'photo', required: true, instructions: 'Capture full front yard width including sidewalk' },
      { label: 'back_yard_photo', type: 'photo', required: true, instructions: 'Capture full back yard including any structures' },
      { label: 'mailbox_photo', type: 'photo', required: true, instructions: 'Close-up of mailbox and address number' },
      { label: 'arrival_geotag', type: 'geotag', required: true, instructions: 'GPS check-in within 50ft of property' },
    ],
    estimatedMinutes: 45,
    workerInstructions: `You are conducting an exterior property condition verification for a real estate management client.
DO NOT enter the property. Stay on public sidewalk and open areas.
Take all required photos in good lighting. Ensure photos are clear and unobscured.
Complete the condition checklist honestly. Note any visible damage or maintenance issues.
Submit all photos and the completed form through the task portal when done.`,
  };
}

function buildErrandPlan(task: Task): TaskPlan {
  return {
    steps: [
      { order: 1, action: 'confirm_task', detail: 'Confirm errand details with requester' },
      { order: 2, action: 'complete_errand', detail: 'Complete the specified errand' },
      { order: 3, action: 'photo_receipt', detail: 'Photograph any receipts or completion evidence' },
      { order: 4, action: 'submit', detail: 'Submit completion evidence' },
    ],
    deliverables: [
      { name: 'completion_photo', description: 'Photo proving errand completion', format: 'photo', required: true },
    ],
    evidenceSpec: [
      { label: 'completion_photo', type: 'photo', required: true, instructions: 'Photo confirming task completion' },
    ],
    estimatedMinutes: 60,
    workerInstructions: `Complete the errand as described. Photograph any receipts or completion confirmation. Submit when done.`,
  };
}

function buildDeliveryPlan(task: Task): TaskPlan {
  return {
    steps: [
      { order: 1, action: 'pickup', detail: 'Pick up item from origin location' },
      { order: 2, action: 'photo_pickup', detail: 'Photo of item at pickup' },
      { order: 3, action: 'deliver', detail: 'Deliver to destination' },
      { order: 4, action: 'photo_delivery', detail: 'Photo confirming delivery' },
    ],
    deliverables: [
      { name: 'pickup_photo', description: 'Photo of item at pickup location', format: 'photo', required: true },
      { name: 'delivery_photo', description: 'Photo confirming delivery', format: 'photo', required: true },
    ],
    evidenceSpec: [
      { label: 'pickup_photo', type: 'photo', required: true, instructions: 'Photo of item at pickup' },
      { label: 'delivery_photo', type: 'photo', required: true, instructions: 'Photo of item at delivery location' },
    ],
    estimatedMinutes: 90,
    workerInstructions: `Pick up and deliver the item as described. Photo the item at pickup and at delivery. Submit when done.`,
  };
}

function buildDefaultPlan(task: Task): TaskPlan {
  return {
    steps: [{ order: 1, action: 'complete_task', detail: task.description }],
    deliverables: [{ name: 'completion_evidence', description: 'Evidence of task completion', format: 'photo', required: true }],
    evidenceSpec: [{ label: 'completion_evidence', type: 'photo', required: true, instructions: 'Photo or document proving completion' }],
    estimatedMinutes: task.estimatedHours ? task.estimatedHours * 60 : 60,
    workerInstructions: task.description,
  };
}
