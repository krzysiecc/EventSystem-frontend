import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";
import { useConfirmStore } from "@/store/useConfirmStore";

/**
 * @description Aplikacyjne okno potwierdzenia (zamiast `window.confirm`).
 * Montowane raz w RootLayout, sterowane przez `useConfirmStore`. Obsługuje
 * Escape (anuluj) i Enter (potwierdź), wariant „danger" dla akcji nieodwracalnych.
 */
const ConfirmDialog = () => {
  const { isOpen, options, respond } = useConfirmStore();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") respond(false);
      else if (e.key === "Enter") respond(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, respond]);

  if (!isOpen || !options) return null;

  const danger = options.variant === "danger";

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-bg-overlay/60 backdrop-blur-sm"
        onClick={() => respond(false)}
        aria-hidden="true"
      />
      <div className="animate-fade-in relative z-10 w-full max-w-sm rounded-xl border border-border-light bg-surface-raised p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
              danger
                ? "bg-status-error-bg text-status-error"
                : "bg-accent-subtle text-accent-primary"
            }`}
          >
            <AlertTriangle size={20} />
          </span>
          <div className="min-w-0 pt-0.5">
            {options.title && (
              <h2 className="text-lg font-bold text-text-primary">
                {options.title}
              </h2>
            )}
            <p className="mt-1 text-sm text-text-secondary">
              {options.message}
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={() => respond(false)}
            className="flex-1 rounded-md border border-border-medium py-2 text-sm font-medium text-text-secondary transition hover:bg-bg-secondary"
          >
            {options.cancelText ?? "Anuluj"}
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => respond(true)}
            className={`flex-1 rounded-md py-2 text-sm font-bold transition ${
              danger
                ? "bg-status-error text-white hover:opacity-90"
                : "bg-accent-primary text-text-on-accent hover:bg-accent-hover"
            }`}
          >
            {options.confirmText ?? "Potwierdź"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmDialog;
