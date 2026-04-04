// Daily income tracking with 7-day history, average calculation, and fraud validation

const INCOME_KEY = "gigshield_daily_income";

export interface IncomeRecord {
  date: string; // YYYY-MM-DD
  amount: number;
}

export function getIncomeHistory(): IncomeRecord[] {
  try {
    const raw = localStorage.getItem(INCOME_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as IncomeRecord[];
  } catch {
    return [];
  }
}

export function addDailyIncome(amount: number): IncomeRecord[] {
  const today = new Date().toISOString().slice(0, 10);
  const history = getIncomeHistory();

  // Update today's entry or add new
  const idx = history.findIndex((r) => r.date === today);
  if (idx >= 0) {
    history[idx].amount = amount;
  } else {
    history.push({ date: today, amount });
  }

  // Keep last 7 days only
  const sorted = history.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  localStorage.setItem(INCOME_KEY, JSON.stringify(sorted));
  return sorted;
}

export function getAverageIncome(): number {
  const history = getIncomeHistory();
  if (history.length === 0) return 500; // default
  const sum = history.reduce((s, r) => s + r.amount, 0);
  return Math.round(sum / history.length);
}

export function getLast7DaysIncome(): number[] {
  const history = getIncomeHistory();
  // Return amounts sorted oldest→newest, padded to 7
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const amounts = sorted.map((r) => r.amount);
  while (amounts.length < 7) amounts.unshift(0);
  return amounts.slice(-7);
}

export interface IncomeValidation {
  valid: boolean;
  adjustedIncome: number;
  suspicious: boolean;
  message?: string;
}

export function validateIncome(enteredIncome: number): IncomeValidation {
  const avg = getAverageIncome();
  if (avg === 0) {
    return { valid: true, adjustedIncome: enteredIncome, suspicious: false };
  }

  const deviation = Math.abs(enteredIncome - avg) / avg;

  if (deviation > 0.3) {
    return {
      valid: false,
      adjustedIncome: avg,
      suspicious: true,
      message: `Suspicious income ₹${enteredIncome} (avg ₹${avg}). Using average instead.`,
    };
  }

  return { valid: true, adjustedIncome: enteredIncome, suspicious: false };
}

// Dynamic premium based on risk score
export function getDynamicPremium(riskScore: number): { amount: number; label: string } {
  if (riskScore > 70) return { amount: 30, label: "High Risk Premium" };
  if (riskScore > 40) return { amount: 20, label: "Medium Risk Premium" };
  return { amount: 10, label: "Low Risk Premium" };
}

// Trigger detection
export interface TriggerResult {
  triggered: boolean;
  reasons: string[];
  type: string;
}

export function detectTriggers(weather: {
  rain: boolean;
  temp: number;
  aqi: number;
  humidity: number;
}): TriggerResult {
  const reasons: string[] = [];

  if (weather.rain && weather.humidity > 60) reasons.push("🌧️ Heavy rain detected");
  else if (weather.rain) reasons.push("🌧️ Rain detected");
  if (weather.temp > 42) reasons.push("🔥 Extreme heat (>42°C)");
  if (weather.aqi > 150) reasons.push("😷 Hazardous air quality (AQI >150)");

  const type = reasons.length > 0
    ? weather.rain ? "Rain Claim" : weather.temp > 42 ? "Heat Claim" : "AQI Claim"
    : "";

  return { triggered: reasons.length > 0, reasons, type };
}

// Full system flow
export interface SystemResult {
  incomeHistory: IncomeRecord[];
  avgIncome: number;
  incomeValidation: IncomeValidation;
  riskScore: number;
  premium: { amount: number; label: string };
  trigger: TriggerResult;
  claimEligible: boolean;
  payout: number;
}

export function processSystem(
  weather: { rain: boolean; temp: number; aqi: number; humidity: number; windSpeed: number },
  enteredIncome: number,
  riskScore: number
): SystemResult {
  // 1. Update daily income
  const incomeHistory = addDailyIncome(enteredIncome);
  const avgIncome = getAverageIncome();

  // 2. Validate income
  const incomeValidation = validateIncome(enteredIncome);

  // 3. Dynamic premium
  const premium = getDynamicPremium(riskScore);

  // 4. Detect triggers
  const trigger = detectTriggers(weather);

  // 5. Calculate payout using avg income
  const lossPercentage = 0.5;
  const payout = Math.round(avgIncome * lossPercentage);

  return {
    incomeHistory,
    avgIncome,
    incomeValidation,
    riskScore,
    premium,
    trigger,
    claimEligible: trigger.triggered,
    payout,
  };
}
