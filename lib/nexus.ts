import { NexusPolicy } from "@/types";

const NEXUS_API_URL = process.env.NEXUS_API_URL ?? "http://localhost:3002";

export async function getNexusPolicy(): Promise<NexusPolicy> {
  try {
    const response = await fetch(`${NEXUS_API_URL}/policies/health`);

    if (!response.ok) {
      console.warn("NEXUS API unavailable, using default policy");
      return getDefaultPolicy();
    }

    const data = await response.json();
    return data as NexusPolicy;

  } catch (error) {
    console.warn("NEXUS API unreachable, using default policy:", error);
    return getDefaultPolicy();
  }
}

export async function reportOutbreakToNexus(
  threatLevel: string,
  affectedCount: number,
  recommendation: string
): Promise<void> {
  try {
    await fetch(`${NEXUS_API_URL}/outbreak/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threatLevel,
        affectedCount,
        recommendation,
        reportedBy: "PULSE",
        timestamp: new Date(),
      }),
    });

    console.log("Outbreak reported to NEXUS successfully");

  } catch (error) {
    console.warn("Failed to report outbreak to NEXUS:", error);
  }
}

export async function reportTriageToNexus(
  patientId: string,
  triageLevel: string
): Promise<void> {
  try {
    await fetch(`${NEXUS_API_URL}/triage/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId,
        triageLevel,
        reportedBy: "PULSE",
        timestamp: new Date(),
      }),
    });

    console.log(`Triage result for ${patientId} reported to NEXUS`);

  } catch (error) {
    console.warn("Failed to report triage to NEXUS:", error);
  }
}

// Default policy when NEXUS API is not yet available
function getDefaultPolicy(): NexusPolicy {
  return {
    outbreakThreshold: 30,     // 30% of patients triggers outbreak
    quarantineRequired: true,
    isolationZones: [],
    maxCapacity: 100,
    allowedMovement: false,
  };
}