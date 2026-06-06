import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastState {
  toasts: Toast[];
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

/**
 * @description Zustand store for managing toast notifications across the app. 
 * Replaced crypto.randomUUID with a custom generator to support non-HTTPS environments (Local IP).
 */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    // Bezpieczny generator ID działający na HTTP i IP
    const id = Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    
    set((state) => ({ 
      toasts: [...state.toasts, { id, message, type }] 
    }));

    // Automatyczne usuwanie po 3 sekundach
    setTimeout(() => {
      set((state) => ({ 
        toasts: state.toasts.filter((t) => t.id !== id) 
      }));
    }, 3000);
  },
  removeToast: (id) =>
    set((state) => ({ 
      toasts: state.toasts.filter((t) => t.id !== id) 
    })),
}));