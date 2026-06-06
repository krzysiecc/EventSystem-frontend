import { Link } from "react-router-dom";
import { useMyTickets } from "./api/useStudentQueries";

const MyTickets = () => {
  const { data: tickets, isLoading } = useMyTickets();

  if (isLoading)
    return <div className="p-6 text-text-muted">Ładowanie biletów...</div>;

  // Zabezpieczenie przed mapowaniem błędnych danych
  const safeTickets = Array.isArray(tickets) ? tickets : [];
  const activeTickets = safeTickets.filter((t) => !t.isUsed);
  const pastTickets = safeTickets.filter((t) => t.isUsed);

  return (
    <div className="layout-container py-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Moje bilety</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-secondary mb-4 border-b border-border-light pb-2">
          Aktywne bilety
        </h2>
        {activeTickets.length === 0 ? (
          <p className="text-text-muted">Brak aktywnych biletów.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTickets.map((ticket) => {
               // Bezpieczny render tekstów
               const title = typeof ticket.eventTitle === 'string' ? ticket.eventTitle : "Wydarzenie";
               const dateText = ticket.eventDate ? new Date(ticket.eventDate).toLocaleDateString() : "Brak daty";

               return (
                <Link
                  key={String(ticket.id)} // Bezpieczny klucz
                  to={`/student/tickets/${ticket.id}`}
                  className="block bg-surface-raised border-l-4 border-l-accent-primary p-5 rounded-r-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-text-primary">
                    {title}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    📅 {dateText}
                  </p>
                  <div className="mt-3 text-sm font-medium text-accent-primary">
                    Pokaż kod QR →
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-text-secondary mb-4 border-b border-border-light pb-2">
          Historia (bilety zużyte)
        </h2>
        {pastTickets.length === 0 ? (
          <p className="text-text-muted">Brak zużytych biletów.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
            {pastTickets.map((ticket) => {
                const title = typeof ticket.eventTitle === 'string' ? ticket.eventTitle : "Wydarzenie";
                const dateText = ticket.eventDate ? new Date(ticket.eventDate).toLocaleDateString() : "Brak daty";

                return (
                  <div
                    key={String(ticket.id)}
                    className="bg-surface-sunken border border-border-medium p-5 rounded-xl"
                  >
                    <h3 className="font-bold text-text-primary line-through">
                      {title}
                    </h3>
                    <p className="text-sm text-text-secondary mt-1">
                      📅 {dateText}
                    </p>
                    <span className="inline-block mt-3 bg-status-error-bg text-status-error text-xs px-2 py-1 rounded">
                      ZUŻYTY
                    </span>
                  </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default MyTickets;