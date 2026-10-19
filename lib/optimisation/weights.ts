/**
 * Configurable weights for Multi-Objective Meal Plan Optimisation:
 * Total Weight Sum = 1.0 (100%)
 */
export interface OptimizationWeights {
  w1_nutritionAdequacy: number; // Weight for matching caloric & macronutrient targets
  w2_affordability: number; // Weight for respecting and remaining within daily food budget
  w3_variety: number; // Weight for avoiding monotonous repetitive ingredients
  w4_mealTimingPracticality: number; // Weight for matching athletic pre/post workout carbohydrate & protein timing
}

export const DEFAULT_OPTIMIZATION_WEIGHTS: OptimizationWeights = {
  w1_nutritionAdequacy: 0.45,
  w2_affordability: 0.25,
  w3_variety: 0.15,
  w4_mealTimingPracticality: 0.15,
};

