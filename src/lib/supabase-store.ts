// Supabase-backed data store for GigShield AI
import { supabase } from "@/integrations/supabase/client";

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
  payout: number;
  txnId: string;
  date: string;
  status: "Credited" | "Pending" | "Rejected" | "Flagged";
  flagged?: boolean;
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
  riskScore: number;
  riskLevel: "Low" | "Medium" | "High";
}

// Auth helpers
export const signUp = async (email: string, password: string, name: string, phone?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone: phone || "" },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  await supabase.auth.signOut();
};

export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

export const onAuthChange = (callback: (session: any) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return subscription;
};

// Profile
export const getProfile = async (): Promise<UserProfile | null> => {
  const session = await getSession();
  if (!session) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  if (!data) return null;
  return {
    name: data.name,
    email: data.email || "",
    phone: data.phone || "",
    city: data.city || "Unknown",
    plan: (data.plan as UserProfile["plan"]) || "none",
    coverageActive: data.coverage_active || false,
  };
};

export const updateProfile = async (updates: Partial<UserProfile>) => {
  const session = await getSession();
  if (!session) return;

  const dbUpdates: Record<string, any> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.city !== undefined) dbUpdates.city = updates.city;
  if (updates.plan !== undefined) dbUpdates.plan = updates.plan;
  if (updates.coverageActive !== undefined) dbUpdates.coverage_active = updates.coverageActive;
  if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
  if (updates.email !== undefined) dbUpdates.email = updates.email;

  await supabase.from("profiles").update(dbUpdates).eq("user_id", session.user.id);
};

// Claims
export const fetchClaims = async (): Promise<Claim[]> => {
  const session = await getSession();
  if (!session) return [];

  const { data } = await supabase
    .from("claims")
    .select("*")
    .order("created_at", { ascending: false });

  if (!data) return [];
  return data.map((c) => ({
    id: c.id,
    type: c.type,
    amount: Number(c.amount),
    payout: Number(c.payout),
    txnId: c.txn_id,
    date: new Date(c.created_at).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    status: c.status as Claim["status"],
    flagged: c.flagged || false,
  }));
};

export const createClaim = async (income: number, lossPercentage: number, type: string, riskScore: number) => {
  const { data, error } = await supabase.functions.invoke("create-claim", {
    body: { income, lossPercentage, type, riskScore },
  });
  if (error) throw error;
  if (data?.fraudBlocked) throw new Error(data.error);
  return data;
};

// Payments
export const processPayment = async (amount: number, planName?: string) => {
  const { data, error } = await supabase.functions.invoke("process-payment", {
    body: { amount, planName },
  });
  if (error) throw error;
  return data;
};

// Risk calculation
export const calculateRisk = async (weather: { rain: boolean; temperature: number; aqi: number; windSpeed: number }) => {
  const { data, error } = await supabase.functions.invoke("calculate-risk", {
    body: weather,
  });
  if (error) throw error;
  return data as { riskScore: number; riskLevel: "Low" | "Medium" | "High" };
};

// Local settings (these stay in localStorage as they're preferences, not data)
const KEYS = {
  notifications: "gigshield_notifications_enabled",
  riskPreference: "gigshield_risk_preference",
  riskScore: "gigshield_risk_score",
};

export const getRiskScore = (): number => {
  const val = localStorage.getItem(KEYS.riskScore);
  return val ? Number(val) : 50;
};

export const setRiskScore = (val: number) => {
  localStorage.setItem(KEYS.riskScore, String(val));
};

export const getNotificationsEnabled = (): boolean => {
  const val = localStorage.getItem(KEYS.notifications);
  return val === null ? true : val === "true";
};

export const setNotificationsEnabled = (val: boolean) => {
  localStorage.setItem(KEYS.notifications, String(val));
};

export const getRiskPreference = (): "Low" | "Medium" | "High" => {
  return (localStorage.getItem(KEYS.riskPreference) as any) || "Medium";
};

export const setRiskPreference = (val: "Low" | "Medium" | "High") => {
  localStorage.setItem(KEYS.riskPreference, val);
};

export const calcPremium = (basePrice: number, riskScore: number): number => {
  return Math.round(basePrice + riskScore / 10);
};

// Export data
export const exportData = async (format: "json" | "csv") => {
  const claims = await fetchClaims();
  const profile = await getProfile();

  if (format === "json") {
    const data = JSON.stringify({ user: profile, claims }, null, 2);
    downloadFile(data, "gigshield-data.json", "application/json");
  } else {
    const header = "ID,Type,Amount,Payout,TxnID,Date,Status\n";
    const rows = claims.map((c) => `${c.id},${c.type},₹${c.amount},₹${c.payout},${c.txnId},${c.date},${c.status}`).join("\n");
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
