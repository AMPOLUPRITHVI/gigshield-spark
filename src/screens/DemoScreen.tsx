import { motion, AnimatePresence } from "framer-motion";
import { CloudRain, Zap, TrendingDown, Loader2 } from "lucide-react";
import { useState } from "react";
import PaymentPopup from "../components/PaymentPopup";
import { addClaim } from "../lib/store";

const DemoScreen = () => {
  const [step, setStep] = useState<"idle" | "loading" | "success">("idle");
  const [income, setIncome] = useState(800);
  const [lossPct, setLossPct] = useState(50);

  const payout = Math.round(income * (lossPct / 100));

  const handleSimulate = () => {
    setStep("loading");
    setTimeout(() => setStep("success"), 2000);
  };

  const handleClose = () => {
    const txnId = `TXN${Math.floor(100000 + Math.random() * 900000)}`;
    const time = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    addClaim({
      type: "Rain Claim",
      amount: payout,
      txnId,
      date: `Just now, ${time}`,
      status: "Credited",
    });
    setStep("idle");
  };

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">🌧️ Live Claim Simulation</h2>
        <p className="text-sm text-muted-foreground mt-1">See how instant payouts work</p>
      </div>

      {/* Scenario Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-glow p-5 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl gradient-primary">
            <CloudRain size={22} className="text-foreground" />
          </div>
          <div>
            <p className="font-bold text-foreground">Rain Scenario</p>
            <p className="text-xs text-muted-foreground">Real-time weather simulation</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Income", value: `₹${income}/day`, icon: TrendingDown },
            { label: "Rain", value: "YES", icon: CloudRain },
            { label: "Loss", value: `${lossPct}%`, icon: Zap },
          ].map((item) => (
            <div key={item.label} className="glass-card p-3 text-center space-y-1">
              <item.icon size={16} className="mx-auto text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
              <p className="text-sm font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Editable Inputs */}
      <div className="glass-card p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Daily Income (₹)</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
            className="w-full glass-card p-3 bg-transparent text-foreground outline-none rounded-xl text-sm font-semibold"
          />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Loss Percentage</span>
            <span className="text-foreground font-semibold">{lossPct}%</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={lossPct}
            onChange={(e) => setLossPct(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </div>
      </div>

      {/* Claim Calculation */}
      <div className="glass-card p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Daily Income</span>
          <span className="text-foreground">₹{income}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Loss Percentage</span>
          <span className="text-destructive">-{lossPct}%</span>
        </div>
        <div className="h-px bg-white/10 my-1" />
        <div className="flex justify-between text-sm font-bold">
          <span className="text-foreground">Claim Amount</span>
          <span className="neon-text-green">₹{payout}</span>
        </div>
      </div>

      {/* Simulate Button */}
      <AnimatePresence mode="wait">
        {step === "idle" && (
          <motion.button
            key="btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSimulate}
            className="btn-accent-glow w-full text-base pulse-glow flex items-center justify-center gap-2"
          >
            <Zap size={18} /> Simulate Claim
          </motion.button>
        )}

        {step === "loading" && (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card-glow p-6 text-center space-y-3"
          >
            <Loader2 size={36} className="mx-auto neon-text-purple animate-spin" />
            <p className="text-sm font-semibold text-foreground">⏳ Processing claim...</p>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full gradient-primary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Popup */}
      <PaymentPopup
        open={step === "success"}
        onClose={handleClose}
        amount={payout}
      />
    </div>
  );
};

export default DemoScreen;
