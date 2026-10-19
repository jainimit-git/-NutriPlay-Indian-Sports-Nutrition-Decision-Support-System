export type SafetyRiskLevel = "low" | "moderate" | "high";

export interface RedsAssessment {
  estimatedFfmKg: number;
  energyAvailabilityKcalPerKgFfm: number;
  riskLevel: SafetyRiskLevel;
  flagTriggered: boolean;
  headline: string;
  explanation: string;
  clinicalNotice: string;
}

export interface SafetyWarning {
  id: string;
  category: "energy_availability" | "training_overload" | "dietary_deficiency" | "environmental";
  severity: "info" | "warning" | "danger";
  title: string;
  message: string;
  actionableGuidance: string;
}

export interface OverallSafetyReport {
  reds: RedsAssessment;
  warnings: SafetyWarning[];
  mandatoryClinicalDisclaimer: string;
}

