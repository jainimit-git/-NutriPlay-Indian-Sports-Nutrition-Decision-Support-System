import { AthleteProfile } from "@/lib/types/athlete";
import { DecisionSupportOutput } from "@/lib/recommendations/recommendationService";
import { calculateEnergyRequirement } from "@/lib/nutrition/energyEngine";
import { calculateNutrientTargets } from "@/lib/nutrition/nutrientEngine";
import { generateOptimizedMealPlan } from "@/lib/optimisation/mealOptimizer";
import { calculateHydrationPlan } from "@/lib/hydration/hydrationEngine";
import { calculateHeatIndex } from "@/lib/weather/heatIndex";
import { getWeatherData } from "@/lib/weather/weatherService";
import { generateOverallSafetyReport } from "@/lib/safety/redsSafetyEngine";

export type AblationMode = "full" | "no_weather" | "no_training_load";

export interface AblationRunResult {
  mode: AblationMode;
  athleteName: string;
  energyTdeeKcal: number;
  carbTargetGrams: number;
  proteinTargetGrams: number;
  totalFluidLiters: number;
  heatStressAdjustmentLiters: number;
  totalCostInr: number;
  budgetAdherence: boolean;
  optimizationScore: number;
}

/**
 * Runs an experimental ablation trial with specified subsystem ablated.
 */
export async function runAblationTrial(
  profile: AthleteProfile,
  mode: AblationMode
): Promise<AblationRunResult> {
  // 1. Weather Abstraction with optional ablation
  let weatherData;
  if (mode === "no_weather") {
    // Neutral laboratory reference: 22°C, 50% RH (Low heat stress, multiplier 1.0)
    const neutralHeatIndex = calculateHeatIndex(22, 50);
    weatherData = {
      location: profile.location,
      temperatureCelsius: 22,
      relativeHumidityPct: 50,
      conditionDescription: "Neutral Reference Climate (Ablated)",
      isFallback: true,
      sourceNotice: "Ablation experimental condition: Weather disabled",
      heatIndex: neutralHeatIndex,
    };
  } else {
    const liveWeather = await getWeatherData(profile.location);
    weatherData = liveWeather.data;
  }

  // 2. Athlete Training Load with optional ablation
  let activeProfile = { ...profile };
  if (mode === "no_training_load") {
    // Treat as non-exercising / generic baseline day
    activeProfile = {
      ...profile,
      trainingDurationMinutes: 0,
      trainingIntensity: "rest",
    };
  }

  // 3. Run Pipeline
  const energy = calculateEnergyRequirement(activeProfile);
  const targets = calculateNutrientTargets(activeProfile, energy);
  const mealPlan = generateOptimizedMealPlan(activeProfile, targets);
  const hydration = calculateHydrationPlan(activeProfile, weatherData.heatIndex);

  return {
    mode,
    athleteName: profile.name || "Synthetic Athlete",
    energyTdeeKcal: energy.totalDailyEnergyExpenditureKcal,
    carbTargetGrams: targets.carbohydrateGrams,
    proteinTargetGrams: targets.proteinGrams,
    totalFluidLiters: hydration.totalDailyFluidRecommendationLiters,
    heatStressAdjustmentLiters: hydration.heatStressAdjustmentLiters,
    totalCostInr: mealPlan.dailyTotals.costInr,
    budgetAdherence: mealPlan.dailyTotals.costInr <= profile.dailyBudgetInr,
    optimizationScore: mealPlan.metrics.overallScore,
  };
}

