export type TriageLevel = "red" | "yellow" | "green";

export interface VitalSigns {
  heartRate: number;           // bpm
  bloodPressure: {
    sys: number;               // mmHg
    dia: number;               // mmHg
  };
  spO2: number;                // % oxygen saturation
  temperature: number;         // °C
  respiratoryRate: number;     // breaths per minute
}

export interface Patient {
  patientId: string;
  name: string;
  age: number;
  vitals: VitalSigns;
  nutritionLevel?: number;     // % from HARVEST
  triageLevel?: TriageLevel;
  timestamp: Date;
}

export interface TriageRequest {
  patient: Patient;
  nutritionLevel: number;      // % from HARVEST
}

export interface TriageResponse {
  patientId: string;
  triageLevel: TriageLevel;
  score: number;
  reasons: string[];
  timestamp: Date;
}

export interface OutbreakRequest {
  patients: Patient[];
  policy?: NexusPolicy;        // from NEXUS
}

export interface OutbreakResponse {
  outbreakDetected: boolean;
  affectedCount: number;
  threatLevel: "low" | "medium" | "high" | "critical";
  symptoms: string[];
  recommendation: string;
  timestamp: Date;
}

export interface HarvestData {
  patientId: string;
  nutritionLevel: number;      // 0-100%
  hydrationLevel: number;      // 0-100%
  resourceAccess: boolean;
}

export interface NexusPolicy {
  outbreakThreshold: number;   // % of population to trigger alert
  quarantineRequired: boolean;
  isolationZones: string[];
  maxCapacity: number;
  allowedMovement: boolean;
}
