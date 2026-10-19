import { BiologicalSex } from "@/lib/types/athlete";

export interface StepExplanation {
  step: string;
  formula: string;
  inputValue: string;
  outputValue: string;
  scientificRationale: string;
}

export interface EnergyRequirementResult {
  bmrKcal: number;
  baselineActivityMultiplier: number;
  nonTrainingEnergyKcal: number;
  sportMetValue: number;
  exerciseDurationHours: number;
  exerciseEnergyExpenditureKcal: number;
  thermicEffectOfFoodKcal: number;
  totalDailyEnergyExpenditureKcal: number;
  targetCaloriesMin: number;
  targetCaloriesMax: number;
  targetCaloriesRecommended: number;
  energyAvailabilityEstKcalPerKgFfm?: number; // kcal / kg FFM if estimated
  explanations: StepExplanation[];
}

export interface MicronutrientTargets {
  sodiumMg: number;
  calciumMg: number;
  ironMg: number;
  fiberGrams: number;
}

export interface MacronutrientTargets {
  caloriesKcal: number;
  proteinGrams: number;
  proteinGramsPerKg: number;
  proteinCalories: number;
  proteinPercentOfEnergy: number;

  carbohydrateGrams: number;
  carbohydrateGramsPerKg: number;
  carbohydrateCalories: number;
  carbohydratePercentOfEnergy: number;

  fatGrams: number;
  fatGramsPerKg: number;
  fatCalories: number;
  fatPercentOfEnergy: number;

  micronutrients: MicronutrientTargets;
  explanations: StepExplanation[];
}

