import { WeatherData, WeatherFetchResult } from "@/lib/types/weather";
import { calculateHeatIndex } from "@/lib/weather/heatIndex";

interface IndianCityClimate {
  temperatureCelsius: number;
  relativeHumidityPct: number;
  description: string;
}

const INDIAN_CITIES_CLIMATOLOGY: Record<string, IndianCityClimate> = {
  mumbai: { temperatureCelsius: 32, relativeHumidityPct: 75, description: "Humid Coastal Weather" },
  delhi: { temperatureCelsius: 36, relativeHumidityPct: 45, description: "Hot Northern Plains" },
  chennai: { temperatureCelsius: 34, relativeHumidityPct: 80, description: "High Heat & Maritime Humidity" },
  kolkata: { temperatureCelsius: 33, relativeHumidityPct: 78, description: "Tropical Humid Conditions" },
  bengaluru: { temperatureCelsius: 28, relativeHumidityPct: 55, description: "Moderate Elevated Plateau" },
  bangalore: { temperatureCelsius: 28, relativeHumidityPct: 55, description: "Moderate Elevated Plateau" },
  hyderabad: { temperatureCelsius: 33, relativeHumidityPct: 50, description: "Semi-Arid Warm Weather" },
  ahmedabad: { temperatureCelsius: 38, relativeHumidityPct: 40, description: "Very Warm Semi-Arid Heat" },
  pune: { temperatureCelsius: 30, relativeHumidityPct: 60, description: "Mild Warm Weather" },
  chandigarh: { temperatureCelsius: 34, relativeHumidityPct: 50, description: "Warm Northern Plain" },
  jaipur: { temperatureCelsius: 37, relativeHumidityPct: 35, description: "Dry Subtropical Heat" },
};

/**
 * Server-Side Weather Service Abstraction:
 * Securely accesses external weather API if configured, with guaranteed graceful fallback
 * to Indian seasonal climatological norms if API is unavailable, key is missing, or network fails.
 */
export async function getWeatherData(locationName: string): Promise<WeatherFetchResult> {
  const normalizedCity = locationName.trim().toLowerCase();
  const apiKey = process.env.WEATHER_API_KEY;
  const baseUrl = process.env.WEATHER_API_BASE_URL || "https://api.openweathermap.org/data/2.5";

  // If API key is present and looks configured, attempt live query
  if (apiKey && apiKey !== "" && !apiKey.startsWith("YOUR_")) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s strict timeout

      const res = await fetch(
        `${baseUrl}/weather?q=${encodeURIComponent(locationName)},IN&units=metric&appid=${apiKey}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        const temp = Math.round(json.main.temp * 10) / 10;
        const humidity = json.main.humidity;
        const condition = json.weather?.[0]?.description || "Clear skies";

        const heatIndex = calculateHeatIndex(temp, humidity);

        return {
          success: true,
          data: {
            location: json.name || locationName,
            temperatureCelsius: temp,
            relativeHumidityPct: humidity,
            conditionDescription: condition,
            windSpeedKph: json.wind?.speed ? Math.round(json.wind.speed * 3.6) : undefined,
            isFallback: false,
            sourceNotice: "Live meteorological data from OpenWeather API service.",
            heatIndex,
          },
        };
      }
    } catch {
      // Gracefully continue to fallback without bubbling crash
    }
  }

  // Graceful fallback to Indian climatological database
  const fallbackMatch = INDIAN_CITIES_CLIMATOLOGY[normalizedCity] || {
    temperatureCelsius: 31,
    relativeHumidityPct: 65,
    description: "Standard Indian Tropical Baseline",
  };

  const heatIndex = calculateHeatIndex(fallbackMatch.temperatureCelsius, fallbackMatch.relativeHumidityPct);

  return {
    success: true,
    data: {
      location: locationName.trim() || "National Baseline (India)",
      temperatureCelsius: fallbackMatch.temperatureCelsius,
      relativeHumidityPct: fallbackMatch.relativeHumidityPct,
      conditionDescription: fallbackMatch.description,
      isFallback: true,
      sourceNotice: "Scientific regional climatological baseline (API key offline or network unconfigured).",
      heatIndex,
    },
  };
}

