// Evidence type definitions — for photo/checklist/geofence validation

export type EvidenceStatus = 'pending' | 'submitted' | 'valid' | 'invalid' | 'disputed';

export interface GeoTag {
  lat: number;
  lng: number;
  accuracyMeters: number;
  timestamp: string;            // ISO 8601
}

export interface Photo {
  url: string;
  thumbnailUrl?: string;
  geotag?: GeoTag;
  capturedAt: string;           // ISO 8601
  sizeBytes?: number;
  mimeType?: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  notes?: string;
}

export interface PropertyConditionEvidence {
  photos: Photo[];              // front, back, sides, door, street
  checklist: ChecklistItem[];   // damage visible, yard maintained, etc.
  notes?: string;
  workerNotes?: string;
}

export interface Evidence {
  id: string;
  taskId: string;
  workerId: string;
  status: EvidenceStatus;
  photos: Photo[];
  checklist: ChecklistItem[];
  geotag?: GeoTag;
  submittedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;          // 'agent' | 'admin'
  rejectionReason?: string;
  notes?: string;
}

export interface EvidenceSubmission {
  taskId: string;
  photos: Photo[];
  checklist: ChecklistItem[];
  geotag?: GeoTag;
  notes?: string;
}
