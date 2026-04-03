import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Shield, Zap, CloudRain, Download, Loader2, Thermometer, Calendar, Bell, X, BarChart3 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts";
import { useState, useEffect, useRef } from "react";
import { fetchClaims, exportData, type Claim } from "../lib/supabase-store";
import { fetchForecast, type DailyForecast } from "../lib/forecast";
import { getUserLocation } from "../lib/weather";
import { toast } from "@/hooks/use-toast";

const AnalyticsScreen = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [rainAlert, setRainAlert] = useState<string | null>(null);
  const rainAlertShown = useRef(false);

  useEffect(() => {
    const load = async () => {
      const [claimsData] = await Promise.all([fetchClaims()]);
      setClaims(claimsData);

      try {
        const coords = await getUserLocation();
        const fc = await fetchForecast(coords.lat, coords.lon);
        setForecast(fc);
      } catch {
        const fc = await fetchForecast(17.385, 78.4867);
        setForecast(fc);
      }
      setLoading(false);
    };
    load();
  }, []);

  // Rain prediction notification
  useEffect(() => {
    if (rainAlertShown.current || forecast.length < 2) return;
    const tomorrow = forecast[1];
    if (tomorrow && tomorrow.rainProbability >= 60) {
      rainAlertShown.current = true;
      const msg = `🌧️ ${tomorrow.rainProbability}% rain probability tomorrow — auto-claim may trigger!`;
      setRainAlert(msg);
      toast({ title: "Rain Alert", description: msg, variant: "destructive" });
    }
  }, [forecast]);

  const totalPayout = claims.reduce((s, c) => s + c.payout, 0);
  const tomorrow = forecast[1];

  const metrics = [
    { icon: TrendingUp, label: "Total Protected", value: `₹${(totalPayout * 3).toLocaleString()}`, sub: "All time", accent: "neon-text-green" },
    { icon: Shield, label: "Total Claims", value: String(claims.length), sub: "Processed", accent: "neon-text-blue" },
    { icon: Zap, label: "Avg Response", value: "2.1s", sub: "Claim processing", accent: "neon-text-purple" },
  ];

  const forecastChart = forecast.map((d) => ({
    day: new Date(d.date).toLocaleDateString("en", { weekday: "short" }),
    rain: d.rainProbability,
    tempMax: d.tempMax,
    tempMin: d.tempMin,
  }));

  const handleDownload = async (format: "json" | "csv") => {
    await exportData(format);
  };

  if (loading) {
    return (
      <div className="px-4 pt-16 pb-24 max-w-lg mx-auto flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={24} />
      </div>
    );
  }

  return (
    <div className="px-4 pt-12 pb-24 max-w-lg mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">Performance, predictions & reports</p>
      </div>

      {/* Tomorrow's Prediction */}
      {tomorrow && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-glow p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <CloudRain size={16} className="neon-text-blue" />
            <span className="text-sm font-semibold text-foreground">Tomorrow's Prediction</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Rain Probability</p>
              <p className={`text-3xl font-extrabold ${tomorrow.rainProbability >= 60 ? "text-destructive" : tomorrow.rainProbability >= 30 ? "text-warning" : "neon-text-green"}`}>
                {tomorrow.rainProbability}%
              </p>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Thermometer size={12} />
                <span>High: {tomorrow.tempMax}°C</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Thermometer size={12} />
                <span>Low: {tomorrow.tempMin}°C</span>
              </div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${tomorrow.rainProbability}%` }}
              transition={{ duration: 1 }}
              className={`h-full rounded-full ${tomorrow.rainProbability >= 60 ? "bg-destructive" : tomorrow.rainProbability >= 30 ? "bg-warning" : "bg-accent"}`}
            />
          </div>
          <p className="text-[10px] text-muted-foreground">
            {tomorrow.rainProbability >= 60
              ? "⚠️ High chance of rain — auto-claim may trigger"
              : tomorrow.rainProbability >= 30
              ? "🌤️ Moderate rain chance — stay alert"
              : "☀️ Low rain probability — clear skies expected"}
          </p>
        </motion.div>
      )}

      {/* Key Metrics */}
      <div className="space-y-3">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card-glow p-4 flex items-center gap-4"
          >
            <div className="p-2.5 rounded-xl gradient-primary">
              <m.icon size={18} className="text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-lg font-bold ${m.accent}`}>{m.value}</p>
            </div>
            <span className="text-[10px] text-muted-foreground">{m.sub}</span>
          </motion.div>
        ))}
      </div>

      {/* 7-Day Rain Forecast */}
      {forecastChart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4 space-y-3"
        >
          <p className="text-sm font-semibold text-foreground">7-Day Rain Probability</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={forecastChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 18%)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "hsl(230, 25%, 11%)",
                  border: "1px solid hsl(230, 20%, 18%)",
                  borderRadius: "12px",
                  color: "hsl(210, 40%, 98%)",
                }}
                formatter={(value: number) => [`${value}%`, "Rain Probability"]}
              />
              <Bar dataKey="rain" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Temperature Trend */}
      {forecastChart.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-4 space-y-3"
        >
          <p className="text-sm font-semibold text-foreground">7-Day Temperature Range</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={forecastChart}>
              <defs>
                <linearGradient id="colorTempMax" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 80%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 80%, 55%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTempMin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 18%)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(230, 25%, 11%)",
                  border: "1px solid hsl(230, 20%, 18%)",
                  borderRadius: "12px",
                  color: "hsl(210, 40%, 98%)",
                }}
              />
              <Area type="monotone" dataKey="tempMax" stroke="hsl(0, 80%, 55%)" fill="url(#colorTempMax)" strokeWidth={2} name="High °C" />
              <Area type="monotone" dataKey="tempMin" stroke="hsl(217, 91%, 60%)" fill="url(#colorTempMin)" strokeWidth={2} name="Low °C" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Coverage Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-4 space-y-4"
      >
        <p className="text-sm font-semibold text-foreground">Coverage Breakdown</p>
        {[
          { label: "Rain Coverage", pct: 65, color: "gradient-primary" },
          { label: "Heat Coverage", pct: 45, color: "gradient-accent" },
          { label: "AQI Coverage", pct: 20, color: "gradient-warning" },
        ].map((bar) => (
          <div key={bar.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{bar.label}</span>
              <span className="text-foreground font-semibold">{bar.pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${bar.pct}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`h-full rounded-full ${bar.color}`}
              />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Weekly Report Download */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4 space-y-3"
      >
        <p className="text-sm font-semibold text-foreground">Weekly Report</p>
        <p className="text-xs text-muted-foreground">Download your claims and coverage data</p>
        <div className="flex gap-3">
          <button
            onClick={() => handleDownload("csv")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Download size={14} />
            CSV Report
          </button>
          <button
            onClick={() => handleDownload("json")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass-card text-foreground text-sm font-semibold hover:bg-muted/50 transition-colors border border-border"
          >
            <Download size={14} />
            JSON Report
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AnalyticsScreen;
