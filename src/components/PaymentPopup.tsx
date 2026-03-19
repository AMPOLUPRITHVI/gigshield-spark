import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useMemo } from "react";

interface PaymentPopupProps {
  open: boolean;
  onClose: () => void;
  amount: number;
}

const PaymentPopup = ({ open, onClose, amount }: PaymentPopupProps) => {
  const txnId = useMemo(() => {
    if (!open) return "";
    return `TXN${Math.floor(100000 + Math.random() * 900000)}`;
  }, [open]);

  const time = useMemo(() => {
    if (!open) return "";
    return new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="glass-card-glow w-full max-w-sm p-6 space-y-5 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={18} className="text-muted-foreground" />
            </button>

            {/* Success Icon */}
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
              >
                <div className="p-4 rounded-full bg-accent/20">
                  <CheckCircle2 size={48} className="neon-text-green" />
                </div>
              </motion.div>
            </div>

            {/* Content */}
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold neon-text-green">Payment Successful</h3>
              <p className="text-3xl font-extrabold text-foreground">₹{amount}</p>
              <p className="text-sm text-muted-foreground">credited instantly</p>
            </div>

            {/* Details */}
            <div className="glass-card p-4 space-y-3 rounded-xl">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Txn ID</span>
                <span className="font-mono font-semibold text-foreground">{txnId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-semibold text-foreground">{time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="neon-text-green font-semibold">✅ Completed</span>
              </div>
            </div>

            {/* Done Button */}
            <button onClick={onClose} className="btn-primary-glow w-full text-sm">
              Done
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentPopup;
