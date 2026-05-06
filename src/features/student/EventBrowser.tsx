import { useAllEvents, useRegisterForEvent } from "./api/useStudentQueries";
import { useToastStore } from "@/store/useToastStore";

const EventBrowser = () => {
  const { data: events, isLoading } = useAllEvents();
  const registerMutation = useRegisterForEvent();
  const addToast = useToastStore((state) => state.addToast);

  const handleRegister = (eventId: string) => {
    registerMutation.mutate(eventId, {
      onSuccess: () =>
        addToast("Successfully registered for the event!", "success"),
      onError: (err: unknown) =>
        addToast(
          err instanceof Error ? err.message : "Failed to register.",
          "error"
        ),
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
        {events?.map((event) => (
          <div
            key={event.id}
            className="bg-surface-raised border border-border-light rounded-xl overflow-hidden shadow-sm flex flex-col"
          >
            <div className="p-5 flex-1">
              <h3 className="text-lg font-bold text-text-primary mb-2 line-clamp-2">
                {event.title}
              </h3>
              <div className="text-sm text-text-secondary space-y-1 mb-4">
                <p>📅 {new Date(event.date).toLocaleDateString()}</p>
                <p>📍 {event.location}</p>
                <p className="text-status-info font-medium">
                  {(() => {
                    const remainingSeats = event.capacity - event.ticketsSold;
                    const endsWith1 = remainingSeats % 10 === 1;
                    const teens = remainingSeats % 100 >= 12 && remainingSeats % 100 <= 14;
                    const form =
                      remainingSeats === 1
                        ? "miejsce"
                        : endsWith1 && !teens
                          ? "miejsca"
                          : "miejsc";

                    return `${remainingSeats === 1 ? "Zostało" : "Zostało"} ${remainingSeats} ${form}`;
                  })()}
                </p>
              </div>
              <p className="text-sm text-text-muted line-clamp-3 mb-4">
                {event.description}
              </p>
            </div>

            <div className="p-4 border-t border-border-light bg-bg-secondary flex gap-2">
              <button
                onClick={() => handleRegister(event.id)}
                disabled={
                  event.capacity <= event.ticketsSold ||
                  registerMutation.isPending
                }
                className="flex-1 bg-accent-primary text-text-on-accent py-2 rounded-md font-medium transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registerMutation.isPending ? "Przetwarzanie..." : "Pobierz bilet"}
              </button>
            </div>
          </div>
        ))}
        {events?.length === 0 && (
          <p className="col-span-full text-center text-text-muted">
            Nie znaleziono dostępnych wydarzeń.
          </p>
        )}
      </div>
    </div>
  );
};

export default EventBrowser;
