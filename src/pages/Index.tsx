import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BottomNav from "../components/BottomNav";
import HomeScreen from "../screens/HomeScreen";
import PlansScreen from "../screens/PlansScreen";
import DemoScreen from "../screens/DemoScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";

const screens: Record<string, React.FC> = {
  home: HomeScreen,
  plans: PlansScreen,
  demo: DemoScreen,
  history: HistoryScreen,
  profile: ProfileScreen,
};

const Index = () => {
  const [active, setActive] = useState("home");
  const Screen = screens[active];

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <Screen />
        </motion.div>
      </AnimatePresence>
      <BottomNav active={active} onNavigate={setActive} />
    </div>
  );
};

export default Index;
