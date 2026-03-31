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

function calcRiskScore(temp: number, humidity: number, rain: boolean, windSpeed: number, aqi: number): number {
  const rainFactor = rain ? 100 : Math.min(humidity / 90 * 30, 30);
  let tempFactor = 0;
  if (temp > 42) tempFactor = 100;
  else if (temp > 38) tempFactor = 80;
  else if (temp > 35) tempFactor = 60;
  else if (temp < 5) tempFactor = 70;
  else if (temp < 10) tempFactor = 40;
  else tempFactor = Math.max(0, (temp - 25) * 3);
  const aqiFactor = Math.min((aqi / 300) * 100, 100);
  const windFactor = Math.min((windSpeed / 20) * 100, 100);
  const score = Math.round(rainFactor * 0.4 + tempFactor * 0.3 + aqiFactor * 0.2 + windFactor * 0.1);
  return Math.min(Math.max(score, 0), 100);
}

function scoreToLevel(score: number): "Low" | "Medium" | "High" {
  if (score >= 71) return "High";
  if (score >= 31) return "Medium";
  return "Low";
}

function weatherCodeToDescription(code: number): { description: string; icon: string; rain: boolean } {
  if (code === 0) return { description: "Clear sky", icon: "01d", rain: false };
  if (code <= 3) return { description: "Partly cloudy", icon: "02d", rain: false };
  if (code <= 48) return { description: "Foggy", icon: "50d", rain: false };
  if (code <= 57) return { description: "Drizzle", icon: "09d", rain: true };
  if (code <= 67) return { description: "Rain", icon: "10d", rain: true };
  if (code <= 77) return { description: "Snow", icon: "13d", rain: false };
  if (code <= 82) return { description: "Rain showers", icon: "09d", rain: true };
  if (code <= 86) return { description: "Snow showers", icon: "13d", rain: false };
  if (code >= 95) return { description: "Thunderstorm", icon: "11d", rain: true };
  return { description: "Unknown", icon: "01d", rain: false };
}

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`
    );
    if (!res.ok) return "Unknown";
    const data = await res.json();
    return data.address?.city || data.address?.town || data.address?.village || data.address?.state || "Unknown";
  } catch {
    return "Unknown";
  }
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResult> {
  try {
    const [weatherRes, cityName] = await Promise.all([
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
      ),
      reverseGeocode(lat, lon),
    ]);

    if (!weatherRes.ok) throw new Error("Weather API failed");
    const data = await weatherRes.json();
    const current = data.current;

    const temp = Math.round(current.temperature_2m);
    const humidity = current.relative_humidity_2m;
    const windSpeed = Math.round(current.wind_speed_10m / 3.6); // km/h → m/s
    const { description, icon, rain } = weatherCodeToDescription(current.weather_code);
    const aqi = Math.floor(Math.random() * 150) + 30; // AQI placeholder

    const riskScore = calcRiskScore(temp, humidity, rain, windSpeed, aqi);

    return {
      temp,
      humidity,
      description,
      icon,
      rain,
      aqi,
      windSpeed,
      city: cityName,
      riskScore,
      riskLevel: scoreToLevel(riskScore),
    };
  } catch {
    // Minimal fallback — still uses coordinates info
    const riskScore = 35;
    return {
      temp: 28,
      humidity: 60,
      description: "Data unavailable",
      icon: "01d",
      rain: false,
      aqi: 80,
      windSpeed: 5,
      city: "Your Location",
      riskScore,
      riskLevel: scoreToLevel(riskScore),
    };
  }
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
