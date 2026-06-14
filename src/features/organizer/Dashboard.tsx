import { Link } from "react-router-dom";
import {
  Plus,
  CalendarDays,
  MapPin,
  Ticket,
  CheckCheck,
  Settings2,
  ScanLine,
} from "lucide-react";
import { useOrganizerEvents } from "./api/useEvents";
import PageHeader from "@/components/ui/PageHeader";
import { formatEventDate } from "@/lib/eventDate";

const OrganizerDashboard = () => {
  const { data: events, isLoading, isError } = useOrganizerEvents();

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <span className="text-text-muted">Ładowanie wydarzeń...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md bg-status-error-bg p-4 text-status-error">
        Nie udało się załadować wydarzeń. Spróbuj ponownie.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Organizator"
        title="Twoje wydarzenia"
        subtitle="Zarządzaj swoimi nadchodzącymi wydarzeniami."
        actions={
          <Link
            to="/organizer/events/new"
            className="flex items-center gap-2 rounded-md bg-accent-primary px-4 py-2 font-medium text-text-on-accent transition hover:bg-accent-hover"
          >
            <Plus size={16} />
            Zorganizuj wydarzenie
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events?.length === 0 ? (
          <p className="col-span-full py-8 text-center text-text-muted">
            Nie masz jeszcze żadnych wydarzeń.
          </p>
        ) : (
          events?.map((event, i) => {
            const isUpcoming = new Date(event.date) >= new Date();

            return (
              <div
                key={event.id}
                style={{ animationDelay: `${i * 60}ms` }}
                className="animate-rise flex flex-col rounded-xl border border-border-light bg-surface-raised p-5 shadow-sm transition hover:border-accent-primary hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 text-lg font-semibold text-text-primary">
                    {event.title}
                  </h3>
                  <span
                    className={`whitespace-nowrap rounded px-2 py-1 font-mono text-xs font-medium uppercase ${
                      isUpcoming
                        ? "bg-status-success-bg text-status-success"
                        : "bg-status-info-bg text-status-info"
                    }`}
                  >
                    {isUpcoming ? "Nadchodzące" : "Zakończone"}
                  </span>
                </div>

                <div className="mb-4 grow space-y-2 text-sm text-text-secondary">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={15} className="text-accent-primary" />
                    {formatEventDate(event)}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={15} className="text-accent-primary" />
                    {event.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <Ticket size={15} className="text-accent-primary" />
                    {event.enrolledCount} / {event.maxCapacity} zarejestrowanych
                  </p>
                  {typeof event.scannedCount === "number" && (
                    <p className="flex items-center gap-2">
                      <CheckCheck size={15} className="text-status-success" />
                      {event.scannedCount} wpuszczonych
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-auto flex gap-2 border-t border-border-light pt-4">
                  <Link
                    to={`/organizer/events/${event.id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-bg-secondary py-2 text-sm font-medium text-accent-primary transition hover:bg-accent-subtle"
                  >
                    <Settings2 size={15} />
                    Zarządzaj
                  </Link>
                  {isUpcoming && (
                    <Link
                      to={`/organizer/scanner/${event.id}`}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-status-success py-2 text-sm font-medium text-text-on-accent transition hover:opacity-90"
                    >
                      <ScanLine size={15} />
                      Skaner
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
