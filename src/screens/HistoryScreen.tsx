import { motion } from "framer-motion";
import { CloudRain, Sun, CheckCircle2 } from "lucide-react";

const claims = [
  { type: "Rain Claim", amount: "₹400", icon: CloudRain, date: "Today, 2:30 PM", status: "Credited" },
  { type: "Heat Claim", amount: "₹250", icon: Sun, date: "Yesterday, 11:15 AM", status: "Credited" },
  { type: "Rain Claim", amount: "₹350", icon: CloudRain, date: "Mar 16, 4:00 PM", status: "Credited" },
  { type: "Heat Claim", amount: "₹200", icon: Sun, date: "Mar 14, 1:45 PM", status: "Credited" },
];

const HistoryScreen = () => (
  <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5">
    <div>
      <h2 className="text-xl font-bold text-foreground">Claim History</h2>
      <p className="text-sm text-muted-foreground mt-1">Your past payouts</p>
    </div>

    <div className="space-y-3">
      {claims.map((claim, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass-card-glow p-4 flex items-center gap-4"
        >
          <div className="p-2.5 rounded-xl gradient-primary">
            <claim.icon size={18} className="text-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">{claim.type}</p>
            <p className="text-xs text-muted-foreground">{claim.date}</p>
          </div>
          <div className="text-right">
            <p className="font-bold neon-text-green text-sm">{claim.amount}</p>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <CheckCircle2 size={10} className="neon-text-green" />
              {claim.status}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default HistoryScreen;
