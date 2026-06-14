import { Link } from "react-router-dom";
import { CalendarDays, QrCode, Check } from "lucide-react";
import { useMyTickets } from "./api/useStudentQueries";
import PageHeader from "@/components/ui/PageHeader";

const MyTickets = () => {
  const { data: tickets, isLoading } = useMyTickets();

  if (isLoading)
    return <div className="p-6 text-text-muted">Ładowanie biletów...</div>;

  const activeTickets = tickets?.filter((t) => !t.isScanned) || [];
  const pastTickets = tickets?.filter((t) => t.isScanned) || [];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader kicker="Student" title="Moje bilety" />

      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 border-b border-border-light pb-2 font-mono text-xs uppercase tracking-wider text-text-muted">
          Aktywne bilety
        </h2>
        {activeTickets.length === 0 ? (
          <p className="text-text-muted">Brak aktywnych biletów.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeTickets.map((ticket, i) => (
              <Link
                key={ticket.id}
                to={`/student/tickets/${ticket.id}`}
                style={{ animationDelay: `${i * 50}ms` }}
                className="animate-rise block rounded-xl border border-border-light border-l-4 border-l-accent-primary bg-surface-raised p-5 shadow-sm transition hover:border-accent-primary hover:shadow-md"
              >
                <h3 className="text-lg font-bold text-text-primary">
                  {ticket.eventTitle}
                </h3>
                <p className="mt-1 flex items-center gap-2 text-sm text-text-secondary">
                  <CalendarDays size={14} className="text-accent-primary" />
                  {new Date(ticket.eventDate).toLocaleDateString()}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-accent-primary">
                  <QrCode size={15} />
                  Pokaż kod QR
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 flex items-center gap-2 border-b border-border-light pb-2 font-mono text-xs uppercase tracking-wider text-text-muted">
          Historia (bilety zużyte)
        </h2>
        {pastTickets.length === 0 ? (
          <p className="text-text-muted">Brak zużytych biletów.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 opacity-75 md:grid-cols-2 lg:grid-cols-3">
            {pastTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-xl border border-border-medium bg-surface-sunken p-5"
              >
                <h3 className="font-bold text-text-primary line-through">
                  {ticket.eventTitle}
                </h3>
                <p className="mt-1 flex items-center gap-2 text-sm text-text-secondary">
                  <CalendarDays size={14} />
                  {new Date(ticket.eventDate).toLocaleDateString()}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 rounded bg-status-error-bg px-2 py-1 font-mono text-xs text-status-error">
                  <Check size={12} />
                  ZUŻYTY
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyTickets;
