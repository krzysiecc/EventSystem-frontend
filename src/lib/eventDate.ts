/**
 * @description Wspólne formatowanie dat wydarzeń z obsługą zakresu start–koniec.
 * Wszystkie listy i widoki wydarzeń używają tego helpera, dzięki czemu po
 * dodaniu `startDate`/`endDate` w backendzie zakres pojawi się wszędzie. Gdy
 * pól zakresu brak, wyświetlana jest pojedyncza data (`date`), co zachowuje
 * dotychczasowe zachowanie.
 */

export interface EventDateLike {
  date: string;
  startDate?: string | null;
  endDate?: string | null;
}

const dateFmt = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const timeFmt = new Intl.DateTimeFormat("pl-PL", {
  hour: "2-digit",
  minute: "2-digit",
});

/** Data startu wydarzenia (startDate, a w razie braku — date). */
export const eventStart = (evt: EventDateLike): Date =>
  new Date(evt.startDate ?? evt.date);

/** Data końca wydarzenia (endDate). `null`, gdy brak/niepoprawna. */
export const eventEnd = (evt: EventDateLike): Date | null => {
  if (!evt.endDate) return null;
  const d = new Date(evt.endDate);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** Okno po starcie, w którym pokazujemy „właśnie się rozpoczęło”. */
export const JUST_STARTED_MS = 5 * 60 * 1000;

/**
 * @description Faza życia wydarzenia względem chwili `now`:
 * - `upcoming`  — jeszcze się nie zaczęło,
 * - `starting`  — pierwsze 5 minut po starcie („właśnie się rozpoczęło”),
 * - `live`      — trwa (po 5 min, przed końcem),
 * - `ended`     — po `endDate` (gdy znamy koniec).
 * Gdy nie znamy końca, po starcie zostaje `starting`/`live` (nie wygasa).
 */
export type EventPhase = "upcoming" | "starting" | "live" | "ended";

export const getEventPhase = (
  evt: EventDateLike,
  now: number = Date.now(),
): EventPhase => {
  const start = eventStart(evt).getTime();
  if (Number.isNaN(start)) return "upcoming";
  if (now < start) return "upcoming";

  const end = eventEnd(evt)?.getTime() ?? null;
  if (end != null && now >= end) return "ended";
  if (now < start + JUST_STARTED_MS) return "starting";
  return "live";
};

/**
 * @description Zwraca tekst daty wydarzenia. Jeśli istnieje sensowny `endDate`,
 * renderuje zakres; przy tym samym dniu z czasem skraca koniec do samej godziny.
 * @param evt        obiekt z polami date/startDate/endDate
 * @param opts.time  dołącz godzinę (dla widoków szczegółów)
 */
export const formatEventDate = (
  evt: EventDateLike,
  opts: { time?: boolean } = {},
): string => {
  const start = eventStart(evt);
  if (Number.isNaN(start.getTime())) return "";

  const fmt = opts.time ? dateTimeFmt : dateFmt;
  const end = evt.endDate ? new Date(evt.endDate) : null;

  if (!end || Number.isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
    return fmt.format(start);
  }

  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) {
    return opts.time
      ? `${dateTimeFmt.format(start)} – ${timeFmt.format(end)}`
      : dateFmt.format(start);
  }

  return `${fmt.format(start)} – ${fmt.format(end)}`;
};
