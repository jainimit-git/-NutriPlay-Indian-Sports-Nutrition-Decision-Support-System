export type HeatIndexRisk = "low" | "caution" | "extreme_caution" | "danger" | "extreme_danger";

export interface HeatIndexAssessment {
  heatIndexCelsius: number;
  riskCategory: HeatIndexRisk;
  riskLabel: string;
  advisoryText: string;
  hydrationMultiplier: number; // Multiplier applied to training fluid (1.0 to 1.4)
}

export interface WeatherData {
  location: string;
  temperatureCelsius: number;
  relativeHumidityPct: number;
  conditionDescription: string;
  windSpeedKph?: number;
  isFallback: boolean;
  sourceNotice: string;
  heatIndex: HeatIndexAssessment;
}

export interface WeatherFetchResult {
  success: boolean;
  data: WeatherData;
  error?: string;
}

