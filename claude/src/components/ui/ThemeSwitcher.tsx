import { Sun, Moon, Contrast } from "lucide-react";
import { useThemeStore, type Theme } from "@/store/useThemeStore";

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Jasny", Icon: Sun },
  { value: "dark", label: "Ciemny", Icon: Moon },
  { value: "mono", label: "Mono", Icon: Contrast },
];

/**
 * @description Segmentowy przełącznik motywów (Light / Dark / Mono).
 * Wstaw w prawym górnym rogu layoutu (DashboardLayout / AuthLayout).
 */
const ThemeSwitcher = () => {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div
      role="radiogroup"
      aria-label="Motyw"
      className="flex gap-0.5 rounded-md border border-border-light bg-bg-secondary p-0.5"
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            title={label}
            onClick={() => setTheme(value)}
            className={`grid h-7 w-8 place-items-center rounded-sm transition-colors ${
              active
                ? "bg-signal text-[#1a1300]"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            <Icon size={15} strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSwitcher;
