import { Link } from "react-router-dom";
import { useAllUsers } from "./api/useAdminQueries";

const AdminDashboard = () => {
  const { data: users, isLoading } = useAllUsers();

  const studentsCount = users?.filter((u) => u.role === "Student").length || 0;
  const organizersCount =
    users?.filter((u) => u.role === "Organizer").length || 0;

  return (
    <div className="layout-container py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Panel Administratora
        </h1>
        <p className="text-text-secondary">
          Globalne zarządzanie platformą i użytkownikami.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/admin/users"
          className="bg-surface-raised border border-border-light p-6 rounded-xl shadow-sm hover:border-accent-primary transition flex items-center justify-between"
        >
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Zarządzanie użytkownikami
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Przeglądaj, blokuj i zmieniaj role.
            </p>
          </div>
          <div className="text-right">
            {isLoading ? (
              <span className="text-text-muted">...</span>
            ) : (
              <div className="flex gap-2 text-sm font-medium">
                <span className="bg-bg-secondary px-2 py-1 rounded">
                  S: {studentsCount}
                </span>
                <span className="bg-bg-secondary px-2 py-1 rounded">
                  O: {organizersCount}
                </span>
              </div>
            )}
          </div>
        </Link>

        <Link
          to="/admin/logs"
          className="bg-surface-raised border border-border-light p-6 rounded-xl shadow-sm hover:border-status-warning transition flex items-center justify-between"
        >
          <div>
            <h2 className="text-xl font-bold text-text-primary">
              Logi systemowe
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Śledź błędy i aktywność w systemie.
            </p>
          </div>
          <span className="text-2xl">📋</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
