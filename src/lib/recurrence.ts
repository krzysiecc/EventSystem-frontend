/**
 * @description Logika cykliczności wydarzeń („jak w Kalendarzu Google", bez crona
 * widocznego dla użytkownika). Czysto frontendowo: regułę rozwijamy w konkretne
 * terminy, które panel tworzenia wysyła jako osobne wydarzenia (jedno na termin).
 * Trzymamy to z dala od UI, żeby dało się przetestować bez Reacta.
 *
 * Konwencja dni tygodnia: 0 = poniedziałek … 6 = niedziela (jak w kalendarzu w
 * aplikacji), inna niż natywne `Date.getDay()` (0 = niedziela).
 */

export type RecurrenceFreq = "none" | "daily" | "weekly" | "monthly";

export type RecurrenceEnd =
  | { type: "date"; date: string } // "YYYY-MM-DD"
  | { type: "count"; count: number };

export interface Recurrence {
  freq: RecurrenceFreq;
  /** Powtarzaj co N jednostek (≥ 1): co 2 tygodnie itd. */
  interval: number;
  /** Dni tygodnia (0=pn…6=nd) dla freq=weekly. Pusto → dzień startu. */
  weekdays: number[];
  end: RecurrenceEnd;
}

export interface Occurrence {
  start: Date;
  end: Date;
}

export interface ExpandResult {
  occurrences: Occurrence[];
  /** Przekroczono twardy limit i listę ucięto. */
  truncated: boolean;
}

/** Twardy limit terminów — zabezpieczenie przed przypadkowym utworzeniem setek. */
export const MAX_OCCURRENCES = 60;

export const DEFAULT_RECURRENCE: Recurrence = {
  freq: "none",
  interval: 1,
  weekdays: [],
  end: { type: "count", count: 10 },
};

/** 0=pn…6=nd z natywnego Date (0=nd…6=so). */
export const isoWeekday = (d: Date): number => (d.getDay() + 6) % 7;

const dateOnly = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const mondayOf = (d: Date): Date => {
  const x = dateOnly(d);
  x.setDate(x.getDate() - isoWeekday(x));
  return x;
};

const DAY_MS = 86_400_000;

/** Data + godzina jak w `datetime-local` (czas lokalny), do payloadu wydarzenia. */
export const toLocalInput = (d: Date): string => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(
    d.getHours(),
  )}:${p(d.getMinutes())}`;
};

/**
 * @description Rozwija regułę cykliczności w listę terminów. Każdy termin
 * zachowuje godzinę i czas trwania z `startISO`/`endISO`; zmienia się tylko data.
 * Pierwszym terminem jest sam start (jeśli pasuje do reguły). Zatrzymuje się na
 * dacie końca / liczbie terminów, a najpóźniej na {@link MAX_OCCURRENCES}.
 */
export const expandOccurrences = (
  startISO: string,
  endISO: string,
  rec: Recurrence,
): ExpandResult => {
  const start = new Date(startISO);
  const end = new Date(endISO);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return { occurrences: [], truncated: false };
  }

  const durationMs = Math.max(0, end.getTime() - start.getTime());
  const makeOcc = (s: Date): Occurrence => ({
    start: s,
    end: new Date(s.getTime() + durationMs),
  });

  if (rec.freq === "none") {
    return { occurrences: [makeOcc(start)], truncated: false };
  }

  const interval = Math.max(1, Math.floor(rec.interval) || 1);
  const weekdays = rec.weekdays.length ? rec.weekdays : [isoWeekday(start)];

  const untilMs =
    rec.end.type === "date" && rec.end.date
      ? new Date(`${rec.end.date}T23:59:59`).getTime()
      : Infinity;
  const maxCount =
    rec.end.type === "count" ? Math.max(1, Math.floor(rec.end.count) || 1) : Infinity;

  const startDateOnly = dateOnly(start).getTime();
  const startMonday = mondayOf(start).getTime();
  const startMonthIdx = start.getFullYear() * 12 + start.getMonth();

  const matches = (c: Date): boolean => {
    if (rec.freq === "daily") {
      const days = Math.round((dateOnly(c).getTime() - startDateOnly) / DAY_MS);
      return days % interval === 0;
    }
    if (rec.freq === "weekly") {
      if (!weekdays.includes(isoWeekday(c))) return false;
      const weekIdx = Math.round((mondayOf(c).getTime() - startMonday) / (7 * DAY_MS));
      return weekIdx % interval === 0;
    }
    // monthly
    if (c.getDate() !== start.getDate()) return false;
    const monthIdx = c.getFullYear() * 12 + c.getMonth();
    return (monthIdx - startMonthIdx) % interval === 0;
  };

  const occurrences: Occurrence[] = [];
  let truncated = false;
  const cursor = new Date(start);
  const MAX_DAYS = 366 * 12; // bezpiecznik pętli (12 lat)

  for (let guard = 0; guard < MAX_DAYS; guard++) {
    const occStart = new Date(
      cursor.getFullYear(),
      cursor.getMonth(),
      cursor.getDate(),
      start.getHours(),
      start.getMinutes(),
    );
    if (occStart.getTime() >= start.getTime() && matches(cursor)) {
      if (occStart.getTime() > untilMs) break;
      if (occurrences.length >= MAX_OCCURRENCES) {
        truncated = true;
        break;
      }
      occurrences.push(makeOcc(occStart));
      if (occurrences.length >= maxCount) break;
    }
    cursor.setDate(cursor.getDate() + 1);
    if (dateOnly(cursor).getTime() > untilMs) break;
  }

  return { occurrences, truncated };
};
