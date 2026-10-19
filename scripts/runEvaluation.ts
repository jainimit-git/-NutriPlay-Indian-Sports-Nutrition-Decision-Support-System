import fs from "fs";
import path from "path";
import { SYNTHETIC_ATHLETE_COHORT } from "../lib/evaluation/syntheticCohorts";
import { generateComprehensiveAthletePlan } from "../lib/recommendations/recommendationService";
import { runBaseline1Generic, runBaseline2Greedy } from "../lib/evaluation/baselines";
import { runAblationTrial } from "../lib/evaluation/ablationEngine";

async function main() {
  console.log("================================================================================");
  console.log("       NutriPlay — Research Evaluation & Baseline Comparison Pipeline           ");
  console.log("================================================================================\n");

  const comparisonResults = [];
  const ablationResults = [];

  console.log("1. Running Benchmark Evaluation across Synthetic Cohort (N = " + SYNTHETIC_ATHLETE_COHORT.length + ")...\n");

  for (const athlete of SYNTHETIC_ATHLETE_COHORT) {
    // 1. NutriPlay Full System
    const nutriplayOutput = await generateComprehensiveAthletePlan(athlete);

    // 2. Baseline 1 (Static Mifflin + 1.0g/kg protein)
    const b1Output = runBaseline1Generic(athlete);

    // 3. Baseline 2 (Greedy single-objective)
    const b2Output = runBaseline2Greedy(
      athlete,
      nutriplayOutput.energy.targetCaloriesRecommended,
      nutriplayOutput.targets.proteinGrams
    );

    comparisonResults.push({
      athleteName: athlete.name,
      sport: athlete.sport,
      diet: athlete.dietaryPreference,
      budgetInr: athlete.dailyBudgetInr,
      nutriplay: {
        caloriesTarget: nutriplayOutput.targets.caloriesKcal,
        caloriesActual: nutriplayOutput.mealPlan.dailyTotals.energyKcal,
        calorieAdequacyPct: Math.round(
          (nutriplayOutput.mealPlan.dailyTotals.energyKcal / nutriplayOutput.targets.caloriesKcal) * 100
        ),
        proteinTargetG: nutriplayOutput.targets.proteinGrams,
        proteinActualG: nutriplayOutput.mealPlan.dailyTotals.proteinG,
        proteinAdequacyPct: Math.round(
          (nutriplayOutput.mealPlan.dailyTotals.proteinG / nutriplayOutput.targets.proteinGrams) * 100
        ),
        costInr: nutriplayOutput.mealPlan.dailyTotals.costInr,
        budgetAdherence: nutriplayOutput.mealPlan.dailyTotals.costInr <= athlete.dailyBudgetInr,
        optimizationScore: nutriplayOutput.mealPlan.metrics.overallScore,
      },
      baseline1: {
        caloriesTarget: b1Output.caloriesTarget,
        caloriesActual: b1Output.caloriesActual,
        calorieAdequacyPct: Math.round((b1Output.caloriesActual / b1Output.caloriesTarget) * 100),
        proteinTargetG: b1Output.proteinTargetG,
        proteinActualG: b1Output.proteinActualG,
        costInr: b1Output.costInr,
        budgetAdherence: b1Output.budgetAdherence,
      },
      baseline2: {
        caloriesActual: b2Output.caloriesActual,
        calorieAdequacyPct: Math.round((b2Output.caloriesActual / b2Output.caloriesTarget) * 100),
        proteinActualG: b2Output.proteinActualG,
        costInr: b2Output.costInr,
        budgetAdherence: b2Output.budgetAdherence,
      },
    });

    // Run Ablation Trials
    const trialFull = await runAblationTrial(athlete, "full");
    const trialNoWeather = await runAblationTrial(athlete, "no_weather");
    const trialNoTraining = await runAblationTrial(athlete, "no_training_load");

    ablationResults.push({ athlete: athlete.name, trialFull, trialNoWeather, trialNoTraining });
  }

  // Summary Metrics
  const avgNutriplayCalAdequacy = Math.round(
    comparisonResults.reduce((acc, r) => acc + r.nutriplay.calorieAdequacyPct, 0) / comparisonResults.length
  );
  const avgNutriplayProtAdequacy = Math.round(
    comparisonResults.reduce((acc, r) => acc + r.nutriplay.proteinAdequacyPct, 0) / comparisonResults.length
  );
  const nutriplayBudgetAdherencePct = Math.round(
    (comparisonResults.filter((r) => r.nutriplay.budgetAdherence).length / comparisonResults.length) * 100
  );
  const avgOptimizationScore = Math.round(
    comparisonResults.reduce((acc, r) => acc + r.nutriplay.optimizationScore, 0) / comparisonResults.length
  );

  const avgB1CalAdequacy = Math.round(
    comparisonResults.reduce((acc, r) => acc + r.baseline1.calorieAdequacyPct, 0) / comparisonResults.length
  );
  const avgB2CalAdequacy = Math.round(
    comparisonResults.reduce((acc, r) => acc + r.baseline2.calorieAdequacyPct, 0) / comparisonResults.length
  );

  console.log("--------------------------------------------------------------------------------");
  console.log("                        BENCHMARK SUMMARY METRICS                               ");
  console.log("--------------------------------------------------------------------------------");
  console.log(`NutriPlay Mean Calorie Adequacy:   ${avgNutriplayCalAdequacy}%`);
  console.log(`NutriPlay Mean Protein Adequacy:   ${avgNutriplayProtAdequacy}%`);
  console.log(`NutriPlay Budget Adherence Rate:   ${nutriplayBudgetAdherencePct}%`);
  console.log(`NutriPlay Mean Optimization Score: ${avgOptimizationScore} / 100`);
  console.log(`Baseline 1 Mean Calorie Adequacy:  ${avgB1CalAdequacy}% (Static template deficit)`);
  console.log(`Baseline 2 Mean Calorie Adequacy:  ${avgB2CalAdequacy}%`);
  console.log("--------------------------------------------------------------------------------\n");

  // Format CSV for Ablation Results
  let csvContent = "Athlete,Mode,TDEE_kcal,Carbs_g,Protein_g,Fluid_L,Heat_Adj_L,Cost_INR,Budget_Met,Score\n";
  for (const item of ablationResults) {
    for (const t of [item.trialFull, item.trialNoWeather, item.trialNoTraining]) {
      csvContent += `"${item.athlete}","${t.mode}",${t.energyTdeeKcal},${t.carbTargetGrams},${t.proteinTargetGrams},${t.totalFluidLiters},${t.heatStressAdjustmentLiters},${t.totalCostInr},${t.budgetAdherence},${t.optimizationScore}\n`;
    }
  }

  // Save to disk
  const docsDir = path.resolve(__dirname, "../docs");
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });

  fs.writeFileSync(
    path.join(docsDir, "EVALUATION_RESULTS.json"),
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        summary: {
          cohortSize: SYNTHETIC_ATHLETE_COHORT.length,
          avgNutriplayCalAdequacy,
          avgNutriplayProtAdequacy,
          nutriplayBudgetAdherencePct,
          avgOptimizationScore,
          avgB1CalAdequacy,
          avgB2CalAdequacy,
        },
        individualResults: comparisonResults,
      },
      null,
      2
    )
  );

  fs.writeFileSync(path.join(docsDir, "ABLATION_RESULTS.csv"), csvContent);

  console.log("✅ Written evaluation data to docs/EVALUATION_RESULTS.json");
  console.log("✅ Written ablation trials to docs/ABLATION_RESULTS.csv");
  console.log("\nEvaluation run completed successfully.");
}

main().catch((err) => {
  console.error("Evaluation pipeline failed:", err);
  process.exit(1);
});

