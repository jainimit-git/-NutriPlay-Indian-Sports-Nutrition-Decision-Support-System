import { AthleteProfile } from "@/lib/types/athlete";
import { FoodItem } from "@/lib/types/food";
import { filterFoodsByConstraints } from "@/lib/nutrition/dietaryEngine";
import { INDIAN_FOOD_DATABASE } from "@/data/foods/indianFoodsDataset";
import { calculateMifflinStJeorBmr } from "@/lib/nutrition/energyEngine";

export interface BaselineEvaluationOutput {
  systemName: string;
  caloriesTarget: number;
  caloriesActual: number;
  proteinTargetG: number;
  proteinActualG: number;
  carbsActualG: number;
  fatActualG: number;
  costInr: number;
  budgetInr: number;
  budgetAdherence: boolean;
  dietaryConstraintAdherence: boolean;
}

/**
 * Baseline 1: Generic Clinical Nutrition Approach
 * Uses Mifflin-St Jeor + standard static Physical Activity Level (PAL = 1.60)
 * Flat general protein target: 1.0 g/kg body weight (no sports periodization)
 * Flat carbohydrate target: 55% of calories
 * Standard fixed portion allocations without multi-objective optimization
 */
export function runBaseline1Generic(
  profile: AthleteProfile,
  database: FoodItem[] = INDIAN_FOOD_DATABASE
): BaselineEvaluationOutput {
  const bmr = calculateMifflinStJeorBmr(profile.weightKg, profile.heightCm, profile.age, profile.sex);
  const staticPal = 1.60;
  const targetCalories = Math.round(bmr * staticPal);
  const proteinTargetG = Math.round(profile.weightKg * 1.0); // Generic RDA

  const allowedFoods = filterFoodsByConstraints(database, {
    dietaryPreference: profile.dietaryPreference,
    excludedAllergens: profile.dietaryExclusions,
  });

  // Pick first available standard items for breakfast, lunch, and dinner (simplistic clinical template)
  const bfast = allowedFoods.find((f) => f.appropriateMealSlots.includes("breakfast")) || allowedFoods[0];
  const lunchStaple = allowedFoods.find((f) => f.appropriateMealSlots.includes("lunch") && f.category === "cereals_millets") || allowedFoods[0];
  const lunchProtein = allowedFoods.find((f) => f.appropriateMealSlots.includes("lunch") && f.category === "pulses_legumes") || allowedFoods[0];
  const dinnerStaple = allowedFoods.find((f) => f.appropriateMealSlots.includes("dinner") && f.category === "cereals_millets") || allowedFoods[0];
  const dinnerProtein = allowedFoods.find((f) => f.appropriateMealSlots.includes("dinner") && f.category === "pulses_legumes") || allowedFoods[0];

  const selected = [bfast, lunchStaple, lunchProtein, dinnerStaple, dinnerProtein].filter(Boolean);

  const caloriesActual = selected.reduce((sum, f) => sum + f.energyKcal, 0);
  const proteinActualG = Math.round(selected.reduce((sum, f) => sum + f.proteinG, 0) * 10) / 10;
  const carbsActualG = Math.round(selected.reduce((sum, f) => sum + f.carbohydratesG, 0) * 10) / 10;
  const fatActualG = Math.round(selected.reduce((sum, f) => sum + f.fatG, 0) * 10) / 10;
  const costInr = selected.reduce((sum, f) => sum + f.approximateCostInr, 0);

  return {
    systemName: "Baseline 1 (Static Mifflin + 1.0g/kg Protein)",
    caloriesTarget: targetCalories,
    caloriesActual,
    proteinTargetG,
    proteinActualG,
    carbsActualG,
    fatActualG,
    costInr,
    budgetInr: profile.dailyBudgetInr,
    budgetAdherence: costInr <= profile.dailyBudgetInr,
    dietaryConstraintAdherence: true,
  };
}

/**
 * Baseline 2: Simple Greedy Rule-Based Planner
 * Iterates through allowed foods greedily adding items until caloric quota is met,
 * with NO multi-objective consideration of cost, variety, or sports nutrient timing.
 */
export function runBaseline2Greedy(
  profile: AthleteProfile,
  targetCalories: number,
  proteinTargetG: number,
  database: FoodItem[] = INDIAN_FOOD_DATABASE
): BaselineEvaluationOutput {
  const allowedFoods = filterFoodsByConstraints(database, {
    dietaryPreference: profile.dietaryPreference,
    excludedAllergens: profile.dietaryExclusions,
  });

  let currentCal = 0;
  let currentProt = 0;
  let currentCarb = 0;
  let currentFat = 0;
  let currentCost = 0;

  // Greedily pick first few items repeatedly until target calories is reached
  let index = 0;
  while (currentCal < targetCalories * 0.95 && index < 20) {
    const food = allowedFoods[index % allowedFoods.length];
    currentCal += food.energyKcal;
    currentProt += food.proteinG;
    currentCarb += food.carbohydratesG;
    currentFat += food.fatG;
    currentCost += food.approximateCostInr;
    index++;
  }

  return {
    systemName: "Baseline 2 (Greedy Single-Objective Rule-Based)",
    caloriesTarget: targetCalories,
    caloriesActual: currentCal,
    proteinTargetG,
    proteinActualG: Math.round(currentProt * 10) / 10,
    carbsActualG: Math.round(currentCarb * 10) / 10,
    fatActualG: Math.round(currentFat * 10) / 10,
    costInr: currentCost,
    budgetInr: profile.dailyBudgetInr,
    budgetAdherence: currentCost <= profile.dailyBudgetInr,
    dietaryConstraintAdherence: true,
  };
}

