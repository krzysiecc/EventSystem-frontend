import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Ticket,
  QrCode,
} from "lucide-react";
import {
  useEventDetails,
  useRegisterForEvent,
  useMyTickets,
} from "./api/useStudentQueries";
import { useToastStore } from "@/store/useToastStore";
import { formatEventDate } from "@/lib/eventDate";

const EventDetailsStudent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, isError } = useEventDetails(id);
  const { data: tickets } = useMyTickets();
  const registerMutation = useRegisterForEvent();
  const addToast = useToastStore((state) => state.addToast);

  if (isLoading) return <div className="p-6">Ładowanie szczegółów...</div>;
  if (isError || !event)
    return (
      <div className="p-6 text-status-error">Nie znaleziono wydarzenia.</div>
    );

  // Masz już bilet na to wydarzenie? Zamiast zapisu — link do kodu QR biletu.
  const existingTicket = (tickets ?? []).find(
    (t) =>
      (t.eventId != null && t.eventId === event.id) ||
      t.eventTitle.trim().toLowerCase() === event.title.trim().toLowerCase(),
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
    <div className="mx-auto max-w-3xl">
      <Link
        to="/student/events"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-accent-primary hover:underline"
      >
        <ArrowLeft size={15} />
        Wróć do listy
      </Link>

      <div className="rounded-xl border border-border-light bg-surface-raised p-6 shadow-sm md:p-10">
        <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-text-primary md:text-4xl">
          {event.title}
        </h1>

        <div className="mb-8 grid grid-cols-1 gap-4 rounded-xl bg-bg-secondary p-4 sm:grid-cols-3">
          <div>
            <span className="mb-1 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-text-muted">
              <CalendarDays size={13} /> Data
            </span>
            <span className="font-medium text-text-primary">
              {formatEventDate(event, { time: true })}
            </span>
          </div>
          <div>
            <span className="mb-1 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-text-muted">
              <MapPin size={13} /> Lokalizacja
            </span>
            <span className="font-medium text-text-primary">
              {event.locationName || event.location}
            </span>
            {event.locationName && event.location && (
              <span className="mt-0.5 block text-xs text-text-muted">
                {event.location}
              </span>
            )}
          </div>
          <div>
            <span className="mb-1 flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-text-muted">
              <Users size={13} /> Dostępność
            </span>
            <span
              className={`font-medium ${isFull ? "text-status-error" : "text-status-success"}`}
            >
              {event.maxCapacity - event.enrolledCount} / {event.maxCapacity}{" "}
              miejsc
            </span>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="mb-2 text-xl font-bold text-text-primary">
            O wydarzeniu
          </h3>
          <p className="whitespace-pre-wrap text-text-secondary">
            {event.description}
          </p>
        </div>

        {existingTicket ? (
          <Link
            to={`/student/tickets/${existingTicket.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-accent-primary px-8 py-3 text-lg font-bold text-accent-primary transition hover:bg-accent-subtle md:w-auto"
          >
            <QrCode size={18} />
            {existingTicket.isScanned ? "Pokaż bilet (zużyty)" : "Pokaż swój bilet"}
          </Link>
        ) : (
          <button
            onClick={handleRegister}
            disabled={isFull || registerMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-primary px-8 py-3 text-lg font-bold text-text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          >
            <Ticket size={18} />
            {registerMutation.isPending
              ? "Przetwarzanie..."
              : isFull
                ? "Brak miejsc"
                : "Odbierz darmowy bilet"}
          </button>
        )}
      </div>
    </div>
  );
};

export default EventDetailsStudent;
