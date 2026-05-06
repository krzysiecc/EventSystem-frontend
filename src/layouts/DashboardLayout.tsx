import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

const DashboardLayout = ({ role }: { role: string }) => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Uproszczone menu w zależności od roli
  const basePath = `/${role.toLowerCase()}`;

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary md:flex-row">
      {/* Pasek nawigacji */}
      <aside className="flex w-full flex-col border-b border-border-light bg-surface-raised p-4 md:w-64 md:border-b-0 md:border-r">
        <div className="mb-6 text-xl font-bold text-text-primary">
          Panel {role === "Student" ? "Studenta" : "Organizatora"}
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
            <Link
              to={`${basePath}/tickets`}
              className="font-medium text-text-secondary hover:underline"
            >
              Moje bilety
            </Link>
          )}
        </nav>

        {/* Przycisk wylogowania (na dole paska na desktopie) */}
        <div className="mt-auto hidden pt-6 md:block border-t border-border-light">
          <button
            onClick={handleLogout}
            className="w-full text-left font-bold text-status-error hover:underline"
          >
            Wyloguj się
          </button>
        </div>
      </aside>

      {/* Główna treść */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Outlet />
      </main>

      {/* Przycisk wylogowania dla urządzeń mobilnych */}
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
