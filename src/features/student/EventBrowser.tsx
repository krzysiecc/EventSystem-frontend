import { useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  ArrowRight,
  Search,
  X,
  Loader2,
  Check,
} from "lucide-react";
import {
  useAllEvents,
  useRegisterForEvent,
  useMyTickets,
  type PublicEvent,
  type Ticket,
} from "./api/useStudentQueries";
import { useToastStore } from "@/store/useToastStore";
import PageHeader from "@/components/ui/PageHeader";
import { formatEventDate, eventStart } from "@/lib/eventDate";

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

const labelClass =
  "mb-1 block font-mono text-[11px] uppercase tracking-wider text-text-muted";
const inputClass =
  "w-full rounded-md border border-border-medium bg-bg-tertiary px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

const EventBrowser = () => {
  const { data: events, isLoading } = useAllEvents();
  const { data: tickets } = useMyTickets();
  const registerMutation = useRegisterForEvent();
  const addToast = useToastStore((state) => state.addToast);

  // Mapowanie: czy student ma już bilet na dane wydarzenie (po ID, a w razie
  // braku eventId — po tytule). Pozwala wyszarzyć „Pobierz bilet".
  const ticketForEvent = useMemo(() => {
    const byId = new Map<number, Ticket>();
    const byTitle = new Map<string, Ticket>();
    (tickets ?? []).forEach((t) => {
      if (t.eventId != null) byId.set(t.eventId, t);
      byTitle.set(t.eventTitle.trim().toLowerCase(), t);
    });
    return (e: PublicEvent) =>
      byId.get(e.id) ?? byTitle.get(e.title.trim().toLowerCase());
  }, [tickets]);

  // Track which event ID is currently being registered to show per-card loading
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);

  // Filtry: wyszukiwanie po nazwie + zakres dat (działają tak samo na mobile)
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

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

  const filtered = useMemo(() => {
    if (!events) return [];
    const q = search.trim().toLowerCase();
    const fromTs = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toTs = to ? new Date(`${to}T23:59:59`).getTime() : null;
    return events.filter((e) => {
      if (q && !e.title.toLowerCase().includes(q)) return false;
      const ts = eventStart(e).getTime();
      if (fromTs != null && ts < fromTs) return false;
      if (toTs != null && ts > toTs) return false;
      return true;
    });
  }, [events, search, from, to]);

  const hasFilters = !!(search || from || to);
  const clearFilters = () => {
    setSearch("");
    setFrom("");
    setTo("");
  };

  if (isLoading)
    return <div className="p-6 text-text-muted">Ładowanie wydarzeń...</div>;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader kicker="Student" title="Nadchodzące wydarzenia" />

      {/* FILTRY */}
      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-border-light bg-surface-raised p-3 shadow-sm sm:flex-row sm:items-end sm:gap-4 sm:p-4">
        <div className="min-w-0 flex-1">
          <label className={labelClass}>Szukaj</label>
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nazwa wydarzenia..."
              className={`${inputClass} pl-9`}
            />
          </div>
        </div>
        <div className="sm:w-40">
          <label className={labelClass}>Od dnia</label>
          <input
            type="date"
            value={from}
            max={to || undefined}
            onChange={(e) => setFrom(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="sm:w-40">
          <label className={labelClass}>Do dnia</label>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
            className={inputClass}
          />
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border-medium px-3 py-2 text-sm text-text-secondary transition hover:border-accent-primary hover:text-text-primary"
          >
            <X size={14} />
            Wyczyść
          </button>
        )}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-text-muted">
          {hasFilters
            ? "Brak wydarzeń pasujących do filtrów."
            : "Nie znaleziono dostępnych wydarzeń."}
        </p>
      )}

      {/* MOBILE — wąskie paski ze zmniejszonym tekstem */}
      <ul className="space-y-2.5 md:hidden">
        {filtered.map((event, i) => {
          const remainingSeats = event.maxCapacity - event.enrolledCount;
          const isFull = remainingSeats <= 0;
          const isThisCardPending = pendingEventId === event.id.toString();
          const myTicket = ticketForEvent(event);
          const hasTicket = !!myTicket;
          const usedTicket = myTicket?.isScanned ?? false;

          return (
            <li
              key={event.id}
              style={{ animationDelay: `${i * 35}ms` }}
              className="animate-rise"
            >
              <div className="flex items-center gap-3 rounded-lg border border-border-light bg-surface-raised p-3 shadow-sm transition hover:border-accent-primary">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-text-primary">
                    {event.title}
                  </h3>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={12} className="text-accent-primary" />
                      {formatEventDate(event)}
                    </span>
                    <span className="flex min-w-0 items-center gap-1">
                      <MapPin
                        size={12}
                        className="shrink-0 text-accent-primary"
                      />
                      <span className="truncate">
                        {event.locationName || event.location}
                      </span>
                    </span>
                  </div>
                  <span
                    className={`mt-1 inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ${
                      usedTicket
                        ? "bg-bg-tertiary text-text-muted"
                        : hasTicket
                          ? "bg-status-success-bg text-status-success"
                          : isFull
                            ? "bg-status-error-bg text-status-error"
                            : "bg-accent-subtle text-accent-secondary"
                    }`}
                  >
                    {usedTicket
                      ? "Bilet zużyty"
                      : hasTicket
                        ? "Masz bilet"
                        : isFull
                          ? "Brak miejsc"
                          : getRemainingSeatsLabel(remainingSeats)}
                  </span>
                </div>
                <button
                  onClick={() => handleRegister(event.id.toString())}
                  disabled={isFull || isThisCardPending || hasTicket}
                  aria-label={hasTicket ? "Masz już bilet" : "Pobierz bilet"}
                  title={
                    usedTicket
                      ? "Bilet zużyty"
                      : hasTicket
                        ? "Masz już bilet"
                        : "Pobierz bilet"
                  }
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent-primary text-text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isThisCardPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : hasTicket ? (
                    <Check size={16} />
                  ) : (
                    <ArrowRight size={16} />
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* DESKTOP — karty */}
      <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((event, i) => {
          const remainingSeats = event.maxCapacity - event.enrolledCount;
          const isFull = remainingSeats <= 0;
          const isThisCardPending = pendingEventId === event.id.toString();
          const myTicket = ticketForEvent(event);
          const hasTicket = !!myTicket;
          const usedTicket = myTicket?.isScanned ?? false;

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
                      usedTicket
                        ? "bg-bg-tertiary text-text-muted"
                        : hasTicket
                          ? "bg-status-success-bg text-status-success"
                          : isFull
                            ? "bg-status-error-bg text-status-error"
                            : "bg-accent-subtle text-accent-secondary"
                    }`}
                  >
                    {usedTicket
                      ? "Bilet zużyty"
                      : hasTicket
                        ? "Masz bilet"
                        : isFull
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
                    {formatEventDate(event)}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={15} className="text-accent-primary" />
                    {event.locationName || event.location}
                  </p>
                </div>
                <p className="line-clamp-3 text-sm text-text-muted">
                  {event.description.replace(/<[^>]+>/g, "")}
                </p>
              </div>

              <div className="border-t border-border-light p-4">
                <button
                  onClick={() => handleRegister(event.id.toString())}
                  disabled={isFull || isThisCardPending || hasTicket}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-accent-primary py-2 font-medium text-text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isThisCardPending
                    ? "Przetwarzanie..."
                    : usedTicket
                      ? "Bilet zużyty"
                      : hasTicket
                        ? "Masz już bilet"
                        : isFull
                          ? "Brak miejsc"
                          : "Pobierz bilet"}
                  {!isFull && !isThisCardPending && !hasTicket && (
                    <ArrowRight size={15} />
                  )}
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
