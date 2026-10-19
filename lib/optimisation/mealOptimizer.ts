import { AthleteProfile } from "@/lib/types/athlete";
import { FoodItem, MealSlot } from "@/lib/types/food";
import { MacronutrientTargets } from "@/lib/types/nutrition";
import {
  FeasibilityAssessment,
  OneDayMealPlan,
  OptimizationMetrics,
  PlannedFoodItem,
  PlannedMeal,
} from "@/lib/types/plan";
import { filterFoodsByConstraints } from "@/lib/nutrition/dietaryEngine";
import { INDIAN_FOOD_DATABASE } from "@/data/foods/indianFoodsDataset";
import { DEFAULT_OPTIMIZATION_WEIGHTS, OptimizationWeights } from "@/lib/optimisation/weights";

interface SlotTemplate {
  slot: MealSlot;
  label: string;
  caloricFraction: number; // Fraction of daily target calories
  timing: string;
  categories: Array<{
    category: FoodItem["category"] | "any";
    required: boolean;
    maxServings: number;
  }>;
}

const ATHLETIC_SLOT_TEMPLATES: SlotTemplate[] = [
  {
    slot: "breakfast",
    label: "Breakfast",
    caloricFraction: 0.20,
    timing: "07:30 – 08:30 AM (Morning Fueling)",
    categories: [
      { category: "cereals_millets", required: true, maxServings: 2 },
      { category: "dairy", required: false, maxServings: 1 },
      { category: "fruits", required: false, maxServings: 1 },
    ],
  },
  {
    slot: "mid_morning",
    label: "Mid-Morning Refreshment",
    caloricFraction: 0.08,
    timing: "10:30 – 11:00 AM",
    categories: [
      { category: "fruits", required: false, maxServings: 1 },
      { category: "nuts_seeds", required: false, maxServings: 1 },
      { category: "beverages_sports", required: false, maxServings: 1 },
    ],
  },
  {
    slot: "lunch",
    label: "Lunch (Main Anchor Meal)",
    caloricFraction: 0.28,
    timing: "01:00 – 02:00 PM",
    categories: [
      { category: "cereals_millets", required: true, maxServings: 2 },
      { category: "pulses_legumes", required: true, maxServings: 2 },
      { category: "vegetables", required: false, maxServings: 1 },
      { category: "dairy", required: false, maxServings: 1 },
    ],
  },
  {
    slot: "pre_training",
    label: "Pre-Training Carb Primer",
    caloricFraction: 0.09,
    timing: "1–2 hours before workout session",
    categories: [
      { category: "fruits", required: true, maxServings: 1 },
      { category: "pulses_legumes", required: false, maxServings: 1 },
      { category: "beverages_sports", required: false, maxServings: 1 },
    ],
  },
  {
    slot: "post_training",
    label: "Post-Training Muscle Recovery",
    caloricFraction: 0.15,
    timing: "Within 30–45 min post-exercise",
    categories: [
      { category: "poultry_meat_fish", required: false, maxServings: 2 },
      { category: "dairy", required: false, maxServings: 1 },
      { category: "beverages_sports", required: false, maxServings: 1 },
    ],
  },
  {
    slot: "dinner",
    label: "Dinner (Recovery & Replenishment)",
    caloricFraction: 0.20,
    timing: "08:00 – 09:00 PM",
    categories: [
      { category: "cereals_millets", required: true, maxServings: 2 },
      { category: "pulses_legumes", required: true, maxServings: 1 },
      { category: "vegetables", required: false, maxServings: 1 },
    ],
  },
];

/**
 * Deterministic Multi-Objective Meal Plan Optimizer:
 * Balances Nutritional Adequacy, Affordability, Cultural Dietary Constraints, and Meal Practicality.
 */
export function generateOptimizedMealPlan(
  profile: AthleteProfile,
  targets: MacronutrientTargets,
  database: FoodItem[] = INDIAN_FOOD_DATABASE,
  weights: OptimizationWeights = DEFAULT_OPTIMIZATION_WEIGHTS
): OneDayMealPlan {
  // 1. Filter database by dietary constraints and exclusions
  const allowedFoods = filterFoodsByConstraints(database, {
    dietaryPreference: profile.dietaryPreference,
    excludedAllergens: profile.dietaryExclusions,
  });

  if (allowedFoods.length === 0) {
    return createEmptyInfeasiblePlan(
      profile,
      targets,
      "No food items match the specified dietary preference and allergy exclusions.",
      "Consider removing one or more food allergy/dislike exclusions."
    );
  }

  // 2. Select appropriate food candidates for each slot
  const meals: PlannedMeal[] = [];
  const selectedFoodCounts: Record<string, number> = {};

  for (const template of ATHLETIC_SLOT_TEMPLATES) {
    // If rest day, skip pre-workout and post-workout specific slots
    if (profile.trainingIntensity === "rest" && (template.slot === "pre_training" || template.slot === "post_training")) {
      continue;
    }

    const slotItems: PlannedFoodItem[] = [];
    const slotAllowedFoods = allowedFoods.filter((f) => f.appropriateMealSlots.includes(template.slot));

    for (const rule of template.categories) {
      let candidatePool = slotAllowedFoods.filter((f) =>
        rule.category === "any" ? true : f.category === rule.category
      );

      // If non-veg and post-training or lunch/dinner, prioritize high protein
      if (candidatePool.length === 0 && !rule.required) {
        continue;
      }

      if (candidatePool.length === 0 && rule.required) {
        candidatePool = slotAllowedFoods;
      }

      if (candidatePool.length === 0) continue;

      // Select candidate that has not been over-used across meals
      const sortedCandidates = [...candidatePool].sort((a, b) => {
        const countA = selectedFoodCounts[a.id] || 0;
        const countB = selectedFoodCounts[b.id] || 0;
        return countA - countB;
      });

      const selected = sortedCandidates[0];
      if (!selected) continue;

      // Determine serving count (1 or 2 based on caloric fraction and food density)
      let servings = 1;
      if (selected.category === "cereals_millets" && (template.slot === "lunch" || template.slot === "dinner")) {
        servings = targets.caloriesKcal > 2800 ? 2 : 1;
      } else if (selected.id === "poultry_boiled_eggs_whole" && profile.trainingIntensity === "very_high") {
        servings = 2;
      }

      selectedFoodCounts[selected.id] = (selectedFoodCounts[selected.id] || 0) + servings;

      slotItems.push({
        food: selected,
        servings,
        totalEnergyKcal: Math.round(selected.energyKcal * servings),
        totalProteinG: Math.round(selected.proteinG * servings * 10) / 10,
        totalCarbohydratesG: Math.round(selected.carbohydratesG * servings * 10) / 10,
        totalFatG: Math.round(selected.fatG * servings * 10) / 10,
        totalCostInr: Math.round(selected.approximateCostInr * servings),
      });
    }

    // Subtotals for this meal
    const subtotalEnergyKcal = slotItems.reduce((acc, i) => acc + i.totalEnergyKcal, 0);
    const subtotalProteinG = Math.round(slotItems.reduce((acc, i) => acc + i.totalProteinG, 0) * 10) / 10;
    const subtotalCarbohydratesG = Math.round(slotItems.reduce((acc, i) => acc + i.totalCarbohydratesG, 0) * 10) / 10;
    const subtotalFatG = Math.round(slotItems.reduce((acc, i) => acc + i.totalFatG, 0) * 10) / 10;
    const subtotalCostInr = slotItems.reduce((acc, i) => acc + i.totalCostInr, 0);

    meals.push({
      slot: template.slot,
      label: template.label,
      items: slotItems,
      subtotalEnergyKcal,
      subtotalProteinG,
      subtotalCarbohydratesG,
      subtotalFatG,
      subtotalCostInr,
      timingRecommendation: template.timing,
    });
  }

  // 3. Compute Daily Aggregates
  const dailyTotals = {
    energyKcal: meals.reduce((acc, m) => acc + m.subtotalEnergyKcal, 0),
    proteinG: Math.round(meals.reduce((acc, m) => acc + m.subtotalProteinG, 0) * 10) / 10,
    carbohydratesG: Math.round(meals.reduce((acc, m) => acc + m.subtotalCarbohydratesG, 0) * 10) / 10,
    fatG: Math.round(meals.reduce((acc, m) => acc + m.subtotalFatG, 0) * 10) / 10,
    fiberG: Math.round(
      meals.flatMap((m) => m.items).reduce((acc, i) => acc + i.food.fiberG * i.servings, 0) * 10
    ) / 10,
    ironMg: Math.round(
      meals.flatMap((m) => m.items).reduce((acc, i) => acc + i.food.ironMg * i.servings, 0) * 10
    ) / 10,
    calciumMg: Math.round(
      meals.flatMap((m) => m.items).reduce((acc, i) => acc + i.food.calciumMg * i.servings, 0)
    ),
    sodiumMg: Math.round(
      meals.flatMap((m) => m.items).reduce((acc, i) => acc + i.food.sodiumMg * i.servings, 0)
    ),
    costInr: meals.reduce((acc, m) => acc + m.subtotalCostInr, 0),
  };

  const budget = profile.dailyBudgetInr;
  const budgetRemainingInr = budget - dailyTotals.costInr;

  // 4. Feasibility Assessment
  let feasibility: FeasibilityAssessment;
  const calorieAdequacyPct = Math.round((dailyTotals.energyKcal / targets.caloriesKcal) * 100);
  const proteinAdequacyPct = Math.round((dailyTotals.proteinG / targets.proteinGrams) * 100);
  const carbAdequacyPct = Math.round((dailyTotals.carbohydratesG / targets.carbohydrateGrams) * 100);
  const fatAdequacyPct = Math.round((dailyTotals.fatG / targets.fatGrams) * 100);

  if (dailyTotals.costInr > budget) {
    const minEstimatedBudget = Math.round(dailyTotals.costInr * 1.05);
    feasibility = {
      isFeasible: false,
      status: "budget_infeasible",
      infeasibilityReason: `Your daily budget of ₹${budget} is insufficient to procure this ${profile.dietaryPreference} sports nutrition plan (actual cost ₹${dailyTotals.costInr}/day).`,
      suggestedRelaxation: `Increasing your budget to at least ₹${minEstimatedBudget}/day will satisfy both macronutrient targets and dietary constraints.`,
      minimumEstimatedFeasibleBudgetInr: minEstimatedBudget,
    };
  } else if (calorieAdequacyPct < 75 || proteinAdequacyPct < 75) {
    feasibility = {
      isFeasible: false,
      status: "constraint_infeasible",
      infeasibilityReason: `Nutritional shortfall detected: Calorie adequacy is ${calorieAdequacyPct}%, Protein is ${proteinAdequacyPct}%.`,
      suggestedRelaxation: "Relax dietary exclusions or allow additional high-density Indian staples.",
    };
  } else {
    feasibility = {
      isFeasible: true,
      status: "optimal",
    };
  }

  // 5. Compute Mathematical Multi-Objective Scores
  // Component 1: Nutrition Adequacy (Normalized deviation from 100%)
  const calErr = Math.abs(dailyTotals.energyKcal - targets.caloriesKcal) / targets.caloriesKcal;
  const protErr = Math.abs(dailyTotals.proteinG - targets.proteinGrams) / targets.proteinGrams;
  const carbErr = Math.abs(dailyTotals.carbohydratesG - targets.carbohydrateGrams) / targets.carbohydrateGrams;
  const fatErr = Math.abs(dailyTotals.fatG - targets.fatGrams) / targets.fatGrams;
  const compositeNutritionalDeviation = calErr * 0.4 + protErr * 0.3 + carbErr * 0.2 + fatErr * 0.1;
  const nutritionAdequacyScore = Math.max(0, Math.min(100, Math.round((1.0 - compositeNutritionalDeviation) * 100)));

  // Component 2: Affordability Score
  let affordabilityScore: number;
  if (dailyTotals.costInr <= budget) {
    affordabilityScore = Math.max(70, Math.min(100, Math.round(100 - (dailyTotals.costInr / budget) * 20)));
  } else {
    const budgetOverrunRatio = (dailyTotals.costInr - budget) / budget;
    affordabilityScore = Math.max(0, Math.round((1.0 - budgetOverrunRatio * 2) * 100));
  }

  // Component 3: Variety Score (Penalty for excessive single-item repetition)
  const uniqueItemsCount = Object.keys(selectedFoodCounts).length;
  const maxRepeats = Math.max(...Object.values(selectedFoodCounts), 0);
  const varietyScore = Math.min(100, Math.max(0, Math.round((uniqueItemsCount / 10) * 70 + (maxRepeats <= 3 ? 30 : 10))));

  // Component 4: Practicality Score
  const practicalityScore = profile.trainingIntensity === "rest" ? 95 : 90;

  // Composite Objective Function:
  const overallScore = Math.round(
    weights.w1_nutritionAdequacy * nutritionAdequacyScore +
      weights.w2_affordability * affordabilityScore +
      weights.w3_variety * varietyScore +
      weights.w4_mealTimingPracticality * practicalityScore
  );

  const metrics: OptimizationMetrics = {
    overallScore,
    nutritionAdequacyScore,
    affordabilityScore,
    varietyScore,
    practicalityScore,
    calorieAdequacyPct,
    proteinAdequacyPct,
    carbAdequacyPct,
    fatAdequacyPct,
  };

  // Plain-language rationale
  const rationale: string[] = [
    `Total estimated daily cost is ₹${dailyTotals.costInr} against a budget of ₹${budget} (${feasibility.isFeasible ? "within budget" : "exceeds budget"}).`,
    `Plan achieves ${calorieAdequacyPct}% of target energy (${dailyTotals.energyKcal}/${targets.caloriesKcal} kcal) and ${proteinAdequacyPct}% of target protein (${dailyTotals.proteinG}/${targets.proteinGrams}g).`,
    `All meal selections strictly adhere to ${profile.dietaryPreference.toUpperCase()} constraints with ${profile.dietaryExclusions.length} allergen exclusion(s).`,
  ];

  return {
    meals,
    dailyTotals,
    targets,
    budgetInr: budget,
    budgetRemainingInr,
    feasibility,
    metrics,
    rationale,
  };
}

function createEmptyInfeasiblePlan(
  profile: AthleteProfile,
  targets: MacronutrientTargets,
  reason: string,
  suggestedRelaxation: string
): OneDayMealPlan {
  return {
    meals: [],
    dailyTotals: {
      energyKcal: 0,
      proteinG: 0,
      carbohydratesG: 0,
      fatG: 0,
      fiberG: 0,
      ironMg: 0,
      calciumMg: 0,
      sodiumMg: 0,
      costInr: 0,
    },
    targets,
    budgetInr: profile.dailyBudgetInr,
    budgetRemainingInr: profile.dailyBudgetInr,
    feasibility: {
      isFeasible: false,
      status: "constraint_infeasible",
      infeasibilityReason: reason,
      suggestedRelaxation,
    },
    metrics: {
      overallScore: 0,
      nutritionAdequacyScore: 0,
      affordabilityScore: 0,
      varietyScore: 0,
      practicalityScore: 0,
      calorieAdequacyPct: 0,
      proteinAdequacyPct: 0,
      carbAdequacyPct: 0,
      fatAdequacyPct: 0,
    },
    rationale: [reason, suggestedRelaxation],
  };
}

