import { describe, it, expect } from "vitest";
import { runBaseline1Generic, runBaseline2Greedy } from "@/lib/evaluation/baselines";
import { runAblationTrial } from "@/lib/evaluation/ablationEngine";
import { SYNTHETIC_ATHLETE_COHORT } from "@/lib/evaluation/syntheticCohorts";

describe("Evaluation Pipeline & Baseline Suite", () => {
  const athlete = SYNTHETIC_ATHLETE_COHORT[0]; // Rohit Cricket bowler

  it("executes Baseline 1 generic clinical approach", () => {
    const b1 = runBaseline1Generic(athlete);
    expect(b1.systemName).toContain("Baseline 1");
    expect(b1.caloriesActual).toBeGreaterThan(0);
    expect(b1.proteinTargetG).toBe(athlete.weightKg * 1.0); // 78g flat
    expect(b1.dietaryConstraintAdherence).toBe(true);
  });

  it("executes Baseline 2 greedy rule-based approach", () => {
    const b2 = runBaseline2Greedy(athlete, 3200, 150);
    expect(b2.systemName).toContain("Baseline 2");
    expect(b2.caloriesActual).toBeGreaterThanOrEqual(3200 * 0.90);
    expect(b2.proteinActualG).toBeGreaterThan(0);
  });

  it("demonstrates weather sensitivity in ablation trials", async () => {
    // Mumbai has high heat index (> 32°C)
    const fullTrial = await runAblationTrial(athlete, "full");
    const noWeatherTrial = await runAblationTrial(athlete, "no_weather");

    // Full system should have a positive heat stress adjustment in Mumbai, while no_weather has 0
    expect(fullTrial.heatStressAdjustmentLiters).toBeGreaterThan(0);
    expect(noWeatherTrial.heatStressAdjustmentLiters).toBe(0);
    expect(fullTrial.totalFluidLiters).toBeGreaterThan(noWeatherTrial.totalFluidLiters);
  });

  it("demonstrates training-load sensitivity in ablation trials", async () => {
    const fullTrial = await runAblationTrial(athlete, "full");
    const noTrainingTrial = await runAblationTrial(athlete, "no_training_load");

    // Training load accounts for 120 min high cricket session: TDEE and carbs should be significantly higher in full system
    expect(fullTrial.energyTdeeKcal).toBeGreaterThan(noTrainingTrial.energyTdeeKcal);
    expect(fullTrial.carbTargetGrams).toBeGreaterThan(noTrainingTrial.carbTargetGrams);
  });
});

