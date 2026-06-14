import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  ChevronLeft,
  ChevronRight,
  X,
  CalendarDays,
  MapPin,
  Clock,
} from "lucide-react";
import { useCalendarEvents, type CalendarEvent } from "./api/useCalendarEvents";
import { formatEventDate } from "@/lib/eventDate";
import PageHeader from "@/components/ui/PageHeader";
import "./EventCalendar.css";

const MONTHS = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];
const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/**
 * @description Kalendarz wszystkich wydarzeń (student + organizator). Każdy dzień
 * to obracająca się kostka 3D (gsap) z numerem dnia na froncie; bar u góry
 * pozwala ustawić miesiąc i rok. Kliknięcie dnia z wydarzeniami otwiera
 * animowany popup z listą wydarzeń tego dnia.
 */
const EventCalendar = () => {
  const { data: events, isLoading } = useCalendarEvents();
  const init = useMemo(() => new Date(), []);
  const [year, setYear] = useState(init.getFullYear());
  const [month, setMonth] = useState(init.getMonth());
  const [selected, setSelected] = useState<{
    label: string;
    events: CalendarEvent[];
  } | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Rozłożenie wydarzeń na poszczególne dni (z obsługą zakresu start–koniec).
  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    (events ?? []).forEach((e) => {
      const start = new Date(e.startDate ?? e.date);
      if (Number.isNaN(start.getTime())) return;
      const endRaw = e.endDate ? new Date(e.endDate) : start;
      const cur = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
      );
      const last = Number.isNaN(endRaw.getTime())
        ? new Date(cur)
        : new Date(endRaw.getFullYear(), endRaw.getMonth(), endRaw.getDate());
      let guard = 0;
      while (cur <= last && guard < 366) {
        const k = keyOf(cur);
        const arr = map.get(k);
        if (arr) arr.push(e);
        else map.set(k, [e]);
        cur.setDate(cur.getDate() + 1);
        guard++;
      }
    });
    return map;
  }, [events]);

  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Pn = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstDow + daysInMonth) / 7) * 7;
  const rows = totalCells / 7;
  const todayKey = keyOf(init);

  // Pochylenie kostek za kursorem (tylko mysz, bez reduced-motion).
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const radius = 2.2;
    const maxAngle = 32;
    let raf = 0;

    const tiltAt = (rowC: number, colC: number) => {
      grid.querySelectorAll<HTMLElement>(".cal-cube").forEach((cube) => {
        const r = Number(cube.dataset.row);
        const c = Number(cube.dataset.col);
        const dist = Math.hypot(r - rowC, c - colC);
        if (dist <= radius) {
          const pct = 1 - dist / radius;
          gsap.to(cube, {
            duration: 0.3,
            ease: "power3.out",
            overwrite: true,
            rotateX: -pct * maxAngle,
            rotateY: pct * maxAngle,
          });
        } else {
          gsap.to(cube, {
            duration: 0.6,
            ease: "power3.out",
            overwrite: true,
            rotateX: 0,
            rotateY: 0,
          });
        }
      });
    };

    const onMove = (e: PointerEvent) => {
      const rect = grid.getBoundingClientRect();
      const colC = (e.clientX - rect.left) / (rect.width / 7);
      const rowC = (e.clientY - rect.top) / (rect.height / rows);
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => tiltAt(rowC, colC));
    };
    const reset = () => {
      grid.querySelectorAll<HTMLElement>(".cal-cube").forEach((cube) =>
        gsap.to(cube, {
          duration: 0.6,
          ease: "power3.out",
          rotateX: 0,
          rotateY: 0,
        }),
      );
    };

    grid.addEventListener("pointermove", onMove);
    grid.addEventListener("pointerleave", reset);
    return () => {
      grid.removeEventListener("pointermove", onMove);
      grid.removeEventListener("pointerleave", reset);
      if (raf) cancelAnimationFrame(raf);
      gsap.killTweensOf(grid.querySelectorAll(".cal-cube"));
    };
  }, [rows, year, month]);

  // Animacja wejścia popupu.
  useEffect(() => {
    if (selected && popupRef.current) {
      gsap.fromTo(
        popupRef.current,
        { scale: 0.92, opacity: 0, y: 8 },
        { scale: 1, opacity: 1, y: 0, duration: 0.25, ease: "power3.out" },
      );
    }
  }, [selected]);

  // Escape zamyka popup.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  const goPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const goNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };
  const goToday = () => {
    setYear(init.getFullYear());
    setMonth(init.getMonth());
  };

  const years = Array.from({ length: 7 }, (_, i) => init.getFullYear() - 2 + i);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        kicker="Kalendarz"
        title="Wydarzenia"
        subtitle="Wszystkie nadchodzące i odbywające się wydarzenia."
      />

      {/* BAR: miesiąc + rok */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-light bg-surface-raised p-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={goPrev}
            aria-label="Poprzedni miesiąc"
            className="grid h-9 w-9 place-items-center rounded-md border border-border-light text-text-secondary transition hover:border-accent-primary hover:text-text-primary"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Następny miesiąc"
            className="grid h-9 w-9 place-items-center rounded-md border border-border-light text-text-secondary transition hover:border-accent-primary hover:text-text-primary"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            aria-label="Miesiąc"
            className="rounded-md border border-border-medium bg-bg-tertiary px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            aria-label="Rok"
            className="rounded-md border border-border-medium bg-bg-tertiary px-3 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={goToday}
          className="rounded-md bg-accent-primary px-3 py-2 text-sm font-medium text-text-on-accent transition hover:bg-accent-hover"
        >
          Dziś
        </button>
      </div>

      {/* Nagłówki dni tygodnia */}
      <div className="mb-2 grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center font-mono text-[10px] uppercase tracking-wider text-text-muted sm:text-xs"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Siatka kostek */}
      <div ref={gridRef} className="cal-scene grid grid-cols-7 gap-1.5 sm:gap-2">
        {Array.from({ length: totalCells }, (_, index) => {
          const dayNum = index - firstDow + 1;
          if (dayNum < 1 || dayNum > daysInMonth) {
            return <div key={index} aria-hidden="true" />;
          }
          const row = Math.floor(index / 7);
          const col = index % 7;
          const k = `${year}-${month}-${dayNum}`;
          const dayEvents = eventsByDay.get(k) ?? [];
          const hasEvents = dayEvents.length > 0;
          const isToday = k === todayKey;

          return (
            <button
              key={index}
              type="button"
              data-row={row}
              data-col={col}
              disabled={!hasEvents}
              onClick={() =>
                hasEvents &&
                setSelected({
                  label: `${dayNum} ${MONTHS[month]} ${year}`,
                  events: dayEvents,
                })
              }
              aria-label={`${dayNum} ${MONTHS[month]}${
                hasEvents ? ` — ${dayEvents.length} wydarzeń` : ""
              }`}
              className="cal-cube"
            >
              <span className="cal-face cal-face--top bg-bg-secondary" />
              <span className="cal-face cal-face--bottom bg-bg-secondary" />
              <span className="cal-face cal-face--left bg-bg-tertiary" />
              <span className="cal-face cal-face--right bg-bg-tertiary" />
              <span className="cal-face cal-face--back bg-bg-secondary" />
              <span
                className={`cal-face cal-face--front border ${
                  hasEvents ? "border-accent-primary" : "border-border-light"
                } ${isToday ? "bg-accent-subtle" : "bg-surface-raised"}`}
              >
                <span className="flex flex-col items-center">
                  <span
                    className={`font-mono text-sm font-bold sm:text-lg ${
                      hasEvents ? "text-accent-primary" : "text-text-primary"
                    } ${isToday ? "underline decoration-2 underline-offset-2" : ""}`}
                  >
                    {dayNum}
                  </span>
                  {hasEvents && (
                    <span className="mt-0.5 h-1 w-1 rounded-full bg-signal sm:h-1.5 sm:w-1.5" />
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {isLoading && (
        <p className="mt-4 text-center text-text-muted">Ładowanie wydarzeń...</p>
      )}

      {/* POPUP z wydarzeniami dnia */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelected(null)}
            aria-hidden="true"
          />
          <div
            ref={popupRef}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-border-light bg-surface-raised shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border-light p-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-text-primary">
                <CalendarDays size={18} className="text-accent-primary" />
                {selected.label}
              </h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Zamknij"
                className="grid h-8 w-8 place-items-center rounded-md text-text-muted transition hover:bg-bg-secondary hover:text-text-primary"
              >
                <X size={18} />
              </button>
            </div>
            <ul className="max-h-[60vh] divide-y divide-border-light overflow-y-auto">
              {selected.events.map((e) => (
                <li key={e.id} className="p-4">
                  <p className="font-semibold text-text-primary">{e.title}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary">
                    <Clock size={13} className="text-accent-primary" />
                    {formatEventDate(e, { time: true })}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-sm text-text-secondary">
                    <MapPin size={13} className="text-accent-primary" />
                    {e.locationName || e.location}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCalendar;
