import { create } from "zustand";
import { jwtDecode } from "jwt-decode";

// TODO: define payload based on .NET implementation
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
}

/** *
 * @description Zustand store for authentication state management. It provides a simple API to log in and log out users, while keeping track of the current user's information and authentication status. The login function decodes the JWT token to extract user details and updates the store accordingly, while the logout function clears the user data and tokens from localStorage.
 *
 * @param   none
 * @returns Zustand store with user info and auth actions
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

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
