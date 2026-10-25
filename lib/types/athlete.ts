/**
 * NutriPlay Athlete Domain Types
 */

export type BiologicalSex = "male" | "female";

export type DietaryPreference = "vegetarian" | "non_vegetarian" | "vegan" | "jain";

export type TrainingIntensity = "rest" | "light" | "moderate" | "high" | "very_high";

export type TrainingTimeOfDay = "morning" | "afternoon" | "evening";

export type SportType =
  | "cricket"
  | "badminton"
  | "field_hockey"
  | "kabaddi"
  | "running"
  | "weightlifting"
  | "football"
  | "cycling"
  | "wrestling"
  | "swimming"
  | "general_athletics";

export interface SweatRateMeasuredInput {
  preExerciseWeightKg: number;
  postExerciseWeightKg: number;
  fluidConsumedLiters: number;
  urineOutputLiters: number;
  exerciseDurationMinutes: number;
}

export interface AthleteProfile {
  id?: string;
  name?: string;
  age: number; // years (14 - 85)
  sex: BiologicalSex;
  heightCm: number; // cm (120 - 230)
  weightKg: number; // kg (35 - 200)
  sport: string;
  trainingDurationMinutes: number; // 0 - 360
  trainingIntensity: TrainingIntensity;
  trainingFrequencyDaysPerWeek: number; // 1 - 7
  dietaryPreference: DietaryPreference;
  dailyBudgetInr: number; // INR (min 80)
  location: string; // Indian city or custom
  trainingTimeOfDay?: TrainingTimeOfDay;
  trainingDate?: string;
  trainingType?: "practice" | "match" | "competition" | "recovery" | "rest_day" | "other";
  dietaryExclusions: string[]; // e.g., ["milk", "egg", "peanuts", "fish"]
  measuredSweatRateInput?: SweatRateMeasuredInput;
}

export interface AthletePersonalProfile {
  name: string;
  age: number;
  sex: BiologicalSex;
  heightCm: number;
  weightKg: number;
  dietaryPreference: DietaryPreference;
  dietaryExclusions: string[];
}

export interface TrainingSessionInput {
  sport: string;
  trainingDurationMinutes: number;
  trainingIntensity: TrainingIntensity;
  trainingFrequencyDaysPerWeek: number;
  dailyBudgetInr: number;
  location: string;
  trainingDate: string;
  trainingType: "practice" | "match" | "competition" | "recovery" | "rest_day" | "other";
  trainingTimeOfDay?: TrainingTimeOfDay;
}

export interface SportMetadata {
  id: SportType;
  label: string;
  category: "endurance" | "power_strength" | "intermittent_team" | "skill_racket";
  metValue: number; // Metabolic Equivalent of Task baseline
  defaultCarbFactorGPerKg: {
    rest: number;
    light: number;
    moderate: number;
    high: number;
    very_high: number;
  };
  defaultProteinFactorGPerKg: {
    rest: number;
    light: number;
    moderate: number;
    high: number;
    very_high: number;
  };
}
