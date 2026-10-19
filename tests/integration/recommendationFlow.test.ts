import { describe, it, expect } from "vitest";
import { generateComprehensiveAthletePlan } from "@/lib/recommendations/recommendationService";
import { AthleteProfile } from "@/lib/types/athlete";

describe("NutriPlay End-to-End Recommendation Flow Integration Tests", () => {
  it("executes the full end-to-end decision-support pipeline for a fast bowler (cricketer)", async () => {
    const profile: AthleteProfile = {
      name: "Rohit Sharma",
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

    const output = await generateComprehensiveAthletePlan(profile);

    // 1. Athlete & Weather verified
    expect(output.athlete.name).toBe("Rohit Sharma");
    expect(output.weather.location).toBe("Mumbai");
    expect(output.weather.heatIndex).toBeDefined();

    // 2. Energy calculations verified
    expect(output.energy.bmrKcal).toBeGreaterThan(1600);
    expect(output.energy.totalDailyEnergyExpenditureKcal).toBeGreaterThan(2800);
    expect(output.energy.explanations.length).toBeGreaterThanOrEqual(4);

    // 3. Nutrient targets verified
    expect(output.targets.proteinGrams).toBeGreaterThanOrEqual(130);
    expect(output.targets.carbohydrateGrams).toBeGreaterThan(300);
    expect(output.targets.micronutrients.ironMg).toBe(19);

    // 4. Meal plan verified
    expect(output.mealPlan.meals.length).toBeGreaterThanOrEqual(5);
    expect(output.mealPlan.dailyTotals.costInr).toBeLessThanOrEqual(550);
    expect(output.mealPlan.feasibility.isFeasible).toBe(true);

    // 5. Hydration verified
    expect(output.hydration.totalDailyFluidRecommendationLiters).toBeGreaterThanOrEqual(3.5);
    expect(output.hydration.sweatRate.sweatRateLitersPerHour).toBeGreaterThan(0.8);
    expect(output.hydration.electrolyte.indianBeverageOptions.length).toBeGreaterThan(0);

    // 6. Safety verified
    expect(output.safety.reds).toBeDefined();
    expect(output.safety.mandatoryClinicalDisclaimer).toContain("decision-support prototype");
  });

  it("executes end-to-end flow for female Jain athlete respecting all dietary and micronutrient rules", async () => {
    const jainProfile: AthleteProfile = {
      name: "Dharmi",
      age: 22,
      sex: "female",
      heightCm: 165,
      weightKg: 54,
      sport: "badminton",
      trainingDurationMinutes: 90,
      trainingIntensity: "moderate",
      trainingFrequencyDaysPerWeek: 5,
      dietaryPreference: "jain",
      dailyBudgetInr: 400,
      location: "Ahmedabad",
      trainingTimeOfDay: "evening",
      dietaryExclusions: ["peanuts"],
    };

    const output = await generateComprehensiveAthletePlan(jainProfile);

    // Jain compliance across all meals
    for (const meal of output.mealPlan.meals) {
      for (const item of meal.items) {
        expect(item.food.isJain).toBe(true);
        expect(item.food.isVegetarian).toBe(true);
        expect(item.food.isNonVegetarian).toBe(false);
        expect(item.food.allergens).not.toContain("peanuts");
      }
    }

    // Female ICMR Iron target must be 29mg
    expect(output.targets.micronutrients.ironMg).toBe(29);
  });

  it("handles extreme weather conditions and adjusts fluid recommendations accordingly", async () => {
    const delhiProfile: AthleteProfile = {
      name: "Vikas",
      age: 25,
      sex: "male",
      heightCm: 176,
      weightKg: 74,
      sport: "kabaddi",
      trainingDurationMinutes: 120,
      trainingIntensity: "very_high",
      trainingFrequencyDaysPerWeek: 6,
      dietaryPreference: "vegetarian",
      dailyBudgetInr: 450,
      location: "Delhi",
      trainingTimeOfDay: "afternoon",
      dietaryExclusions: [],
    };

    const output = await generateComprehensiveAthletePlan(delhiProfile);

    expect(output.weather.location).toBe("Delhi");
    // High training + heat requires high fluid volume (> 4L)
    expect(output.hydration.totalDailyFluidRecommendationLiters).toBeGreaterThanOrEqual(4.0);
    // Electrolyte guidance must be triggered
    expect(output.hydration.electrolyte.recommendedElectrolyteAdditionMg).toBeGreaterThan(1000);
  });
});

