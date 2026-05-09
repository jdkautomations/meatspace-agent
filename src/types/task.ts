// Task type definitions for meatspace-agent

export type TaskStatus =
  | 'created'
  | 'posted'
  | 'applying'
  | 'assigned'
  | 'in_progress'
  | 'submitted'
  | 'verifying'
  | 'approved'
  | 'paid'
  | 'disputed'
  | 'revised'
  | 'cancelled';

export type TaskCategory = 'verification' | 'research' | 'handoff';

export type RiskLevel = 'low' | 'medium' | 'high' | 'blocked';

export interface TaskLocation {
  address: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
  geofenceRadiusMeters?: number;
}

export interface TaskEvidence {
  required: string[];           // e.g. ['photo', 'geotag', 'timestamp']
  minPhotos?: number;
  checklistItems?: string[];
}

export interface Task {
  id: string;
  category: TaskCategory;
  type: string;                 // e.g. 'storefront-photo', 'property-condition'
  title: string;
  description: string;
  location: TaskLocation;
  budget: number;               // USD
  durationMinutes: number;
  status: TaskStatus;
  riskLevel: RiskLevel;
  evidence: TaskEvidence;
  bountyId?: string;            // RentAHuman bounty ID after posting
  workerId?: string;            // Assigned worker ID
  createdAt: string;            // ISO 8601
  updatedAt: string;
  deadline?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface CreateTaskInput {
  category: TaskCategory;
  type: string;
  title: string;
  description: string;
  location: TaskLocation;
  budget: number;
  durationMinutes: number;
  evidence: TaskEvidence;
  tags?: string[];
  deadline?: string;
}
