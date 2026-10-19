import { describe, it, expect } from "vitest";
import { evaluateRedsRisk, generateOverallSafetyReport } from "@/lib/safety/redsSafetyEngine";
import { calculateEnergyRequirement } from "@/lib/nutrition/energyEngine";
import { calculateHeatIndex } from "@/lib/weather/heatIndex";
import { AthleteProfile } from "@/lib/types/athlete";

describe("RED-S Safety & Clinical Warning Suite", () => {
  const athlete: AthleteProfile = {
    name: "Pooja",
    age: 21,
    sex: "female",
    heightCm: 168,
    weightKg: 55,
    sport: "badminton",
    trainingDurationMinutes: 120, // 2 hr high intensity
    trainingIntensity: "very_high",
    trainingFrequencyDaysPerWeek: 6,
    dietaryPreference: "vegetarian",
    dailyBudgetInr: 350,
    location: "Hyderabad",
    dietaryExclusions: [],
  };

  it("triggers RED-S flag when actual caloric intake is severely deficient relative to exercise load (EA < 30)", () => {
    const energy = calculateEnergyRequirement(athlete);
    // Athlete expends ~950 kcal in 2hr very_high badminton, but only consumes 1500 kcal
    // FFM for 55kg female @ 22% BF = 55 * 0.78 = 42.9 kg
    // Net energy = 1500 - 950 = 550 kcal
    // EA = 550 / 42.9 = 12.8 kcal/kg FFM (< 30)
    const severeIntakeKcal = 1500;
    const reds = evaluateRedsRisk(athlete, energy, severeIntakeKcal);

    expect(reds.flagTriggered).toBe(true);
    expect(reds.riskLevel).toBe("high");
    expect(reds.energyAvailabilityKcalPerKgFfm).toBeLessThan(30);
    expect(reds.headline).toBe(
      "Potential low-energy-availability risk — consider professional assessment"
    );
    expect(reds.clinicalNotice).toContain("does NOT diagnose RED-S");
  });

  it("evaluates healthy fueled athletes as optimal with no alarm flag (EA >= 45)", () => {
    const energy = calculateEnergyRequirement(athlete);
    // Athlete consuming high-carbohydrate athletic intake (~3000 kcal)
    // Net energy = 3000 - 950 = 2050 kcal; 2050 / 42.9 = 47.8 kcal/kg FFM (> 45)
    const highIntakeKcal = 3000;
    const reds = evaluateRedsRisk(athlete, energy, highIntakeKcal);

    expect(reds.flagTriggered).toBe(false);
    expect(reds.riskLevel).toBe("low");
    expect(reds.energyAvailabilityKcalPerKgFfm).toBeGreaterThanOrEqual(45);
    expect(reds.headline).toContain("Optimal Energy Availability");
  });

  it("identifies sub-optimal energy availability in the 30-45 kcal/kg FFM range", () => {
    const energy = calculateEnergyRequirement(athlete);
    // Standard maintenance baseline intake (yields ~42 kcal/kg FFM)
    const reds = evaluateRedsRisk(athlete, energy, energy.targetCaloriesRecommended);

    expect(reds.flagTriggered).toBe(false);
    expect(reds.riskLevel).toBe("moderate");
    expect(reds.energyAvailabilityKcalPerKgFfm).toBeGreaterThanOrEqual(30);
    expect(reds.energyAvailabilityKcalPerKgFfm).toBeLessThan(45);
  });

  it("generates comprehensive safety report including overtraining and environmental heat warnings", () => {
    const overtrainedAthlete: AthleteProfile = {
      ...athlete,
      trainingFrequencyDaysPerWeek: 7, // 7 days without rest
      trainingDurationMinutes: 120,
    };

    const energy = calculateEnergyRequirement(overtrainedAthlete);
    const dangerHeat = calculateHeatIndex(38, 70); // Danger heat stress
    const report = generateOverallSafetyReport(overtrainedAthlete, energy, dangerHeat);

    // Should include overtraining and heat warnings
    const categories = report.warnings.map((w) => w.category);
    expect(categories).toContain("training_overload");
    expect(categories).toContain("environmental");

    // Mandatory disclaimer must be present
    expect(report.mandatoryClinicalDisclaimer).toContain("decision-support prototype");
    expect(report.mandatoryClinicalDisclaimer).toContain("does NOT provide medical diagnosis");
  });
});

