"use client";

import React from "react";
import { HydrationPlan } from "@/lib/types/hydration";
import { Droplets, Sun, AlertCircle, CheckCircle, Compass, Sparkles } from "lucide-react";

interface HydrationCardProps {
  hydration: HydrationPlan;
}

export function HydrationCard({ hydration }: HydrationCardProps) {
  const { sweatRate, electrolyte, heatIndexAssessment, scheduleBreakdown } = hydration;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-sky-600" />
            Hydration & Electrolyte Strategy
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Combines basal metabolic turnover, exercise sweat loss, and real-time environmental heat stress
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Total Recommended Fluids</div>
          <div className="text-xl font-black text-sky-600">
            {hydration.totalDailyFluidRecommendationLiters} Liters / day
          </div>
        </div>
      </div>

      {/* Grid: Sweat Rate & Heat Index Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sweat Rate card */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sweat Rate & Fluid Deficit
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                sweatRate.isMeasured
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {sweatRate.methodLabel}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900">
              {sweatRate.sweatRateLitersPerHour} L/hr
            </span>
            <span className="text-xs text-slate-500">
              (Total Loss: {sweatRate.totalSweatLossLiters} L)
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed mt-1">
            {sweatRate.calculationExplanation}
          </p>
        </div>

        {/* Heat Index card */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              Heat Index Assessment
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
              {heatIndexAssessment.riskLabel}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-amber-950">
              {heatIndexAssessment.heatIndexCelsius}°C
            </span>
            <span className="text-xs text-amber-800">
              (Multiplier: {heatIndexAssessment.hydrationMultiplier}x)
            </span>
          </div>

          <p className="text-xs text-amber-900 leading-relaxed mt-1">
            {heatIndexAssessment.advisoryText}
          </p>
        </div>
      </div>

      {/* Sodium & Electrolyte Section */}
      <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-sky-950 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-600" />
            Sodium & Electrolyte Management
          </h3>
          <span className="text-xs font-semibold text-sky-800">
            Estimated Na+ Lost: ~{electrolyte.totalEstimatedSodiumLossMg} mg
          </span>
        </div>

        <p className="text-xs text-slate-700 leading-relaxed">
          {electrolyte.timingAndSourceGuidance}
        </p>

        <div>
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Recommended Authentic Indian Hydration Solutions:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {electrolyte.indianBeverageOptions.map((bev, idx) => (
              <div
                key={idx}
                className="text-xs bg-white p-2.5 rounded-lg border border-sky-200/70 text-slate-800 flex items-start gap-2 shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{bev}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Structured Hydration Schedule */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-emerald-600" />
          Timing & Protocol Schedule
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900 mb-1">1. Pre-Training</div>
            <p className="text-slate-600">{scheduleBreakdown.preExerciseWindow}</p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900 mb-1">2. During Exercise</div>
            <p className="text-slate-600">{scheduleBreakdown.duringExerciseWindow}</p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900 mb-1">3. Post-Training</div>
            <p className="text-slate-600">{scheduleBreakdown.postExerciseWindow}</p>
          </div>
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="font-bold text-slate-900 mb-1">4. Throughout Day</div>
            <p className="text-slate-600">{scheduleBreakdown.dailyRestingFluids}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

