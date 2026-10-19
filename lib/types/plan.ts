import { FoodItem, MealSlot } from "@/lib/types/food";
import { MacronutrientTargets } from "@/lib/types/nutrition";

export interface PlannedFoodItem {
  food: FoodItem;
  servings: number;
  totalEnergyKcal: number;
  totalProteinG: number;
  totalCarbohydratesG: number;
  totalFatG: number;
  totalCostInr: number;
}

export interface PlannedMeal {
  slot: MealSlot;
  label: string;
  items: PlannedFoodItem[];
  subtotalEnergyKcal: number;
  subtotalProteinG: number;
  subtotalCarbohydratesG: number;
  subtotalFatG: number;
  subtotalCostInr: number;
  timingRecommendation: string;
}

export interface FeasibilityAssessment {
  isFeasible: boolean;
  status: "optimal" | "acceptable" | "budget_infeasible" | "constraint_infeasible";
  infeasibilityReason?: string;
  suggestedRelaxation?: string;
  minimumEstimatedFeasibleBudgetInr?: number;
}

export interface OptimizationMetrics {
  overallScore: number; // 0 to 100
  nutritionAdequacyScore: number; // 0 to 100
  affordabilityScore: number; // 0 to 100
  varietyScore: number; // 0 to 100
  practicalityScore: number; // 0 to 100
  calorieAdequacyPct: number; // Actual / Target * 100
  proteinAdequacyPct: number;
  carbAdequacyPct: number;
  fatAdequacyPct: number;
}

export interface OneDayMealPlan {
  meals: PlannedMeal[];
  dailyTotals: {
    energyKcal: number;
    proteinG: number;
    carbohydratesG: number;
    fatG: number;
    fiberG: number;
    ironMg: number;
    calciumMg: number;
    sodiumMg: number;
    costInr: number;
  };
  targets: MacronutrientTargets;
  budgetInr: number;
  budgetRemainingInr: number;
  feasibility: FeasibilityAssessment;
  metrics: OptimizationMetrics;
  rationale: string[];
}

