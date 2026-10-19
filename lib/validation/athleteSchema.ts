import { z } from "zod";

export const sweatRateMeasuredInputSchema = z.object({
  preExerciseWeightKg: z
    .number({ invalid_type_error: "Pre-exercise weight must be a number" })
    .min(30, "Pre-exercise weight must be at least 30 kg")
    .max(220, "Pre-exercise weight exceeds realistic physiological limits"),
  postExerciseWeightKg: z
    .number({ invalid_type_error: "Post-exercise weight must be a number" })
    .min(28, "Post-exercise weight must be at least 28 kg")
    .max(220, "Post-exercise weight exceeds realistic physiological limits"),
  fluidConsumedLiters: z
    .number({ invalid_type_error: "Fluid consumed must be a number" })
    .min(0, "Fluid consumed cannot be negative")
    .max(10, "Fluid consumed exceeds realistic safety limit (max 10L)"),
  urineOutputLiters: z
    .number({ invalid_type_error: "Urine output must be a number" })
    .min(0, "Urine output cannot be negative")
    .max(5, "Urine output exceeds realistic safety limit (max 5L)"),
  exerciseDurationMinutes: z
    .number({ invalid_type_error: "Exercise duration must be a number" })
    .min(10, "Exercise duration must be at least 10 minutes to assess sweat rate")
    .max(480, "Exercise duration cannot exceed 480 minutes"),
}).refine(
  (data) => data.postExerciseWeightKg <= data.preExerciseWeightKg + data.fluidConsumedLiters,
  {
    message: "Post-exercise weight cannot exceed pre-exercise weight plus fluid consumed.",
    path: ["postExerciseWeightKg"],
  }
);

export const athleteProfileSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60).optional(),
  age: z
    .number({ invalid_type_error: "Age must be a valid number" })
    .int("Age must be an integer")
    .min(14, "Athlete age must be at least 14 years")
    .max(85, "Athlete age must be 85 years or less"),
  sex: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Sex must be either 'male' or 'female'" }),
  }),
  heightCm: z
    .number({ invalid_type_error: "Height must be a number" })
    .min(120, "Height must be at least 120 cm")
    .max(235, "Height cannot exceed 235 cm"),
  weightKg: z
    .number({ invalid_type_error: "Weight must be a number" })
    .min(35, "Weight must be at least 35 kg")
    .max(200, "Weight cannot exceed 200 kg"),
  sport: z.enum(
    [
      "cricket",
      "badminton",
      "field_hockey",
      "kabaddi",
      "running",
      "weightlifting",
      "football",
      "cycling",
      "wrestling",
      "swimming",
      "general_athletics",
    ],
    {
      errorMap: () => ({ message: "Please select a supported sport" }),
    }
  ),
  trainingDurationMinutes: z
    .number({ invalid_type_error: "Training duration must be a number" })
    .min(0, "Training duration cannot be negative")
    .max(360, "Daily training duration cannot exceed 360 minutes (6 hours)"),
  trainingIntensity: z.enum(["rest", "light", "moderate", "high", "very_high"], {
    errorMap: () => ({ message: "Select a valid training intensity" }),
  }),
  trainingFrequencyDaysPerWeek: z
    .number({ invalid_type_error: "Training frequency must be a number" })
    .int("Training frequency must be whole days")
    .min(1, "Training frequency must be at least 1 day per week")
    .max(7, "Training frequency cannot exceed 7 days per week"),
  dietaryPreference: z.enum(["vegetarian", "non_vegetarian", "jain"], {
    errorMap: () => ({ message: "Select a valid dietary preference" }),
  }),
  dailyBudgetInr: z
    .number({ invalid_type_error: "Daily budget must be a number" })
    .min(80, "Daily food budget cannot be less than ₹80 in India for nutritional adequacy")
    .max(5000, "Daily food budget cannot exceed ₹5,000"),
  location: z
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .max(80, "Location name too long"),
  trainingTimeOfDay: z.enum(["morning", "afternoon", "evening"]).optional(),
  dietaryExclusions: z.array(z.string()).default([]),
  measuredSweatRateInput: sweatRateMeasuredInputSchema.optional(),
});

export type ValidatedAthleteProfile = z.infer<typeof athleteProfileSchema>;
export type ValidatedSweatRateInput = z.infer<typeof sweatRateMeasuredInputSchema>;

