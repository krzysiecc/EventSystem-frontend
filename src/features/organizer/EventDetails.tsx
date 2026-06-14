import { useParams, Link } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Camera, Users } from "lucide-react";
import { useOrganizerEventDetails } from "./api/useEvents";
import { formatEventDate } from "@/lib/eventDate";

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
    <div className="mx-auto max-w-4xl">
      <Link
        to="/organizer/events"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-accent-primary hover:underline"
      >
        <ArrowLeft size={15} />
        Wróć do listy
      </Link>

      <div className="mb-6 rounded-xl border border-border-light bg-surface-raised p-6 shadow-sm">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-text-primary">
              {event.title}
            </h1>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-text-secondary">
              <span className="flex items-center gap-2">
                <CalendarDays size={15} className="text-accent-primary" />
                {formatEventDate(event, { time: true })}
              </span>
              <span className="flex items-center gap-2">
                <MapPin size={15} className="text-accent-primary" />
                {event.location}
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`rounded px-3 py-1 font-mono text-xs font-bold uppercase ${
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
              Edytuj wydarzenie
            </Link>
          </div>
        </div>

        {/* Pasek postępu zapisów */}
        <div className="mb-6 rounded-lg bg-bg-secondary p-5">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold text-text-primary">
              Zajęte miejsca
            </span>
            <span className="font-mono font-semibold text-text-primary">
              {event.enrolledCount} / {event.maxCapacity} ({progress}%)
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-border-light">
            <div
              className="h-2.5 rounded-full bg-accent-primary"
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Główne akcje operacyjne */}
        <div className="grid grid-cols-1 gap-4 border-t border-border-light pt-6 md:grid-cols-2">
          <Link
            to={`/organizer/scanner/${event.id}`}
            className="flex flex-col items-center justify-center gap-2 rounded-xl bg-status-success p-6 text-text-on-accent shadow-md transition-opacity hover:opacity-90"
          >
            <Camera size={26} />
            <span className="text-xl font-bold">Uruchom skaner QR</span>
            <span className="text-sm opacity-90">Skanuj wejściówki na bramce</span>
          </Link>

          <Link
            to={`/organizer/events/${event.id}/attendees`}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border-medium bg-surface-sunken p-6 text-text-primary shadow-sm transition-colors hover:border-accent-primary"
          >
            <Users size={26} className="text-accent-primary" />
            <span className="text-xl font-bold">Lista uczestników</span>
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
