import { describe, it, expect } from "vitest";
import { calculateHydrationPlan } from "@/lib/hydration/hydrationEngine";
import { calculateSweatRate } from "@/lib/hydration/sweatRateEngine";
import { calculateHeatIndex } from "@/lib/weather/heatIndex";
import { AthleteProfile } from "@/lib/types/athlete";

describe("Hydration & Sweat Rate Engine Unit Tests", () => {
  const baseProfile: AthleteProfile = {
    name: "Rohit",
    age: 24,
    sex: "male",
    heightCm: 180,
    weightKg: 70,
    sport: "cricket",
    trainingDurationMinutes: 90,
    trainingIntensity: "high",
    trainingFrequencyDaysPerWeek: 6,
    dietaryPreference: "non_vegetarian",
    dailyBudgetInr: 450,
    location: "Mumbai",
    trainingTimeOfDay: "morning",
    dietaryExclusions: [],
  };

  it("calculates accurate baseline daily fluid requirement based on body mass (35ml/kg)", () => {
    const heatIndex = calculateHeatIndex(25, 50); // Low risk
    const plan = calculateHydrationPlan(baseProfile, heatIndex);

    // 70 kg * 35 ml/kg = 2.45L -> 2.5L
    expect(plan.baselineDailyWaterLiters).toBe(2.5);
  });

  it("calculates measured sweat rate when verified test data is provided", () => {
    const measuredProfile: AthleteProfile = {
      ...baseProfile,
      measuredSweatRateInput: {
        preExerciseWeightKg: 70.0,
        postExerciseWeightKg: 68.8, // 1.2 kg loss
        fluidConsumedLiters: 0.5,
        urineOutputLiters: 0.1,
        exerciseDurationMinutes: 90, // 1.5 hr
      },
    };

    const heatIndex = calculateHeatIndex(28, 55);
    const sweatResult = calculateSweatRate(measuredProfile, heatIndex);

    // Sweat Loss = (70 - 68.8) + 0.5 - 0.1 = 1.2 + 0.4 = 1.6 L
    // Sweat Rate = 1.6 L / 1.5 hr = 1.07 L/hr
    expect(sweatResult.isMeasured).toBe(true);
    expect(sweatResult.methodLabel).toContain("MEASURED");
    expect(sweatResult.totalSweatLossLiters).toBe(1.6);
    expect(sweatResult.sweatRateLitersPerHour).toBe(1.07);
    expect(sweatResult.calculationExplanation).toContain("Pre-exercise wt");
  });

  it("uses empirical fallback when no measured sweat test data is provided", () => {
    const heatIndex = calculateHeatIndex(25, 50);
    const sweatResult = calculateSweatRate(baseProfile, heatIndex);

    expect(sweatResult.isMeasured).toBe(false);
    expect(sweatResult.methodLabel).toContain("EMPIRICAL FALLBACK");
    expect(sweatResult.sweatRateLitersPerHour).toBeGreaterThan(0.5);
    expect(sweatResult.totalSweatLossLiters).toBeGreaterThan(0.5);
  });

  it("adjusts fluid recommendations upward during environmental heat stress", () => {
    const mildHeat = calculateHeatIndex(24, 45); // low risk
    const highHeat = calculateHeatIndex(38, 75); // danger risk

    const planMild = calculateHydrationPlan(baseProfile, mildHeat);
    const planHot = calculateHydrationPlan(baseProfile, highHeat);

    expect(planHot.heatStressAdjustmentLiters).toBeGreaterThan(0);
    expect(planHot.totalDailyFluidRecommendationLiters).toBeGreaterThan(
      planMild.totalDailyFluidRecommendationLiters
    );
    expect(planHot.rationales[2]).toContain("accelerates ambient fluid evaporation");
  });

  it("provides actionable sodium/electrolyte guidance and Indian beverages for sessions >= 60 min", () => {
    const heatIndex = calculateHeatIndex(32, 65);
    const plan = calculateHydrationPlan(baseProfile, heatIndex);

    expect(plan.electrolyte.recommendedElectrolyteAdditionMg).toBeGreaterThan(0);
    expect(plan.electrolyte.indianBeverageOptions.length).toBeGreaterThanOrEqual(3);
    const beverageList = plan.electrolyte.indianBeverageOptions.join(" ");
    expect(beverageList).toContain("Coconut");
    expect(beverageList).toContain("Chaas");
    expect(beverageList).toContain("Nimbu Pani");
  });
});

