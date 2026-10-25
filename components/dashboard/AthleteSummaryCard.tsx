"use client";

import React from "react";
import { AthleteProfile } from "@/lib/types/athlete";
import { WeatherData } from "@/lib/types/weather";
import { getSportMetadata } from "@/data/reference/sportsData";
import { User, Activity, MapPin, CloudSun, ShieldCheck, IndianRupee } from "lucide-react";

interface AthleteSummaryCardProps {
  athlete: AthleteProfile;
  weather: WeatherData;
}

export function AthleteSummaryCard({ athlete, weather }: AthleteSummaryCardProps) {
  const sportMeta = getSportMetadata(athlete.sport);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold text-xl">
            {athlete.name ? athlete.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{athlete.name || "Athlete Profile"}</h2>
            <p className="text-xs text-slate-500 capitalize">
              {athlete.age} yrs • {athlete.sex} • {athlete.weightKg} kg • {athlete.heightCm} cm
            </p>
          </div>
        </div>

        {/* Environmental weather pill */}
        <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-100 text-xs text-slate-700">
          <CloudSun className="w-5 h-5 text-sky-600 flex-shrink-0" />
          <div>
            <div className="font-semibold text-sky-900 flex items-center gap-1">
              <span>{weather.location}:</span>
              <span>{weather.temperatureCelsius}°C</span>
              <span className="text-sky-600 font-normal">({weather.relativeHumidityPct}% RH)</span>
            </div>
            <div className="text-[11px] text-sky-700">
              Heat Index: <span className="font-semibold">{weather.heatIndex.heatIndexCelsius}°C</span> • {weather.heatIndex.riskLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Grid of parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-2">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            Sport & Discipline
          </div>
          <div className="text-sm font-bold text-slate-800 mt-1">{sportMeta?.label || athlete.sport}</div>
          <div className="text-[11px] text-slate-500 capitalize">
            {athlete.trainingIntensity} load ({athlete.trainingDurationMinutes} min)
            {!sportMeta && " · generic sport estimate"}
          </div>
          {athlete.trainingType && (
            <div className="text-[11px] text-slate-500">
              {athlete.trainingType.replace("_", " ")}
              {athlete.trainingDate ? ` · ${athlete.trainingDate}` : ""}
            </div>
          )}
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            Dietary Regimen
          </div>
          <div className="text-sm font-bold text-slate-800 mt-1 capitalize">
            {athlete.dietaryPreference.replace("_", "-")}
          </div>
          <div className="text-[11px] text-slate-500">
            {athlete.dietaryExclusions.length > 0
              ? `Excludes: ${athlete.dietaryExclusions.join(", ")}`
              : "No allergen exclusions"}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
            Food Budget
          </div>
          <div className="text-sm font-bold text-slate-800 mt-1">₹{athlete.dailyBudgetInr} / day</div>
          <div className="text-[11px] text-slate-500">Target daily allocation</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rose-600" />
            Training Location
          </div>
          <div className="text-sm font-bold text-slate-800 mt-1">{athlete.location}</div>
          <div className="text-[11px] text-slate-500">
            {weather.isFallback ? "Climatological fallback" : "Live Weather feed"}
          </div>
        </div>
      </div>
    </div>
  );
}
