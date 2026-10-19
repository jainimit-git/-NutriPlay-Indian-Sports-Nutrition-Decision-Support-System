import { AthleteProfile } from "@/lib/types/athlete";
import { EnergyRequirementResult } from "@/lib/types/nutrition";
import { HeatIndexAssessment } from "@/lib/types/weather";
import { OverallSafetyReport, RedsAssessment, SafetyRiskLevel, SafetyWarning } from "@/lib/types/safety";
import { SAFETY_CONFIG } from "@/lib/safety/safetyConfig";

/**
 * Evaluates Relative Energy Deficiency in Sport (RED-S) and Low Energy Availability (LEA).
 *
 * IMPORTANT: NutriPlay strictly follows ethical bioengineering principles.
 * The system does NOT diagnose RED-S; it calculates an Energy Availability (EA) metric
 * and displays non-diagnostic decision-support warnings.
 *
 * EA = (Energy Intake - Exercise Energy Expenditure) / Fat-Free Mass (kg FFM)
 */
export function evaluateRedsRisk(
  profile: AthleteProfile,
  energy: EnergyRequirementResult,
  actualPlannedIntakeKcal?: number
): RedsAssessment {
  // 1. Estimate Fat-Free Mass (FFM)
  const bodyFatPct =
    profile.sex === "male"
      ? SAFETY_CONFIG.estimatedAthleteBodyFatPercent.male
      : SAFETY_CONFIG.estimatedAthleteBodyFatPercent.female;

  const estimatedFfmKg = Math.round(profile.weightKg * (1 - bodyFatPct / 100) * 10) / 10;

  // 2. Compute Energy Availability
  // Energy intake: Use actual planned intake if available, else recommended target calories
  const energyIntakeKcal = actualPlannedIntakeKcal ?? energy.targetCaloriesRecommended;
  const eeeKcal = energy.exerciseEnergyExpenditureKcal;

  const netEnergyAfterExercise = energyIntakeKcal - eeeKcal;
  const energyAvailability = Math.round((netEnergyAfterExercise / estimatedFfmKg) * 10) / 10;

  // 3. Classify according to IOC RED-S consensus thresholds
  let riskLevel: SafetyRiskLevel = "low";
  let flagTriggered = false;
  let headline = "Optimal Energy Availability";
  let explanation = `Estimated Energy Availability is ${energyAvailability} kcal/kg FFM/day (meets the ≥45 kcal/kg FFM benchmark). Sufficient energy remains for baseline metabolic and hormonal health.`;

  if (energyAvailability < SAFETY_CONFIG.energyAvailabilityThresholds.clinicalRiskThresholdKcalPerKgFfm) {
    riskLevel = "high";
    flagTriggered = true;
    headline = "Potential low-energy-availability risk — consider professional assessment";
    explanation = `Estimated Energy Availability is ${energyAvailability} kcal/kg FFM/day, which is below the IOC clinical threshold of 30 kcal/kg FFM/day. Chronic low energy availability is associated with suppressed testosterone/estrogen, reduced bone density, and impaired immune resilience.`;
  } else if (
    energyAvailability < SAFETY_CONFIG.energyAvailabilityThresholds.optimalKcalPerKgFfm
  ) {
    riskLevel = "moderate";
    flagTriggered = false;
    headline = "Sub-Optimal Energy Availability";
    explanation = `Estimated Energy Availability is ${energyAvailability} kcal/kg FFM/day (within the sub-optimal range of 30–45 kcal/kg FFM/day). Acceptable for short-term periodized athletic body composition phases, but monitor recovery.`;
  }

  const clinicalNotice =
    "This calculation is a mathematical heuristic estimation. NutriPlay does NOT diagnose RED-S or clinical eating disorders. If fatigue, missed menstrual cycles, recurrent stress fractures, or mood disturbances occur, consult a licensed sports physician.";

  return {
    estimatedFfmKg,
    energyAvailabilityKcalPerKgFfm: energyAvailability,
    riskLevel,
    flagTriggered,
    headline,
    explanation,
    clinicalNotice,
  };
}

/**
 * Compiles a comprehensive safety report combining RED-S, overtraining risks, and heat stress.
 */
export function generateOverallSafetyReport(
  profile: AthleteProfile,
  energy: EnergyRequirementResult,
  heatIndex?: HeatIndexAssessment,
  actualPlannedIntakeKcal?: number
): OverallSafetyReport {
  const reds = evaluateRedsRisk(profile, energy, actualPlannedIntakeKcal);
  const warnings: SafetyWarning[] = [];

  // 1. RED-S Warning
  if (reds.flagTriggered) {
    warnings.push({
      id: "warning_reds_lea",
      category: "energy_availability",
      severity: "danger",
      title: reds.headline,
      message: reds.explanation,
      actionableGuidance:
        "Increase daily carbohydrate and calorie intake to cover exercise expenditure, or moderate training volume. Schedule a review with a sports dietitian.",
    });
  }

  // 2. Overtraining / Rest Day Absence Warning
  if (profile.trainingFrequencyDaysPerWeek === 7 && profile.trainingDurationMinutes >= 90) {
    warnings.push({
      id: "warning_no_rest_day",
      category: "training_overload",
      severity: "warning",
      title: "Elevated Overtraining & Musculoskeletal Strain Risk",
      message: `Training 7 days/week for ${profile.trainingDurationMinutes} minutes/day without scheduled rest days impairs glycogen supercompensation and tissue remodeling.`,
      actionableGuidance:
        "Incorporate at least 1 full rest or active recovery day per week to facilitate central nervous system recovery and connective tissue repair.",
    });
  }

  // 3. Environmental Heat Illness Warning
  if (heatIndex && (heatIndex.riskCategory === "danger" || heatIndex.riskCategory === "extreme_danger")) {
    warnings.push({
      id: "warning_environmental_heat",
      category: "environmental",
      severity: "danger",
      title: `High Environmental Heat Stress (${heatIndex.heatIndexCelsius}°C)`,
      message: `${heatIndex.riskLabel}: High ambient humidity and temperature severely limit sweat evaporative cooling.`,
      actionableGuidance:
        "Enforce mandatory shade breaks every 20 minutes, consume cold sodium-electrolyte fluids, and consider shifting training sessions to early morning or late evening.",
    });
  }

  return {
    reds,
    warnings,
    mandatoryClinicalDisclaimer: SAFETY_CONFIG.mandatoryDisclaimerText,
  };
}

