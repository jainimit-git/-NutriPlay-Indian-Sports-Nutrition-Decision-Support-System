"use client";

import React, { useState } from "react";
import { AthleteForm } from "@/components/athlete/AthleteForm";
import { AthleteSummaryCard } from "@/components/dashboard/AthleteSummaryCard";
import { VisualisationSection } from "@/components/dashboard/VisualisationSection";
import { MealPlanCard } from "@/components/dashboard/MealPlanCard";
import { HydrationCard } from "@/components/dashboard/HydrationCard";
import { SafetyAlertCard } from "@/components/dashboard/SafetyAlertCard";
import { ExplanationsCard } from "@/components/dashboard/ExplanationsCard";
import { ValidatedAthleteProfile } from "@/lib/validation/athleteSchema";
import { DecisionSupportOutput } from "@/lib/recommendations/recommendationService";
import { Activity, ArrowLeft, Printer, RefreshCw } from "lucide-react";

export default function HomePage() {
  const [planResult, setPlanResult] = useState<DecisionSupportOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleFormSubmit = async (profile: ValidatedAthleteProfile) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to generate athletic decision plan");
      }

      setPlanResult(data.plan);
    } catch (err: any) {
      setApiError(err?.message || "An unexpected error occurred while generating the plan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPlanResult(null);
    setApiError(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Title */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          Indian Sports Nutrition & Hydration Decision-Support System
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          NutriPlay Decision Engine
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Generates individualized one-day nutrition and hydration strategies for Indian athletes
          using IFCT data, sports metabolic load, environmental heat index, and cultural diet constraints.
        </p>
      </div>

      {apiError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm max-w-2xl mx-auto">
          <strong>Error:</strong> {apiError}
        </div>
      )}

      {/* Main Container: Form vs Dashboard */}
      {!planResult ? (
        <div className="max-w-4xl mx-auto">
          <AthleteForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dashboard Control Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 px-3.5 py-2 rounded-lg border border-slate-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Assess Another Athlete
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print / Export Plan
              </button>
            </div>
          </div>

          {/* 1. Athlete & Environment Summary Card */}
          <AthleteSummaryCard athlete={planResult.athlete} weather={planResult.weather} />

          {/* 2. Visualisations (Macro Progress, Budget Adherence, Hydration) */}
          <VisualisationSection
            targets={planResult.targets}
            plan={planResult.mealPlan}
            hydration={planResult.hydration}
          />

          {/* 3. Personalized One-Day Meal Plan */}
          <MealPlanCard plan={planResult.mealPlan} />

          {/* 4. Hydration & Electrolyte Strategy */}
          <HydrationCard hydration={planResult.hydration} />

          {/* 5. RED-S Safety Screen & Advisories */}
          <SafetyAlertCard safety={planResult.safety} />

          {/* 6. Explainable Recommendations & Formulas */}
          <ExplanationsCard
            energy={planResult.energy}
            targets={planResult.targets}
            plan={planResult.mealPlan}
            hydration={planResult.hydration}
          />
        </div>
      )}
    </div>
  );
}
