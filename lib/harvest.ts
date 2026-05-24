import { HarvestData } from "@/types";

const HARVEST_API_URL = process.env.HARVEST_API_URL ?? "http://localhost:3001";

export async function getHarvestData(patientId: string): Promise<HarvestData> {
  try {
    const response = await fetch(`${HARVEST_API_URL}/nutrition/${patientId}`);

    if (!response.ok) {
      console.warn(`HARVEST API unavailable, using fallback for patient ${patientId}`);
      return getFallbackData(patientId);
    }

    const data = await response.json();
    return data as HarvestData;

  } catch (error) {
    console.warn("HARVEST API unreachable, using fallback data:", error);
    return getFallbackData(patientId);
  }
}

export async function getAllHarvestData(): Promise<HarvestData[]> {
  try {
    const response = await fetch(`${HARVEST_API_URL}/nutrition`);

    if (!response.ok) {
      console.warn("HARVEST API unavailable, using fallback");
      return [];
    }

    const data = await response.json();
    return data as HarvestData[];

  } catch (error) {
    console.warn("HARVEST API unreachable:", error);
    return [];
  }
}

// Fallback when HARVEST API is not yet available
function getFallbackData(patientId: string): HarvestData {
  return {
    patientId,
    nutritionLevel: 50,        // neutral fallback
    hydrationLevel: 50,
    resourceAccess: true,
  };
}