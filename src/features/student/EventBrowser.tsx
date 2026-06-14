import { useState } from "react";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import { useAllEvents, useRegisterForEvent } from "./api/useStudentQueries";
import { useToastStore } from "@/store/useToastStore";
import PageHeader from "@/components/ui/PageHeader";

/**
 * @description Returns the correct Polish grammatical form for "miejsce/miejsca/miejsc"
 * based on the number of remaining seats.
 */
const getRemainingSeatsLabel = (count: number): string => {
  if (count === 1) return "1 miejsce";
  const lastTwo = count % 100;
  const lastOne = count % 10;
  // 12-14 use "miejsc" regardless of last digit
  if (lastTwo >= 12 && lastTwo <= 14) return `${count} miejsc`;
  // 2, 3, 4 use "miejsca"
  if (lastOne >= 2 && lastOne <= 4) return `${count} miejsca`;
  return `${count} miejsc`;
};

const EventBrowser = () => {
  const { data: events, isLoading } = useAllEvents();
  const registerMutation = useRegisterForEvent();
  const addToast = useToastStore((state) => state.addToast);

  // Track which event ID is currently being registered to show per-card loading
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);

  const handleRegister = (eventId: string) => {
    setPendingEventId(eventId);
    registerMutation.mutate(eventId, {
      onSuccess: () => {
        addToast("Pomyślnie zapisano na wydarzenie!", "success");
        setPendingEventId(null);
      },
      onError: (err: unknown) => {
        addToast(
          err instanceof Error ? err.message : "Nie udało się zapisać.",
          "error",
        );
        setPendingEventId(null);
      },
    });
  };

  if (isLoading)
    return <div className="p-6 text-text-muted">Ładowanie wydarzeń...</div>;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader kicker="Student" title="Nadchodzące wydarzenia" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events?.length === 0 && (
          <p className="col-span-full py-8 text-center text-text-muted">
            Nie znaleziono dostępnych wydarzeń.
          </p>
        )}

        {events?.map((event, i) => {
          const remainingSeats = event.maxCapacity - event.enrolledCount;
          const isFull = remainingSeats <= 0;
          const isThisCardPending = pendingEventId === event.id.toString();

          return (
            <div
              key={event.id}
              style={{ animationDelay: `${i * 50}ms` }}
              className="animate-rise group flex flex-col overflow-hidden rounded-xl border border-border-light bg-surface-raised shadow-sm transition hover:border-accent-primary hover:shadow-md"
            >
              <div className="flex-1 p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="font-mono text-2xl font-extrabold leading-none text-text-primary opacity-15">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`rounded px-2 py-1 font-mono text-xs font-medium ${
                      isFull
                        ? "bg-status-error-bg text-status-error"
                        : "bg-accent-subtle text-accent-secondary"
                    }`}
                  >
                    {isFull
                      ? "Brak miejsc"
                      : getRemainingSeatsLabel(remainingSeats)}
                  </span>
                </div>
                <h3 className="mb-3 line-clamp-2 text-xl font-bold text-text-primary">
                  {event.title}
                </h3>
                <div className="mb-4 space-y-1.5 text-sm text-text-secondary">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={15} className="text-accent-primary" />
                    {new Date(event.date).toLocaleDateString("pl-PL")}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={15} className="text-accent-primary" />
                    {event.location}
                  </p>
                </div>
                <p className="line-clamp-3 text-sm text-text-muted">
                  {event.description.replace(/<[^>]+>/g, "")}
                </p>
              </div>

              <div className="border-t border-border-light p-4">
                <button
                  onClick={() => handleRegister(event.id.toString())}
                  disabled={isFull || isThisCardPending}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-accent-primary py-2 font-medium text-text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isThisCardPending
                    ? "Przetwarzanie..."
                    : isFull
                      ? "Brak miejsc"
                      : "Pobierz bilet"}
                  {!isFull && !isThisCardPending && <ArrowRight size={15} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventBrowser;
