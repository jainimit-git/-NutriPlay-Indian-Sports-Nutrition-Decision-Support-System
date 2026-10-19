import { describe, it, expect } from "vitest";
import { athleteProfileSchema, sweatRateMeasuredInputSchema } from "@/lib/validation/athleteSchema";

describe("Athlete Profile Validation Suite", () => {
  const validProfile = {
    name: "Aman Sharma",
    age: 22,
    sex: "male" as const,
    heightCm: 178,
    weightKg: 72,
    sport: "cricket" as const,
    trainingDurationMinutes: 120,
    trainingIntensity: "high" as const,
    trainingFrequencyDaysPerWeek: 6,
    dietaryPreference: "vegetarian" as const,
    dailyBudgetInr: 350,
    location: "Mumbai",
    trainingTimeOfDay: "morning" as const,
    dietaryExclusions: ["peanuts"],
  };

  it("successfully validates a legitimate athlete profile", () => {
    const result = athleteProfileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.weightKg).toBe(72);
      expect(result.data.dietaryPreference).toBe("vegetarian");
    }
  });

  it("successfully validates female athlete with Jain dietary preference", () => {
    const jainProfile = {
      ...validProfile,
      name: "Pooja Shah",
      sex: "female" as const,
      sport: "badminton" as const,
      dietaryPreference: "jain" as const,
      dailyBudgetInr: 400,
      location: "Ahmedabad",
    };
    const result = athleteProfileSchema.safeParse(jainProfile);
    expect(result.success).toBe(true);
  });

  it("rejects impossible age (< 14)", () => {
    const invalid = { ...validProfile, age: 9 };
    const result = athleteProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 14");
    }
  });

  it("rejects negative weight", () => {
    const invalid = { ...validProfile, weightKg: -65 };
    const result = athleteProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 35 kg");
    }
  });

  it("rejects non-positive height", () => {
    const invalid = { ...validProfile, heightCm: 0 };
    const result = athleteProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("at least 120 cm");
    }
  });

  it("rejects negative training duration", () => {
    const invalid = { ...validProfile, trainingDurationMinutes: -30 };
    const result = athleteProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("cannot be negative");
    }
  });

  it("rejects excessive training duration (> 360 min)", () => {
    const invalid = { ...validProfile, trainingDurationMinutes: 450 };
    const result = athleteProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("cannot exceed 360 minutes");
    }
  });

  it("rejects unrealistic daily food budget below threshold (< ₹80)", () => {
    const invalid = { ...validProfile, dailyBudgetInr: 40 };
    const result = athleteProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("cannot be less than ₹80");
    }
  });

  it("rejects invalid training frequency outside 1-7 days", () => {
    const invalid = { ...validProfile, trainingFrequencyDaysPerWeek: 8 };
    const result = athleteProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("rejects unsupported sport type", () => {
    const invalid = { ...validProfile, sport: "curling" as any };
    const result = athleteProfileSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("validates measured sweat rate input correctly", () => {
    const validSweat = {
      preExerciseWeightKg: 70.0,
      postExerciseWeightKg: 68.8,
      fluidConsumedLiters: 0.5,
      urineOutputLiters: 0.1,
      exerciseDurationMinutes: 90,
    };
    const result = sweatRateMeasuredInputSchema.safeParse(validSweat);
    expect(result.success).toBe(true);
  });

  it("rejects physically impossible sweat rate data where post-exercise weight increases beyond fluid consumed", () => {
    const impossibleSweat = {
      preExerciseWeightKg: 70.0,
      postExerciseWeightKg: 72.0, // Gained 2kg while only drinking 0.5L
      fluidConsumedLiters: 0.5,
      urineOutputLiters: 0.0,
      exerciseDurationMinutes: 60,
    };
    const result = sweatRateMeasuredInputSchema.safeParse(impossibleSweat);
    expect(result.success).toBe(false);
  });
});

