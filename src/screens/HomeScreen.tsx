import { motion } from "framer-motion";
import { Shield, TrendingUp, AlertTriangle, CloudRain, Bell, MapPin, Loader2, Thermometer, Wind, Droplets, Gauge, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { getUser, getRiskScore, setRiskScore } from "../lib/store";
import { fetchWeather, getUserLocation, type WeatherResult } from "../lib/weather";

const riskColors = {
  Low: "neon-text-green",
  Medium: "text-warning",
  High: "text-destructive",
};

const HomeScreen = () => {
  const user = getUser();
  const [showNotif, setShowNotif] = useState(true);
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);

  const loadWeather = async () => {
    setLoadingWeather(true);
    try {
      const { lat, lon } = await getUserLocation();
      const data = await fetchWeather(lat, lon);
      setWeather(data);
      setRiskScore(data.riskScore);
    } catch {
      const data = await fetchWeather(17.385, 78.4867);
      setWeather(data);
      setRiskScore(data.riskScore);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  // Animated counter for risk score
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
  const earningsProtected = user?.plan === "none" ? "₹0" : riskLevel === "High" ? "₹1,200" : riskLevel === "Medium" ? "₹800" : "₹400";
  const coverageActive = user?.plan !== "none";

  const scoreColor = riskScore >= 71 ? "text-destructive" : riskScore >= 31 ? "text-warning" : "neon-text-green";
  const scoreBg = riskScore >= 71 ? "from-destructive/20 to-destructive/5" : riskScore >= 31 ? "from-warning/20 to-warning/5" : "from-accent/20 to-accent/5";

  const cards = [
    { icon: TrendingUp, label: "Earnings Protected", value: earningsProtected, accent: "neon-text-blue" },
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

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold neon-text-purple">GigShield AI</h1>
          <p className="text-foreground/80 text-sm mt-0.5">Hello, {user?.name || "User"} 👋</p>
        </div>
        <button
          onClick={() => setShowNotif(!showNotif)}
          className="relative p-2 glass-card rounded-xl"
        >
          <Bell size={20} className="text-foreground" />
          {showNotif && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
          )}
        </button>
      </div>

      {/* Weather Strip */}
      {weather && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-muted-foreground" />
            <span className="text-xs text-foreground font-medium">{weather.city}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Thermometer size={12} />{weather.temp}°C</span>
            <span className="flex items-center gap-1"><Droplets size={12} />{weather.humidity}%</span>
            <span className="flex items-center gap-1"><Wind size={12} />{weather.windSpeed} m/s</span>
            <button onClick={loadWeather} disabled={loadingWeather} className="p-1 rounded-lg hover:bg-muted/50 transition-colors">
              <RefreshCw size={12} className={loadingWeather ? "animate-spin" : ""} />
            </button>
          </div>
        </motion.div>
      )}
      {loadingWeather && !weather && (
        <div className="glass-card p-3 flex items-center justify-center gap-2">
          <Loader2 size={14} className="animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Detecting location & weather...</span>
        </div>
      )}

      {/* Risk Score Gauge */}
      {weather && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`glass-card-glow p-5 bg-gradient-to-br ${scoreBg}`}
        >
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
              <span className={`text-xs font-semibold ${riskColors[riskLevel]}`}>
                {riskLevel} Risk
              </span>
            </div>
            {/* Mini circular gauge */}
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <path
                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="3"
                />
                <motion.path
                  d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke={riskScore >= 71 ? "hsl(var(--destructive))" : riskScore >= 31 ? "hsl(var(--warning))" : "hsl(var(--accent))"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="100"
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - riskScore }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
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

      {/* Notification */}
      {showNotif && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 border-l-4 border-warning"
        >
          <p className="text-sm text-warning font-medium">⚠️ {weather?.rain ? "High rain risk — stay safe" : "Weather alert active"}</p>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="space-y-3">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card-glow p-4 flex items-center gap-4"
          >
            <div className="p-2.5 rounded-xl gradient-primary">
              <card.icon size={20} className="text-foreground" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className={`text-lg font-bold ${riskColors[card.value as keyof typeof riskColors] || "text-foreground"}`}>
                {card.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Weather Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        <div className={`${weather?.rain ? "gradient-warning" : "gradient-primary"} p-4 flex items-center gap-3`}>
          <CloudRain size={28} className="text-foreground" />
          <div>
            <p className="font-bold text-foreground text-sm">{weatherBanner}</p>
            <p className="text-xs text-foreground/80">{coverageActive ? "Your coverage is active ✅" : "Subscribe to activate coverage"}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomeScreen;
