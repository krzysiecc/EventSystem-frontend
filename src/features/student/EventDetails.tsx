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
  Check,
  BellRing,
} from "lucide-react";
import {
  useEventDetails,
  useRegisterForEvent,
  useMyTickets,
  usePresaveEvent,
  useCancelPresave,
} from "./api/useStudentQueries";
import { useQueryClient } from "@tanstack/react-query";
import { useToastStore } from "@/store/useToastStore";
import { ApiError } from "@/lib/apiClient";
import { formatEventDate, getEventPhase } from "@/lib/eventDate";
import { registrationStatus } from "@/lib/eventRegistration";

const formatDateTime = (d: Date) =>
  d.toLocaleString("pl-PL", { dateStyle: "long", timeStyle: "short" });

const EventDetailsStudent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, isError } = useEventDetails(id);
  const { data: tickets } = useMyTickets();
  const registerMutation = useRegisterForEvent();
  const presaveMutation = usePresaveEvent();
  const cancelPresaveMutation = useCancelPresave();
  const addToast = useToastStore((state) => state.addToast);
  const queryClient = useQueryClient();

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

  const isFull = event.maxCapacity <= event.enrolledCount;
  const reg = registrationStatus(event);
  const isPresave = reg.phase === "presave";
  // Backend blokuje zapis, gdy wydarzenie już się rozpoczęło (`Date < now`),
  // a po `endDate` jest zakończone. Odzwierciedlamy to w UI, zamiast pokazywać
  // przycisk zapisu, który i tak zwróci błąd. (Czas czytany w libie, nie w
  // renderze — zgodnie z regułą czystości komponentów.)
  const phase = getEventPhase(event);
  const hasEnded = phase === "ended";
  const hasStarted = phase !== "upcoming";

  // Pre-rejestracja = zapis na POWIADOMIENIE mailowe o starcie właściwej
  // rejestracji. Osobny stan niż bilet — nie wywołujemy `/tickets/enroll`
  // (backend zwróciłby 409), tylko dedykowany endpoint presave. Bilet odbiera
  // się dopiero w fazie „open", gdy student dostanie maila.
  const handlePresave = () => {
    presaveMutation.mutate(event.id.toString(), {
      onSuccess: () =>
        addToast(
          `Damy znać mailem, gdy ruszy rejestracja (${formatDateTime(reg.opensAt!)}).`,
          "success",
        ),
      onError: (err) => {
        // 409 = już zapisany na powiadomienie: odśwież szczegóły, by UI pokazał stan.
        if (err instanceof ApiError && err.status === 409) {
          queryClient.invalidateQueries({ queryKey: ["student", "events", id] });
          addToast("Już czekasz na powiadomienie o tym wydarzeniu.", "info");
          return;
        }
        addToast("Nie udało się zapisać na powiadomienie.", "error");
      },
    });
  };

  const handleCancelPresave = () => {
    cancelPresaveMutation.mutate(event.id.toString(), {
      onSuccess: () => addToast("Powiadomienie odwołane.", "info"),
      onError: () => addToast("Nie udało się odwołać powiadomienia.", "error"),
    });
  };

  const handleRegister = () => {
    registerMutation.mutate(event.id.toString(), {
      onSuccess: () => {
        addToast(
          "Zapisano pomyślnie! Bilet znajduje się w Twoim panelu.",
          "success",
        );
        navigate("/student/tickets");
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          // 409 = backend twardo blokuje zapis przed `registrationOpensAt`
          // (kod „registration_not_open", w ciele jest `opensAt`). Backend nie
          // zna pre-rejestracji — odrzuca KAŻDY zapis przed tą datą.
          if (err.status === 409) {
            const opensAt = (err.body as { opensAt?: string })?.opensAt;
            addToast(
              opensAt
                ? `Rejestracja otwiera się ${formatDateTime(new Date(opensAt))}.`
                : "Rejestracja nie jest jeszcze otwarta.",
              "warning",
            );
            queryClient.invalidateQueries({
              queryKey: ["student", "events", id],
            });
            return;
          }
          // 400 „Masz już bilet…" — masz już zapis; odśwież bilety, żeby widok
          // przełączył się na „Pokaż swój bilet".
          if (/bilet/i.test(err.message)) {
            addToast(err.message, "info");
            queryClient.invalidateQueries({ queryKey: ["student", "tickets"] });
            return;
          }
        }
        addToast("Błąd podczas rejestracji na wydarzenie.", "error");
      },
    });
  };

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

        {/* Wyraźny znacznik fazy zapisów — odróżnia pre-rejestrację od pełnej
            rejestracji i stanu zamkniętego (zanim trafi się na przycisk niżej). */}
        <span
          className={`mb-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            hasEnded || hasStarted || reg.phase === "closed"
              ? "bg-bg-tertiary text-text-muted"
              : isPresave
                ? "bg-accent-subtle text-accent-primary"
                : isFull
                  ? "bg-status-error/15 text-status-error"
                  : "bg-status-success/15 text-status-success"
          }`}
        >
          {isPresave && event.hasPresaved ? (
            <Check size={13} />
          ) : (
            <Clock size={13} />
          )}
          {hasEnded
            ? "Wydarzenie zakończone"
            : hasStarted
              ? "Wydarzenie w toku"
              : reg.phase === "closed"
                ? "Zapisy jeszcze zamknięte"
                : isPresave
                  ? event.hasPresaved
                    ? "Powiadomienie włączone"
                    : "Wkrótce rejestracja"
                  : isFull
                    ? "Brak wolnych miejsc"
                    : "Rejestracja otwarta"}
        </span>

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
              ? `Rejestracja otwiera się ${formatDateTime(reg.opensAt!)} — zapisz się na powiadomienie, a wyślemy Ci maila, gdy ruszy.`
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
        ) : hasEnded || hasStarted ? (
          <div className="space-y-1.5">
            <button
              disabled
              className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-bg-tertiary px-8 py-3 text-lg font-bold text-text-muted md:w-auto"
            >
              <Clock size={18} />
              {hasEnded ? "Wydarzenie zakończone" : "Wydarzenie w toku"}
            </button>
            <p className="text-xs text-text-muted">
              {hasEnded
                ? "To wydarzenie już się odbyło."
                : "Zapisy zamykają się w chwili rozpoczęcia wydarzenia."}
            </p>
          </div>
        ) : reg.phase === "closed" ? (
          <button
            disabled
            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-accent-primary px-8 py-3 text-lg font-bold text-text-on-accent opacity-50 md:w-auto"
          >
            <Clock size={18} />
            Zapisy jeszcze niedostępne
          </button>
        ) : isPresave ? (
          // Faza pre-rejestracji: zapis na POWIADOMIENIE mailowe (nie bilet). Po
          // zapisie student widzi potwierdzenie + może odwołać; bilet odbierze,
          // gdy ruszy „open" i dostanie maila.
          event.hasPresaved ? (
            <div className="space-y-2">
              <div className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-accent-primary bg-accent-subtle px-8 py-3 text-lg font-bold text-accent-primary md:w-auto">
                <Check size={18} />
                Powiadomimy Cię mailem
              </div>
              <button
                onClick={handleCancelPresave}
                disabled={cancelPresaveMutation.isPending}
                className="block text-sm text-text-muted underline hover:text-text-secondary disabled:opacity-50"
              >
                {cancelPresaveMutation.isPending
                  ? "Odwoływanie..."
                  : "Odwołaj powiadomienie"}
              </button>
            </div>
          ) : (
            <button
              onClick={handlePresave}
              disabled={presaveMutation.isPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-primary px-8 py-3 text-lg font-bold text-text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            >
              <BellRing size={18} />
              {presaveMutation.isPending
                ? "Przetwarzanie..."
                : "Powiadom mnie, gdy ruszy rejestracja"}
            </button>
          )
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
