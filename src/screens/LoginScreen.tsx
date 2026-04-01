import { motion, AnimatePresence } from "framer-motion";
import { Shield, Mail, ArrowRight, User, MapPin, Loader2, Lock } from "lucide-react";
import { useState } from "react";
import { signUp, signIn } from "../lib/supabase-store";
import { toast } from "@/hooks/use-toast";
import GoogleSignInButton from "@/components/GoogleSignInButton";

interface LoginScreenProps {
  onLogin: () => void;
}

type Step = "welcome" | "login" | "signup";

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [step, setStep] = useState<Step>("welcome");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        onLogin();
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name.trim() || !email || !password) return;
    setLoading(true);
    try {
      const { error } = await signUp(email, password, name.trim(), phone);
      if (error) {
        toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created!", description: "You are now logged in." });
        onLogin();
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-sm space-y-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
              className="w-20 h-20 mx-auto rounded-3xl gradient-primary flex items-center justify-center"
            >
              <Shield size={40} className="text-foreground" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-extrabold neon-text-purple">GigShield AI</h1>
              <p className="text-muted-foreground mt-2 text-sm">AI-powered insurance for gig workers</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setStep("login")}
                className="glass-card-glow w-full p-4 flex items-center gap-4 text-left hover:border-primary/30 transition-all"
              >
                <div className="p-2.5 rounded-xl gradient-primary">
                  <Mail size={18} className="text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">Sign In</p>
                  <p className="text-xs text-muted-foreground">Email & password</p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => setStep("signup")}
                className="glass-card-glow w-full p-4 flex items-center gap-4 text-left hover:border-primary/30 transition-all"
              >
                <div className="p-2.5 rounded-xl gradient-accent">
                  <User size={18} className="text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">Create Account</p>
                  <p className="text-xs text-muted-foreground">New to GigShield?</p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm space-y-6"
          >
            <button onClick={() => setStep("welcome")} className="text-muted-foreground text-sm">← Back</button>
            <h2 className="text-2xl font-bold text-foreground">Sign In</h2>
            <div className="space-y-3">
              <div className="glass-card p-4 flex items-center gap-3">
                <Mail size={18} className="text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
              <div className="glass-card p-4 flex items-center gap-3">
                <Lock size={18} className="text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <button
              onClick={handleLogin}
              disabled={!email || !password || loading}
              className="btn-accent-glow w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <p className="text-xs text-center text-muted-foreground">
              No account? <button onClick={() => setStep("signup")} className="neon-text-purple font-medium">Create one</button>
            </p>
          </motion.div>
        )}

        {step === "signup" && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm space-y-6"
          >
            <button onClick={() => setStep("welcome")} className="text-muted-foreground text-sm">← Back</button>
            <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
            <div className="space-y-3">
              <div className="glass-card p-4 flex items-center gap-3">
                <User size={18} className="text-muted-foreground" />
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground" autoFocus />
              </div>
              <div className="glass-card p-4 flex items-center gap-3">
                <Mail size={18} className="text-muted-foreground" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
              </div>
              <div className="glass-card p-4 flex items-center gap-3">
                <Lock size={18} className="text-muted-foreground" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6 chars)" className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
              </div>
              <div className="glass-card p-4 flex items-center gap-3">
                <MapPin size={18} className="text-muted-foreground" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
            <button
              onClick={handleSignup}
              disabled={!name.trim() || !email || !password || loading}
              className="btn-accent-glow w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {loading ? "Creating account..." : "Get Started"}
            </button>
            <p className="text-xs text-center text-muted-foreground">
              Already have an account? <button onClick={() => setStep("login")} className="neon-text-purple font-medium">Sign in</button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginScreen;
