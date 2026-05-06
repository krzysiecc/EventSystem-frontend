import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

interface ProtectedRouteProps {
  allowedRoles: Array<"Student" | "Organizer" | "Admin">;
}

/**
 * @description A component that protects routes based on authentication and user roles. It checks if the user is authenticated and if their role is included in the allowedRoles array. If the user is not authenticated, it redirects to the login page. If the user is authenticated but does not have the required role, it redirects to an unauthorized page. If all checks pass, it renders the child routes via <Outlet />.
 *
 * @param allowedRoles  Array of roles that are allowed to access the route (e.g., ["Student", "Organizer"])
 * @returns             A component that checks authentication and authorization before rendering child routes.
 */

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
