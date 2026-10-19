/**
 * Nutritional Reference Configuration
 * Grounded in:
 * - ICMR-NIN (2020) Recommended Dietary Allowances (RDA) & Estimated Average Requirements (EAR) for Indians
 * - IOC (International Olympic Committee) Consensus Statement on Sports Nutrition
 * - ACSM (American College of Sports Medicine) Nutrition and Athletic Performance
 */

export interface NutritionReferenceConfig {
  thermicEffectOfFoodFactor: number; // ~0.10 (10% of ingested energy)
  baselineActivityMultipliers: {
    sedentary: number; // 1.20
    lightlyActive: number; // 1.35 (standard baseline for athlete non-training time)
    moderatelyActive: number; // 1.50
  };
  macronutrientCaloricDensity: {
    proteinKcalPerGram: number; // 4.0 kcal/g
    carbohydrateKcalPerGram: number; // 4.0 kcal/g
    fatKcalPerGram: number; // 9.0 kcal/g
    alcoholKcalPerGram: number; // 7.0 kcal/g
  };
  acceptableMacronutrientDistributionRanges: {
    fatMinPercent: number; // 20%
    fatMaxPercent: number; // 35%
    proteinMinGPerKg: number; // 1.2 g/kg (athlete baseline)
    proteinMaxGPerKg: number; // 2.5 g/kg
    carbMinGPerKg: number; // 3.0 g/kg (rest day)
    carbMaxGPerKg: number; // 12.0 g/kg (extreme endurance)
  };
  icmrMicronutrientBaselines: {
    sodiumBaseMg: number; // 2000 mg/day baseline
    calciumMg: {
      male: number; // 1000 mg
      female: number; // 1000 mg
    };
    ironMg: {
      male: number; // 19 mg
      female: number; // 29 mg (higher due to menstrual losses, vital in Indian female athletes)
    };
    fiberBaseGrams: number; // 30 g/day
  };
}

export const NUTRITION_REFERENCE: NutritionReferenceConfig = {
  thermicEffectOfFoodFactor: 0.10,
  baselineActivityMultipliers: {
    sedentary: 1.20,
    lightlyActive: 1.35,
    moderatelyActive: 1.50,
  },
  macronutrientCaloricDensity: {
    proteinKcalPerGram: 4.0,
    carbohydrateKcalPerGram: 4.0,
    fatKcalPerGram: 9.0,
    alcoholKcalPerGram: 7.0,
  },
  acceptableMacronutrientDistributionRanges: {
    fatMinPercent: 20,
    fatMaxPercent: 35,
    proteinMinGPerKg: 1.2,
    proteinMaxGPerKg: 2.5,
    carbMinGPerKg: 3.0,
    carbMaxGPerKg: 12.0,
  },
  icmrMicronutrientBaselines: {
    sodiumBaseMg: 2000,
    calciumMg: {
      male: 1000,
      female: 1000,
    },
    ironMg: {
      male: 19,
      female: 29,
    },
    fiberBaseGrams: 30,
  },
};

