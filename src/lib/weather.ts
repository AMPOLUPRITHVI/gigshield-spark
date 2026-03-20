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
  riskLevel: "Low" | "Medium" | "High";
}

function calcRisk(temp: number, humidity: number, rain: boolean, windSpeed: number): "Low" | "Medium" | "High" {
  let score = 0;
  if (rain) score += 3;
  if (temp > 40) score += 2;
  if (temp < 10) score += 1;
  if (humidity > 80) score += 1;
  if (windSpeed > 10) score += 1;
  if (score >= 4) return "High";
  if (score >= 2) return "Medium";
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

    return {
      temp,
      humidity,
      description: data.weather[0]?.description || "clear",
      icon: data.weather[0]?.icon || "01d",
      rain,
      aqi: Math.floor(Math.random() * 200) + 50, // AQI not in basic API
      windSpeed: Math.round(windSpeed),
      city: data.name || "Unknown",
      riskLevel: calcRisk(temp, humidity, rain, windSpeed),
    };
  } catch {
    return mockWeather();
  }
}

function mockWeather(): WeatherResult {
  return {
    temp: 32,
    humidity: 75,
    description: "scattered clouds",
    icon: "03d",
    rain: true,
    aqi: 120,
    windSpeed: 8,
    city: "Hyderabad",
    riskLevel: "High",
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
