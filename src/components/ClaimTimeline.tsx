import { motion } from "framer-motion";
import { Cloud, Gauge, ShieldCheck, CreditCard, CheckCircle2 } from "lucide-react";

interface ClaimTimelineProps {
  step: number; // 0-4
}

const steps = [
  { icon: Cloud, label: "Weather Detected", desc: "Real-time data received" },
  { icon: Gauge, label: "Risk Calculated", desc: "AI score computed" },
  { icon: ShieldCheck, label: "Fraud Check Passed", desc: "No suspicious activity" },
  { icon: CreditCard, label: "Payment Processed", desc: "Payout credited" },
];

const ClaimTimeline = ({ step }: ClaimTimelineProps) => {
  return (
    <div className="space-y-1">
      {steps.map((s, i) => {
        const completed = i < step;
        const active = i === step;
        return (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-3"
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  completed
                    ? "gradient-accent"
                    : active
                    ? "gradient-primary animate-pulse"
                    : "bg-muted/30"
                }`}
              >
                {completed ? (
                  <CheckCircle2 size={14} className="text-accent-foreground" />
                ) : (
                  <s.icon size={14} className={active ? "text-foreground" : "text-muted-foreground"} />
                )}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-0.5 h-5 ${completed ? "bg-accent" : "bg-muted/20"}`} />
              )}
            </div>
            <div className="flex-1 pb-3">
              <p className={`text-xs font-semibold ${completed ? "neon-text-green" : active ? "text-foreground" : "text-muted-foreground"}`}>
                {completed ? "✔ " : ""}{s.label}
              </p>
              <p className="text-[10px] text-muted-foreground">{s.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ClaimTimeline;
