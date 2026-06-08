import { useState } from "react";
import { useAllEvents, useRegisterForEvent } from "./api/useStudentQueries";
import { useToastStore } from "@/store/useToastStore";

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
    <div className="layout-container py-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Nadchodzące wydarzenia
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events?.length === 0 && (
          <p className="col-span-full text-center text-text-muted py-8">
            Nie znaleziono dostępnych wydarzeń.
          </p>
        )}

        {events?.map((event) => {
          const remainingSeats = event.maxCapacity - event.enrolledCount;
          const isFull = remainingSeats <= 0;
          const isThisCardPending = pendingEventId === event.id.toString();

          return (
            <div
              key={event.id}
              className="bg-surface-raised border border-border-light rounded-xl overflow-hidden shadow-sm flex flex-col"
            >
              <div className="p-5 flex-1">
                <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2">
                  {event.title}
                </h3>
                <div className="text-sm text-text-secondary space-y-1 mb-4">
                  <p>📅 {new Date(event.date).toLocaleDateString("pl-PL")}</p>
                  <p>📍 {event.location}</p>
                  <p
                    className={
                      isFull
                        ? "text-status-error font-medium"
                        : "text-status-info font-medium"
                    }
                  >
                    {isFull
                      ? "Brak wolnych miejsc"
                      : `Zostało ${getRemainingSeatsLabel(remainingSeats)}`}
                  </p>
                </div>
                <p className="text-sm text-text-muted line-clamp-3 mb-4">
                  {event.description.replace(/<[^>]+>/g, "")}
                </p>
              </div>

              <div className="p-4 border-t border-border-light bg-bg-secondary">
                <button
                  onClick={() => handleRegister(event.id.toString())}
                  disabled={isFull || isThisCardPending}
                  className="w-full bg-accent-primary text-text-on-accent py-2 rounded-md font-medium transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isThisCardPending
                    ? "Przetwarzanie..."
                    : isFull
                      ? "Brak miejsc"
                      : "Pobierz bilet"}
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
