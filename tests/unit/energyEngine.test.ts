import { describe, it, expect } from "vitest";
import {
  calculateMifflinStJeorBmr,
  calculateExerciseEnergyExpenditure,
  calculateEnergyRequirement,
} from "@/lib/nutrition/energyEngine";
import { AthleteProfile } from "@/lib/types/athlete";

describe("Energy Requirement Engine Unit Tests", () => {
  it("computes accurate Mifflin-St Jeor BMR for 70kg, 175cm, 25yo male", () => {
    // Expected: 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1673.8
    const bmr = calculateMifflinStJeorBmr(70, 175, 25, "male");
    expect(bmr).toBeCloseTo(1673.8, 1);
  });

  it("computes accurate Mifflin-St Jeor BMR for 60kg, 165cm, 22yo female", () => {
    // Expected: 10*60 + 6.25*165 - 5*22 - 161 = 600 + 1031.25 - 110 - 161 = 1360.25 -> 1360.3
    const bmr = calculateMifflinStJeorBmr(60, 165, 22, "female");
    expect(bmr).toBeCloseTo(1360.3, 1);
  });

  it("computes 0 Exercise Energy Expenditure on rest days or zero duration", () => {
    const resRest = calculateExerciseEnergyExpenditure(8.0, 75, 90, "rest");
    expect(resRest.eeeKcal).toBe(0);

    const resZero = calculateExerciseEnergyExpenditure(8.0, 75, 0, "high");
    expect(resZero.eeeKcal).toBe(0);
  });

  it("scales exercise energy expenditure with sport MET, weight, duration, and intensity", () => {
    // Cricket MET=5.5, weight=78kg, duration=120min (2hr), intensity=high (1.15)
    // Effective MET = 5.5 * 1.15 = 6.325 -> 6.3
    // EEE = 6.325 * 78 * 2 = 986.7 -> 987 kcal
    const { eeeKcal, effectiveMet } = calculateExerciseEnergyExpenditure(5.5, 78, 120, "high");
    expect(effectiveMet).toBe(6.3);
    expect(eeeKcal).toBe(987);
  });

  it("calculates comprehensive TDEE with step explanations for a full athlete profile", () => {
    const profile: AthleteProfile = {
      name: "Aman",
      age: 24,
      sex: "male",
      heightCm: 180,
      weightKg: 75,
      sport: "kabaddi", // MET 8.0
      trainingDurationMinutes: 90, // 1.5 hr
      trainingIntensity: "high", // factor 1.15
      trainingFrequencyDaysPerWeek: 6,
      dietaryPreference: "vegetarian",
      dailyBudgetInr: 400,
      location: "Delhi",
      dietaryExclusions: [],
    };

    const result = calculateEnergyRequirement(profile);

    // BMR: 10*75 + 6.25*180 - 5*24 + 5 = 750 + 1125 - 120 + 5 = 1760 kcal
    expect(result.bmrKcal).toBe(1760);

    // Baseline non-training: 1760 * 1.35 = 2376 kcal
    expect(result.nonTrainingEnergyKcal).toBe(2376);

    // Effective MET: 8.0 * 1.15 = 9.2; EEE = 9.2 * 75 * 1.5 = 1035 kcal
    expect(result.exerciseEnergyExpenditureKcal).toBe(1035);

    // Total TDEE: 2376 + 1035 = 3411 kcal
    expect(result.totalDailyEnergyExpenditureKcal).toBe(3411);
    expect(result.targetCaloriesRecommended).toBe(3411);

    // Explanations must be present for transparency
    expect(result.explanations.length).toBeGreaterThanOrEqual(4);
    expect(result.explanations[0].step).toContain("Basal Metabolic Rate");
    expect(result.explanations[3].step).toContain("Total Daily Energy Expenditure");
  });

  it("uses an explicit generic sport estimate for unlisted sports and retains session load", () => {
    const profile: AthleteProfile = {
      name: "Custom sport athlete",
      age: 24,
      sex: "male",
      heightCm: 180,
      weightKg: 75,
      sport: "squash",
      trainingDurationMinutes: 90,
      trainingIntensity: "high",
      trainingFrequencyDaysPerWeek: 6,
      dietaryPreference: "vegetarian",
      dailyBudgetInr: 400,
      location: "Delhi",
      dietaryExclusions: [],
    };

    const result = calculateEnergyRequirement(profile);
    expect(result.sportMetValue).toBe(5);
    expect(result.exerciseEnergyExpenditureKcal).toBe(647);
  });
});
