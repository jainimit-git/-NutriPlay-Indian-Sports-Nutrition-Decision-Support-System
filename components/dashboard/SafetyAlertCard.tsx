"use client";

import React from "react";
import { OverallSafetyReport } from "@/lib/types/safety";
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, HeartPulse } from "lucide-react";

interface SafetyAlertCardProps {
  safety: OverallSafetyReport;
}

export function SafetyAlertCard({ safety }: SafetyAlertCardProps) {
  const { reds, warnings, mandatoryClinicalDisclaimer } = safety;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-rose-600" />
          Safety & Low-Energy-Availability (RED-S) Screen
        </h2>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${
            reds.flagTriggered
              ? "bg-rose-100 text-rose-800"
              : reds.riskLevel === "moderate"
              ? "bg-amber-100 text-amber-800"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {reds.flagTriggered
            ? "RED-S Advisory Active"
            : reds.riskLevel === "moderate"
            ? "Sub-Optimal EA"
            : "Energy Availability: Optimal"}
        </span>
      </div>

      {/* Energy Availability (EA) Metrics Breakdown */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Computed Energy Availability (EA)
          </div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">
            {reds.energyAvailabilityKcalPerKgFfm}{" "}
            <span className="text-sm font-normal text-slate-500">kcal / kg FFM / day</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Estimated Fat-Free Mass: <strong>{reds.estimatedFfmKg} kg</strong> (IOC reference standards)
          </div>
        </div>

        <div className="text-xs text-slate-600 max-w-md">
          <p className="leading-relaxed">{reds.explanation}</p>
        </div>
      </div>

      {/* Triggered Warnings List */}
      {warnings.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Active Decision-Support Advisories:
          </h3>
          {warnings.map((warn) => (
            <div
              key={warn.id}
              className={`p-4 rounded-xl border space-y-1.5 ${
                warn.severity === "danger"
                  ? "bg-rose-50 border-rose-200 text-rose-950"
                  : "bg-amber-50 border-amber-200 text-amber-950"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle
                  className={`w-4 h-4 ${
                    warn.severity === "danger" ? "text-rose-600" : "text-amber-600"
                  }`}
                />
                <span>{warn.title}</span>
              </div>
              <p className="text-xs leading-relaxed">{warn.message}</p>
              <div className="text-xs font-medium pt-1 border-t border-slate-200/50">
                <strong>Actionable Guidance:</strong> {warn.actionableGuidance}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>
            No severe safety risk flags detected. Energy availability, rest schedule, and environmental factors satisfy safe athletic bounds.
          </span>
        </div>
      )}

      {/* Mandatory Non-Diagnostic Clinical Notice */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 space-y-2">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800">
          <Info className="w-4 h-4 text-slate-600" />
          Mandatory Clinical Boundary & Ethics Statement
        </div>
        <p className="text-xs leading-relaxed">{mandatoryClinicalDisclaimer}</p>
        <p className="text-[11px] text-slate-500 italic">{reds.clinicalNotice}</p>
      </div>
    </div>
  );
}

