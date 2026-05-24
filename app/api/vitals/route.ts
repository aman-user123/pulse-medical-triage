import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { Patient } from "@/types";
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: "pulse-bunker",
      clientEmail: "firebase-adminsdk-fbsvc@pulse-bunker.iam.gserviceaccount.com",
      privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCfSABQ0zotF4W3\nZ1tCUsYJvpXL3XiHp9etija9ldriUzXZ9zzqcOLBCTq/cXlWXHvq7/akEBCJUSIn\nvpmDzQrNKIepRfn2IFjWxesXUHlIida1lRr0rq+A6R9dYV4xKGpW3Al6MUmevXk4\n0csyIB7ScA10fqSXaHs5FRMIYdF4a3hC5WFcZMi8c2IWsUPNejDfWlICe8soVAcC\nReHtFadd/Ias02m9xLjBcTUlQKrRfsrIBiA8EkCDb2p0xPF4k3truo8KDERZRaAQ\nngrAHXDltbmG5wsR2MjC7OFYU/hqs3KcaHhYPGoXHVN1WufpZpvVinxJEoD0wFGm\nUl8eU1CDAgMBAAECggEAMr6OkzFoNFttF0wPT+bs/sfAE23ga192n+wLmoS2cipO\nWr2go5QJObSGCd3N6UyXkfaXHhecHRNDDWR0pf/Z9Bh4d946T0Zo5yuwxQG3UfvP\n8pOpPdC1Sx16B5bwmjqk/j0lq88uBCubBhYYZUTEbQiT0MxUBYSc1Ue4g5AeWv1p\nS2rYwbdESspDqSx7SjHlUfxhquOzcZkUvbtvh+iuEFVlKTLm/1nm+DMN/06pfg3B\nEB67PaWXffFKeo21t/Vai5s5dpkNMkIoXIQX1OyEyNzLHvXhnduaUZxlkS+sePIv\nUNnqwCNnn8TPq72lZskF6FnbZsffD9gbbvis9Iv+yQKBgQDTVmtmcPi6vTiPWVYr\n+tCnFRZPRWmLLD39btrbf8FTv/L32IWPO1yAFHagxI8tBiyu1gfrNb/IiZrAduVg\n1oZOUnbuqzL/1H6h44sW4/2R30jC5tG5XZLc+ikOdYMwqjn6PgwG/+7iUiFUz4P3\n6pfXVx90uEtdGA3qxE7pvQQYdwKBgQDA8Uf3A4Ctg3WMZ4z9ektH2eody6hSbx0P\nEjVLK8Q/GrPrkK7pAt4+N2s7fgz2Oflvbs0ux3YfTyVyiVqBAQ/hM+w0KxNv26F6\nft/q4m9HHgu1Vn3y0YzM6HnG03+ag1H5UYIzG1axPAWzPDGhmsz+UzAxAzhJpGEk\n3jYSxf+XVQKBgENOWpYdlJmkecbtpMwM7TbJOHm2mY6BYJy+GWWeomuRzkew5Zhg\nR21jFwTMlOy58rEb6Rm33IR5jpeNRjA5Ijz/dnE8hNmFS28zkLCRm8hBXGL2MATh\nEEzgPwMj2cw96okQCbSQ/fuGPKdOD7F9PS6PyKzbpOTZLFWAf8FhOVSxAoGBAL1O\nf5ufNiwI5dbi6vTxftd6ujiN0BNBrjNRXDTrNlvsKUgh51v8Um6dFXuDy9fzPgfV\noUAauI0zrLxahBA7KId/2Gu/MAz6Y8+6mJzvmtseYcKEoIMUk5+hIYqxjWvfGRkU\nnjjixAaVq8oWb2PubN/EY25TiHDI9f+kf02gM40ZAoGATrx2Sgo+uvYiWEc2ahhO\nWBMINJp4CiZqB5P1fCUqS/hJCzFt4DFPln2u+3hMj4/eCJQuVIMKxeSfNdg0zyrm\nY+OgD3AL1cFRZ9ZEMHejx7x+eOK1PkYJVdc8VnliJZ1NGIVnS81iLwXYVjmaQ53b\nVsq6rkFNeC5kE4VvR/oVuUA=\n-----END PRIVATE KEY-----\n",
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