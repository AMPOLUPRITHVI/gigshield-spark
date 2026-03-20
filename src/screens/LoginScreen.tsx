import { motion, AnimatePresence } from "framer-motion";
import { Shield, Phone, Mail, ArrowRight, User, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { saveUser, setLoggedIn } from "../lib/store";

interface LoginScreenProps {
  onLogin: () => void;
}

type Step = "welcome" | "phone" | "email" | "otp" | "signup";

const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [step, setStep] = useState<Step>("welcome");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const simulateOtp = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 1500);
  };

  const verifyOtp = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("signup");
    }, 1000);
  };

  const handleEmailLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("signup");
    }, 1500);
  };

  const handleSignup = () => {
    if (!name.trim()) return;
    setLoading(true);
    setTimeout(() => {
      saveUser({
        name: name.trim(),
        email: email || `${phone}@gigshield.ai`,
        phone: phone || "N/A",
        city: city || "Hyderabad",
        plan: "none",
        coverageActive: false,
      });
      setLoggedIn(true);
      setLoading(false);
      onLogin();
    }, 1000);
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
                onClick={() => setStep("phone")}
                className="glass-card-glow w-full p-4 flex items-center gap-4 text-left hover:border-primary/30 transition-all"
              >
                <div className="p-2.5 rounded-xl gradient-primary">
                  <Phone size={18} className="text-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">Continue with Phone</p>
                  <p className="text-xs text-muted-foreground">OTP verification</p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
              </button>
              <button
                onClick={() => setStep("email")}
                className="glass-card-glow w-full p-4 flex items-center gap-4 text-left hover:border-primary/30 transition-all"
              >
                <div className="p-2.5 rounded-xl gradient-accent">
                  <Mail size={18} className="text-accent-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">Continue with Email</p>
                  <p className="text-xs text-muted-foreground">Email & password</p>
                </div>
                <ArrowRight size={16} className="text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        )}

        {step === "phone" && (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm space-y-6"
          >
            <button onClick={() => setStep("welcome")} className="text-muted-foreground text-sm">← Back</button>
            <h2 className="text-2xl font-bold text-foreground">Enter your phone</h2>
            <p className="text-sm text-muted-foreground">We'll send a 6-digit OTP</p>
            <div className="glass-card p-4 flex items-center gap-3">
              <span className="text-foreground font-semibold">+91</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Phone number"
                className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
            </div>
            <button
              onClick={simulateOtp}
              disabled={phone.length < 10 || loading}
              className="btn-accent-glow w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {loading ? "Sending OTP..." : "Get OTP"}
            </button>
          </motion.div>
        )}

        {step === "email" && (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm space-y-6"
          >
            <button onClick={() => setStep("welcome")} className="text-muted-foreground text-sm">← Back</button>
            <h2 className="text-2xl font-bold text-foreground">Email Login</h2>
            <div className="space-y-3">
              <div className="glass-card p-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
              <div className="glass-card p-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <button
              onClick={handleEmailLogin}
              disabled={!email || !password || loading}
              className="btn-accent-glow w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm space-y-6 text-center"
          >
            <button onClick={() => setStep("phone")} className="text-muted-foreground text-sm text-left w-full">← Back</button>
            <h2 className="text-2xl font-bold text-foreground">Verify OTP</h2>
            <p className="text-sm text-muted-foreground">Enter the 6-digit code sent to +91{phone}</p>
            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-xl glass-card text-foreground outline-none focus:ring-2 focus:ring-primary transition-all"
                  autoFocus={i === 0}
                />
              ))}
            </div>
            <button
              onClick={verifyOtp}
              disabled={otp.some((d) => !d) || loading}
              className="btn-accent-glow w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
            <p className="text-xs text-muted-foreground">
              Didn't receive? <button className="neon-text-purple font-medium">Resend OTP</button>
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
            <h2 className="text-2xl font-bold text-foreground">Complete Profile</h2>
            <p className="text-sm text-muted-foreground">Tell us about yourself</p>
            <div className="space-y-3">
              <div className="glass-card p-4 flex items-center gap-3">
                <User size={18} className="text-muted-foreground" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  autoFocus
                />
              </div>
              {!phone && (
                <div className="glass-card p-4 flex items-center gap-3">
                  <Phone size={18} className="text-muted-foreground" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              )}
              {!email && (
                <div className="glass-card p-4 flex items-center gap-3">
                  <Mail size={18} className="text-muted-foreground" />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              )}
              <div className="glass-card p-4 flex items-center gap-3">
                <MapPin size={18} className="text-muted-foreground" />
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City / Location"
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <button
              onClick={handleSignup}
              disabled={!name.trim() || loading}
              className="btn-accent-glow w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {loading ? "Setting up..." : "Get Started"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginScreen;
