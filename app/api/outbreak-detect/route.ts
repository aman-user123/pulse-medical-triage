import { NextRequest, NextResponse } from "next/server";
import { runOutbreakDetection } from "@/lib/outbreak";
import { getNexusPolicy } from "@/lib/nexus";
import { reportOutbreakToNexus } from "@/lib/nexus";
import { OutbreakRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patients } = body;

    if (!patients || !Array.isArray(patients)) {
      return NextResponse.json(
        { error: "Patients array is required" },
        { status: 400 }
      );
    }

    // Fetch latest policy from NEXUS
    const policy = await getNexusPolicy();

    const outbreakRequest: OutbreakRequest = {
      patients,
      policy,
    };

    // Run outbreak detection logic
    const result = runOutbreakDetection(outbreakRequest);

    // If outbreak detected report immediately to NEXUS
    if (result.outbreakDetected) {
      await reportOutbreakToNexus(
        result.threatLevel,
        result.affectedCount,
        result.recommendation
      );
    }

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("Outbreak detection API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}