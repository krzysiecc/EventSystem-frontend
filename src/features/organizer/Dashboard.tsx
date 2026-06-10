import { useOrganizerEvents } from "./api/useEvents";
import { Link } from "react-router-dom";

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
    <div className="layout-container py-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Panel Organizatora
          </h1>
          <p className="text-text-secondary">
            Zarządzaj swoimi nadchodzącymi wydarzeniami
          </p>
        </div>

        <Link
          to="/organizer/events/new"
          className="rounded-lg bg-accent-primary px-4 py-3 text-center font-medium text-text-on-accent transition-colors hover:bg-accent-hover sm:w-auto"
        >
          + Zorganizuj wydarzenie
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events?.length === 0 ? (
          <p className="col-span-full text-center text-text-muted py-8">
            Nie masz jeszcze żadnych wydarzeń.
          </p>
        ) : (
          events?.map((event) => {
            const isUpcoming = new Date(event.date) >= new Date();

            return (
              <div
                key={event.id}
                className="rounded-xl border border-border-light bg-surface-raised p-5 shadow-sm transition-shadow hover:shadow-md flex flex-col"
              >
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-text-primary line-clamp-2">
                    {event.title}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap
                    ${
                      isUpcoming
                        ? "bg-status-success-bg text-status-success"
                        : "bg-status-info-bg text-status-info"
                    }`}
                  >
                    {isUpcoming ? "Nadchodzące" : "Zakończone"}
                  </span>
                </div>

                <div className="mb-4 space-y-1 text-sm text-text-secondary grow">
                  <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                  <p>📍 {event.location}</p>
                  <p>
                    🎟️ {event.enrolledCount} / {event.maxCapacity}{" "}
                    zarejestrowanych
                  </p>
                  {typeof event.scannedCount === "number" && (
                    <p>✅ {event.scannedCount} wpuszczonych</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-auto pt-4 border-t border-border-light flex gap-2">
                  <Link
                    to={`/organizer/events/${event.id}`}
                    className="flex-1 rounded-md bg-bg-secondary py-2 text-center text-sm font-medium text-accent-primary transition-colors hover:bg-accent-subtle"
                  >
                    Zarządzaj
                  </Link>
                  {isUpcoming && (
                    <Link
                      to={`/organizer/scanner/${event.id}`}
                      className="flex-1 rounded-md bg-status-success text-text-on-accent py-2 text-center text-sm font-medium transition-opacity hover:opacity-90"
                    >
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
