import { Link } from "react-router-dom";
import { useMyTickets } from "./api/useStudentQueries";

const StudentDashboard = () => {
  const { data: tickets, isLoading } = useMyTickets();

  const upcomingTickets = tickets?.filter((t) => !t.isScanned) || [];

  return (
    <div className="layout-container py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Witaj z powrotem!</h1>
        <p className="text-text-secondary">
          Poniżej znajdziesz szybkie podsumowanie swoich działań.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/student/events"
          className="bg-accent-primary text-text-on-accent p-6 rounded-xl shadow-sm hover:bg-accent-hover transition flex flex-col items-center justify-center"
        >
          <span className="text-xl font-semibold mb-1">Przeglądaj wydarzenia</span>
          <span className="text-sm opacity-90">
            Znajdź swoje następne studenckie przeżycie
          </span>
        </Link>
        <Link
          to="/student/tickets"
          className="bg-surface-raised border border-border-medium text-text-primary p-6 rounded-xl shadow-sm hover:border-accent-primary transition flex flex-col items-center justify-center"
        >
          <span className="text-xl font-semibold mb-1">Moje bilety</span>
          <span className="text-sm text-text-secondary">
            Wyświetl i użyj swoich kodów QR
          </span>
        </Link>
      </div>

      {/* Upcoming Ticket Widget */}
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-4">
          Twoje następne wydarzenie
        </h2>
        {isLoading ? (
          <p className="text-text-muted">Ładowanie...</p>
        ) : upcomingTickets.length > 0 ? (
          <div className="bg-surface-raised border-l-4 border-l-accent-primary p-5 rounded-r-xl shadow-sm">
            <h3 className="font-semibold text-lg">
              {upcomingTickets[0].eventTitle}
            </h3>
            <p className="text-sm text-text-secondary mb-3">
              📅 {new Date(upcomingTickets[0].eventDate).toLocaleString()}{" "}
              <br />
              📍 {upcomingTickets[0].location}
            </p>
            <Link
              to={`/student/tickets/${upcomingTickets[0].id}`}
              className="text-sm font-medium text-accent-primary hover:underline"
            >
              Pokaż kod QR →
            </Link>
          </div>
        ) : (
          <div className="bg-surface-sunken p-6 rounded-xl text-center border border-border-light">
            <p className="text-text-secondary mb-2">
              Nie masz nadchodzących wydarzeń. Czas znaleźć coś nowego!
            </p>
            <Link
              to="/student/events"
              className="text-accent-primary font-medium hover:underline"
            >
              Przeglądaj dostępne wydarzenia
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
