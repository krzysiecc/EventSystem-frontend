import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Ticket,
  QrCode,
  Eye,
  Clock,
} from "lucide-react";
import {
  useEventDetails,
  useRegisterForEvent,
  useMyTickets,
} from "./api/useStudentQueries";
import { useToastStore } from "@/store/useToastStore";
import { formatEventDate } from "@/lib/eventDate";
import { registrationStatus } from "@/lib/eventRegistration";

const formatDateTime = (d: Date) =>
  d.toLocaleString("pl-PL", { dateStyle: "long", timeStyle: "short" });

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
  // Dopasowujemy PRZEDE WSZYSTKIM po `eventId`. Dopasowanie po tytule jest tylko
  // awaryjne — dla biletów bez `eventId` (legacy). W serii cyklicznej wszystkie
  // terminy mają ten sam tytuł, więc łączenie po tytule wskazywałoby na inny
  // termin (np. bilet z 15 czerwca otwierany ze strony terminu z 29 czerwca).
  const existingTicket = (tickets ?? []).find((t) =>
    t.eventId != null
      ? t.eventId === event.id
      : t.eventTitle.trim().toLowerCase() === event.title.trim().toLowerCase(),
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
  const reg = registrationStatus(event);

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
        <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-text-primary md:text-4xl">
          {event.title}
        </h1>

        {event.clicks24h != null && (
          <p className="mb-6 flex items-center gap-1.5 text-sm text-text-muted">
            <Eye size={15} className="text-accent-primary" />
            Odwiedziny (24h): {event.clicks24h}
          </p>
        )}

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

        {/* Informacja o harmonogramie zapisów (gdy ustawione okna rejestracji). */}
        {reg.phase !== "open" && (
          <p className="mb-3 flex items-center gap-2 text-sm text-text-secondary">
            <Clock size={15} className="text-accent-primary" />
            {reg.phase === "presave"
              ? `Trwa pre-rejestracja. Pełna rejestracja otwiera się ${formatDateTime(reg.opensAt!)}.`
              : reg.presaveAt
                ? `Pre-rejestracja od ${formatDateTime(reg.presaveAt)}, pełna rejestracja od ${formatDateTime(reg.opensAt!)}.`
                : `Rejestracja otwiera się ${formatDateTime(reg.opensAt!)}.`}
          </p>
        )}

        {existingTicket ? (
          <Link
            to={`/student/tickets/${existingTicket.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-accent-primary px-8 py-3 text-lg font-bold text-accent-primary transition hover:bg-accent-subtle md:w-auto"
          >
            <QrCode size={18} />
            {existingTicket.isScanned ? "Pokaż bilet (zużyty)" : "Pokaż swój bilet"}
          </Link>
        ) : reg.phase === "closed" ? (
          <button
            disabled
            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-accent-primary px-8 py-3 text-lg font-bold text-text-on-accent opacity-50 md:w-auto"
          >
            <Clock size={18} />
            Zapisy jeszcze niedostępne
          </button>
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
                : reg.phase === "presave"
                  ? "Pre-rejestracja — odbierz bilet"
                  : "Odbierz darmowy bilet"}
          </button>
        )}
      </div>
    </div>
  );
};

export default EventDetailsStudent;
