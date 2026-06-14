import { useAllEvents } from "./api/useAdminQueries";

const AllEvents = () => {
  const { data: events, isLoading } = useAllEvents();

  if (isLoading) return <div className="p-6 text-text-muted">Ładowanie...</div>;

  return (
    <div className="layout-container py-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Wszystkie wydarzenia
      </h1>
      <div className="bg-surface-raised border border-border-light rounded-xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-secondary text-text-secondary text-sm border-b border-border-light">
              <th className="p-4 font-semibold">Tytuł</th>
              <th className="p-4 font-semibold">Organizator</th>
              <th className="p-4 font-semibold">Data</th>
              <th className="p-4 font-semibold">Zapisani / Pojemność</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {events?.map((event) => (
              <tr
                key={event.id}
                className="hover:bg-bg-secondary transition-colors"
              >
                <td className="p-4 font-medium text-text-primary">
                  {event.title}
                </td>
                <td className="p-4 text-text-secondary">
                  {event.organizerName}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllEvents;
