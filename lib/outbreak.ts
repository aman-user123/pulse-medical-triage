import { OutbreakRequest, OutbreakResponse, NexusPolicy } from "@/types";

const DEFAULT_POLICY: NexusPolicy = {
  outbreakThreshold: 30,       // 30% of patients = outbreak
  quarantineRequired: true,
  isolationZones: [],
  maxCapacity: 100,
  allowedMovement: false,
};

function getAffectedCount(patients: OutbreakRequest["patients"]): number {
  return patients.filter((p) => {
    const v = p.vitals;
    return (
      v.temperature > 38 ||
      v.respiratoryRate > 20 ||
      v.spO2 < 95 ||
      v.heartRate > 100
    );
  }).length;
}

function detectSymptoms(patients: OutbreakRequest["patients"]): string[] {
  const symptoms: string[] = [];

  const highTempCount = patients.filter((p) => p.vitals.temperature > 38).length;
  const lowSpO2Count = patients.filter((p) => p.vitals.spO2 < 95).length;
  const highRespCount = patients.filter((p) => p.vitals.respiratoryRate > 20).length;
  const highHRCount = patients.filter((p) => p.vitals.heartRate > 100).length;

  if (highTempCount > patients.length * 0.2) symptoms.push("Widespread fever");
  if (lowSpO2Count > patients.length * 0.2) symptoms.push("Respiratory distress pattern");
  if (highRespCount > patients.length * 0.2) symptoms.push("Elevated respiratory rates");
  if (highHRCount > patients.length * 0.2) symptoms.push("Elevated heart rates");

  return symptoms;
}

function getThreatLevel(
  affectedPercent: number,
  policy: NexusPolicy
): OutbreakResponse["threatLevel"] {
  if (affectedPercent >= policy.outbreakThreshold * 2) return "critical";
  if (affectedPercent >= policy.outbreakThreshold) return "high";
  if (affectedPercent >= policy.outbreakThreshold * 0.5) return "medium";
  return "low";
}

function getRecommendation(
  threatLevel: OutbreakResponse["threatLevel"],
  policy: NexusPolicy
): string {
  if (threatLevel === "critical") {
    return policy.quarantineRequired
      ? "CRITICAL: Immediate full quarantine required. Notify NEXUS."
      : "CRITICAL: Outbreak detected. Isolate affected patients immediately.";
  }
  if (threatLevel === "high") {
    return "HIGH: Outbreak threshold exceeded. Begin isolation protocols per NEXUS policy.";
  }
  if (threatLevel === "medium") {
    return "MEDIUM: Monitor closely. Approaching outbreak threshold.";
  }
  return "LOW: No outbreak detected. Continue monitoring.";
}

export function runOutbreakDetection(request: OutbreakRequest): OutbreakResponse {
  const policy = request.policy ?? DEFAULT_POLICY;
  const total = request.patients.length;

  if (total === 0) {
    return {
      outbreakDetected: false,
      affectedCount: 0,
      threatLevel: "low",
      symptoms: [],
      recommendation: "No patients to analyze.",
      timestamp: new Date(),
    };
  }

  const affectedCount = getAffectedCount(request.patients);
  const affectedPercent = (affectedCount / total) * 100;
  const outbreakDetected = affectedPercent >= policy.outbreakThreshold;
  const symptoms = detectSymptoms(request.patients);
  const threatLevel = getThreatLevel(affectedPercent, policy);
  const recommendation = getRecommendation(threatLevel, policy);

  return {
    outbreakDetected,
    affectedCount,
    threatLevel,
    symptoms,
    recommendation,
    timestamp: new Date(),
  };
}