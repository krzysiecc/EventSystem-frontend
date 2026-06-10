import { useParams, Link } from "react-router-dom";
import { useOrganizerEventDetails } from "./api/useEvents";

const EventDetailsOrg = () => {
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading, isError } = useOrganizerEventDetails(id);

  if (isLoading) return <div className="p-6">Ładowanie...</div>;
  if (isError || !event)
    return (
      <div className="p-6 text-status-error">Błąd wczytywania wydarzenia.</div>
    );

  const progress =
    event.maxCapacity > 0
      ? Math.round((event.enrolledCount / event.maxCapacity) * 100)
      : 0;
  const isUpcoming = new Date(event.date) >= new Date();

  return (
    <div className="layout-container py-6 max-w-4xl">
      <Link
        to="/organizer/events"
        className="text-accent-primary hover:underline mb-6 inline-block"
      >
        ← Wróć do listy
      </Link>

      <div className="bg-surface-raised border border-border-light rounded-xl p-6 shadow-sm mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              {event.title}
            </h1>
            <p className="text-text-secondary">
              📅 {new Date(event.date).toLocaleString()} • 📍 {event.location}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${
                isUpcoming
                  ? "bg-status-success-bg text-status-success"
                  : "bg-status-info-bg text-status-info"
              }`}
            >
              {isUpcoming ? "Nadchodzące" : "Zakończone"}
            </span>
            <Link
              to={`/organizer/events/${event.id}/edit`}
              className="text-sm font-medium text-accent-primary hover:underline"
            >
              ✏️ Edytuj wydarzenie
            </Link>
          </div>
        </div>

        {/* Pasek postępu zapisów */}
        <div className="bg-bg-secondary p-5 rounded-lg mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold text-text-primary">
              Zajęte miejsca
            </span>
            <span className="font-semibold text-text-primary">
              {event.enrolledCount} / {event.maxCapacity} ({progress}%)
            </span>
          </div>
          <div className="w-full bg-border-light rounded-full h-2.5">
            <div
              className="bg-accent-primary h-2.5 rounded-full"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Główne akcje operacyjne */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border-light pt-6">
          <Link
            to={`/organizer/scanner/${event.id}`}
            className="flex flex-col items-center justify-center p-6 bg-status-success text-text-on-accent rounded-xl hover:opacity-90 transition-opacity shadow-md"
          >
            <span className="text-xl font-bold mb-1">📷 Uruchom skaner QR</span>
            <span className="text-sm opacity-90">
              Skanuj wejściówki na bramce
            </span>
          </Link>

          <Link
            to={`/organizer/events/${event.id}/attendees`}
            className="flex flex-col items-center justify-center p-6 bg-surface-sunken border border-border-medium text-text-primary rounded-xl hover:border-accent-primary transition-colors shadow-sm"
          >
            <span className="text-xl font-bold mb-1">👥 Lista uczestników</span>
            <span className="text-sm text-text-secondary">
              Ręczne sprawdzanie obecności
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsOrg;
