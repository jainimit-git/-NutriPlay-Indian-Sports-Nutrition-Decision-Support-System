"use client";

import React from "react";
import { MacronutrientTargets } from "@/lib/types/nutrition";
import { OneDayMealPlan } from "@/lib/types/plan";
import { HydrationPlan } from "@/lib/types/hydration";
import { Flame, Target, IndianRupee, Droplets, Award, PieChart } from "lucide-react";

interface VisualisationSectionProps {
  targets: MacronutrientTargets;
  plan: OneDayMealPlan;
  hydration: HydrationPlan;
}

export function VisualisationSection({ targets, plan, hydration }: VisualisationSectionProps) {
  const calTarget = targets.caloriesKcal;
  const calActual = plan.dailyTotals.energyKcal;
  const calPct = Math.min(130, Math.round((calActual / calTarget) * 100));

  const protTarget = targets.proteinGrams;
  const protActual = plan.dailyTotals.proteinG;
  const protPct = Math.min(130, Math.round((protActual / protTarget) * 100));

  const carbTarget = targets.carbohydrateGrams;
  const carbActual = plan.dailyTotals.carbohydratesG;
  const carbPct = Math.min(130, Math.round((carbActual / carbTarget) * 100));

  const fatTarget = targets.fatGrams;
  const fatActual = plan.dailyTotals.fatG;
  const fatPct = Math.min(130, Math.round((fatActual / fatTarget) * 100));

  const budget = plan.budgetInr;
  const cost = plan.dailyTotals.costInr;
  const budgetUsedPct = Math.min(100, Math.round((cost / budget) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Energy & Macronutrient Adequacy Progress */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              Nutritional Target vs Actual Plan
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {calPct}% Energy Match
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {/* Calories Bar */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Calories</span>
                <span>
                  <strong className="text-slate-900">{calActual}</strong> / {calTarget} kcal ({calPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    calPct >= 90 && calPct <= 110 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                  style={{ width: `${Math.min(100, calPct)}%` }}
                />
              </div>
            </div>

            {/* Protein Bar */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Protein</span>
                <span>
                  <strong className="text-slate-900">{protActual}g</strong> / {protTarget}g ({protPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, protPct)}%` }}
                />
              </div>
            </div>

            {/* Carbohydrates Bar */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Carbohydrates</span>
                <span>
                  <strong className="text-slate-900">{carbActual}g</strong> / {carbTarget}g ({carbPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, carbPct)}%` }}
                />
              </div>
            </div>

            {/* Fat Bar */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>Dietary Fat</span>
                <span>
                  <strong className="text-slate-900">{fatActual}g</strong> / {fatTarget}g ({fatPct}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, fatPct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
          <span>ICMR Iron: {plan.dailyTotals.ironMg}mg</span>
          <span>Calcium: {plan.dailyTotals.calciumMg}mg</span>
          <span>Fiber: {plan.dailyTotals.fiberG}g</span>
        </div>
      </div>

      {/* 2. Budget vs Cost Allocation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
              Daily Budget Adherence
            </h3>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                cost <= budget
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {cost <= budget ? `₹${plan.budgetRemainingInr} Left` : `₹${Math.abs(plan.budgetRemainingInr)} Over`}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Total Meal Plan Cost</span>
              <span className="text-2xl font-extrabold text-slate-900">₹{cost}</span>
            </div>

            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
              <div
                className={`h-full ${cost <= budget ? "bg-emerald-500" : "bg-rose-500"}`}
                style={{ width: `${budgetUsedPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500">
              <span>Used: ₹{cost}</span>
              <span>Daily Budget: ₹{budget}</span>
            </div>

            {/* Per-meal cost breakdown list */}
            <div className="mt-4 space-y-1.5 pt-2 border-t border-slate-100">
              {plan.meals.map((meal) => (
                <div key={meal.slot} className="flex justify-between text-xs text-slate-600">
                  <span className="truncate pr-2">{meal.label}</span>
                  <span className="font-semibold text-slate-800">₹{meal.subtotalCostInr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-slate-400">
          Costs calculated from authentic Indian domestic food pricing benchmarks.
        </div>
      </div>

      {/* 3. Multi-Objective Performance & Hydration Partitioning */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Optimization Score & Hydration
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800">
              Score: {plan.metrics.overallScore} / 100
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Nutritional Fit</div>
                <div className="text-base font-bold text-slate-800">{plan.metrics.nutritionAdequacyScore}%</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Affordability</div>
                <div className="text-base font-bold text-slate-800">{plan.metrics.affordabilityScore}%</div>
              </div>
            </div>

            {/* Hydration summary */}
            <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100 mt-2">
              <div className="flex items-center justify-between text-xs font-bold text-sky-900 mb-1">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-sky-600" />
                  Total Daily Fluid Target
                </span>
                <span className="text-sm font-extrabold text-sky-700">
                  {hydration.totalDailyFluidRecommendationLiters} L
                </span>
              </div>
              <div className="text-[11px] text-slate-600 space-y-0.5 mt-1.5">
                <div className="flex justify-between">
                  <span>• Basal Water (35ml/kg):</span>
                  <span className="font-medium text-slate-800">{hydration.baselineDailyWaterLiters} L</span>
                </div>
                <div className="flex justify-between">
                  <span>• Training Sweat Replenish:</span>
                  <span className="font-medium text-slate-800">{hydration.trainingHydrationLiters} L</span>
                </div>
                {hydration.heatStressAdjustmentLiters > 0 && (
                  <div className="flex justify-between text-amber-700 font-medium">
                    <span>• Heat Stress Addition:</span>
                    <span>+{hydration.heatStressAdjustmentLiters} L</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 text-[11px] text-slate-500">
          Estimated Sodium Loss: <strong>{hydration.electrolyte.totalEstimatedSodiumLossMg} mg</strong>
        </div>
      </div>
    </div>
  );
}

