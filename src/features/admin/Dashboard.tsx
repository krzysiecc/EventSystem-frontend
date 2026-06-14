import { Link } from "react-router-dom";
import { Users, KeyRound, ScrollText, ArrowUpRight } from "lucide-react";
import { useAllUsers } from "./api/useAdminQueries";
import PageHeader from "@/components/ui/PageHeader";

const AdminDashboard = () => {
  const { data: users, isLoading } = useAllUsers();

  const studentsCount = users?.filter((u) => u.role === "Student").length || 0;
  const organizersCount =
    users?.filter((u) => u.role === "Organizer").length || 0;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Administrator"
        title="Panel główny"
        subtitle="Globalne zarządzanie platformą i użytkownikami."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          to="/admin/users"
          style={{ animationDelay: "0ms" }}
          className="group animate-rise flex flex-col gap-5 rounded-xl border border-border-light bg-surface-raised p-6 shadow-sm transition hover:border-accent-primary"
        >
          <div className="flex items-start justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-accent-subtle text-accent-primary">
              <Users size={20} />
            </div>
            <ArrowUpRight
              size={18}
              className="text-text-muted transition group-hover:text-accent-primary"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Zarządzanie użytkownikami
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Przeglądaj, blokuj i zmieniaj role.
            </p>
          </div>
          <div className="mt-auto flex gap-2 pt-1 font-mono text-xs">
            {isLoading ? (
              <span className="text-text-muted">...</span>
            ) : (
              <>
                <span className="rounded border border-border-light bg-bg-secondary px-2 py-1 text-text-secondary">
                  STUDENCI: {studentsCount}
                </span>
                <span className="rounded border border-border-light bg-bg-secondary px-2 py-1 text-text-secondary">
                  ORG: {organizersCount}
                </span>
              </>
            )}
          </div>
        </Link>

        <Link
          to="/admin/tokens"
          style={{ animationDelay: "80ms" }}
          className="group animate-rise flex flex-col gap-5 rounded-xl border border-border-light bg-surface-raised p-6 shadow-sm transition hover:border-accent-primary"
        >
          <div className="flex items-start justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-accent-subtle text-accent-primary">
              <KeyRound size={20} />
            </div>
            <ArrowUpRight
              size={18}
              className="text-text-muted transition group-hover:text-accent-primary"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Tokeny organizacyjne
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Generuj i unieważniaj tokeny rejestracyjne dla Organizatorów.
            </p>
          </div>
        </Link>

        <Link
          to="/admin/logs"
          style={{ animationDelay: "160ms" }}
          className="group animate-rise flex flex-col gap-5 rounded-xl border border-border-light bg-surface-raised p-6 shadow-sm transition hover:border-signal"
        >
          <div className="flex items-start justify-between">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-signal/15 text-signal">
              <ScrollText size={20} />
            </div>
            <ArrowUpRight
              size={18}
              className="text-text-muted transition group-hover:text-signal"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              Logi systemowe
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Śledź błędy i aktywność w systemie.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
