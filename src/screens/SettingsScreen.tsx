import { motion } from "framer-motion";
import { User, Bell, Shield, LogOut, ChevronRight, X, MapPin, Palette } from "lucide-react";
import { useState } from "react";
import { getUser, saveUser, getNotificationsEnabled, setNotificationsEnabled, getRiskPreference, setRiskPreference, logout } from "../lib/store";
import ThemeToggle from "../components/ThemeToggle";

interface SettingsScreenProps {
  onLogout: () => void;
  onBack: () => void;
}

const riskLevels = ["Low", "Medium", "High"] as const;

const SettingsScreen = ({ onLogout, onBack }: SettingsScreenProps) => {
  const user = getUser();
  const [editProfile, setEditProfile] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [city, setCity] = useState(user?.city || "");
  const [notifs, setNotifs] = useState(getNotificationsEnabled());
  const [risk, setRisk] = useState(getRiskPreference());

  const handleSaveProfile = () => {
    if (user) {
      saveUser({ ...user, name: name.trim(), city: city.trim() });
    }
    setEditProfile(false);
  };

  const handleNotifToggle = () => {
    setNotifs(!notifs);
    setNotificationsEnabled(!notifs);
  };

  const handleRiskChange = (level: typeof riskLevels[number]) => {
    setRisk(level);
    setRiskPreference(level);
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  return (
    <div className="px-4 pt-4 pb-24 max-w-lg mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your account</p>
        </div>
        <button onClick={onBack} className="p-2 glass-card rounded-xl">
          <X size={18} className="text-foreground" />
        </button>
      </div>

      {/* Edit Profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={16} className="text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Edit Profile</p>
          </div>
          <button onClick={() => setEditProfile(!editProfile)} className="text-xs neon-text-purple">
            {editProfile ? "Cancel" : "Edit"}
          </button>
        </div>
        {editProfile ? (
          <div className="space-y-3">
            <div className="glass-card p-3 flex items-center gap-3">
              <User size={16} className="text-muted-foreground" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground text-sm"
                placeholder="Name"
              />
            </div>
            <div className="glass-card p-3 flex items-center gap-3">
              <MapPin size={16} className="text-muted-foreground" />
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="flex-1 bg-transparent outline-none text-foreground text-sm"
                placeholder="City"
              />
            </div>
            <button onClick={handleSaveProfile} className="btn-accent-glow w-full text-sm py-2">Save</button>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            <p>{user?.name} · {user?.city}</p>
            <p className="text-xs">{user?.email}</p>
          </div>
        )}
      </motion.div>

      {/* Theme Toggle */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-4">
        <ThemeToggle />
      </motion.div>

      {/* Risk Preference */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Risk Preference</p>
        </div>
        <div className="flex gap-2">
          {riskLevels.map((level) => (
            <button
              key={level}
              onClick={() => handleRiskChange(level)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                risk === level
                  ? level === "High"
                    ? "bg-destructive/20 text-destructive border border-destructive/30"
                    : level === "Medium"
                    ? "bg-warning/20 text-warning border border-warning/30"
                    : "bg-accent/20 neon-text-green border border-accent/30"
                  : "glass-card text-muted-foreground"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4">
        <button onClick={handleNotifToggle} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={16} className="text-muted-foreground" />
            <p className="text-sm font-semibold text-foreground">Notifications</p>
          </div>
          <div className={`w-10 h-6 rounded-full p-1 transition-all ${notifs ? "bg-accent" : "bg-muted"}`}>
            <div className={`w-4 h-4 rounded-full bg-foreground transition-transform ${notifs ? "translate-x-4" : ""}`} />
          </div>
        </button>
      </motion.div>

      {/* Logout */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <button onClick={handleLogout} className="glass-card w-full p-4 flex items-center gap-3 hover:border-destructive/30 transition-all">
          <LogOut size={16} className="text-destructive" />
          <p className="text-sm font-semibold text-destructive">Logout</p>
          <ChevronRight size={16} className="text-muted-foreground ml-auto" />
        </button>
      </motion.div>
    </div>
  );
};

export default SettingsScreen;
