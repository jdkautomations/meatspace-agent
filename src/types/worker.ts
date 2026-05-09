// Worker type definitions — maps to RentAHuman.ai human profiles

export interface WorkerLocation {
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
}

export interface WorkerWallet {
  type: 'crypto' | 'stripe' | 'paypal';
  address: string;
}

export interface Worker {
  id: string;                   // RentAHuman human ID
  name: string;
  bio?: string;
  skills: string[];             // e.g. ['Photography', 'Verification', 'Errand']
  location: WorkerLocation;
  hourlyRate: number;           // USD
  rating: number;               // 0–5
  reviewCount: number;
  responseTimeMinutes?: number;
  wallets: WorkerWallet[];
  available: boolean;
  distanceKm?: number;          // calculated at query time
  profileUrl?: string;
  lastSeen?: string;            // ISO 8601
}

export interface WorkerScore {
  workerId: string;
  compositeScore: number;       // 0–100
  ratingScore: number;
  distanceScore: number;
  rateScore: number;
  responseScore: number;
  notes?: string;
}

export interface WorkerSearchParams {
  skill?: string;
  location?: string;
  maxRate?: number;
  minRating?: number;
  limit?: number;
}
