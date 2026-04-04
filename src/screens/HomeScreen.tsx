import { motion, AnimatePresence } from "framer-motion";
import { Shield, TrendingUp, AlertTriangle, CloudRain, Bell, MapPin, Loader2, Thermometer, Wind, Droplets, Gauge, RefreshCw, X, DollarSign, BarChart3, Zap } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { getRiskScore, setRiskScore, createClaim, fetchClaims } from "../lib/supabase-store";
import { getProfile, type UserProfile, type Claim } from "../lib/supabase-store";
import { fetchWeather, getUserLocation, type WeatherResult } from "../lib/weather";
import {
  getAverageIncome,
  getLast7DaysIncome,
  processSystem,
  getDynamicPremium,
  detectTriggers,
  validateIncome,
  addDailyIncome,
  type SystemResult,
} from "../lib/income-tracker";
import RiskMap from "@/components/RiskMap";
import WalletCard from "@/components/WalletCard";
import NotificationToast, { type AppNotification } from "@/components/NotificationToast";
import { toast } from "@/hooks/use-toast";

const riskColors = {
  Low: "neon-text-green",
  Medium: "text-warning",
  High: "text-destructive",
};

const HomeScreen = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showNotif, setShowNotif] = useState(false);
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [systemResult, setSystemResult] = useState<SystemResult | null>(null);
  const [fraudAlert, setFraudAlert] = useState<string | null>(null);
  const autoClaimTriggered = useRef(false);

  useEffect(() => {
    getProfile().then(setUser);
    fetchClaims().then(setClaims);
  }, []);

  const addNotification = useCallback((message: string, type: AppNotification["type"]) => {
    const notif: AppNotification = { id: crypto.randomUUID(), message, type, timestamp: Date.now() };
    setNotifications((prev) => [notif, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    }, 5000);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const runAutomatedSystem = useCallback(
    async (weatherData: WeatherResult) => {
      // Run the full processSystem flow
      const avgIncome = getAverageIncome();
      const enteredIncome = avgIncome || 500;
      const result = processSystem(
        {
          rain: weatherData.rain,
          temp: weatherData.temp,
          aqi: weatherData.aqi,
          humidity: weatherData.humidity,
          windSpeed: weatherData.windSpeed,
        },
        enteredIncome,
        weatherData.riskScore
      );
      setSystemResult(result);

      // Check income validation
      if (result.incomeValidation.suspicious) {
        setFraudAlert(result.incomeValidation.message || null);
      } else {
        setFraudAlert(null);
      }

      // Premium notification
      addNotification(`💰 Premium updated: ₹${result.premium.amount}/day (${result.premium.label})`, "info");

      // Auto-claim if triggered
      if (result.trigger.triggered && !autoClaimTriggered.current) {
        autoClaimTriggered.current = true;
        result.trigger.reasons.forEach((r) => addNotification(`⚠️ ${r}`, "warning"));
        addNotification("⚡ Auto-claim triggered", "warning");

        try {
          const claimResult = await createClaim(
            result.avgIncome,
            50,
            result.trigger.type || "Auto Claim",
            weatherData.riskScore
          );
          addNotification(`💰 ₹${claimResult.payout} credited automatically`, "success");
          toast({
            title: "Auto Claim Processed!",
            description: `₹${claimResult.payout} credited based on ${result.trigger.type}`,
          });
          fetchClaims().then(setClaims);
        } catch (err: any) {
          addNotification(`Claim blocked: ${err.message}`, "info");
        }
      }
    },
    [addNotification]
  );

  const loadWeather = async () => {
    setLoadingWeather(true);
    try {
      const coords = await getUserLocation();
      setUserCoords(coords);
      const data = await fetchWeather(coords.lat, coords.lon);
      setWeather(data);
      setRiskScore(data.riskScore);
      generateAlerts(data);
      runAutomatedSystem(data);
    } catch {
      const data = await fetchWeather(17.385, 78.4867);
      setUserCoords({ lat: 17.385, lon: 78.4867 });
      setWeather(data);
      setRiskScore(data.riskScore);
      generateAlerts(data);
      addNotification("📍 Using default location", "info");
      runAutomatedSystem(data);
    } finally {
      setLoadingWeather(false);
    }
  };

  const generateAlerts = (w: WeatherResult) => {
    const a: string[] = [];
    if (w.rain) a.push("🌧️ Rain detected in your area — coverage active");
    if (w.temp > 38) a.push("🔥 Extreme heat warning — stay hydrated");
    if (w.aqi > 150) a.push("😷 Poor air quality — limit outdoor activity");
    if (w.windSpeed > 15) a.push("💨 High wind speeds detected");
    if (w.riskScore >= 71) a.push("🚨 High risk zone — claim eligible");
    if (a.length === 0) a.push("✅ No active weather alerts");
    setAlerts(a);

    a.filter((x) => !x.startsWith("✅")).forEach((msg) => {
      addNotification(msg, "warning");
    });

    if (a.length > 0 && a[0] !== "✅ No active weather alerts") {
      setShowNotif(true);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  useEffect(() => {
    if (!weather) return;
    const target = weather.riskScore;
    const duration = 1200;
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(eased * target));
      if (progress >= 1) clearInterval(interval);
    }, 16);
    return () => clearInterval(interval);
  }, [weather?.riskScore]);

  const riskLevel = weather?.riskLevel || "Medium";
  const riskScore = weather?.riskScore || getRiskScore();
  const coverageActive = user?.plan !== "none";
  const premium = getDynamicPremium(riskScore);
  const incomeHistory = getLast7DaysIncome();
  const avgIncome = getAverageIncome();

  const scoreColor = riskScore >= 71 ? "text-destructive" : riskScore >= 31 ? "text-warning" : "neon-text-green";
  const scoreBg = riskScore >= 71 ? "from-destructive/20 to-destructive/5" : riskScore >= 31 ? "from-warning/20 to-warning/5" : "from-accent/20 to-accent/5";

  const cards = [
    { icon: Shield, label: "Active Coverage", value: coverageActive ? "ON" : "OFF", accent: coverageActive ? "neon-text-green" : "text-destructive" },
    { icon: AlertTriangle, label: "Risk Level", value: riskLevel, accent: riskColors[riskLevel] },
  ];

  const weatherBanner = weather?.rain
    ? "🌧️ Heavy rain expected today"
    : weather && weather.temp > 38
    ? "🔥 Extreme heat warning"
    : weather && weather.aqi > 150
    ? "😷 Poor air quality detected"
    : "☀️ Clear conditions today";

  // Income chart bar max
  const maxIncome = Math.max(...incomeHistory, 1);

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-4">
      <NotificationToast notifications={notifications} onDismiss={dismissNotification} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold neon-text-purple">GigShield AI</h1>
          <p className="text-foreground/80 text-sm mt-0.5">Hello, {user?.name || "User"} 👋</p>
        </div>
        <button onClick={() => setShowNotif(!showNotif)} className="relative p-2 glass-card rounded-xl">
          <Bell size={20} className="text-foreground" />
          {alerts.some((a) => !a.startsWith("✅")) && (
            <motion.span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-destructive" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
          )}
        </button>
      </div>

      {!weather && !loadingWeather && (
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} onClick={loadWeather} className="w-full glass-card-glow p-4 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform">
          <MapPin size={16} className="neon-text-blue" />
          <span className="text-sm font-semibold text-foreground">📍 Detect My Location</span>
        </motion.button>
      )}

      {loadingWeather && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 flex flex-col items-center justify-center gap-2">
          <Loader2 size={20} className="animate-spin neon-text-purple" />
          <span className="text-xs text-muted-foreground">Fetching weather for your location...</span>
        </motion.div>
      )}

      {weather && !loadingWeather && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="neon-text-blue" />
              <span className="text-xs text-foreground font-semibold">{weather.city}</span>
              {weather.rain && <span className="text-xs">🌧️</span>}
            </div>
            <button onClick={loadWeather} disabled={loadingWeather} className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-muted/50 transition-colors text-xs text-muted-foreground">
              <RefreshCw size={11} className={loadingWeather ? "animate-spin" : ""} />
              <span>Update</span>
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Thermometer size={12} />{weather.temp}°C</span>
            <span className="flex items-center gap-1"><Droplets size={12} />{weather.humidity}%</span>
            <span className="flex items-center gap-1"><Wind size={12} />{weather.windSpeed} m/s</span>
            <span className="flex items-center gap-1">AQI {weather.aqi}</span>
          </div>
        </motion.div>
      )}

      {/* Fraud Alert */}
      <AnimatePresence>
        {fraudAlert && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card border border-destructive/30 p-3 flex items-start gap-2"
          >
            <AlertTriangle size={16} className="text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-destructive">⚠️ Suspicious Income Detected</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{fraudAlert}</p>
            </div>
            <button onClick={() => setFraudAlert(null)} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Premium Card */}
      {weather && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl gradient-accent">
              <DollarSign size={16} className="text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dynamic Premium</p>
              <p className="text-sm font-bold text-foreground">₹{premium.amount}/day</p>
            </div>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${riskScore > 70 ? "bg-destructive/20 text-destructive" : riskScore > 40 ? "bg-warning/20 text-warning" : "bg-accent/20 neon-text-green"}`}>
            {premium.label}
          </span>
        </motion.div>
      )}

      {/* Daily Income Tracker */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-glow p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Daily Income Tracker</span>
          </div>
          <span className="text-xs text-muted-foreground">Avg: <span className="font-bold neon-text-green">₹{avgIncome}</span></span>
        </div>
        <div className="flex items-end gap-1.5 h-16">
          {incomeHistory.map((val, i) => {
            const height = maxIncome > 0 ? (val / maxIncome) * 100 : 0;
            return (
              <motion.div
                key={i}
                className="flex-1 rounded-t-sm bg-gradient-to-t from-accent/60 to-accent/20 relative group cursor-default"
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(height, 4)}%` }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ₹{val}
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className="flex justify-between text-[8px] text-muted-foreground">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      </motion.div>

      {/* Live Risk Map */}
      {weather && userCoords && (
        <RiskMap lat={userCoords.lat} lon={userCoords.lon} riskLevel={riskLevel} riskScore={riskScore} />
      )}

      {weather && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`glass-card-glow p-5 bg-gradient-to-br ${scoreBg}`}>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">AI Risk Score</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-extrabold ${scoreColor}`}>{animatedScore}</span>
                <span className="text-sm text-muted-foreground">/100</span>
              </div>
              <span className={`text-xs font-semibold ${riskColors[riskLevel]}`}>{riskLevel} Risk</span>
            </div>
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <motion.path d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={riskScore >= 71 ? "hsl(var(--destructive))" : riskScore >= 31 ? "hsl(var(--warning))" : "hsl(var(--accent))"} strokeWidth="3" strokeLinecap="round" strokeDasharray="100" initial={{ strokeDashoffset: 100 }} animate={{ strokeDashoffset: 100 - riskScore }} transition={{ duration: 1.2, ease: "easeOut" }} />
              </svg>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 text-center">
            {[
              { label: "Rain", value: weather.rain ? "Yes" : "No", factor: "40%" },
              { label: "Temp", value: `${weather.temp}°`, factor: "30%" },
              { label: "AQI", value: String(weather.aqi), factor: "20%" },
              { label: "Wind", value: `${weather.windSpeed}`, factor: "10%" },
            ].map((f) => (
              <div key={f.label} className="glass-card p-2 rounded-xl">
                <p className="text-[9px] text-muted-foreground">{f.label} ({f.factor})</p>
                <p className="text-xs font-bold text-foreground">{f.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Auto Trigger Status */}
      {systemResult?.trigger.triggered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card border border-accent/30 p-3 space-y-2"
        >
          <div className="flex items-center gap-2">
            <Zap size={14} className="neon-text-green" />
            <span className="text-xs font-semibold text-foreground">⚡ Auto-Trigger Active</span>
          </div>
          {systemResult.trigger.reasons.map((r, i) => (
            <p key={i} className="text-[11px] text-muted-foreground ml-5">{r}</p>
          ))}
          <p className="text-[10px] neon-text-green ml-5">Payout: ₹{systemResult.payout} (avg income × 50%)</p>
        </motion.div>
      )}

      {/* Wallet */}
      <WalletCard claims={claims} />

      <div className="space-y-3">
        {cards.map((card, i) => (
          <motion.div key={card.label} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="glass-card-glow p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl gradient-primary">
              <card.icon size={20} className="text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className={`text-lg font-bold ${riskColors[card.value as keyof typeof riskColors] || "text-foreground"}`}>{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card overflow-hidden">
        <div className={`${weather?.rain ? "gradient-warning" : "gradient-primary"} p-4 flex items-center gap-3`}>
          <CloudRain size={28} className="text-foreground" />
          <div>
            <p className="font-bold text-foreground text-sm">{weatherBanner}</p>
            <p className="text-xs text-foreground/80">{coverageActive ? "Your coverage is active ✅" : "Subscribe to activate coverage"}</p>
          </div>
        </div>
      </motion.div>

      {/* System Flow Summary */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-3 space-y-1.5">
        <p className="text-[10px] font-semibold text-muted-foreground text-center">🔄 Automated System Flow</p>
        <div className="flex items-center justify-center gap-1 text-[9px] text-muted-foreground flex-wrap">
          {["Weather", "→", "Risk", "→", "Premium", "→", "Trigger", "→", "Claim"].map((s, i) => (
            <span key={i} className={s === "→" ? "text-accent" : "glass-card px-1.5 py-0.5 rounded text-foreground"}>
              {s}
            </span>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground text-center">
          🧠 Risk calculated using real-time weather, location data, and historical patterns.
          <span className="neon-text-blue ml-1 cursor-help" title="We combine rain (40%), temperature (30%), AQI (20%), and wind (10%) to compute your risk score.">How it works →</span>
        </p>
      </motion.div>
    </div>
  );
};

export default HomeScreen;
