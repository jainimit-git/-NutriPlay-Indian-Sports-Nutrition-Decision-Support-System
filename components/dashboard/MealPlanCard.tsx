"use client";

import React from "react";
import { OneDayMealPlan } from "@/lib/types/plan";
import { Utensils, AlertTriangle, Clock, Info, CheckCircle2 } from "lucide-react";

interface MealPlanCardProps {
  plan: OneDayMealPlan;
}

export function MealPlanCard({ plan }: MealPlanCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-600" />
            Personalised One-Day Indian Meal Strategy
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Optimized with Indian Food Composition Tables (IFCT) for training fuel, protein distribution & domestic cost
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Daily Total Cost</div>
          <div className="text-xl font-black text-slate-900">₹{plan.dailyTotals.costInr}</div>
        </div>
      </div>

      {/* Infeasibility Warning Banner if applicable */}
      {!plan.feasibility.isFeasible && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Optimization Infeasibility Advisory</span>
          </div>
          <p className="text-xs">{plan.feasibility.infeasibilityReason}</p>
          {plan.feasibility.suggestedRelaxation && (
            <p className="text-xs font-semibold text-amber-950 bg-amber-100/70 p-2.5 rounded-lg border border-amber-300">
              💡 Suggested Solution: {plan.feasibility.suggestedRelaxation}
            </p>
          )}
        </div>
      )}

      {/* Meal Slots List */}
      <div className="space-y-4">
        {plan.meals.map((meal) => (
          <div
            key={meal.slot}
            className="rounded-xl border border-slate-200 overflow-hidden transition-all hover:border-slate-300"
          >
            {/* Meal Header */}
            <div className="bg-slate-50/80 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-bold text-sm text-slate-900">{meal.label}</h3>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {meal.timingRecommendation}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
                <span>{meal.subtotalEnergyKcal} kcal</span>
                <span>•</span>
                <span>{meal.subtotalProteinG}g Prot</span>
                <span>•</span>
                <span>{meal.subtotalCarbohydratesG}g Carb</span>
                <span>•</span>
                <span className="font-bold text-slate-900">₹{meal.subtotalCostInr}</span>
              </div>
            </div>

            {/* Food Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Food Item & Indian Name</th>
                    <th className="py-2.5 px-3 font-semibold">Portion / Unit</th>
                    <th className="py-2.5 px-3 font-semibold">Calories</th>
                    <th className="py-2.5 px-3 font-semibold">Protein</th>
                    <th className="py-2.5 px-3 font-semibold">Carbs</th>
                    <th className="py-2.5 px-3 font-semibold">Fat</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {meal.items.map((item) => (
                    <tr key={item.food.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-medium text-slate-900">
                        {item.food.name}
                        {item.food.hindiName && (
                          <span className="text-[11px] text-slate-400 ml-1.5 font-normal">
                            ({item.food.hindiName})
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {item.servings > 1 ? `${item.servings} × ` : ""}
                        {item.food.servingUnit}
                      </td>
                      <td className="py-2.5 px-3 font-semibold">{item.totalEnergyKcal} kcal</td>
                      <td className="py-2.5 px-3 text-sky-700 font-medium">{item.totalProteinG}g</td>
                      <td className="py-2.5 px-3 text-amber-700 font-medium">{item.totalCarbohydratesG}g</td>
                      <td className="py-2.5 px-3 text-slate-600">{item.totalFatG}g</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900">₹{item.totalCostInr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Daily Grand Summary Footer Card */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
            One-Day Aggregate Macro Intake
          </div>
          <div className="text-lg font-bold flex items-center gap-3 mt-1">
            <span>{plan.dailyTotals.energyKcal} kcal</span>
            <span className="text-slate-600">•</span>
            <span className="text-sky-400">{plan.dailyTotals.proteinG}g Protein</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400">{plan.dailyTotals.carbohydratesG}g Carbs</span>
            <span className="text-slate-600">•</span>
            <span className="text-rose-400">{plan.dailyTotals.fatG}g Fat</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Total Procured Cost</div>
          <div className="text-2xl font-black text-emerald-400">₹{plan.dailyTotals.costInr}</div>
        </div>
      </div>
    </div>
  );
}

