import { describe, it, expect } from "vitest";
import { calculateHeatIndex } from "@/lib/weather/heatIndex";
import { getWeatherData } from "@/lib/weather/weatherService";

describe("Weather & Heat Index Unit Tests", () => {
  it("calculates accurate Heat Index for normal mild conditions (24°C, 50% RH)", () => {
    const hi = calculateHeatIndex(24, 50);
    expect(hi.heatIndexCelsius).toBeLessThan(27);
    expect(hi.riskCategory).toBe("low");
    expect(hi.hydrationMultiplier).toBe(1.0);
  });

  it("calculates Caution heat index for 30°C and 60% RH", () => {
    // 30°C (86°F), 60% RH -> Heat Index approx 33-35°C (Extreme Caution)
    const hi = calculateHeatIndex(30, 60);
    expect(hi.heatIndexCelsius).toBeGreaterThanOrEqual(30);
    expect(["caution", "extreme_caution"]).toContain(hi.riskCategory);
    expect(hi.hydrationMultiplier).toBeGreaterThan(1.0);
  });

  it("identifies Danger / Extreme Danger category for hot and humid Indian conditions (38°C, 70% RH)", () => {
    const hi = calculateHeatIndex(38, 70);
    expect(hi.heatIndexCelsius).toBeGreaterThan(45);
    expect(["danger", "extreme_danger"]).toContain(hi.riskCategory);
    expect(hi.hydrationMultiplier).toBeGreaterThanOrEqual(1.35);
  });

  it("gracefully falls back to scientific Indian city climate when API key is unconfigured", async () => {
    const result = await getWeatherData("Mumbai");
    expect(result.success).toBe(true);
    expect(result.data.isFallback).toBe(true);
    expect(result.data.temperatureCelsius).toBe(32);
    expect(result.data.relativeHumidityPct).toBe(75);
    expect(result.data.heatIndex).toBeDefined();
    expect(result.data.heatIndex.riskCategory).toBeDefined();
  });

  it("gracefully falls back to national baseline for arbitrary or unknown locations without crashing", async () => {
    const result = await getWeatherData("SmallVillageUnknown123");
    expect(result.success).toBe(true);
    expect(result.data.isFallback).toBe(true);
    expect(result.data.temperatureCelsius).toBeGreaterThan(0);
    expect(result.data.relativeHumidityPct).toBeGreaterThan(0);
    expect(result.data.conditionDescription).toContain("Baseline");
  });
});

