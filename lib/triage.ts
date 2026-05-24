import { TriageRequest, TriageResponse, TriageLevel } from "@/types";

function scoreVitals(request: TriageRequest): { score: number; reasons: string[] } {
  
  let score = 0;
  const reasons: string[] = [];
  const { vitals } = request.patient;
const nutritionLevel = request.nutritionLevel;

  // Heart rate scoring
  if (vitals.heartRate > 120 || vitals.heartRate < 50) {
    score += 30;
    reasons.push(`Critical heart rate: ${vitals.heartRate} bpm`);
  } else if (vitals.heartRate > 100 || vitals.heartRate < 60) {
    score += 15;
    reasons.push(`Abnormal heart rate: ${vitals.heartRate} bpm`);
  }

  // Blood pressure scoring
  if (vitals.bloodPressure.sys > 180 || vitals.bloodPressure.sys < 80) {
    score += 30;
    reasons.push(`Critical blood pressure: ${vitals.bloodPressure.sys}/${vitals.bloodPressure.dia}`);
  } else if (vitals.bloodPressure.sys > 140 || vitals.bloodPressure.sys < 90) {
    score += 15;
    reasons.push(`Abnormal blood pressure: ${vitals.bloodPressure.sys}/${vitals.bloodPressure.dia}`);
  }

  // SpO2 scoring
  if (vitals.spO2 < 90) {
    score += 30;
    reasons.push(`Critical oxygen saturation: ${vitals.spO2}%`);
  } else if (vitals.spO2 < 95) {
    score += 15;
    reasons.push(`Low oxygen saturation: ${vitals.spO2}%`);
  }

  // Temperature scoring
  if (vitals.temperature > 39.5 || vitals.temperature < 35) {
    score += 20;
    reasons.push(`Critical temperature: ${vitals.temperature}°C`);
  } else if (vitals.temperature > 38 || vitals.temperature < 36) {
    score += 10;
    reasons.push(`Abnormal temperature: ${vitals.temperature}°C`);
  }

  // Respiratory rate scoring
  if (vitals.respiratoryRate > 30 || vitals.respiratoryRate < 8) {
    score += 20;
    reasons.push(`Critical respiratory rate: ${vitals.respiratoryRate} breaths/min`);
  } else if (vitals.respiratoryRate > 20 || vitals.respiratoryRate < 12) {
    score += 10;
    reasons.push(`Abnormal respiratory rate: ${vitals.respiratoryRate} breaths/min`);
  }

  // HARVEST nutrition level — low nutrition increases severity
  if (nutritionLevel < 30) {
    score += 20;
    reasons.push(`Critical nutrition level: ${nutritionLevel}%`);
  } else if (nutritionLevel < 50) {
    score += 10;
    reasons.push(`Low nutrition level: ${nutritionLevel}%`);
  }

  return { score, reasons };
}

function getTriageLevel(score: number): TriageLevel {
  if (score >= 60) return "red";
  if (score >= 30) return "yellow";
  return "green";
}

export function runTriage(request: TriageRequest): TriageResponse {
  const { score, reasons } = scoreVitals(request);
  const triageLevel = getTriageLevel(score);

  return {
    patientId: request.patient.patientId,
    triageLevel,
    score,
    reasons,
    timestamp: new Date(),
  };
}