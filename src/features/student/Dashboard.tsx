import { Link } from "react-router-dom";
import { Compass, Ticket, CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { useMyTickets } from "./api/useStudentQueries";

const StudentDashboard = () => {
  const { data: tickets, isLoading } = useMyTickets();

  const upcomingTickets = tickets?.filter((t) => !t.isScanned) || [];
  const next = upcomingTickets[0];

  return (
    <div className="mx-auto max-w-5xl space-y-8 sm:space-y-10">
      {/* HERO */}
      <header className="animate-rise pt-2 sm:pt-4">
        <div className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          <span className="h-px w-8 bg-border-medium" aria-hidden="true" />
          Panel studenta
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-5xl">
          Witaj z powrotem<span className="text-accent-primary">.</span>
        </h1>
        <p className="mt-3 max-w-lg text-sm text-text-secondary sm:text-base">
          Masz{" "}
          <b className="text-text-primary">{upcomingTickets.length}</b> aktywnych
          biletów. Sprawdź, co Cię czeka.
        </p>
      </header>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          to="/student/events"
          style={{ animationDelay: "60ms" }}
          className="animate-rise group flex items-center justify-between rounded-xl bg-accent-primary p-5 text-text-on-accent shadow-sm transition hover:bg-accent-hover sm:p-6"
        >
          <div>
            <span className="block text-lg font-bold sm:text-xl">
              Przeglądaj wydarzenia
            </span>
            <span className="text-sm opacity-90">
              Znajdź swoje następne przeżycie
            </span>
          </div>
          <Compass size={26} className="transition group-hover:scale-110" />
        </Link>
        <Link
          to="/student/tickets"
          style={{ animationDelay: "120ms" }}
          className="animate-rise group flex items-center justify-between rounded-xl border border-border-medium bg-surface-raised p-5 text-text-primary shadow-sm transition hover:border-accent-primary sm:p-6"
        >
          <div>
            <span className="block text-lg font-bold sm:text-xl">Moje bilety</span>
            <span className="text-sm text-text-secondary">
              Wyświetl i użyj kodów QR
            </span>
          </div>
          <Ticket
            size={26}
            className="text-accent-primary transition group-hover:scale-110"
          />
        </Link>
      </div>

      {/* Next event */}
      <section className="animate-rise" style={{ animationDelay: "180ms" }}>
        <div className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          <span className="text-signal">01</span> Twój następny event
        </div>
        {isLoading ? (
          <p className="text-text-muted">Ładowanie...</p>
        ) : next ? (
          <div className="rounded-xl border border-border-light bg-surface-raised p-5 shadow-sm sm:p-6">
            <h3 className="text-xl font-bold text-text-primary sm:text-2xl">
              {next.eventTitle}
            </h3>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-text-secondary">
              <span className="flex items-center gap-2">
                <CalendarDays size={15} className="text-accent-primary" />
                {new Date(next.eventDate).toLocaleString()}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={15} className="text-accent-primary" />
                {next.location}
              </span>
            </div>
            <Link
              to={`/student/tickets/${next.id}`}
              className="mt-5 inline-flex items-center gap-2 rounded-md bg-accent-primary px-4 py-2 text-sm font-medium text-text-on-accent transition hover:bg-accent-hover"
            >
              Pokaż kod QR <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-border-light bg-surface-sunken p-6 text-center">
            <p className="mb-2 text-text-secondary">
              Nie masz nadchodzących wydarzeń. Czas znaleźć coś nowego!
            </p>
            <Link
              to="/student/events"
              className="font-medium text-accent-primary hover:underline"
            >
              Przeglądaj dostępne wydarzenia
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentDashboard;
