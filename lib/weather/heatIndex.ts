import { HeatIndexAssessment, HeatIndexRisk } from "@/lib/types/weather";

/**
 * Calculates Heat Index using the National Oceanic and Atmospheric Administration (NOAA)
 * / National Weather Service (NWS) Rothfusz regression formula.
 * Ground truth: Steadman, R. G. (1979) "The Assessment of Sultriness".
 */
export function calculateHeatIndex(
  temperatureCelsius: number,
  relativeHumidityPct: number
): HeatIndexAssessment {
  const T = (temperatureCelsius * 9) / 5 + 32; // Convert to Fahrenheit
  const RH = relativeHumidityPct;

  let heatIndexF: number;

  if (T < 80) {
    // Steadman simple approximation below 80°F (26.7°C)
    heatIndexF = 0.5 * (T + 61.0 + (T - 68.0) * 1.2 + RH * 0.094);
  } else {
    // Full NOAA Rothfusz Regression Equation
    let hi =
      -42.379 +
      2.04901523 * T +
      10.14333127 * RH -
      0.22475541 * T * RH -
      0.00683783 * T * T -
      0.05481717 * RH * RH +
      0.00122874 * T * T * RH +
      0.00085282 * T * RH * RH -
      0.00000199 * T * T * RH * RH;

    // Adjustments for extreme low/high humidity
    if (RH < 13 && T >= 80 && T <= 112) {
      const adj = ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
      hi -= adj;
    } else if (RH > 85 && T >= 80 && T <= 87) {
      const adj = ((RH - 85) / 10) * ((87 - T) / 5);
      hi += adj;
    }

    heatIndexF = hi;
  }

  const heatIndexCelsius = Math.round((((heatIndexF - 32) * 5) / 9) * 10) / 10;

  let riskCategory: HeatIndexRisk = "low";
  let riskLabel = "Normal / Low Heat Stress";
  let advisoryText = "Conditions are comfortable. Standard athletic hydration protocol is adequate.";
  let hydrationMultiplier = 1.0;

  if (heatIndexCelsius >= 54) {
    riskCategory = "extreme_danger";
    riskLabel = "Extreme Danger (Heat Stroke Imminent)";
    advisoryText = "High risk of heat stroke or collapse. Outdoor athletic training strongly discouraged.";
    hydrationMultiplier = 1.45;
  } else if (heatIndexCelsius >= 41) {
    riskCategory = "danger";
    riskLabel = "Danger (Heat Cramps & Exhaustion Likely)";
    advisoryText = "Severe heat stress. Mandatory frequent fluid breaks, shade cooling, and electrolyte supplementation.";
    hydrationMultiplier = 1.35;
  } else if (heatIndexCelsius >= 32) {
    riskCategory = "extreme_caution";
    riskLabel = "Extreme Caution (Heat Exhaustion Possible)";
    advisoryText = "Substantial heat and humidity stress. Increased sweat rate expected; elevate fluid and sodium intake.";
    hydrationMultiplier = 1.25;
  } else if (heatIndexCelsius >= 27) {
    riskCategory = "caution";
    riskLabel = "Caution (Fatigue Possible with Prolonged Exposure)";
    advisoryText = "Moderate heat conditions. Ensure scheduled fluid intake before, during, and after practice.";
    hydrationMultiplier = 1.12;
  }

  return {
    heatIndexCelsius,
    riskCategory,
    riskLabel,
    advisoryText,
    hydrationMultiplier,
  };
}

