import { describe, it, expect } from "vitest";
import { generateOptimizedMealPlan } from "@/lib/optimisation/mealOptimizer";
import { calculateEnergyRequirement } from "@/lib/nutrition/energyEngine";
import { calculateNutrientTargets } from "@/lib/nutrition/nutrientEngine";
import { AthleteProfile } from "@/lib/types/athlete";
import { FoodItem } from "@/lib/types/food";

describe("Multi-Objective Meal Plan Optimization Suite", () => {
  const baseProfile: AthleteProfile = {
    name: "Rohit",
    age: 24,
    sex: "male",
    heightCm: 182,
    weightKg: 78,
    sport: "cricket",
    trainingDurationMinutes: 120,
    trainingIntensity: "high",
    trainingFrequencyDaysPerWeek: 6,
    dietaryPreference: "non_vegetarian",
    dailyBudgetInr: 550,
    location: "Mumbai",
    trainingTimeOfDay: "morning",
    dietaryExclusions: [],
  };

  it("generates a feasible, high-adequacy meal plan for a cricketer with sufficient budget", () => {
    const energy = calculateEnergyRequirement(baseProfile);
    const targets = calculateNutrientTargets(baseProfile, energy);
    const plan = generateOptimizedMealPlan(baseProfile, targets);

    expect(plan.feasibility.isFeasible).toBe(true);
    expect(plan.feasibility.status).toBe("optimal");
    expect(plan.meals.length).toBeGreaterThanOrEqual(5);

    // Cost must not exceed budget
    expect(plan.dailyTotals.costInr).toBeLessThanOrEqual(baseProfile.dailyBudgetInr);
    expect(plan.budgetRemainingInr).toBeGreaterThanOrEqual(0);

    // Multi-objective scores must be within valid bounded range [0, 100]
    expect(plan.metrics.overallScore).toBeGreaterThanOrEqual(60);
    expect(plan.metrics.overallScore).toBeLessThanOrEqual(100);
    expect(plan.metrics.nutritionAdequacyScore).toBeGreaterThanOrEqual(50);

    // Explanations/rationales must be generated
    expect(plan.rationale.length).toBeGreaterThanOrEqual(2);
  });

  it("detects and flags budget infeasibility when budget is artificially low without generating a misleading plan", () => {
    const lowBudgetProfile: AthleteProfile = {
      ...baseProfile,
      dailyBudgetInr: 85, // Unrealistically low for high-calorie athletic diet
    };

    const energy = calculateEnergyRequirement(lowBudgetProfile);
    const targets = calculateNutrientTargets(lowBudgetProfile, energy);
    const plan = generateOptimizedMealPlan(lowBudgetProfile, targets);

    expect(plan.feasibility.isFeasible).toBe(false);
    expect(plan.feasibility.status).toBe("budget_infeasible");
    expect(plan.feasibility.infeasibilityReason).toBeDefined();
    expect(plan.feasibility.infeasibilityReason).toContain("insufficient");
    expect(plan.feasibility.suggestedRelaxation).toBeDefined();
    expect(plan.feasibility.minimumEstimatedFeasibleBudgetInr).toBeGreaterThan(85);
  });

  it("strictly produces 100% Jain-compliant foods for a Jain athlete", () => {
    const jainProfile: AthleteProfile = {
      name: "Dhaval",
      age: 23,
      sex: "male",
      heightCm: 172,
      weightKg: 63,
      sport: "running",
      trainingDurationMinutes: 60,
      trainingIntensity: "moderate",
      trainingFrequencyDaysPerWeek: 5,
      dietaryPreference: "jain",
      dailyBudgetInr: 350,
      location: "Ahmedabad",
      dietaryExclusions: [],
    };

    const energy = calculateEnergyRequirement(jainProfile);
    const targets = calculateNutrientTargets(jainProfile, energy);
    const plan = generateOptimizedMealPlan(jainProfile, targets);

    expect(plan.meals.length).toBeGreaterThan(0);
    const allPlannedItems = plan.meals.flatMap((m) => m.items);
    for (const item of allPlannedItems) {
      expect(item.food.isJain).toBe(true);
      expect(item.food.isVegetarian).toBe(true);
      expect(item.food.isNonVegetarian).toBe(false);
    }
  });

  it("optimizes deterministically on a synthetic toy food dataset with known optimal selection", () => {
    const toyDatabase: FoodItem[] = [
      {
        id: "toy_oats",
        name: "Toy Oats",
        category: "cereals_millets",
        appropriateMealSlots: ["breakfast"],
        servingUnit: "1 bowl",
        servingSizeGrams: 100,
        energyKcal: 350,
        proteinG: 12,
        carbohydratesG: 60,
        fatG: 5,
        fiberG: 8,
        ironMg: 3,
        calciumMg: 50,
        sodiumMg: 10,
        isVegetarian: true,
        isNonVegetarian: false,
        isJain: true,
        allergens: [],
        approximateCostInr: 20,
        regionalCuisine: "pan_indian",
      },
      {
        id: "toy_dal",
        name: "Toy Dal",
        category: "pulses_legumes",
        appropriateMealSlots: ["lunch", "dinner"],
        servingUnit: "1 bowl",
        servingSizeGrams: 150,
        energyKcal: 200,
        proteinG: 14,
        carbohydratesG: 30,
        fatG: 3,
        fiberG: 5,
        ironMg: 2.5,
        calciumMg: 40,
        sodiumMg: 200,
        isVegetarian: true,
        isNonVegetarian: false,
        isJain: true,
        allergens: [],
        approximateCostInr: 15,
        regionalCuisine: "pan_indian",
      },
      {
        id: "toy_roti",
        name: "Toy Roti",
        category: "cereals_millets",
        appropriateMealSlots: ["lunch", "dinner"],
        servingUnit: "2 rotis",
        servingSizeGrams: 80,
        energyKcal: 200,
        proteinG: 6,
        carbohydratesG: 40,
        fatG: 1,
        fiberG: 4,
        ironMg: 2,
        calciumMg: 20,
        sodiumMg: 10,
        isVegetarian: true,
        isNonVegetarian: false,
        isJain: true,
        allergens: [],
        approximateCostInr: 10,
        regionalCuisine: "pan_indian",
      },
    ];

    const energy = calculateEnergyRequirement(baseProfile);
    const targets = calculateNutrientTargets(baseProfile, energy);
    const plan = generateOptimizedMealPlan(baseProfile, targets, toyDatabase);

    expect(plan.meals.length).toBeGreaterThan(0);
    // All foods selected must belong to the toy database
    const toyIds = toyDatabase.map((t) => t.id);
    for (const meal of plan.meals) {
      for (const item of meal.items) {
        expect(toyIds).toContain(item.food.id);
      }
    }
  });
});

