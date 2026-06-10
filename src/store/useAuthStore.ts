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
 * @description Read the persisted user from localStorage. Used to seed the
 * store's initial state synchronously so that the very first render already
 * reflects the logged-in user (avoids a flash-redirect to /login on refresh).
 */
const readStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? (JSON.parse(storedUser) as User) : null;
  } catch (error) {
    console.error("Failed to restore auth state : ", error);
    localStorage.removeItem("authUser");
    return null;
  }
};

/**
 * @description Zustand store for authentication state. Handles
 * login/logout, and restoring auth state from localStorage on page refresh.
 */
export const useAuthStore = create<AuthState>((set) => {
  const storedUser = readStoredUser();

  return {
    user: storedUser,
    isAuthenticated: !!storedUser,

    /**
     * @description Restore authentication state from localStorage.
     * Kept for explicit re-sync; initial state is already seeded from storage.
     */
    initializeFromStorage: () => {
      const user = readStoredUser();
      set({ user, isAuthenticated: !!user });
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
  };
});
