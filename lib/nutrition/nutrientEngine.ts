import { AthleteProfile } from "@/lib/types/athlete";
import { EnergyRequirementResult, MacronutrientTargets, StepExplanation } from "@/lib/types/nutrition";
import { FALLBACK_SPORT_METADATA, getSportMetadata } from "@/data/reference/sportsData";
import { NUTRITION_REFERENCE } from "@/data/reference/nutritionReference";

/**
 * Calculates individual macronutrient and micronutrient targets
 * tailored to Indian athletic requirements and sports training load.
 */
export function calculateNutrientTargets(
  profile: AthleteProfile,
  energy: EnergyRequirementResult
): MacronutrientTargets {
  const explanations: StepExplanation[] = [];
  const sportMeta = getSportMetadata(profile.sport) || FALLBACK_SPORT_METADATA;
  const weight = profile.weightKg;
  const targetCalories = energy.targetCaloriesRecommended;

  // 1. Protein Target (g/kg basis)
  const proteinFactor = sportMeta.defaultProteinFactorGPerKg[profile.trainingIntensity];
  const rawProteinGrams = Math.round(weight * proteinFactor);
  const proteinCalories = rawProteinGrams * NUTRITION_REFERENCE.macronutrientCaloricDensity.proteinKcalPerGram;
  const proteinPercent = Math.round((proteinCalories / targetCalories) * 1000) / 10;

  explanations.push({
    step: "Protein Requirement",
    formula: "Weight(kg) × Sport-Specific Intensity Factor (g/kg)",
    inputValue: `Weight=${weight}kg, Factor=${proteinFactor}g/kg (${sportMeta.category} sport, ${profile.trainingIntensity} load)`,
    outputValue: `${rawProteinGrams} g (${proteinCalories} kcal, ${proteinPercent}%)`,
    scientificRationale:
      "Protein synthesis and muscle tissue remodeling require 1.2–2.4 g/kg in competitive athletes, exceeding the general sedentary ICMR RDA of 0.83 g/kg.",
  });

  // 2. Carbohydrate Target (g/kg basis based on training fuel demand)
  let carbFactor = sportMeta.defaultCarbFactorGPerKg[profile.trainingIntensity];
  let rawCarbGrams = Math.round(weight * carbFactor);
  let carbohydrateCalories = rawCarbGrams * NUTRITION_REFERENCE.macronutrientCaloricDensity.carbohydrateKcalPerGram;

  // 3. Fat Target (energy balance approach with safety floor)
  let fatCalories = targetCalories - (proteinCalories + carbohydrateCalories);
  let fatPercent = (fatCalories / targetCalories) * 100;

  // Guard against essential fatty acid deficit: Ensure fat is between 20% and 35%
  const minFatPercent = NUTRITION_REFERENCE.acceptableMacronutrientDistributionRanges.fatMinPercent;
  const maxFatPercent = NUTRITION_REFERENCE.acceptableMacronutrientDistributionRanges.fatMaxPercent;

  if (fatPercent < minFatPercent) {
    // Rebalance: Set fat to minFatPercent and adjust carbs to match energy
    fatCalories = Math.round(targetCalories * (minFatPercent / 100));
    carbohydrateCalories = targetCalories - proteinCalories - fatCalories;
    rawCarbGrams = Math.round(carbohydrateCalories / NUTRITION_REFERENCE.macronutrientCaloricDensity.carbohydrateKcalPerGram);
    carbFactor = Math.round((rawCarbGrams / weight) * 10) / 10;
  } else if (fatPercent > maxFatPercent) {
    fatCalories = Math.round(targetCalories * (maxFatPercent / 100));
    carbohydrateCalories = targetCalories - proteinCalories - fatCalories;
    rawCarbGrams = Math.round(carbohydrateCalories / NUTRITION_REFERENCE.macronutrientCaloricDensity.carbohydrateKcalPerGram);
    carbFactor = Math.round((rawCarbGrams / weight) * 10) / 10;
  }

  const fatGrams = Math.round(fatCalories / NUTRITION_REFERENCE.macronutrientCaloricDensity.fatKcalPerGram);
  const finalFatPercent = Math.round((fatCalories / targetCalories) * 1000) / 10;
  const finalCarbPercent = Math.round((carbohydrateCalories / targetCalories) * 1000) / 10;

  explanations.push({
    step: "Carbohydrate Target",
    formula: "Weight(kg) × Glycogen Fueling Factor (g/kg)",
    inputValue: `Weight=${weight}kg, Factor=${carbFactor}g/kg for ${profile.trainingDurationMinutes} min session`,
    outputValue: `${rawCarbGrams} g (${carbohydrateCalories} kcal, ${finalCarbPercent}%)`,
    scientificRationale:
      "Carbohydrates are the primary substrate for glycolytic and aerobic ATP synthesis. Intake is periodized by daily training load to maintain muscle glycogen stores.",
  });

  explanations.push({
    step: "Fat Requirement",
    formula: "[Total Target Calories - (Protein kcal + Carb kcal)] / 9 kcal/g",
    inputValue: `Remaining Energy=${fatCalories} kcal (${finalFatPercent}% of total)`,
    outputValue: `${fatGrams} g (${fatCalories} kcal)`,
    scientificRationale:
      "Fat provides essential fatty acids, fat-soluble vitamins (A, D, E, K), and sustained metabolic fuel. Minimum 20% energy is preserved for endocrine health.",
  });

  // 4. Micronutrient baselines (ICMR-NIN 2020)
  const ironTarget =
    profile.sex === "female"
      ? NUTRITION_REFERENCE.icmrMicronutrientBaselines.ironMg.female
      : NUTRITION_REFERENCE.icmrMicronutrientBaselines.ironMg.male;

  const micronutrients = {
    sodiumMg: NUTRITION_REFERENCE.icmrMicronutrientBaselines.sodiumBaseMg,
    calciumMg: NUTRITION_REFERENCE.icmrMicronutrientBaselines.calciumMg[profile.sex],
    ironMg: ironTarget,
    fiberGrams: NUTRITION_REFERENCE.icmrMicronutrientBaselines.fiberBaseGrams,
  };

  explanations.push({
    step: "Micronutrient Baselines",
    formula: "ICMR-NIN 2020 Recommended Dietary Allowances for Indian Adults",
    inputValue: `Sex=${profile.sex}, Age=${profile.age}`,
    outputValue: `Iron=${ironTarget}mg, Calcium=${micronutrients.calciumMg}mg, Sodium Baseline=${micronutrients.sodiumMg}mg`,
    scientificRationale:
      "Iron is critical for oxygen transport (hemoglobin/myoglobin), with higher requirements for females due to physiological losses. Calcium is vital for skeletal stress and neuromuscular signaling.",
  });

  return {
    caloriesKcal: targetCalories,
    proteinGrams: rawProteinGrams,
    proteinGramsPerKg: Math.round((rawProteinGrams / weight) * 10) / 10,
    proteinCalories,
    proteinPercentOfEnergy: proteinPercent,

    carbohydrateGrams: rawCarbGrams,
    carbohydrateGramsPerKg: Math.round((rawCarbGrams / weight) * 10) / 10,
    carbohydrateCalories,
    carbohydratePercentOfEnergy: finalCarbPercent,

    fatGrams,
    fatGramsPerKg: Math.round((fatGrams / weight) * 10) / 10,
    fatCalories,
    fatPercentOfEnergy: finalFatPercent,

    micronutrients,
    explanations,
  };
}
