import { NextRequest, NextResponse } from "next/server";
import { runTriage } from "@/lib/triage";
import { getHarvestData } from "@/lib/harvest";
import { reportTriageToNexus } from "@/lib/nexus";
import { TriageRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patient } = body;

    if (!patient) {
      return NextResponse.json(
        { error: "Patient data is required" },
        { status: 400 }
      );
    }

    // Fetch nutrition data from HARVEST
    const harvestData = await getHarvestData(patient.patientId);

    const triageRequest: TriageRequest = {
      patient,
      nutritionLevel: harvestData.nutritionLevel,
    };

    // Run triage logic
    const result = runTriage(triageRequest);

    // Report result to NEXUS
    await reportTriageToNexus(result.patientId, result.triageLevel);

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Triage API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}