import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { getUser, saveUser } from "../lib/store";
import PaymentPopup from "../components/PaymentPopup";

const plans = [
  { name: "Basic" as const, price: "₹10/week", coverage: "₹300", amount: 10, features: ["Weather coverage", "Basic claims", "Email support"] },
  { name: "Standard" as const, price: "₹20/week", coverage: "₹600", amount: 20, features: ["All Basic features", "Priority claims", "24/7 support", "AI risk alerts"], popular: true },
  { name: "Pro" as const, price: "₹30/week", coverage: "₹1,000", amount: 30, features: ["All Standard features", "Instant payouts", "Multi-risk coverage", "Dedicated manager"] },
];

const PlansScreen = () => {
  const [selected, setSelected] = useState(1);
  const [step, setStep] = useState<"idle" | "paying" | "success">("idle");
  const user = getUser();

  const handleSubscribe = () => {
    setStep("paying");
    setTimeout(() => setStep("success"), 2000);
  };

  const handlePaymentDone = () => {
    const plan = plans[selected];
    if (user) {
      saveUser({ ...user, plan: plan.name, coverageActive: true });
    }
    setStep("idle");
  };

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Choose Your Plan</h2>
        <p className="text-sm text-muted-foreground mt-1">AI-powered coverage for gig workers</p>
      </div>

      {user?.plan && user.plan !== "none" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-accent p-3 flex items-center gap-2">
          <CheckCircle2 size={16} className="neon-text-green" />
          <span className="text-sm text-foreground">Active plan: <strong className="neon-text-green">{user.plan}</strong></span>
        </motion.div>
      )}

      <div className="space-y-4">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelected(i)}
            className={`relative cursor-pointer transition-all duration-300 p-5 rounded-2xl border ${
              selected === i
                ? "glass-card-glow border-primary/40"
                : "glass-card border-white/5 hover:border-white/15"
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-2.5 right-4 gradient-accent text-accent-foreground text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Sparkles size={10} /> POPULAR
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-foreground text-lg">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.price}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold neon-text-green">{plan.coverage}</p>
                <p className="text-[10px] text-muted-foreground">coverage</p>
              </div>
            </div>

            <div className="space-y-2">
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                  <Check size={14} className="neon-text-green" />
                  {f}
                </div>
              ))}
            </div>

            {selected === i && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={(e) => { e.stopPropagation(); handleSubscribe(); }}
                className="btn-accent-glow w-full mt-4 text-sm flex items-center justify-center gap-2"
              >
                {step === "paying" ? <Loader2 size={16} className="animate-spin" /> : null}
                {step === "paying" ? "Processing..." : `Subscribe to ${plan.name} — ₹${plan.amount}`}
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      <PaymentPopup
        open={step === "success"}
        onClose={handlePaymentDone}
        amount={plans[selected].amount}
      />
    </div>
  );
};

export default PlansScreen;
