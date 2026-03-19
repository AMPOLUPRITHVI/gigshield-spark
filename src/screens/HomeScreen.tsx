import { motion } from "framer-motion";
import { Shield, TrendingUp, AlertTriangle, CloudRain, Bell } from "lucide-react";
import { useState } from "react";

const riskLevels = ["Low", "Medium", "High"] as const;
const riskColors = {
  Low: "neon-text-green",
  Medium: "text-warning",
  High: "text-destructive",
};

const HomeScreen = () => {
  const [risk, setRisk] = useState<(typeof riskLevels)[number]>("High");
  const [showNotif, setShowNotif] = useState(true);

  const cards = [
    { icon: TrendingUp, label: "Today's Earnings Protected", value: "₹1,200", accent: "neon-blue" },
    { icon: Shield, label: "Active Coverage", value: "ON", accent: "neon-green" },
    { icon: AlertTriangle, label: "Risk Level Today", value: risk, accent: risk === "High" ? "destructive" : risk === "Medium" ? "warning" : "neon-green" },
  ];

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold neon-text-purple">GigShield AI</h1>
          <p className="text-foreground/80 text-sm mt-0.5">Hello, Prudhvi 👋</p>
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

      {/* Notification */}
      {showNotif && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 border-l-4 border-warning"
        >
          <p className="text-sm text-warning font-medium">⚠️ High rain risk tomorrow</p>
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
            <div className={`p-2.5 rounded-xl gradient-primary`}>
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
              onClick={() => setRisk(level)}
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
        <div className="gradient-warning p-4 flex items-center gap-3">
          <CloudRain size={28} className="text-foreground" />
          <div>
            <p className="font-bold text-foreground text-sm">⚠️ Heavy rain expected today</p>
            <p className="text-xs text-foreground/80">Stay safe & activate your coverage</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HomeScreen;
