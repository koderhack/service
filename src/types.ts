export interface GeoLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface Appointment {
  id: string;
  clientName: string; // Simplified for demo, can be parsed from text
  location: GeoLocation;
  start: string; // ISO string
  end: string;   // ISO string
  notes?: string;
  isSynced?: boolean;
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface ScoredSlot extends TimeSlot {
  score: number; // Lower is better (minutes of added travel)
  travelToClient: number; // minutes
  travelFromClient: number; // minutes
  reason: string;
}

export interface UserPreferences {
  workStartHour: number; // e.g., 8
  workEndHour: number;   // e.g., 17
  appointmentDurationMinutes: number; // e.g., 60
  homeBase: GeoLocation;
}

export interface WebhookTask {
  id: string;
  rawText: string;
  timestamp: number;
}