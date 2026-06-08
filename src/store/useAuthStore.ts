import { create } from "zustand";
import { queryClient } from "@/lib/queryClient";

interface User {
  id: string;
  role: "Student" | "Organizer" | "Admin";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (role: "Student" | "Organizer" | "Admin", id: string) => void;
  logout: () => void;
  initializeFromStorage: () => void;
}

/**
 * @description Zustand store for authentication state. Handles JWT decoding,
 * login/logout, and restoring auth state from localStorage on page refresh.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  /**
   * @description Restore authentication state from localStorage.
   * Should be called once on app startup to handle page refreshes.
   */
  initializeFromStorage: () => {
    try {
      const storedUser = localStorage.getItem("authUser");
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        set({ user, isAuthenticated: true });
      }
    } catch (error) {
      console.error("Failed to restore auth state : ", error);
      localStorage.removeItem("authUser");
    }
  },

  login: (role, id) => {
    const user: User = { role, id };
    localStorage.setItem("authUser", JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem("authUser");
    set({ user: null, isAuthenticated: false });

    queryClient.clear();
  },
}));
