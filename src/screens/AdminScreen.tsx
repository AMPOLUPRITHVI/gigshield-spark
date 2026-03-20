import { motion } from "framer-motion";
import { Shield, AlertTriangle, TrendingUp, Users, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { getClaims } from "../lib/store";

const weeklyData = [
  { day: "Mon", claims: 4, fraud: 0 },
  { day: "Tue", claims: 7, fraud: 1 },
  { day: "Wed", claims: 3, fraud: 0 },
  { day: "Thu", claims: 8, fraud: 2 },
  { day: "Fri", claims: 6, fraud: 0 },
  { day: "Sat", claims: 5, fraud: 1 },
  { day: "Sun", claims: 2, fraud: 0 },
];

const monthlyTrend = [
  { month: "Jan", earnings: 4200 },
  { month: "Feb", earnings: 5800 },
  { month: "Mar", earnings: 3900 },
  { month: "Apr", earnings: 6200 },
  { month: "May", earnings: 7100 },
  { month: "Jun", earnings: 5400 },
];

const riskDistribution = [
  { name: "Low", value: 40, color: "hsl(145, 80%, 50%)" },
  { name: "Medium", value: 35, color: "hsl(40, 95%, 55%)" },
  { name: "High", value: 25, color: "hsl(0, 84%, 60%)" },
];

const AdminScreen = () => {
  const claims = getClaims();
  const totalPayout = claims.reduce((s, c) => s + c.amount, 0);

  const stats = [
    { icon: BarChart3, label: "Total Claims", value: String(claims.length), accent: "neon-text-blue" },
    { icon: AlertTriangle, label: "Fraud Alerts", value: "2", accent: "text-destructive" },
    { icon: TrendingUp, label: "Total Payout", value: `₹${totalPayout.toLocaleString()}`, accent: "neon-text-green" },
    { icon: Users, label: "Active Users", value: "156", accent: "neon-text-purple" },
  ];

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Claims, fraud & analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card-glow p-4 space-y-2"
          >
            <div className="p-2 rounded-xl gradient-primary w-fit">
              <stat.icon size={16} className="text-foreground" />
            </div>
            <p className={`text-xl font-bold ${stat.accent}`}>{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly Claims Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-4 space-y-3"
      >
        <p className="text-sm font-semibold text-foreground">Weekly Claims</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyData}>
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
            <Bar dataKey="claims" fill="hsl(250, 80%, 60%)" radius={[6, 6, 0, 0]} />
            <Bar dataKey="fraud" fill="hsl(0, 84%, 60%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Monthly Earnings Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-4 space-y-3"
      >
        <p className="text-sm font-semibold text-foreground">Earnings Protected (Monthly)</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={monthlyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(230, 20%, 18%)" />
            <XAxis dataKey="month" tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} />
            <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 11 }} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(230, 25%, 11%)",
                border: "1px solid hsl(230, 20%, 18%)",
                borderRadius: "12px",
                color: "hsl(210, 40%, 98%)",
              }}
            />
            <Line type="monotone" dataKey="earnings" stroke="hsl(145, 80%, 50%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(145, 80%, 50%)" }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Risk Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4 space-y-3"
      >
        <p className="text-sm font-semibold text-foreground">Risk Distribution</p>
        <div className="flex items-center">
          <ResponsiveContainer width="50%" height={140}>
            <PieChart>
              <Pie data={riskDistribution} innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={4}>
                {riskDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {riskDistribution.map((r) => (
              <div key={r.name} className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full" style={{ background: r.color }} />
                <span className="text-muted-foreground">{r.name}</span>
                <span className="font-bold text-foreground">{r.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Fraud Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-4 space-y-3"
      >
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-destructive" />
          <p className="text-sm font-semibold text-foreground">Recent Fraud Alerts</p>
        </div>
        {[
          { id: "FA-001", desc: "Duplicate claim detected — Rain coverage", time: "2h ago", severity: "High" },
          { id: "FA-002", desc: "Unusual payout pattern — User #47", time: "5h ago", severity: "Medium" },
        ].map((alert) => (
          <div key={alert.id} className="glass-card p-3 flex items-center gap-3">
            <AlertTriangle size={16} className={alert.severity === "High" ? "text-destructive" : "text-warning"} />
            <div className="flex-1">
              <p className="text-xs font-semibold text-foreground">{alert.desc}</p>
              <p className="text-[10px] text-muted-foreground">{alert.id} · {alert.time}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default AdminScreen;
