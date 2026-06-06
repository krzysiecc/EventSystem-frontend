import { useState } from "react";
import { useAllEvents, useRegisterForEvent } from "./api/useStudentQueries";
import { useToastStore } from "@/store/useToastStore";

const getRemainingSeatsLabel = (count: number): string => {
  if (count === 1) return "1 miejsce";
  const lastTwo = count % 100;
  const lastOne = count % 10;
  if (lastTwo >= 12 && lastTwo <= 14) return `${count} miejsc`;
  if (lastOne >= 2 && lastOne <= 4) return `${count} miejsca`;
  return `${count} miejsc`;
};

const EventBrowser = () => {
  const { data: events, isLoading } = useAllEvents();
  const registerMutation = useRegisterForEvent();
  const addToast = useToastStore((state) => state.addToast);
  const [pendingEventId, setPendingEventId] = useState<number | null>(null);

  const handleRegister = (eventId: number) => {
    setPendingEventId(eventId);
    registerMutation.mutate(eventId, {
      onSuccess: () => {
        addToast("Pomyślnie zapisano na wydarzenie!", "success");
        setPendingEventId(null);
      },
      onError: (err: unknown) => {
        addToast(
          err instanceof Error ? err.message : "Nie udało się zapisać.",
          "error"
        );
        setPendingEventId(null);
      },
    });
  };

  if (isLoading)
    return <div className="p-6 text-text-muted text-center">Ładowanie wydarzeń...</div>;

  // Bezpieczne mapowanie danych z backendu
  const safeEvents = Array.isArray(events) ? events : [];

  return (
    <div className="layout-container py-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6 text-center md:text-left">
        Nadchodzące wydarzenia
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {safeEvents.map((event) => {
          // Wyciąganie wartości (złapie camelCase ORAZ PascalCase)
          const sold = Number(event.ticketsSold ?? event.TicketsSold) || 0;
          const capacity = Number(event.maxCapacity ?? event.MaxCapacity) || 0;
          
          const remainingSeats = capacity - sold;
          const isFull = capacity > 0 && remainingSeats <= 0;
          const isThisCardPending = pendingEventId === event.id;

          const titleText = typeof event.title === 'string' ? event.title : "Wydarzenie";
          const locationText = typeof event.location === 'string' ? event.location : "Brak lokalizacji";
          const descText = typeof event.description === 'string' ? event.description.replace(/<[^>]+>/g, "") : "";
          const dateText = event.date ? new Date(event.date).toLocaleDateString("pl-PL") : "Brak daty";

          return (
            <div key={String(event.id)} className="bg-surface-raised border border-border-light rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-accent-primary transition-colors">
              <div className="p-5 flex-1">
                <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2">{titleText}</h3>
                <div className="text-sm text-text-secondary space-y-1 mb-4 border-l-2 border-accent-primary pl-3 font-mono">
                  <p>📅 {dateText}</p>
                  <p>📍 {locationText}</p>
                  <p className={isFull ? "text-status-error font-bold uppercase" : "text-status-info font-bold"}>
                    {isFull ? "Wyprzedane" : `Zostało ${getRemainingSeatsLabel(remainingSeats)}`}
                  </p>
                </div>
                <p className="text-sm text-text-muted line-clamp-3 mb-4 italic">
                  {descText}
                </p>
              </div>
              <div className="p-4 border-t border-border-light bg-bg-secondary">
                <button
                  onClick={() => handleRegister(event.id)}
                  disabled={isFull || isThisCardPending}
                  className="w-full bg-accent-primary text-text-on-accent py-2 rounded-md font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  {isThisCardPending ? "Zapisywanie..." : isFull ? "Brak wolnych miejsc" : "Pobierz darmowy bilet"}
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