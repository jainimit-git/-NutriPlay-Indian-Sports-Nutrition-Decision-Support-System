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
import { getSportMetadata } from "@/data/reference/sportsData";

export interface DecisionSupportOutput {
  athlete: AthleteProfile;
  weather: WeatherData;
  energy: EnergyRequirementResult;
  targets: MacronutrientTargets;
  mealPlan: OneDayMealPlan;
  hydration: HydrationPlan;
  safety: OverallSafetyReport;
  timestamp: string;
  assumptions: string[];
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
  const assumptions: string[] = [];
  if (!getSportMetadata(profile.sport)) {
    assumptions.push(
      `No sport-specific model is available for ${profile.sport}. Energy and nutrient estimates use a generic sports-session fallback with the submitted duration and intensity.`
    );
  }
  if (profile.dietaryPreference === "vegan") {
    assumptions.push(
      "Vegan filtering excludes tagged dairy, egg, and non-vegetarian foods; the food dataset does not provide complete ingredient certification, so verify packaged or prepared foods."
    );
  }
  if (profile.dietaryExclusions.length > 0) {
    assumptions.push(
      "Allergen and intolerance filters match the food dataset's recorded tags; the dataset cannot confirm undeclared ingredients or cross-contact, so verify food packaging and preparation."
    );
  }
  if (weather.isFallback) {
    assumptions.push("Weather is a climatological estimate, not a live observation; hydration guidance is an estimate, not a measured sweat rate.");
  }
  if (profile.trainingType && profile.trainingType !== "rest_day") {
    assumptions.push(
      "Session type is recorded, but the current nutrition and hydration models distinguish workload by duration and intensity rather than applying separate match, competition, recovery, or practice multipliers."
    );
  }
  if (profile.trainingDate && profile.trainingDate !== new Date().toISOString().slice(0, 10)) {
    assumptions.push(
      "The weather provider supplies current conditions or a climatological fallback, not a forecast for the selected training date."
    );
  }
  if (profile.trainingTimeOfDay) {
    assumptions.push(
      "Meal timing uses the optimizer's standard meal windows; the optional session start time is recorded but is not currently used to shift meal recommendations."
    );
  }

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
    assumptions,
  };
}
