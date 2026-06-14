import { CalendarDays } from "lucide-react";
import { useAllEvents } from "./api/useAdminQueries";
import PageHeader from "@/components/ui/PageHeader";
import { formatEventDate } from "@/lib/eventDate";

const AllEvents = () => {
  const { data: events, isLoading } = useAllEvents();

  if (isLoading) return <div className="p-6 text-text-muted">Ładowanie...</div>;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader kicker="Administrator" title="Wszystkie wydarzenia" />

      <div className="overflow-x-auto rounded-xl border border-border-light bg-surface-raised shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border-light font-mono text-xs uppercase tracking-wider text-text-muted">
              <th className="p-4 font-medium">Tytuł</th>
              <th className="p-4 font-medium">Organizator</th>
              <th className="p-4 font-medium">Data</th>
              <th className="p-4 font-medium">Zapisani / Pojemność</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {events?.map((event) => (
              <tr
                key={event.id}
                className="transition-colors hover:bg-bg-secondary"
              >
                <td className="p-4 font-medium text-text-primary">
                  {event.title}
                </td>
                <td className="p-4 text-text-secondary">
                  {event.organizerName}
                </td>
                <td className="p-4 font-mono text-sm text-text-secondary">
                  <span className="flex items-center gap-2">
                    <CalendarDays
                      size={14}
                      className="text-accent-primary"
                      aria-hidden="true"
                    />
                    {formatEventDate(event)}
                  </span>
                </td>
                <td className="p-4 font-mono text-sm text-text-secondary">
                  {event.enrolledCount} / {event.maxCapacity}
                </td>
                <td className="p-4">
                  <span
                    className={`rounded px-2 py-1 font-mono text-xs font-medium uppercase ${
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
