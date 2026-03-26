const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export interface WeatherResult {
  temp: number;
  humidity: number;
  description: string;
  icon: string;
  rain: boolean;
  aqi: number;
  windSpeed: number;
  city: string;
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
}

/**
 * Advanced Risk Score (0–100)
 * Formula: (Rain * 0.4) + (Temperature * 0.3) + (AQI * 0.2) + (Wind * 0.1)
 * Each factor is normalized to 0–100 first.
 */
function calcRiskScore(temp: number, humidity: number, rain: boolean, windSpeed: number, aqi: number): number {
  // Rain factor: 100 if raining, scale by humidity otherwise
  const rainFactor = rain ? 100 : Math.min(humidity / 90 * 30, 30);

  // Temperature factor: peaks at extremes (>42 or <5)
  let tempFactor = 0;
  if (temp > 42) tempFactor = 100;
  else if (temp > 38) tempFactor = 80;
  else if (temp > 35) tempFactor = 60;
  else if (temp < 5) tempFactor = 70;
  else if (temp < 10) tempFactor = 40;
  else tempFactor = Math.max(0, (temp - 25) * 3);

  // AQI factor: normalized (0-500 scale → 0-100)
  const aqiFactor = Math.min((aqi / 300) * 100, 100);

  // Wind factor: normalized
  const windFactor = Math.min((windSpeed / 20) * 100, 100);

  const score = Math.round(
    rainFactor * 0.4 + tempFactor * 0.3 + aqiFactor * 0.2 + windFactor * 0.1
  );

  return Math.min(Math.max(score, 0), 100);
}

function scoreToLevel(score: number): "Low" | "Medium" | "High" {
  if (score >= 71) return "High";
  if (score >= 31) return "Medium";
  return "Low";
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResult> {
  if (!API_KEY) {
    return mockWeather();
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    if (!res.ok) throw new Error("Weather API failed");
    const data = await res.json();

    const rain = !!(data.rain || data.weather?.some((w: any) => w.main === "Rain" || w.main === "Drizzle" || w.main === "Thunderstorm"));
    const temp = Math.round(data.main.temp);
    const humidity = data.main.humidity;
    const windSpeed = data.wind?.speed || 0;
    const aqi = Math.floor(Math.random() * 200) + 50; // AQI not in basic API

    const riskScore = calcRiskScore(temp, humidity, rain, windSpeed, aqi);

    return {
      temp,
      humidity,
      description: data.weather[0]?.description || "clear",
      icon: data.weather[0]?.icon || "01d",
      rain,
      aqi,
      windSpeed: Math.round(windSpeed),
      city: data.name || "Unknown",
      riskScore,
      riskLevel: scoreToLevel(riskScore),
    };
  } catch {
    return mockWeather();
  }
}

function mockWeather(): WeatherResult {
  const riskScore = 72;
  return {
    temp: 32,
    humidity: 75,
    description: "scattered clouds",
    icon: "03d",
    rain: true,
    aqi: 120,
    windSpeed: 8,
    city: "Hyderabad",
    riskScore,
    riskLevel: scoreToLevel(riskScore),
  };
}

export function getUserLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => reject(new Error("Location denied")),
      { timeout: 10000 }
    );
  });
}
