import { AthleteProfile } from "@/lib/types/athlete";
import { HeatIndexAssessment } from "@/lib/types/weather";
import { SweatRateResult } from "@/lib/types/hydration";

/**
 * Calculates sweat rate and fluid loss:
 * Strictly distinguishes measured athlete field data from empirical fallback estimations.
 */
export function calculateSweatRate(
  profile: AthleteProfile,
  heatIndex: HeatIndexAssessment
): SweatRateResult {
  // Case A: Athlete provided measured test data
  if (profile.measuredSweatRateInput) {
    const input = profile.measuredSweatRateInput;
    const durationHours = input.exerciseDurationMinutes / 60;

    // Sweat Loss = (Pre Weight - Post Weight) + Fluid Ingested - Urine Excreted
    const weightLossKg = input.preExerciseWeightKg - input.postExerciseWeightKg;
    const sweatLossLiters = Math.max(
      0.1,
      weightLossKg + input.fluidConsumedLiters - input.urineOutputLiters
    );
    const sweatRatePerHour = Math.round((sweatLossLiters / durationHours) * 100) / 100;

    return {
      sweatRateLitersPerHour: sweatRatePerHour,
      totalSweatLossLiters: Math.round(sweatLossLiters * 100) / 100,
      isMeasured: true,
      methodLabel: "MEASURED LAB / FIELD TEST",
      calculationExplanation: `Directly computed from verified test: Pre-exercise wt (${input.preExerciseWeightKg} kg) - Post-exercise wt (${input.postExerciseWeightKg} kg) + Fluid consumed (${input.fluidConsumedLiters} L) - Urine (${input.urineOutputLiters} L) over ${input.exerciseDurationMinutes} min session.`,
    };
  }

  // Case B: Scientific Empirical Fallback (ACSM & Sports Medicine standard ranges)
  const durationHours = profile.trainingDurationMinutes / 60;

  if (profile.trainingIntensity === "rest" || durationHours <= 0) {
    return {
      sweatRateLitersPerHour: 0,
      totalSweatLossLiters: 0,
      isMeasured: false,
      methodLabel: "SCIENTIFIC EMPIRICAL FALLBACK",
      calculationExplanation: "Rest day or zero workout duration: exercise-induced sweat loss is zero.",
    };
  }

  const baselineIntensityRates: Record<AthleteProfile["trainingIntensity"], number> = {
    rest: 0,
    light: 0.60,
    moderate: 0.90,
    high: 1.20,
    very_high: 1.50,
  };

  const baseRate = baselineIntensityRates[profile.trainingIntensity];
  const bodyWeightScaling = profile.weightKg / 70; // Normalized to 70kg reference human
  const heatStressAdjustment = heatIndex.hydrationMultiplier; // 1.0 to 1.45 based on Heat Index

  const estimatedSweatRatePerHour =
    Math.round(baseRate * bodyWeightScaling * heatStressAdjustment * 100) / 100;
  const totalSweatLossLiters = Math.round(estimatedSweatRatePerHour * durationHours * 100) / 100;

  return {
    sweatRateLitersPerHour: estimatedSweatRatePerHour,
    totalSweatLossLiters,
    isMeasured: false,
    methodLabel: "SCIENTIFIC EMPIRICAL FALLBACK",
    calculationExplanation: `Estimated using sports medicine baseline (${baseRate} L/hr for ${profile.trainingIntensity} load) scaled by body mass (${profile.weightKg} kg / 70 kg factor = ${Math.round(bodyWeightScaling * 100) / 100}) and environmental heat stress multiplier (${heatStressAdjustment}x from ${heatIndex.riskLabel}).`,
  };
}

