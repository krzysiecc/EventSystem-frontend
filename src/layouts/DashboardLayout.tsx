import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

const DashboardLayout = ({ role }: { role: string }) => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const basePath = `/${role.toLowerCase()}`;

  // Resolve sidebar title based on role
  const roleLabel =
    role === "Student"
      ? "Studenta"
      : role === "Organizer"
        ? "Organizatora"
        : "Administratora";

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary md:flex-row">
      {/* Sidebar navigation */}
      <aside className="flex w-full flex-col border-b border-border-light bg-surface-raised p-4 md:w-64 md:border-b-0 md:border-r">
        <div className="mb-6 text-xl font-bold text-text-primary">
          Panel {roleLabel}
        </div>

        <nav className="flex gap-4 overflow-x-auto md:flex-col">
          <Link
            to={basePath}
            className="font-medium text-accent-primary hover:underline"
          >
            Panel główny
          </Link>

          {role === "Organizer" && (
            <Link
              to={`${basePath}/events`}
              className="font-medium text-text-secondary hover:underline"
            >
              Moje wydarzenia
            </Link>
          )}

          {role === "Student" && (
            <>
              <Link
                to={`${basePath}/events`}
                className="font-medium text-text-secondary hover:underline"
              >
                Przeglądaj wydarzenia
              </Link>
              <Link
                to={`${basePath}/tickets`}
                className="font-medium text-text-secondary hover:underline"
              >
                Moje bilety
              </Link>
            </>
          )}

          {role === "Admin" && (
            <>
              <Link
                to={`${basePath}/users`}
                className="font-medium text-text-secondary hover:underline"
              >
                Użytkownicy
              </Link>
              <Link
                to={`${basePath}/tokens`}
                className="font-medium text-text-secondary hover:underline"
              >
                Tokeny organizacyjne
              </Link>
              <Link
                to={`${basePath}/logs`}
                className="font-medium text-text-secondary hover:underline"
              >
                Logi systemowe
              </Link>
            </>
          )}
        </nav>

        {/* Logout button visible on desktop at sidebar bottom */}
        <div className="mt-auto hidden pt-6 md:block border-t border-border-light">
          <button
            onClick={handleLogout}
            className="w-full text-left font-bold text-status-error hover:underline"
          >
            Wyloguj się
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>

      {/* Mobile logout button */}
      <div className="border-t border-border-light bg-surface-raised p-4 md:hidden">
        <button
          onClick={handleLogout}
          className="w-full text-center font-bold text-status-error hover:underline"
        >
          Wyloguj się
        </button>
      </div>
    </div>
  );
};

export default DashboardLayout;
