import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-full flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        {theme === "dark" ? <Moon size={16} className="text-muted-foreground" /> : <Sun size={16} className="text-muted-foreground" />}
        <p className="text-sm font-semibold text-foreground">
          {theme === "dark" ? "Dark Mode" : "Light Mode"}
        </p>
      </div>
      <div className={`w-10 h-6 rounded-full p-1 transition-all ${theme === "dark" ? "bg-accent" : "bg-muted"}`}>
        <div className={`w-4 h-4 rounded-full bg-foreground transition-transform ${theme === "dark" ? "translate-x-4" : ""}`} />
      </div>
    </button>
  );
};

export default ThemeToggle;
