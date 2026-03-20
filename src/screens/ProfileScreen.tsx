import { motion } from "framer-motion";
import { User, Shield, BarChart3, Settings, ChevronRight, Server, PieChart } from "lucide-react";
import { getUser, getClaims, exportData } from "../lib/store";

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

const ProfileScreen = ({ onNavigate }: ProfileScreenProps) => {
  const user = getUser();
  const claims = getClaims();
  const totalPayout = claims.reduce((s, c) => s + c.amount, 0);

  const menuItems = [
    { icon: Shield, label: "Admin Dashboard", desc: "Claims, fraud alerts, analytics", target: "admin" },
    { icon: PieChart, label: "Analytics", desc: "Performance & insights", target: "analytics" },
    { icon: Server, label: "System Architecture", desc: "Frontend → API → AI → DB → Payment", target: "" },
    { icon: Settings, label: "Settings", desc: "Account preferences", target: "settings" },
  ];

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-glow p-5 flex items-center gap-4"
      >
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center">
          <User size={28} className="text-foreground" />
        </div>
        <div>
          <h2 className="font-bold text-foreground text-lg">{user?.name || "User"}</h2>
          <p className="text-sm text-muted-foreground">Gig Worker · {user?.city || "Unknown"}</p>
          <p className="text-xs neon-text-green mt-0.5">{user?.plan === "none" ? "No Plan" : `${user?.plan} Plan`}</p>
        </div>
      </motion.div>

      {/* Admin Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Claims", value: String(claims.length) },
          { label: "Fraud Alerts", value: "2" },
          { label: "Payout", value: `₹${totalPayout >= 1000 ? `${(totalPayout / 1000).toFixed(1)}K` : totalPayout}` },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-3 text-center"
          >
            <p className="text-lg font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Menu */}
      <div className="space-y-2">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => item.target && onNavigate(item.target)}
            className="glass-card w-full p-4 flex items-center gap-3 text-left hover:border-white/20 transition-all duration-300"
          >
            <div className="p-2 rounded-xl gradient-primary">
              <item.icon size={16} className="text-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground" />
          </motion.button>
        ))}
      </div>

      {/* Architecture Flow */}
      <div className="glass-card p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">System Architecture</p>
        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
          {["Frontend", "API", "AI Engine", "Database", "Payment"].map((step, i) => (
            <div key={step} className="flex items-center gap-1">
              <span className="glass-card px-2 py-1 rounded-lg text-foreground">{step}</span>
              {i < 4 && <span className="neon-text-purple">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div className="flex gap-3">
        <button onClick={() => exportData("json")} className="flex-1 btn-primary-glow text-sm py-2">Export JSON</button>
        <button onClick={() => exportData("csv")} className="flex-1 glass-card text-sm py-2 text-foreground font-semibold text-center">Export CSV</button>
      </div>
    </div>
  );
};

export default ProfileScreen;
