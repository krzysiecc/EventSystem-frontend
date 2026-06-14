import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Contrast, ChevronDown, Check } from "lucide-react";
import { useThemeStore, type Theme } from "@/store/useThemeStore";

const OPTIONS: { value: Theme; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Jasny", Icon: Sun },
  { value: "dark", label: "Ciemny", Icon: Moon },
  { value: "mono", label: "Mono", Icon: Contrast },
];

/**
 * @description Wybór motywu (Light / Dark / Mono) jako dropdown. Zamyka się po
 * kliknięciu poza menu oraz klawiszem Escape.
 */
const ThemeSwitcher = () => {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[1];
  const ActiveIcon = active.Icon;

  return (
    <div ref={ref} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Motyw"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-border-light bg-bg-secondary px-3 py-2 text-sm text-text-primary transition hover:border-accent-primary"
      >
        <ActiveIcon size={15} className="text-accent-primary" />
        <span>{active.label}</span>
        <ChevronDown
          size={15}
          className={`text-text-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Wybór motywu"
          className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-md border border-border-light bg-surface-raised shadow-lg"
        >
          {OPTIONS.map(({ value, label, Icon }) => {
            const isActive = theme === value;
            return (
              <li key={value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setTheme(value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition ${
                    isActive
                      ? "bg-accent-subtle text-accent-primary"
                      : "text-text-secondary hover:bg-bg-secondary"
                  }`}
                >
                  <Icon size={15} />
                  <span className="flex-1">{label}</span>
                  {isActive && <Check size={14} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default ThemeSwitcher;
