import { useParams, Link, useNavigate } from "react-router-dom";
import { useEventDetails, useRegisterForEvent } from "./api/useStudentQueries";
import { useToastStore } from "@/store/useToastStore";

const EventDetailsStudent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, isError } = useEventDetails(id);
  const registerMutation = useRegisterForEvent();
  const addToast = useToastStore((state) => state.addToast);

  if (isLoading) return <div className="p-6">Ładowanie szczegółów...</div>;
  if (isError || !event)
    return (
      <div className="p-6 text-status-error">Nie znaleziono wydarzenia.</div>
    );

  const handleRegister = () => {
    registerMutation.mutate(event.id.toString(), {
      onSuccess: () => {
        addToast(
          "Zapisano pomyślnie! Bilet znajduje się w Twoim panelu.",
          "success",
        );
        navigate("/student/tickets");
      },
      onError: () =>
        addToast("Błąd podczas rejestracji na wydarzenie.", "error"),
    });
  };

  const isFull = event.maxCapacity <= event.enrolledCount;

  return (
    <div className="layout-container py-6 max-w-3xl">
      <Link
        to="/student/events"
        className="text-accent-primary hover:underline mb-6 inline-block"
      >
        ← Wróć do listy
      </Link>

      <div className="bg-surface-raised border border-border-light rounded-2xl p-6 md:p-10 shadow-sm">
        <h1 className="text-3xl font-extrabold text-text-primary mb-4">
          {event.title}
        </h1>

        <div className="flex flex-col md:flex-row gap-6 mb-8 text-text-secondary bg-bg-secondary p-4 rounded-xl">
          <div>
            <span className="block text-xs uppercase font-bold text-text-muted">
              Data
            </span>
            <span className="font-medium">
              {new Date(event.date).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="block text-xs uppercase font-bold text-text-muted">
              Lokalizacja
            </span>
            <span className="font-medium">{event.location}</span>
          </div>
          <div>
            <span className="block text-xs uppercase font-bold text-text-muted">
              Dostępność
            </span>
            <span
              className={`font-medium ${isFull ? "text-status-error" : "text-status-success"}`}
            >
              {event.maxCapacity - event.enrolledCount} / {event.maxCapacity}{" "}
              miejsc
            </span>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-text-primary mb-10">
          <h3 className="text-xl font-bold mb-2">O wydarzeniu</h3>
          <p className="whitespace-pre-wrap">{event.description}</p>
        </div>

        <button
          onClick={handleRegister}
          disabled={isFull || registerMutation.isPending}
          className="w-full md:w-auto bg-accent-primary text-text-on-accent px-8 py-3 rounded-lg font-bold text-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {registerMutation.isPending
            ? "Przetwarzanie..."
            : isFull
              ? "Brak miejsc"
              : "Odbierz darmowy bilet"}
        </button>
      </div>
    </div>
  );
};

export default EventDetailsStudent;
