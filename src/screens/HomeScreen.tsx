import { motion } from "framer-motion";
import { Shield, TrendingUp, AlertTriangle, CloudRain, Bell, MapPin, Loader2, Thermometer, Wind, Droplets } from "lucide-react";
import { useState, useEffect } from "react";
import { getUser, getRiskPreference, setRiskPreference } from "../lib/store";
import { fetchWeather, getUserLocation, type WeatherResult } from "../lib/weather";

const riskLevels = ["Low", "Medium", "High"] as const;
const riskColors = {
  Low: "neon-text-green",
  Medium: "text-warning",
  High: "text-destructive",
};

const HomeScreen = () => {
  const user = getUser();
  const [risk, setRisk] = useState<(typeof riskLevels)[number]>(getRiskPreference());
  const [showNotif, setShowNotif] = useState(true);
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const loadWeather = async () => {
    setLoadingWeather(true);
    try {
      const { lat, lon } = await getUserLocation();
      const data = await fetchWeather(lat, lon);
      setWeather(data);
      setRisk(data.riskLevel);
      setRiskPreference(data.riskLevel);
    } catch {
      const data = await fetchWeather(17.385, 78.4867); // Hyderabad fallback
      setWeather(data);
    } finally {
      setLoadingWeather(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const handleRiskChange = (level: typeof riskLevels[number]) => {
    setRisk(level);
    setRiskPreference(level);
  };

  const earningsProtected = user?.plan === "none" ? "₹0" : risk === "High" ? "₹1,200" : risk === "Medium" ? "₹800" : "₹400";
  const coverageActive = user?.plan !== "none";

  const cards = [
    { icon: TrendingUp, label: "Today's Earnings Protected", value: earningsProtected, accent: "neon-blue" },
    { icon: Shield, label: "Active Coverage", value: coverageActive ? "ON" : "OFF", accent: coverageActive ? "neon-green" : "destructive" },
    { icon: AlertTriangle, label: "Risk Level Today", value: risk, accent: risk === "High" ? "destructive" : risk === "Medium" ? "warning" : "neon-green" },
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
          </div>
        </motion.div>
      )}
      {loadingWeather && (
        <div className="glass-card p-3 flex items-center justify-center gap-2">
          <Loader2 size={14} className="animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Loading weather...</span>
        </div>
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

      {/* Risk Toggle */}
      <div className="glass-card p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">Risk Level Override</p>
        <div className="flex gap-2">
          {riskLevels.map((level) => (
            <button
              key={level}
              onClick={() => handleRiskChange(level)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                risk === level
                  ? level === "High"
                    ? "bg-destructive/20 text-destructive border border-destructive/30"
                    : level === "Medium"
                    ? "bg-warning/20 text-warning border border-warning/30"
                    : "bg-accent/20 neon-text-green border border-accent/30"
                  : "glass-card text-muted-foreground"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
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
