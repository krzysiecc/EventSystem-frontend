import { useMemo } from "react";
import { Repeat, AlertTriangle } from "lucide-react";
import {
  expandOccurrences,
  isoWeekday,
  MAX_OCCURRENCES,
  type Recurrence,
  type RecurrenceUnit,
} from "@/lib/recurrence";

/**
 * @description Prosty wybór cykliczności wydarzenia w stylu Kalendarza Google
 * (bez crona): „Powtarzaj co N [dni/tygodni/miesięcy]", opcjonalne dni tygodnia
 * (tylko dla tygodni), koniec cyklu (data LUB liczba terminów) oraz żywe
 * podsumowanie z podglądem terminów. Sam picker nic nie tworzy — zwraca regułę
 * przez `onChange`; rozwijaniem zajmuje się panel tworzenia wydarzenia.
 */

const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

const UNIT_ORDER: RecurrenceUnit[] = ["day", "week", "month"];

// Polska odmiana jednostki: [1, 2–4, 5+] (z grubsza, dla 12–14 forma „wiele").
const plural = (n: number, forms: [string, string, string]): string => {
  const t = n % 100;
  const o = n % 10;
  if (n === 1) return forms[0];
  if (t >= 12 && t <= 14) return forms[2];
  if (o >= 2 && o <= 4) return forms[1];
  return forms[2];
};

const UNIT: Record<RecurrenceUnit, [string, string, string]> = {
  day: ["dzień", "dni", "dni"],
  week: ["tydzień", "tygodnie", "tygodni"],
  month: ["miesiąc", "miesiące", "miesięcy"],
};

const TERMINY: [string, string, string] = ["termin", "terminy", "terminów"];

const dateFmt = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const dayMonthFmt = new Intl.DateTimeFormat("pl-PL", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const labelClass =
  "mb-1.5 block font-mono text-xs uppercase tracking-wider text-text-muted";
const fieldClass =
  "rounded-md border border-border-medium bg-bg-tertiary px-2.5 py-1.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

interface Props {
  value: Recurrence;
  onChange: (next: Recurrence) => void;
  /** Start/koniec wydarzenia (datetime-local) — do domyślnych ustawień i podglądu. */
  start: string;
  end: string;
}

// Data startu + 3 miesiące, w formacie input[type=date] — sensowny domyślny
// koniec cyklu, gdy użytkownik przełączy się na „W dniu".
const defaultUntil = (start: string): string => {
  const base = start ? new Date(start) : new Date();
  if (Number.isNaN(base.getTime())) return "";
  base.setMonth(base.getMonth() + 3);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${base.getFullYear()}-${p(base.getMonth() + 1)}-${p(base.getDate())}`;
};

const RecurrencePicker = ({ value, onChange, start, end }: Props) => {
  const repeating = value.repeat;

  const { occurrences, truncated } = useMemo(
    () => expandOccurrences(start, end, value),
    [start, end, value],
  );

  const set = (patch: Partial<Recurrence>) => onChange({ ...value, ...patch });

  // Dzień tygodnia daty startu (0=pn…6=nd), domyślny dla „co tydzień".
  const startWeekday = (): number => {
    const wd = start ? isoWeekday(new Date(start)) : 0;
    return Number.isNaN(wd) ? 0 : wd;
  };

  // Przy przejściu na tygodnie bez zaznaczonych dni — zaznacz dzień startu.
  const weekdaysFor = (unit: RecurrenceUnit): number[] =>
    unit === "week" && value.weekdays.length === 0
      ? [startWeekday()]
      : value.weekdays;

  const handleRepeat = (repeat: boolean) => {
    if (!repeat) return set({ repeat: false });
    set({ repeat: true, weekdays: weekdaysFor(value.unit) });
  };

  const handleUnit = (unit: RecurrenceUnit) =>
    set({ unit, weekdays: weekdaysFor(unit) });

  const toggleWeekday = (wd: number) => {
    const has = value.weekdays.includes(wd);
    const next = has
      ? value.weekdays.filter((d) => d !== wd)
      : [...value.weekdays, wd].sort((a, b) => a - b);
    set({ weekdays: next.length ? next : value.weekdays }); // nie pozwól wyzerować
  };

  const setEndType = (type: "date" | "count") => {
    if (type === value.end.type) return;
    set(
      type === "date"
        ? { end: { type: "date", date: defaultUntil(start) } }
        : { end: { type: "count", count: 10 } },
    );
  };

  // Słowne podsumowanie reguły (bez części o końcu — tę dokłada podgląd niżej).
  const describe = (): string => {
    if (!repeating) return "Wydarzenie jednorazowe.";
    const i = Math.max(1, value.interval);
    const everyN = i === 1 ? "" : `${i} `;
    const base = `Co ${everyN}${plural(i, UNIT[value.unit])}`;
    if (value.unit === "week") {
      const days =
        (value.weekdays.length ? value.weekdays : [startWeekday()])
          .map((d) => WEEKDAYS[d])
          .join(", ") || "—";
      return `${base} w: ${days}`;
    }
    return base;
  };

  const preview = occurrences.slice(0, 3);
  const intervalN = Math.max(1, value.interval);

  return (
    <div className="space-y-3 rounded-md border border-border-light bg-bg-secondary p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="sm:w-44">
          <label className={labelClass}>
            <span className="inline-flex items-center gap-1.5">
              <Repeat size={13} /> Powtarzanie
            </span>
          </label>
          <select
            value={repeating ? "yes" : "no"}
            onChange={(e) => handleRepeat(e.target.value === "yes")}
            className={`w-full ${fieldClass}`}
          >
            <option value="no">Nie powtarzaj</option>
            <option value="yes">Powtarzaj</option>
          </select>
        </div>

        {repeating && (
          <div className="flex items-end gap-1.5">
            <div>
              <label className={labelClass}>Co</label>
              <input
                type="number"
                min={1}
                max={30}
                value={value.interval}
                onChange={(e) =>
                  set({ interval: Math.max(1, Number(e.target.value) || 1) })
                }
                className={`w-16 ${fieldClass}`}
              />
            </div>
            <div>
              <label className={labelClass}>Jednostka</label>
              <select
                value={value.unit}
                onChange={(e) => handleUnit(e.target.value as RecurrenceUnit)}
                className={fieldClass}
              >
                {UNIT_ORDER.map((u) => (
                  <option key={u} value={u}>
                    {plural(intervalN, UNIT[u])}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Dni tygodnia — opcjonalne, tylko dla „tygodni" */}
      {repeating && value.unit === "week" && (
        <div>
          <label className={labelClass}>W dni (opcjonalnie)</label>
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAYS.map((d, wd) => {
              const active = value.weekdays.includes(wd);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleWeekday(wd)}
                  aria-pressed={active}
                  className={`h-8 w-9 rounded-md text-xs font-medium transition ${
                    active
                      ? "bg-accent-primary text-text-on-accent"
                      : "border border-border-medium text-text-secondary hover:border-accent-primary"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Koniec cyklu — data LUB liczba terminów */}
      {repeating && (
        <div>
          <label className={labelClass}>Zakończ</label>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex overflow-hidden rounded-md border border-border-medium">
              <button
                type="button"
                onClick={() => setEndType("date")}
                className={`px-3 py-1.5 text-sm transition ${
                  value.end.type === "date"
                    ? "bg-accent-primary text-text-on-accent"
                    : "text-text-secondary hover:bg-bg-tertiary"
                }`}
              >
                W dniu
              </button>
              <button
                type="button"
                onClick={() => setEndType("count")}
                className={`px-3 py-1.5 text-sm transition ${
                  value.end.type === "count"
                    ? "bg-accent-primary text-text-on-accent"
                    : "text-text-secondary hover:bg-bg-tertiary"
                }`}
              >
                Po terminach
              </button>
            </div>

            {value.end.type === "date" ? (
              <input
                type="date"
                value={value.end.date}
                min={start ? start.slice(0, 10) : undefined}
                onChange={(e) => set({ end: { type: "date", date: e.target.value } })}
                className={fieldClass}
              />
            ) : (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={MAX_OCCURRENCES}
                  value={value.end.count}
                  onChange={(e) =>
                    set({
                      end: {
                        type: "count",
                        count: Math.max(1, Number(e.target.value) || 1),
                      },
                    })
                  }
                  className={`w-20 ${fieldClass}`}
                />
                <span className="text-sm text-text-secondary">
                  {plural(Math.max(1, value.end.count), TERMINY)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Podsumowanie + podgląd */}
      {repeating && (
        <div className="rounded-md bg-bg-tertiary p-2.5 text-sm">
          <p className="text-text-primary">
            {describe()}
            {value.end.type === "date" && value.end.date && (
              <> do {dateFmt.format(new Date(`${value.end.date}T00:00:00`))}</>
            )}
            .
          </p>
          {occurrences.length > 0 ? (
            <p className="mt-1 text-text-secondary">
              <b className="text-text-primary">{occurrences.length}</b>{" "}
              {plural(occurrences.length, TERMINY)}
              {preview.length > 0 && (
                <>
                  {" "}
                  ({preview.map((o) => dayMonthFmt.format(o.start)).join(" • ")}
                  {occurrences.length > preview.length ? " …" : ""})
                </>
              )}
            </p>
          ) : (
            <p className="mt-1 text-text-muted">
              Brak terminów — sprawdź daty i ustawienia powtarzania.
            </p>
          )}
          {truncated && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-status-warning">
              <AlertTriangle size={13} />
              Lista ucięta do {MAX_OCCURRENCES} terminów — zawęź zakres cyklu.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default RecurrencePicker;
