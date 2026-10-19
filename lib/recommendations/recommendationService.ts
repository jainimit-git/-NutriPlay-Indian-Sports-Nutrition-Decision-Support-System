import { AthleteProfile } from "@/lib/types/athlete";
import { EnergyRequirementResult, MacronutrientTargets } from "@/lib/types/nutrition";
import { OneDayMealPlan } from "@/lib/types/plan";
import { WeatherData } from "@/lib/types/weather";
import { HydrationPlan } from "@/lib/types/hydration";
import { OverallSafetyReport } from "@/lib/types/safety";
import { calculateEnergyRequirement } from "@/lib/nutrition/energyEngine";
import { calculateNutrientTargets } from "@/lib/nutrition/nutrientEngine";
import { getWeatherData } from "@/lib/weather/weatherService";
import { calculateHydrationPlan } from "@/lib/hydration/hydrationEngine";
import { generateOptimizedMealPlan } from "@/lib/optimisation/mealOptimizer";
import { generateOverallSafetyReport } from "@/lib/safety/redsSafetyEngine";

export interface DecisionSupportOutput {
  athlete: AthleteProfile;
  weather: WeatherData;
  energy: EnergyRequirementResult;
  targets: MacronutrientTargets;
  mealPlan: OneDayMealPlan;
  hydration: HydrationPlan;
  safety: OverallSafetyReport;
  timestamp: string;
}

/**
 * Master Application Service:
 * Orchestrates the full pipeline from raw athlete parameters to
 * comprehensive scientific meal, hydration, and safety decision-support plans.
 */
export async function generateComprehensiveAthletePlan(
  profile: AthleteProfile
): Promise<DecisionSupportOutput> {
  // 1. Weather & Environmental Heat Index Assessment
  const weatherResult = await getWeatherData(profile.location);
  const weather = weatherResult.data;

  // 2. Energy Requirement Estimation (BMR, PAL, EEE, TDEE)
  const energy = calculateEnergyRequirement(profile);

  // 3. Nutrient Target Computation (Protein, Carbs, Fat, ICMR Micronutrients)
  const targets = calculateNutrientTargets(profile, energy);

  // 4. Multi-Objective Meal Plan Optimization (Constraints, Budget, Timing)
  const mealPlan = generateOptimizedMealPlan(profile, targets);

  // 5. Hydration & Sweat Rate Strategy
  const hydration = calculateHydrationPlan(profile, weather.heatIndex);

  // 6. RED-S Safety & Clinical Assessment
  const safety = generateOverallSafetyReport(
    profile,
    energy,
    weather.heatIndex,
    mealPlan.dailyTotals.energyKcal
  );

  return {
    athlete: profile,
    weather,
    energy,
    targets,
    mealPlan,
    hydration,
    safety,
    timestamp: new Date().toISOString(),
  };
}

