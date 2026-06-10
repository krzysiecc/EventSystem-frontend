import { Link } from "react-router-dom";
import { useOrganizerEvents } from "./api/useEvents";

const ManageEvents = () => {
  const { data: events, isLoading } = useOrganizerEvents();

  if (isLoading)
    return <div className="p-6 text-text-muted">Ładowanie wydarzeń...</div>;

  return (
    <div className="layout-container py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">
          Zarządzaj wydarzeniami
        </h1>
        <Link
          to="/organizer/events/new"
          className="bg-accent-primary text-text-on-accent px-4 py-2 rounded-md hover:bg-accent-hover transition"
        >
          + Nowe wydarzenie
        </Link>
      </div>

      <div className="bg-surface-raised border border-border-light rounded-xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-secondary text-text-secondary text-sm border-b border-border-light">
              <th className="p-4 font-semibold">Tytuł</th>
              <th className="p-4 font-semibold">Data</th>
              <th className="p-4 font-semibold">Zapisani</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {events?.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-muted">
                  Brak wydarzeń.
                </td>
              </tr>
            ) : (
              events?.map((event) => (
                <tr
                  key={event.id}
                  className="hover:bg-bg-secondary transition-colors"
                >
                  <td className="p-4 font-medium text-text-primary">
                    {event.title}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-text-secondary">
                    {event.enrolledCount} / {event.maxCapacity}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        event.status === "published"
                          ? "bg-status-success-bg text-status-success"
                          : "bg-status-warning-bg text-status-warning"
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <Link
                      to={`/organizer/events/${event.id}`}
                      className="text-accent-primary hover:underline text-sm font-medium"
                    >
                      Szczegóły
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageEvents;
