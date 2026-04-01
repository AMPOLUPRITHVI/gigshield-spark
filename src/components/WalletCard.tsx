import { motion } from "framer-motion";
import { Wallet, ArrowDownRight, TrendingUp } from "lucide-react";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";
import { type Claim } from "@/lib/supabase-store";

interface WalletCardProps {
  claims: Claim[];
}

const WalletCard = ({ claims }: WalletCardProps) => {
  const totalPayout = claims
    .filter((c) => c.status === "Credited")
    .reduce((sum, c) => sum + c.payout, 0);

  const weeklyPayout = claims
    .filter((c) => {
      const claimDate = new Date(c.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return c.status === "Credited" && claimDate >= weekAgo;
    })
    .reduce((sum, c) => sum + c.payout, 0);

  const animatedTotal = useAnimatedCounter(totalPayout);
  const animatedWeekly = useAnimatedCounter(weeklyPayout);

  const recentPayouts = claims
    .filter((c) => c.status === "Credited")
    .slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card-glow p-4 space-y-3"
    >
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl gradient-accent">
          <Wallet size={16} className="text-accent-foreground" />
        </div>
        <span className="text-xs font-semibold text-foreground">Wallet</span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground">Total Balance</p>
          <p className="text-2xl font-extrabold neon-text-green">₹{animatedTotal.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">This Week</p>
          <div className="flex items-center gap-1">
            <TrendingUp size={12} className="neon-text-green" />
            <p className="text-sm font-bold neon-text-green">₹{animatedWeekly.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {recentPayouts.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-white/10">
          <p className="text-[10px] text-muted-foreground">Recent Payouts</p>
          {recentPayouts.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ArrowDownRight size={12} className="neon-text-green" />
                <span className="text-foreground">{p.type}</span>
              </div>
              <div className="text-right">
                <span className="font-semibold neon-text-green">+₹{p.payout}</span>
                <span className="text-muted-foreground ml-2 text-[10px]">{p.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default WalletCard;
