import { motion } from "framer-motion";
import { TrendingUp, Shield, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getClaims } from "../lib/store";

const weeklyTrend = [
  { week: "W1", claims: 12, protected: 4800 },
  { week: "W2", claims: 8, protected: 3200 },
  { week: "W3", claims: 15, protected: 6000 },
  { week: "W4", claims: 10, protected: 4000 },
];

const AnalyticsScreen = () => {
  const claims = getClaims();
  const totalPayout = claims.reduce((s, c) => s + c.amount, 0);

  const metrics = [
    { icon: TrendingUp, label: "Total Protected", value: `₹${(totalPayout * 3).toLocaleString()}`, sub: "All time", accent: "neon-text-green" },
    { icon: Shield, label: "Total Claims", value: String(claims.length), sub: "Processed", accent: "neon-text-blue" },
    { icon: Zap, label: "Avg Response", value: "2.1s", sub: "Claim processing", accent: "neon-text-purple" },
  ];

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">Performance & trends</p>
      </div>

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

      {/* Weekly Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4 space-y-3"
      >
        <p className="text-sm font-semibold text-foreground">Weekly Trends</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weeklyTrend}>
            <defs>
              <linearGradient id="colorProtected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(145, 80%, 50%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(145, 80%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 18%)" />
            <XAxis dataKey="week" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(230, 25%, 11%)",
                border: "1px solid hsl(230, 20%, 18%)",
                borderRadius: "12px",
                color: "hsl(210, 40%, 98%)",
              }}
            />
            <Area type="monotone" dataKey="protected" stroke="hsl(145, 80%, 50%)" fillOpacity={1} fill="url(#colorProtected)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Progress Bars */}
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
    </div>
  );
};

export default AnalyticsScreen;
