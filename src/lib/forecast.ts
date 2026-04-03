export interface DailyForecast {
  date: string;
  rainProbability: number;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
}

export async function fetchForecast(lat: number, lon: number): Promise<DailyForecast[]> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_probability_max,temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7`
    );
    if (!res.ok) throw new Error("Forecast API failed");
    const data = await res.json();
    const days: DailyForecast[] = data.daily.time.map((date: string, i: number) => ({
      date,
      rainProbability: data.daily.precipitation_probability_max[i] ?? 0,
      tempMax: Math.round(data.daily.temperature_2m_max[i]),
      tempMin: Math.round(data.daily.temperature_2m_min[i]),
      weatherCode: data.daily.weather_code[i],
    }));
    return days;
  } catch {
    return [];
  }
}
