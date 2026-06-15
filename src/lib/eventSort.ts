/**
 * @description Wspólne sortowanie list wydarzeń. Działa na każdym kształcie
 * wydarzenia, który ma daty (`EventDateLike`) i `enrolledCount`; popularność
 * korzysta z opcjonalnego `clicks24h` (dostarcza backend — patrz
 * docs/api-contract.md). Trzymane poza UI, żeby dało się przetestować.
 */

import { eventStart, type EventDateLike } from "@/lib/eventDate";

export type EventSortKey =
  | "date-asc"
  | "date-desc"
  | "enrolled-desc"
  | "popularity";

export interface SortableEvent extends EventDateLike {
  enrolledCount: number;
  /** Kliknięcia w ostatnich 24h (popularność) — opcjonalne, dostarcza backend. */
  clicks24h?: number;
}

export const EVENT_SORT_OPTIONS: Array<{ value: EventSortKey; label: string }> = [
  { value: "date-asc", label: "Data: rosnąco" },
  { value: "date-desc", label: "Data: malejąco" },
  { value: "enrolled-desc", label: "Liczba zapisanych" },
  { value: "popularity", label: "Popularność (24h)" },
];

export const DEFAULT_EVENT_SORT: EventSortKey = "date-asc";

const startMs = (e: EventDateLike): number => {
  const t = eventStart(e).getTime();
  return Number.isNaN(t) ? 0 : t;
};

/** Zwraca NOWĄ, posortowaną tablicę (nie mutuje wejścia). */
export const sortEvents = <T extends SortableEvent>(
  items: T[],
  key: EventSortKey,
): T[] => {
  const arr = [...items];
  switch (key) {
    case "date-asc":
      return arr.sort((a, b) => startMs(a) - startMs(b));
    case "date-desc":
      return arr.sort((a, b) => startMs(b) - startMs(a));
    case "enrolled-desc":
      return arr.sort((a, b) => b.enrolledCount - a.enrolledCount);
    case "popularity":
      return arr.sort((a, b) => (b.clicks24h ?? 0) - (a.clicks24h ?? 0));
    default:
      return arr;
  }
};
