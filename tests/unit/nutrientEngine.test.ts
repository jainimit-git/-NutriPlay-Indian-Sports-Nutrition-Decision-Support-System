import { describe, it, expect } from "vitest";
import { calculateNutrientTargets } from "@/lib/nutrition/nutrientEngine";
import { calculateEnergyRequirement } from "@/lib/nutrition/energyEngine";
import { AthleteProfile } from "@/lib/types/athlete";

describe("Nutrient Target Engine Unit Tests", () => {
  it("determines correct macronutrients for male strength/power athlete", () => {
    const profile: AthleteProfile = {
      name: "Vikram",
      age: 23,
      sex: "male",
      heightCm: 175,
      weightKg: 80,
      sport: "weightlifting",
      trainingDurationMinutes: 100,
      trainingIntensity: "high",
      trainingFrequencyDaysPerWeek: 5,
      dietaryPreference: "non_vegetarian",
      dailyBudgetInr: 500,
      location: "Chandigarh",
      dietaryExclusions: [],
    };

    const energy = calculateEnergyRequirement(profile);
    const targets = calculateNutrientTargets(profile, energy);

    // Protein for weightlifting high = 2.2 g/kg -> 80 * 2.2 = 176 g
    expect(targets.proteinGrams).toBe(176);
    expect(targets.proteinGramsPerKg).toBe(2.2);

    // Fat percentage should remain in healthy physiological range (>=20% and <=35%)
    expect(targets.fatPercentOfEnergy).toBeGreaterThanOrEqual(20);
    expect(targets.fatPercentOfEnergy).toBeLessThanOrEqual(35);

    // Sum of macro calories should equal total calories within rounding tolerance (+/- 15 kcal)
    const totalMacroKcal = targets.proteinCalories + targets.carbohydrateCalories + targets.fatCalories;
    expect(Math.abs(totalMacroKcal - targets.caloriesKcal)).toBeLessThanOrEqual(15);

    // Male iron target should be ICMR baseline 19mg
    expect(targets.micronutrients.ironMg).toBe(19);
  });

  it("assigns higher ICMR iron RDA (29mg) to female athletes", () => {
    const femaleProfile: AthleteProfile = {
      name: "Deepika",
      age: 20,
      sex: "female",
      heightCm: 165,
      weightKg: 55,
      sport: "badminton",
      trainingDurationMinutes: 90,
      trainingIntensity: "high",
      trainingFrequencyDaysPerWeek: 6,
      dietaryPreference: "vegetarian",
      dailyBudgetInr: 350,
      location: "Bengaluru",
      dietaryExclusions: [],
    };

    const energy = calculateEnergyRequirement(femaleProfile);
    const targets = calculateNutrientTargets(femaleProfile, energy);

    expect(targets.micronutrients.ironMg).toBe(29);
    expect(targets.micronutrients.calciumMg).toBe(1000);
    expect(targets.micronutrients.sodiumMg).toBe(2000);
  });

  it("adjusts carbohydrate intake downwards on rest days compared to high-intensity days", () => {
    const base: AthleteProfile = {
      name: "Karan",
      age: 25,
      sex: "male",
      heightCm: 178,
      weightKg: 70,
      sport: "running",
      trainingDurationMinutes: 0,
      trainingIntensity: "rest",
      trainingFrequencyDaysPerWeek: 5,
      dietaryPreference: "vegetarian",
      dailyBudgetInr: 300,
      location: "Pune",
      dietaryExclusions: [],
    };

    const energyRest = calculateEnergyRequirement(base);
    const targetsRest = calculateNutrientTargets(base, energyRest);

    const highLoad: AthleteProfile = {
      ...base,
      trainingDurationMinutes: 90,
      trainingIntensity: "high",
    };
    const energyHigh = calculateEnergyRequirement(highLoad);
    const targetsHigh = calculateNutrientTargets(highLoad, energyHigh);

    expect(targetsHigh.carbohydrateGrams).toBeGreaterThan(targetsRest.carbohydrateGrams);
    expect(targetsHigh.caloriesKcal).toBeGreaterThan(targetsRest.caloriesKcal);
  });
});

