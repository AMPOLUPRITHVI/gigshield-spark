// localStorage-based data store for GigShield AI

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  plan: "none" | "Basic" | "Standard" | "Pro";
  coverageActive: boolean;
}

export interface Claim {
  id: string;
  type: string;
  amount: number;
  txnId: string;
  date: string;
  status: "Credited" | "Pending" | "Rejected";
}

export interface WeatherData {
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

const KEYS = {
  user: "gigshield_user",
  claims: "gigshield_claims",
  loggedIn: "gigshield_logged_in",
  weather: "gigshield_weather",
  notifications: "gigshield_notifications_enabled",
  riskPreference: "gigshield_risk_preference",
};

// User
export const getUser = (): UserProfile | null => {
  const data = localStorage.getItem(KEYS.user);
  return data ? JSON.parse(data) : null;
};

export const saveUser = (user: UserProfile) => {
  localStorage.setItem(KEYS.user, JSON.stringify(user));
};

export const isLoggedIn = (): boolean => {
  return localStorage.getItem(KEYS.loggedIn) === "true";
};

export const setLoggedIn = (val: boolean) => {
  localStorage.setItem(KEYS.loggedIn, String(val));
};

export const logout = () => {
  localStorage.removeItem(KEYS.loggedIn);
  localStorage.removeItem(KEYS.user);
};

// Claims
export const getClaims = (): Claim[] => {
  const data = localStorage.getItem(KEYS.claims);
  return data ? JSON.parse(data) : [
    { id: "1", type: "Rain Claim", amount: 400, txnId: "TXN847392", date: "Today, 2:30 PM", status: "Credited" },
    { id: "2", type: "Heat Claim", amount: 250, txnId: "TXN123456", date: "Yesterday, 11:15 AM", status: "Credited" },
    { id: "3", type: "Rain Claim", amount: 350, txnId: "TXN987654", date: "Mar 16, 4:00 PM", status: "Credited" },
    { id: "4", type: "Heat Claim", amount: 200, txnId: "TXN654321", date: "Mar 14, 1:45 PM", status: "Credited" },
  ];
};

export const addClaim = (claim: Omit<Claim, "id">) => {
  const claims = getClaims();
  claims.unshift({ ...claim, id: String(Date.now()) });
  localStorage.setItem(KEYS.claims, JSON.stringify(claims));
};

// Notifications
export const getNotificationsEnabled = (): boolean => {
  const val = localStorage.getItem(KEYS.notifications);
  return val === null ? true : val === "true";
};

export const setNotificationsEnabled = (val: boolean) => {
  localStorage.setItem(KEYS.notifications, String(val));
};

// Risk preference
export const getRiskPreference = (): "Low" | "Medium" | "High" => {
  return (localStorage.getItem(KEYS.riskPreference) as any) || "Medium";
};

export const setRiskPreference = (val: "Low" | "Medium" | "High") => {
  localStorage.setItem(KEYS.riskPreference, val);
};

// Export data
export const exportData = (format: "json" | "csv") => {
  const claims = getClaims();
  const user = getUser();
  
  if (format === "json") {
    const data = JSON.stringify({ user, claims }, null, 2);
    downloadFile(data, "gigshield-data.json", "application/json");
  } else {
    const header = "ID,Type,Amount,TxnID,Date,Status\n";
    const rows = claims.map(c => `${c.id},${c.type},₹${c.amount},${c.txnId},${c.date},${c.status}`).join("\n");
    downloadFile(header + rows, "gigshield-claims.csv", "text/csv");
  }
};

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
