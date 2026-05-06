import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

// TODO: define payload based on .NET JWT structure
interface JwtPayload {
  sub: string;
  email: string;
  role: "Student" | "Organizer" | "Admin";
  exp: number;
}

interface User {
  id: string;
  email: string;
  role: "Student" | "Organizer" | "Admin";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
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
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const decoded = jwtDecode<JwtPayload>(token);

      // Check if token is expired
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return;
      }

      const user: User = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };

      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error("Failed to restore auth state from storage:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  },

  login: (token: string) => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);

      const user: User = {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };

      localStorage.setItem("accessToken", token);
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error("Failed to decode token during login:", error);
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    set({ user: null, isAuthenticated: false });
  },
}));
