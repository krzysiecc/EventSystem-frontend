import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Eye, Pencil, Flame } from "lucide-react";
import { useOrganizerEvents } from "./api/useEvents";
import PageHeader from "@/components/ui/PageHeader";
import SortSelect from "@/components/ui/SortSelect";
import { formatEventDate } from "@/lib/eventDate";
import {
  sortEvents,
  DEFAULT_EVENT_SORT,
  type EventSortKey,
} from "@/lib/eventSort";
import { isNearlyFull } from "@/lib/eventPopularity";

const ManageEvents = () => {
  const { data: events, isLoading } = useOrganizerEvents();
  const [sort, setSort] = useState<EventSortKey>(DEFAULT_EVENT_SORT);
  const sorted = useMemo(() => sortEvents(events ?? [], sort), [events, sort]);

  if (isLoading)
    return <div className="p-6 text-text-muted">Ładowanie wydarzeń...</div>;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Organizator"
        title="Zarządzaj wydarzeniami"
        actions={
          <Link
            to="/organizer/events/new"
            className="flex items-center gap-2 rounded-md bg-accent-primary px-4 py-2 font-medium text-text-on-accent transition hover:bg-accent-hover"
          >
            <Plus size={16} />
            Nowe wydarzenie
          </Link>
        }
      />

      <div className="mb-4 flex justify-end">
        <SortSelect value={sort} onChange={setSort} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border-light bg-surface-raised shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border-light font-mono text-xs uppercase tracking-wider text-text-muted">
              <th className="p-4 font-medium">Tytuł</th>
              <th className="p-4 font-medium">Data</th>
              <th className="p-4 font-medium">Zapisani</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 text-right font-medium">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-text-muted">
                  Brak wydarzeń.
                </td>
              </tr>
            ) : (
              sorted.map((event) => {
                const isUpcoming = new Date(event.date) >= new Date();

                return (
                  <tr
                    key={event.id}
                    className="transition-colors hover:bg-bg-secondary"
                  >
                    <td className="p-4 font-medium text-text-primary">
                      {event.title}
                    </td>
                    <td className="p-4 font-mono text-sm text-text-secondary">
                      {formatEventDate(event)}
                    </td>
                    <td className="p-4 font-mono text-sm text-text-secondary">
                      <span className="inline-flex items-center gap-1.5">
                        {event.enrolledCount} / {event.maxCapacity}
                        {isNearlyFull(
                          event.enrolledCount,
                          event.maxCapacity,
                        ) && (
                          <Flame
                            size={13}
                            className="text-status-warning"
                            aria-label="Popularne — zajęte ponad połowa miejsc"
                          />
                        )}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded px-2 py-1 font-mono text-xs font-medium uppercase ${
                          isUpcoming
                            ? "bg-status-success-bg text-status-success"
                            : "bg-status-info-bg text-status-info"
                        }`}
                      >
                        {isUpcoming ? "Nadchodzące" : "Zakończone"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/organizer/events/${event.id}`}
                          className="flex items-center gap-1.5 text-sm font-medium text-accent-primary hover:underline"
                        >
                          <Eye size={14} />
                          Szczegóły
                        </Link>
                        <Link
                          to={`/organizer/events/${event.id}/edit`}
                          className="flex items-center gap-1.5 text-sm font-medium text-accent-primary hover:underline"
                        >
                          <Pencil size={14} />
                          Edytuj
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageEvents;
