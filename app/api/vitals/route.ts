import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { Patient } from "@/types";

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { patient }: { patient: Patient } = body;

    if (!patient) {
      return NextResponse.json(
        { error: "Patient data is required" },
        { status: 400 }
      );
    }

    // Save patient vitals to Firestore
    await db
      .collection("patients")
      .doc(patient.patientId)
      .collection("vitals")
      .add({
        ...patient.vitals,
        nutritionLevel: patient.nutritionLevel ?? null,
        triageLevel: patient.triageLevel ?? null,
        timestamp: new Date(),
      });

    // Update patient document
    await db.collection("patients").doc(patient.patientId).set(
      {
        patientId: patient.patientId,
        name: patient.name,
        age: patient.age,
        triageLevel: patient.triageLevel ?? null,
        lastUpdated: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json(
      { message: "Vitals saved successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Vitals API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId is required" },
        { status: 400 }
      );
    }

    const snapshot = await db
      .collection("patients")
      .doc(patientId)
      .collection("vitals")
      .orderBy("timestamp", "desc")
      .limit(10)
      .get();

    const vitals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ vitals }, { status: 200 });

  } catch (error) {
    console.error("Vitals GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}