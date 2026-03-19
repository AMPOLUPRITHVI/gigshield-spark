import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Basic",
    price: "₹10/week",
    coverage: "₹300",
    features: ["Weather coverage", "Basic claims", "Email support"],
    popular: false,
  },
  {
    name: "Standard",
    price: "₹20/week",
    coverage: "₹600",
    features: ["All Basic features", "Priority claims", "24/7 support", "AI risk alerts"],
    popular: true,
  },
  {
    name: "Pro",
    price: "₹30/week",
    coverage: "₹1,000",
    features: ["All Standard features", "Instant payouts", "Multi-risk coverage", "Dedicated manager"],
    popular: false,
  },
];

const PlansScreen = () => {
  const [selected, setSelected] = useState(1);

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Choose Your Plan</h2>
        <p className="text-sm text-muted-foreground mt-1">AI-powered coverage for gig workers</p>
      </div>

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
                className="btn-accent-glow w-full mt-4 text-sm"
              >
                Subscribe to {plan.name}
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PlansScreen;
