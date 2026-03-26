import { Home, CreditCard, Zap, ScrollText, User } from "lucide-react";
import { motion } from "framer-motion";

interface BottomNavProps {
  active: string;
  onNavigate: (tab: string) => void;
}

const tabs = [
  { id: "home", icon: Home, label: "Home" },
  { id: "plans", icon: CreditCard, label: "Plans" },
  { id: "demo", icon: Zap, label: "Demo" },
  { id: "history", icon: ScrollText, label: "History" },
  { id: "profile", icon: User, label: "Profile" },
];

const BottomNav = ({ active, onNavigate }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/10 rounded-none">
      <div className="flex items-center justify-around max-w-lg mx-auto py-2 px-2">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const isDemo = tab.id === "demo";
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all duration-300 ${isDemo && !isActive ? "scale-110" : ""}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute inset-0 rounded-xl ${isDemo ? 'gradient-accent' : 'gradient-primary'} opacity-15`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              {isDemo && !isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl border border-accent/30"
                  animate={{ boxShadow: ["0 0 8px hsl(145 80% 50% / 0.2)", "0 0 16px hsl(145 80% 50% / 0.4)", "0 0 8px hsl(145 80% 50% / 0.2)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <tab.icon
                size={isDemo ? 24 : 20}
                className={`transition-all duration-300 ${
                  isActive
                    ? isDemo
                      ? "neon-text-green"
                      : "neon-text-purple"
                    : isDemo
                    ? "text-accent/70"
                    : "text-muted-foreground"
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-all duration-300 ${
                  isActive
                    ? isDemo
                      ? "neon-text-green"
                      : "neon-text-purple"
                    : isDemo
                    ? "text-accent/70"
                    : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
