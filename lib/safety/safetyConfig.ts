/**
 * Configurable Safety Thresholds grounded in:
 * - IOC (International Olympic Committee) Consensus Statement on RED-S (2018 & 2023 update)
 * - ACSM Joint Position Stance on Female & Male Athlete Triad
 */
export interface SafetyEngineConfig {
  energyAvailabilityThresholds: {
    optimalKcalPerKgFfm: number; // > 45 kcal/kg FFM/day
    suboptimalThresholdKcalPerKgFfm: number; // 30 - 45 kcal/kg FFM/day
    clinicalRiskThresholdKcalPerKgFfm: number; // < 30 kcal/kg FFM/day (Low Energy Availability)
  };
  estimatedAthleteBodyFatPercent: {
    male: number; // ~14% standard athletic baseline
    female: number; // ~22% standard athletic baseline
  };
  trainingLoadLimits: {
    maxConsecutiveDaysWithoutRest: number; // 7 days
    excessiveDailyTrainingMinutes: number; // > 180 min
  };
  mandatoryDisclaimerText: string;
}

export const SAFETY_CONFIG: SafetyEngineConfig = {
  energyAvailabilityThresholds: {
    optimalKcalPerKgFfm: 45,
    suboptimalThresholdKcalPerKgFfm: 30,
    clinicalRiskThresholdKcalPerKgFfm: 30,
  },
  estimatedAthleteBodyFatPercent: {
    male: 14,
    female: 22,
  },
  trainingLoadLimits: {
    maxConsecutiveDaysWithoutRest: 7,
    excessiveDailyTrainingMinutes: 180,
  },
  mandatoryDisclaimerText:
    "NutriPlay is an engineering research and educational decision-support prototype. It does NOT provide medical diagnosis, clinical treatment, or replace individualized care from a licensed sports medicine physician or accredited sports dietitian.",
};

