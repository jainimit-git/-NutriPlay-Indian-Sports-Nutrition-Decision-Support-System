import { AthleteProfile } from "@/lib/types/athlete";
import { EnergyRequirementResult, StepExplanation } from "@/lib/types/nutrition";
import { FALLBACK_SPORT_METADATA, getSportMetadata } from "@/data/reference/sportsData";
import { NUTRITION_REFERENCE } from "@/data/reference/nutritionReference";

/**
 * Calculates Basal Metabolic Rate using the validated Mifflin-St Jeor equation.
 * Ground truth reference: Mifflin et al., Am J Clin Nutr 1990; 51:241-247.
 */
export function calculateMifflinStJeorBmr(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: "male" | "female"
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  const bmr = sex === "male" ? base + 5 : base - 161;
  return Math.round(bmr * 10) / 10;
}

/**
 * Calculates Exercise Energy Expenditure (EEE) based on:
 * EEE = MET × Weight (kg) × Duration (hours) × Intensity Modifier
 */
export function calculateExerciseEnergyExpenditure(
  sportMet: number,
  weightKg: number,
  durationMinutes: number,
  intensity: AthleteProfile["trainingIntensity"]
): { eeeKcal: number; effectiveMet: number } {
  if (intensity === "rest" || durationMinutes <= 0) {
    return { eeeKcal: 0, effectiveMet: 0 };
  }

  const intensityMultipliers: Record<AthleteProfile["trainingIntensity"], number> = {
    rest: 0,
    light: 0.85,
    moderate: 1.0,
    high: 1.15,
    very_high: 1.30,
  };

  const effectiveMet = sportMet * intensityMultipliers[intensity];
  const durationHours = durationMinutes / 60;
  const eee = effectiveMet * weightKg * durationHours;

  return {
    eeeKcal: Math.round(eee),
    effectiveMet: Math.round(effectiveMet * 10) / 10,
  };
}

/**
 * Full transparent Energy Estimation Pipeline:
 * BMR → Non-training baseline activity → Exercise Energy Expenditure → Total TDEE
 */
export function calculateEnergyRequirement(profile: AthleteProfile): EnergyRequirementResult {
  const explanations: StepExplanation[] = [];

  // Step 1: BMR via Mifflin-St Jeor
  const bmr = calculateMifflinStJeorBmr(profile.weightKg, profile.heightCm, profile.age, profile.sex);
  explanations.push({
    step: "Basal Metabolic Rate (BMR)",
    formula:
      profile.sex === "male"
        ? "10 × Weight(kg) + 6.25 × Height(cm) - 5 × Age(yr) + 5"
        : "10 × Weight(kg) + 6.25 × Height(cm) - 5 × Age(yr) - 161",
    inputValue: `Weight=${profile.weightKg}kg, Height=${profile.heightCm}cm, Age=${profile.age}yr, Sex=${profile.sex}`,
    outputValue: `${bmr} kcal/day`,
    scientificRationale:
      "Mifflin-St Jeor is the international gold standard predictive equation for non-obese active individuals, estimating basal energy needed for vegetative cellular function.",
  });

  // Step 2: Baseline Non-Training Physical Activity Level (PAL)
  const palMultiplier = NUTRITION_REFERENCE.baselineActivityMultipliers.lightlyActive;
  const nonTrainingKcal = Math.round(bmr * palMultiplier);
  explanations.push({
    step: "Baseline Non-Training Physical Activity Level (PAL)",
    formula: "BMR × 1.35 (Light Non-Training Ambulation Factor)",
    inputValue: `BMR=${bmr} kcal, Multiplier=1.35`,
    outputValue: `${nonTrainingKcal} kcal/day`,
    scientificRationale:
      "Athletes perform everyday activities (walking, sitting, studying) outside scheduled sport training, requiring basal PAL adjustment prior to adding specific sport exertion.",
  });

  // Step 3: Exercise Energy Expenditure (EEE)
  const sportMeta = getSportMetadata(profile.sport) || FALLBACK_SPORT_METADATA;
  const durationHours = profile.trainingDurationMinutes / 60;
  const { eeeKcal, effectiveMet } = calculateExerciseEnergyExpenditure(
    sportMeta.metValue,
    profile.weightKg,
    profile.trainingDurationMinutes,
    profile.trainingIntensity
  );

  explanations.push({
    step: "Exercise Energy Expenditure (EEE)",
    formula: "Effective MET × Weight(kg) × Duration(hours)",
    inputValue: `Sport=${sportMeta.label}, Effective MET=${effectiveMet}, Duration=${profile.trainingDurationMinutes} min, Weight=${profile.weightKg}kg`,
    outputValue: `${eeeKcal} kcal/session`,
    scientificRationale: `Exercise expenditure accounts for sport-specific mechanical and metabolic intensity (${profile.sport} at ${profile.trainingIntensity} load).`,
  });

  // Step 4: Total Daily Energy Expenditure (TDEE)
  const totalTdee = nonTrainingKcal + eeeKcal;
  const tefKcal = Math.round(totalTdee * NUTRITION_REFERENCE.thermicEffectOfFoodFactor);

  explanations.push({
    step: "Total Daily Energy Expenditure (TDEE)",
    formula: "Non-Training Energy + Exercise Energy Expenditure",
    inputValue: `${nonTrainingKcal} kcal + ${eeeKcal} kcal`,
    outputValue: `${totalTdee} kcal/day`,
    scientificRationale:
      "Sum of baseline daily living plus the energetic cost of the scheduled sports training session.",
  });

  const targetCaloriesRecommended = totalTdee;
  const targetCaloriesMin = Math.round(totalTdee * 0.95);
  const targetCaloriesMax = Math.round(totalTdee * 1.05);

  return {
    bmrKcal: bmr,
    baselineActivityMultiplier: palMultiplier,
    nonTrainingEnergyKcal: nonTrainingKcal,
    sportMetValue: sportMeta.metValue,
    exerciseDurationHours: durationHours,
    exerciseEnergyExpenditureKcal: eeeKcal,
    thermicEffectOfFoodKcal: tefKcal,
    totalDailyEnergyExpenditureKcal: totalTdee,
    targetCaloriesMin,
    targetCaloriesMax,
    targetCaloriesRecommended,
    explanations,
  };
}
