"use client";

import React, { useState } from "react";
import { EnergyRequirementResult, MacronutrientTargets } from "@/lib/types/nutrition";
import { OneDayMealPlan } from "@/lib/types/plan";
import { HydrationPlan } from "@/lib/types/hydration";
import { HelpCircle, ChevronDown, ChevronRight, Calculator, Check, ArrowRight } from "lucide-react";

interface ExplanationsCardProps {
  energy: EnergyRequirementResult;
  targets: MacronutrientTargets;
  plan: OneDayMealPlan;
  hydration: HydrationPlan;
}

export function ExplanationsCard({ energy, targets, plan, hydration }: ExplanationsCardProps) {
  const [openSection, setOpenSection] = useState<string>("energy");

  const toggle = (section: string) => {
    setOpenSection(openSection === section ? "" : section);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          Explainable Nutrition & Scientific Methodology
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Every recommendation is backed by transparent deterministic equations rather than opaque artificial intelligence
        </p>
      </div>

      <div className="space-y-3">
        {/* Section 1: Energy & BMR Calculations */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggle("energy")}
            className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between text-left font-bold text-sm text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              1. Energy & Calorie Requirements (BMR → EEE → TDEE)
            </span>
            {openSection === "energy" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {openSection === "energy" && (
            <div className="p-4 space-y-3 text-xs divide-y divide-slate-100 bg-white">
              {energy.explanations.map((step, idx) => (
                <div key={idx} className="pt-2 first:pt-0 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">{step.step}</div>
                  <div className="font-mono text-[11px] text-emerald-700 bg-emerald-50/60 px-2 py-1 rounded border border-emerald-100 inline-block">
                    {step.formula}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Inputs: <strong>{step.inputValue}</strong> → Output: <strong>{step.outputValue}</strong>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{step.scientificRationale}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Macronutrient Allocation */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggle("macros")}
            className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between text-left font-bold text-sm text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-sky-600" />
              2. Macronutrient Periodization & ICMR-NIN Baselines
            </span>
            {openSection === "macros" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {openSection === "macros" && (
            <div className="p-4 space-y-3 text-xs divide-y divide-slate-100 bg-white">
              {targets.explanations.map((step, idx) => (
                <div key={idx} className="pt-2 first:pt-0 space-y-1">
                  <div className="font-bold text-slate-900 text-xs">{step.step}</div>
                  <div className="font-mono text-[11px] text-sky-700 bg-sky-50/60 px-2 py-1 rounded border border-sky-100 inline-block">
                    {step.formula}
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    Inputs: <strong>{step.inputValue}</strong> → Output: <strong>{step.outputValue}</strong>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{step.scientificRationale}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Hydration Rationale */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggle("hydration")}
            className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between text-left font-bold text-sm text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              3. Hydration Multipliers & Heat Index Physics
            </span>
            {openSection === "hydration" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {openSection === "hydration" && (
            <div className="p-4 space-y-2 text-xs bg-white">
              {hydration.rationales.map((rat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-700">
                  <span className="font-bold text-blue-600">•</span>
                  <p className="leading-relaxed">{rat}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Multi-Objective Optimisation Objective */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => toggle("optimisation")}
            className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between text-left font-bold text-sm text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-600" />
              4. Multi-Objective Optimization Formulation
            </span>
            {openSection === "optimisation" ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {openSection === "optimisation" && (
            <div className="p-4 space-y-3 text-xs bg-white text-slate-700">
              <div className="font-mono text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                Score = 0.45 × NutritionScore + 0.25 × AffordabilityScore + 0.15 × VarietyScore + 0.15 × PracticalityScore
              </div>
              <p className="leading-relaxed">
                The meal plan generator balances four trade-offs: minimizing caloric/protein shortfall, penalizing budget overruns, ensuring varied non-repetitive Indian dishes, and matching sports nutrient timing (e.g. fast-digesting carbohydrates pre-workout, protein post-workout).
              </p>
              <div className="space-y-1">
                {plan.rationale.map((rat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-600">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{rat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

