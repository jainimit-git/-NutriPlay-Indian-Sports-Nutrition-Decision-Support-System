"use client";

import React, { useState } from "react";
import { AthleteProfile, BiologicalSex, DietaryPreference, SportType, TrainingIntensity, TrainingTimeOfDay } from "@/lib/types/athlete";
import { athleteProfileSchema, ValidatedAthleteProfile } from "@/lib/validation/athleteSchema";
import { SPORTS_REGISTRY } from "@/data/reference/sportsData";
import { ATHLETE_PRESETS } from "@/data/reference/athletePresets";
import { User, Activity, Utensils, IndianRupee, MapPin, AlertCircle, Droplets, Sparkles } from "lucide-react";

interface AthleteFormProps {
  onSubmit: (profile: ValidatedAthleteProfile) => void;
  isLoading?: boolean;
}

export function AthleteForm({ onSubmit, isLoading = false }: AthleteFormProps) {
  const [formData, setFormData] = useState<AthleteProfile>(ATHLETE_PRESETS[0].data);
  const [showSweatSection, setShowSweatSection] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePresetSelect = (presetIndex: number) => {
    const selected = ATHLETE_PRESETS[presetIndex];
    if (selected) {
      setFormData(selected.data);
      setErrors({});
    }
  };

  const handleChange = <K extends keyof AthleteProfile>(field: K, value: AthleteProfile[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleExclusionToggle = (allergen: string) => {
    setFormData((prev) => {
      const exists = prev.dietaryExclusions.includes(allergen);
      return {
        ...prev,
        dietaryExclusions: exists
          ? prev.dietaryExclusions.filter((item) => item !== allergen)
          : [...prev.dietaryExclusions, allergen],
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = athleteProfileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path.join(".");
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    onSubmit(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-8">
      {/* Header & Presets */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Athlete Assessment Profile
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter individual anthropometrics, training parameters, and dietary preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-slate-600">Quick Presets:</span>
            <select
              aria-label="Load Athlete Preset"
              className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              onChange={(e) => handlePresetSelect(Number(e.target.value))}
              defaultValue="0"
            >
              {ATHLETE_PRESETS.map((p, idx) => (
                <option key={p.name} value={idx}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Anthropometrics Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          1. Anthropometrics & Demographics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Athlete Name</label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="e.g. Aman Sharma"
            />
            {errors["name"] && <p className="text-xs text-rose-500 mt-1">{errors["name"]}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Age (Years)</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => handleChange("age", Number(e.target.value))}
              min={14}
              max={85}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {errors["age"] && <p className="text-xs text-rose-500 mt-1">{errors["age"]}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Biological Sex</label>
            <select
              aria-label="Biological Sex"
              value={formData.sex}
              onChange={(e) => handleChange("sex", e.target.value as BiologicalSex)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors["sex"] && <p className="text-xs text-rose-500 mt-1">{errors["sex"]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Height (cm)</label>
              <input
                type="number"
                value={formData.heightCm}
                onChange={(e) => handleChange("heightCm", Number(e.target.value))}
                min={120}
                max={235}
                className="w-full text-sm border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              {errors["heightCm"] && <p className="text-xs text-rose-500 mt-1">{errors["heightCm"]}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.5"
                value={formData.weightKg}
                onChange={(e) => handleChange("weightKg", Number(e.target.value))}
                min={35}
                max={200}
                className="w-full text-sm border border-slate-300 rounded-lg px-2 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              {errors["weightKg"] && <p className="text-xs text-rose-500 mt-1">{errors["weightKg"]}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Sport & Training Parameters */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-600" />
          2. Sport & Training Workload
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Sport Discipline</label>
            <select
              aria-label="Sport Discipline"
              value={formData.sport}
              onChange={(e) => handleChange("sport", e.target.value as SportType)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              {Object.values(SPORTS_REGISTRY).map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.label}
                </option>
              ))}
            </select>
            {errors["sport"] && <p className="text-xs text-rose-500 mt-1">{errors["sport"]}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Session Duration (min)
            </label>
            <input
              type="number"
              value={formData.trainingDurationMinutes}
              onChange={(e) => handleChange("trainingDurationMinutes", Number(e.target.value))}
              min={0}
              max={360}
              step={15}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {errors["trainingDurationMinutes"] && (
              <p className="text-xs text-rose-500 mt-1">{errors["trainingDurationMinutes"]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Training Intensity</label>
            <select
              aria-label="Training Intensity"
              value={formData.trainingIntensity}
              onChange={(e) => handleChange("trainingIntensity", e.target.value as TrainingIntensity)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="rest">Rest Day (No training)</option>
              <option value="light">Light (&lt; 1 hr low-intensity/technical)</option>
              <option value="moderate">Moderate (~1 hr moderate endurance/skills)</option>
              <option value="high">High (1–2 hrs intense / competitive training)</option>
              <option value="very_high">Very High (&gt; 2 hrs heavy competition/drill)</option>
            </select>
            {errors["trainingIntensity"] && (
              <p className="text-xs text-rose-500 mt-1">{errors["trainingIntensity"]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Frequency (Days / Wk)
            </label>
            <input
              type="number"
              value={formData.trainingFrequencyDaysPerWeek}
              onChange={(e) => handleChange("trainingFrequencyDaysPerWeek", Number(e.target.value))}
              min={1}
              max={7}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {errors["trainingFrequencyDaysPerWeek"] && (
              <p className="text-xs text-rose-500 mt-1">{errors["trainingFrequencyDaysPerWeek"]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Dietary, Budget & Environment */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Utensils className="w-4 h-4 text-emerald-600" />
          3. Dietary Constraints, Budget & Environment
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Dietary Preference
            </label>
            <select
              aria-label="Dietary Preference"
              value={formData.dietaryPreference}
              onChange={(e) => handleChange("dietaryPreference", e.target.value as DietaryPreference)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
            >
              <option value="vegetarian">Vegetarian (Lacto-Vegetarian, No Meat/Egg)</option>
              <option value="non_vegetarian">Non-Vegetarian (Eggs, Chicken, Fish allowed)</option>
              <option value="jain">Jain (Strict Vegetarian, No Root Veggies/Onion/Garlic)</option>
            </select>
            {errors["dietaryPreference"] && (
              <p className="text-xs text-rose-500 mt-1">{errors["dietaryPreference"]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Food Budget (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                value={formData.dailyBudgetInr}
                onChange={(e) => handleChange("dailyBudgetInr", Number(e.target.value))}
                min={80}
                max={5000}
                step={25}
                className="w-full text-sm border border-slate-300 rounded-lg pl-7 pr-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            {errors["dailyBudgetInr"] && (
              <p className="text-xs text-rose-500 mt-1">{errors["dailyBudgetInr"]}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location / Training City
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="e.g. Mumbai, Delhi, Chennai"
                className="w-full text-sm border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            {errors["location"] && (
              <p className="text-xs text-rose-500 mt-1">{errors["location"]}</p>
            )}
          </div>
        </div>

        {/* Dietary Exclusions */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Specific Food Exclusions / Allergies (Optional)
          </label>
          <div className="flex flex-wrap gap-2">
            {["milk", "peanuts", "tree_nuts", "soy", "gluten", "fish", "egg"].map((item) => {
              const active = formData.dietaryExclusions.includes(item);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() => handleExclusionToggle(item)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? "bg-rose-50 border-rose-300 text-rose-700 font-semibold"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {active ? `✕ Exclude ${item}` : `+ ${item}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Optional Sweat Rate Testing Accordion */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-sky-600" />
            <div>
              <span className="text-xs font-bold text-slate-800">
                Measured Sweat Rate Test Data (Optional)
              </span>
              <p className="text-[11px] text-slate-500">
                If available from sports lab/field testing. Otherwise, scientific fallback estimation will be applied.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowSweatSection(!showSweatSection)}
            className="text-xs font-medium text-sky-600 hover:text-sky-800 underline"
          >
            {showSweatSection ? "Hide Details" : "Enter Measured Data"}
          </button>
        </div>

        {showSweatSection && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Pre-Exercise Body Wt (kg)
              </label>
              <input
                type="number"
                step="0.05"
                placeholder={formData.weightKg.toString()}
                value={formData.measuredSweatRateInput?.preExerciseWeightKg || ""}
                onChange={(e) =>
                  handleChange("measuredSweatRateInput", {
                    preExerciseWeightKg: Number(e.target.value),
                    postExerciseWeightKg: formData.measuredSweatRateInput?.postExerciseWeightKg || Number(e.target.value) - 0.8,
                    fluidConsumedLiters: formData.measuredSweatRateInput?.fluidConsumedLiters || 0.5,
                    urineOutputLiters: formData.measuredSweatRateInput?.urineOutputLiters || 0,
                    exerciseDurationMinutes: formData.measuredSweatRateInput?.exerciseDurationMinutes || formData.trainingDurationMinutes || 60,
                  })
                }
                className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Post-Exercise Body Wt (kg)
              </label>
              <input
                type="number"
                step="0.05"
                value={formData.measuredSweatRateInput?.postExerciseWeightKg || ""}
                onChange={(e) =>
                  formData.measuredSweatRateInput &&
                  handleChange("measuredSweatRateInput", {
                    ...formData.measuredSweatRateInput,
                    postExerciseWeightKg: Number(e.target.value),
                  })
                }
                className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Fluid Drunk During Session (L)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.measuredSweatRateInput?.fluidConsumedLiters || ""}
                onChange={(e) =>
                  formData.measuredSweatRateInput &&
                  handleChange("measuredSweatRateInput", {
                    ...formData.measuredSweatRateInput,
                    fluidConsumedLiters: Number(e.target.value),
                  })
                }
                className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
        >
          {isLoading ? (
            <span>Computing Scientific Nutrition Plan...</span>
          ) : (
            <>
              <Activity className="w-4 h-4" />
              <span>Generate Personalized Nutrition & Hydration Strategy</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
