import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "../components/BottomNav";
import FloatingParticles from "../components/FloatingParticles";
import HomeScreen from "../screens/HomeScreen";
import PlansScreen from "../screens/PlansScreen";
import DemoScreen from "../screens/DemoScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import AdminScreen from "../screens/AdminScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { isLoggedIn } from "../lib/store";

const Index = () => {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [active, setActive] = useState("home");

  if (!loggedIn) {
    return <LoginScreen onLogin={() => setLoggedIn(true)} />;
  }

  const renderScreen = () => {
    switch (active) {
      case "home": return <HomeScreen />;
      case "plans": return <PlansScreen />;
      case "demo": return <DemoScreen />;
      case "history": return <HistoryScreen />;
      case "profile": return <ProfileScreen onNavigate={setActive} />;
      case "admin": return <AdminScreen />;
      case "analytics": return <AnalyticsScreen />;
      case "settings": return <SettingsScreen onLogout={() => setLoggedIn(false)} onBack={() => setActive("profile")} />;
      default: return <HomeScreen />;
    }
  };

  const showNav = !["admin", "analytics", "settings"].includes(active);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none animated-gradient" />
      <FloatingParticles />

      <div className="relative z-10">
        {["admin", "analytics", "settings"].includes(active) && (
          <button
            onClick={() => setActive("profile")}
            className="fixed top-4 left-4 z-50 glass-card px-3 py-1.5 text-xs text-foreground rounded-lg"
          >
            ← Back
          </button>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
        {showNav && <BottomNav active={active} onNavigate={setActive} />}
      </div>
    </div>
  );
};

export default Index;
