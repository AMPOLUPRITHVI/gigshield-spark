import { motion, AnimatePresence } from "framer-motion";
import { CloudRain, Zap, TrendingDown, Loader2, ShieldAlert, AlertTriangle, CheckCircle2, DollarSign } from "lucide-react";
import { useState } from "react";
import PaymentPopup from "../components/PaymentPopup";
import { getRiskScore, createClaim } from "../lib/supabase-store";
import { useAnimatedCounter } from "../hooks/useAnimatedCounter";
import { toast } from "@/hooks/use-toast";
import ClaimTimeline from "@/components/ClaimTimeline";
import { validateIncome, getAverageIncome, getDynamicPremium, addDailyIncome } from "@/lib/income-tracker";

const DemoScreen = () => {
  const [step, setStep] = useState<"idle" | "validating" | "loading" | "fraud" | "success">("idle");
  const [timelineStep, setTimelineStep] = useState(0);
  const [income, setIncome] = useState(800);
  const [lossPct, setLossPct] = useState(50);
  const [fraudMsg, setFraudMsg] = useState("");
  const [claimPayout, setClaimPayout] = useState(0);
  const [incomeWarning, setIncomeWarning] = useState<string | null>(null);

  const riskScore = getRiskScore();
  const avgIncome = getAverageIncome();
  const premium = getDynamicPremium(riskScore);

  // Validate income on change
  const handleIncomeChange = (val: number) => {
    setIncome(Math.max(0, val));
    const validation = validateIncome(val);
    if (validation.suspicious) {
      setIncomeWarning(validation.message || null);
    } else {
      setIncomeWarning(null);
    }
  };

  // Use validated income for payout
  const validation = validateIncome(income);
  const effectiveIncome = validation.adjustedIncome;
  const payout = Math.round(effectiveIncome * (lossPct / 100));
  const animatedPayout = useAnimatedCounter(payout, 600);

  const handleSimulate = async () => {
    setStep("validating");
    setTimelineStep(1);

    // Track income
    addDailyIncome(income);

    setTimeout(async () => {
      setTimelineStep(2);
      try {
        setStep("loading");
        setTimelineStep(3);
        const result = await createClaim(effectiveIncome, lossPct, "Rain Claim", riskScore);
        setClaimPayout(result.payout);
        setTimelineStep(4);
        setTimeout(() => setStep("success"), 1500);
      } catch (error: any) {
        setFraudMsg(error.message || "Suspicious activity detected");
        setStep("fraud");
        setTimelineStep(0);
      }
    }, 1200);
  };

  const handleClose = () => {
    toast({ title: "Claim processed!", description: `₹${claimPayout} credited to your account` });
    setStep("idle");
    setTimelineStep(0);
  };

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">🌧️ Live Claim Simulation</h2>
        <p className="text-sm text-muted-foreground mt-1">See how instant payouts work</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card-glow p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl gradient-primary"><CloudRain size={22} className="text-foreground" /></div>
          <div className="flex-1">
            <p className="font-bold text-foreground">Rain Scenario</p>
            <p className="text-xs text-muted-foreground">Real-time weather simulation</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Risk Score</p>
            <p className={`text-sm font-bold ${riskScore >= 71 ? "text-destructive" : riskScore >= 31 ? "text-warning" : "neon-text-green"}`}>{riskScore}/100</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Avg Income", value: `₹${avgIncome}/day`, icon: TrendingDown },
            { label: "Rain", value: "YES", icon: CloudRain },
            { label: "Premium", value: `₹${premium.amount}`, icon: DollarSign },
          ].map((item) => (
            <div key={item.label} className="glass-card p-3 text-center space-y-1">
              <item.icon size={16} className="mx-auto text-muted-foreground" />
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
              <p className="text-sm font-bold text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="glass-card p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Daily Income (₹)</label>
          <input type="number" value={income} onChange={(e) => handleIncomeChange(Number(e.target.value))} className="w-full glass-card p-3 bg-transparent text-foreground outline-none rounded-xl text-sm font-semibold" />
          {/* Income Fraud Warning */}
          <AnimatePresence>
            {incomeWarning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-1.5 text-[10px] text-destructive mt-1"
              >
                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                <span>{incomeWarning}</span>
              </motion.div>
            )}
          </AnimatePresence>
          {avgIncome > 0 && (
            <p className="text-[10px] text-muted-foreground">7-day avg: ₹{avgIncome} • Using {validation.suspicious ? "average" : "entered"} income for payout</p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Loss Percentage</span>
            <span className="text-foreground font-semibold">{lossPct}%</span>
          </div>
          <input type="range" min={10} max={100} step={5} value={lossPct} onChange={(e) => setLossPct(Number(e.target.value))} className="w-full accent-accent" />
        </div>
      </div>

      <div className="glass-card p-4 space-y-2">
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Effective Income</span><span className="text-foreground">₹{effectiveIncome}</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Loss Percentage</span><span className="text-destructive">-{lossPct}%</span></div>
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Dynamic Premium</span><span className="text-foreground">₹{premium.amount}/day</span></div>
        <div className="h-px bg-white/10 my-1" />
        <div className="flex justify-between text-sm font-bold"><span className="text-foreground">Estimated Payout</span><span className="neon-text-green text-lg">₹{animatedPayout}</span></div>
      </div>

      {/* Claim Timeline */}
      {step !== "idle" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
          <p className="text-xs font-semibold text-foreground mb-3">🕒 Claim Progress</p>
          <ClaimTimeline step={timelineStep} />
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {step === "idle" && (
          <motion.button key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleSimulate} className="btn-accent-glow w-full text-base pulse-glow flex items-center justify-center gap-2">
            <Zap size={18} /> Simulate Claim
          </motion.button>
        )}
        {step === "validating" && (
          <motion.div key="validating" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card-glow p-6 text-center space-y-3">
            <ShieldAlert size={36} className="mx-auto neon-text-blue animate-pulse" />
            <p className="text-sm font-semibold text-foreground">🔍 Running risk validation...</p>
            <p className="text-xs text-muted-foreground">Checking fraud patterns, income validation & risk level</p>
          </motion.div>
        )}
        {step === "fraud" && (
          <motion.div key="fraud" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card p-6 text-center space-y-3 border border-destructive/30">
            <AlertTriangle size={36} className="mx-auto text-destructive" />
            <p className="text-sm font-bold text-destructive">⚠️ Claim Blocked</p>
            <p className="text-xs text-muted-foreground">{fraudMsg}</p>
            <button onClick={() => setStep("idle")} className="btn-primary-glow w-full text-sm mt-2">Try Again</button>
          </motion.div>
        )}
        {step === "loading" && (
          <motion.div key="loader" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="glass-card-glow p-6 text-center space-y-3">
            <Loader2 size={36} className="mx-auto neon-text-purple animate-spin" />
            <p className="text-sm font-semibold text-foreground">⏳ Processing claim...</p>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div className="h-full gradient-primary rounded-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 2 }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <PaymentPopup open={step === "success"} onClose={handleClose} amount={claimPayout || payout} />
    </div>
  );
};

export default DemoScreen;
