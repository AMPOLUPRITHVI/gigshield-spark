import { motion } from "framer-motion";
import { CloudRain, Sun, CheckCircle2, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchClaims, exportData, type Claim } from "../lib/supabase-store";

const HistoryScreen = () => {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClaims().then((data) => {
      setClaims(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Claim History</h2>
          <p className="text-sm text-muted-foreground mt-1">Your past payouts</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportData("json")} className="glass-card px-3 py-1.5 text-[10px] text-foreground font-medium rounded-lg flex items-center gap-1">
            <Download size={10} /> JSON
          </button>
          <button onClick={() => exportData("csv")} className="glass-card px-3 py-1.5 text-[10px] text-foreground font-medium rounded-lg flex items-center gap-1">
            <Download size={10} /> CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="glass-card p-8 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : claims.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground text-sm">No claims yet. Try the Demo!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim, i) => (
            <motion.div
              key={claim.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card-glow p-4 flex items-center gap-4"
            >
              <div className="p-2.5 rounded-xl gradient-primary">
                {claim.type.includes("Rain") ? <CloudRain size={18} className="text-foreground" /> : <Sun size={18} className="text-foreground" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">{claim.type}</p>
                <p className="text-xs text-muted-foreground">{claim.date}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{claim.txnId}</p>
              </div>
              <div className="text-right">
                <p className="font-bold neon-text-green text-sm">₹{claim.payout}</p>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <CheckCircle2 size={10} className="neon-text-green" />
                  {claim.status}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;
