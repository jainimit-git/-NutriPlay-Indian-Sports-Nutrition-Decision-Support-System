import { AthleteProfile } from "@/lib/types/athlete";
import { HeatIndexAssessment } from "@/lib/types/weather";
import { ElectrolyteGuidance, HydrationPlan } from "@/lib/types/hydration";
import { calculateSweatRate } from "@/lib/hydration/sweatRateEngine";

/**
 * Scientific Hydration & Electrolyte Decision-Support Engine:
 * Combines basal human fluid turnover, exercise-induced sweat deficit,
 * and environmental heat index into actionable timing schedules.
 */
export function calculateHydrationPlan(
  profile: AthleteProfile,
  heatIndex: HeatIndexAssessment
): HydrationPlan {
  // 1. Baseline Rest Daily Fluid Requirement (ICMR / ACSM standard 35ml/kg)
  const baselineDailyWaterLiters = Math.round(((profile.weightKg * 35) / 1000) * 10) / 10;

  // 2. Sweat Rate and Fluid Loss
  const sweatRate = calculateSweatRate(profile, heatIndex);

  // 3. Training-Related Rehydration (ACSM recommends 125% of sweat loss for complete restoration)
  const trainingHydrationLiters =
    profile.trainingIntensity === "rest"
      ? 0
      : Math.round(sweatRate.totalSweatLossLiters * 1.25 * 10) / 10;

  // 4. Heat Stress Non-Exercise Evaporative Adjustment
  let heatStressAdjustmentLiters = 0;
  if (heatIndex.riskCategory === "extreme_danger") {
    heatStressAdjustmentLiters = 0.8;
  } else if (heatIndex.riskCategory === "danger") {
    heatStressAdjustmentLiters = 0.6;
  } else if (heatIndex.riskCategory === "extreme_caution") {
    heatStressAdjustmentLiters = 0.4;
  } else if (heatIndex.riskCategory === "caution") {
    heatStressAdjustmentLiters = 0.2;
  }

  // 5. Total Daily Fluid Guidance
  const totalDailyFluidRecommendationLiters =
    Math.round((baselineDailyWaterLiters + trainingHydrationLiters + heatStressAdjustmentLiters) * 10) / 10;

  // 6. Sodium / Electrolyte Guidance
  const estimatedSodiumLossPerLiterSweatMg = 900; // Average sports science standard (800-1100 mg/L)
  const totalEstimatedSodiumLossMg = Math.round(
    sweatRate.totalSweatLossLiters * estimatedSodiumLossPerLiterSweatMg
  );

  let recommendedElectrolyteAdditionMg = 0;
  let timingAndSourceGuidance = "";

  if (profile.trainingIntensity === "rest" || profile.trainingDurationMinutes < 45) {
    timingAndSourceGuidance =
      "Standard balanced meals and baseline dietary sodium (curries, dal, dahi) are sufficient. Additional electrolyte supplements not needed.";
  } else if (
    profile.trainingDurationMinutes >= 60 ||
    heatIndex.riskCategory === "danger" ||
    heatIndex.riskCategory === "extreme_caution"
  ) {
    // Recommend replacing 50-70% of sweat sodium loss
    recommendedElectrolyteAdditionMg = Math.round(totalEstimatedSodiumLossMg * 0.6);
    timingAndSourceGuidance = `Take ~${Math.round(recommendedElectrolyteAdditionMg / 2)} mg sodium during training and the remainder post-session to prevent hyponatremia and muscle cramps under ${heatIndex.riskLabel}.`;
  } else {
    recommendedElectrolyteAdditionMg = Math.round(totalEstimatedSodiumLossMg * 0.4);
    timingAndSourceGuidance =
      "Mild to moderate electrolyte replenishment recommended during or immediately after the workout session.";
  }

  const indianBeverageOptions: string[] = [
    "Fresh Tender Coconut Water (Natural potassium, magnesium, and sodium)",
    "Spiced Salted Buttermilk (Masala Chaas with kala namak / rock salt & roasted jeera)",
    "Traditional Nimbu Pani (Fresh lime water with a pinch of salt and honey/sugar)",
    "Oral Rehydration Salts (WHO-ORS / Electral packet dissolved in water for heavy sweat losses)",
  ];

  const electrolyte: ElectrolyteGuidance = {
    totalEstimatedSodiumLossMg,
    recommendedElectrolyteAdditionMg,
    timingAndSourceGuidance,
    indianBeverageOptions,
  };

  // 7. Schedule Breakdown
  const scheduleBreakdown = {
    preExerciseWindow:
      profile.trainingIntensity === "rest"
        ? "Maintain regular sip intervals throughout the day."
        : "Drink 400–600 ml water 2–3 hours before training; consume an additional 200–300 ml 15–20 minutes prior.",
    duringExerciseWindow:
      profile.trainingIntensity === "rest"
        ? "Not applicable (Rest day)."
        : `Sip 150–250 ml every 15–20 minutes during practice (target total: ~${Math.round(sweatRate.totalSweatLossLiters * 0.7 * 10) / 10} L during session).`,
    postExerciseWindow:
      profile.trainingIntensity === "rest"
        ? "Not applicable (Rest day)."
        : `Rehydrate with ~${trainingHydrationLiters} L over 2–4 hours post-session along with sodium-rich foods.`,
    dailyRestingFluids: `Spread ${baselineDailyWaterLiters} L baseline across morning, afternoon, and evening waking hours.`,
  };

  // 8. Plain-language rationales
  const rationales: string[] = [
    `Baseline fluid of ${baselineDailyWaterLiters} L is determined by body mass (${profile.weightKg} kg × 35 ml/kg) to support cellular hydration and metabolic waste clearance.`,
    profile.trainingIntensity === "rest"
      ? "Rest day: No exercise sweat replacement is added."
      : `Training fluid guidance of ${trainingHydrationLiters} L restores sweat loss (${sweatRate.totalSweatLossLiters} L) at a 125% replenishment factor to account for continuing respiratory and urinary losses.`,
    heatStressAdjustmentLiters > 0
      ? `Hydration is boosted by +${heatStressAdjustmentLiters} L because the current environmental Heat Index (${heatIndex.heatIndexCelsius}°C, ${heatIndex.riskLabel}) accelerates ambient fluid evaporation.`
      : "Current environmental conditions are within comfortable limits without extra heat stress fluid penalty.",
  ];

  return {
    baselineDailyWaterLiters,
    trainingHydrationLiters,
    heatStressAdjustmentLiters,
    totalDailyFluidRecommendationLiters,
    sweatRate,
    electrolyte,
    heatIndexAssessment: heatIndex,
    scheduleBreakdown,
    rationales,
  };
}

