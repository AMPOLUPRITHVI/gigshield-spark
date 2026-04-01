import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Banknote, CloudRain, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

export interface AppNotification {
  id: string;
  message: string;
  type: "warning" | "success" | "info";
  timestamp: number;
}

interface NotificationToastProps {
  notifications: AppNotification[];
  onDismiss: (id: string) => void;
}

const iconMap = {
  warning: AlertTriangle,
  success: Banknote,
  info: ShieldCheck,
};

const borderMap = {
  warning: "border-warning",
  success: "border-accent",
  info: "border-primary",
};

const NotificationToast = ({ notifications, onDismiss }: NotificationToastProps) => {
  return (
    <div className="fixed top-2 left-2 right-2 z-[100] space-y-2 pointer-events-none">
      <AnimatePresence>
        {notifications.slice(0, 3).map((notif) => {
          const Icon = iconMap[notif.type];
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`glass-card-glow p-3 flex items-center gap-3 border-l-4 ${borderMap[notif.type]} pointer-events-auto`}
            >
              <Icon size={16} className={notif.type === "warning" ? "text-warning" : notif.type === "success" ? "neon-text-green" : "neon-text-blue"} />
              <p className="text-xs font-medium text-foreground flex-1">{notif.message}</p>
              <button onClick={() => onDismiss(notif.id)} className="p-1 rounded hover:bg-muted/50">
                <X size={12} className="text-muted-foreground" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;
