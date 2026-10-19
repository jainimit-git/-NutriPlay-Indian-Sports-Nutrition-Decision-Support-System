import { HeatIndexAssessment } from "@/lib/types/weather";

export interface SweatRateResult {
  sweatRateLitersPerHour: number;
  totalSweatLossLiters: number;
  isMeasured: boolean;
  methodLabel: "MEASURED LAB / FIELD TEST" | "SCIENTIFIC EMPIRICAL FALLBACK";
  calculationExplanation: string;
}

export interface ElectrolyteGuidance {
  totalEstimatedSodiumLossMg: number;
  recommendedElectrolyteAdditionMg: number;
  timingAndSourceGuidance: string;
  indianBeverageOptions: string[];
}

export interface HydrationPlan {
  baselineDailyWaterLiters: number;
  trainingHydrationLiters: number;
  heatStressAdjustmentLiters: number;
  totalDailyFluidRecommendationLiters: number;
  sweatRate: SweatRateResult;
  electrolyte: ElectrolyteGuidance;
  heatIndexAssessment: HeatIndexAssessment;
  scheduleBreakdown: {
    preExerciseWindow: string; // 2-4 hrs and 15-30 min prior
    duringExerciseWindow: string; // every 15-20 min
    postExerciseWindow: string; // 125-150% of fluid deficit over 2-4 hrs
    dailyRestingFluids: string;
  };
  rationales: string[];
}

