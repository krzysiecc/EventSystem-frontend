import { describe, it, expect } from "vitest";
import {
  expandOccurrences,
  toLocalInput,
  isoWeekday,
  MAX_OCCURRENCES,
  type Recurrence,
} from "./recurrence";

// 15 cze 2026 to poniedziałek — wygodny, stały punkt odniesienia dla testów.
const START = "2026-06-15T11:00";
const END = "2026-06-15T13:00";

const rec = (over: Partial<Recurrence>): Recurrence => ({
  repeat: true,
  unit: "day",
  interval: 1,
  weekdays: [],
  end: { type: "count", count: 10 },
  ...over,
});

describe("expandOccurrences", () => {
  it("dla repeat=false zwraca jeden termin równy startowi", () => {
    const { occurrences, truncated } = expandOccurrences(
      START,
      END,
      rec({ repeat: false }),
    );
    expect(occurrences).toHaveLength(1);
    expect(toLocalInput(occurrences[0].start)).toBe(START);
    expect(toLocalInput(occurrences[0].end)).toBe(END);
    expect(truncated).toBe(false);
  });

  it("zachowuje godzinę i czas trwania w każdym terminie", () => {
    const { occurrences } = expandOccurrences(
      START,
      END,
      rec({ unit: "day", end: { type: "count", count: 3 } }),
    );
    expect(occurrences).toHaveLength(3);
    for (const o of occurrences) {
      expect(o.start.getHours()).toBe(11);
      expect(o.start.getMinutes()).toBe(0);
      expect(o.end.getTime() - o.start.getTime()).toBe(2 * 60 * 60 * 1000);
    }
  });

  it("co dzień z limitem liczby terminów daje kolejne dni", () => {
    const { occurrences } = expandOccurrences(
      START,
      END,
      rec({ unit: "day", end: { type: "count", count: 4 } }),
    );
    expect(occurrences.map((o) => o.start.getDate())).toEqual([15, 16, 17, 18]);
  });

  it("co 2 dni respektuje interwał", () => {
    const { occurrences } = expandOccurrences(
      START,
      END,
      rec({ unit: "day", interval: 2, end: { type: "count", count: 3 } }),
    );
    expect(occurrences.map((o) => o.start.getDate())).toEqual([15, 17, 19]);
  });

  it("co tydzień w wybrane dni generuje właściwe daty i kończy się na dacie", () => {
    // Pn(15) i Śr(17) co tydzień, do 28 cze 2026 → 15,17,22,24.
    const { occurrences } = expandOccurrences(
      START,
      END,
      rec({
        unit: "week",
        weekdays: [0, 2], // pn, śr
        end: { type: "date", date: "2026-06-28" },
      }),
    );
    expect(occurrences.map((o) => o.start.getDate())).toEqual([15, 17, 22, 24]);
    // wszystkie to poniedziałki lub środy
    expect(occurrences.every((o) => [0, 2].includes(isoWeekday(o.start)))).toBe(
      true,
    );
  });

  it("co tydzień bez wybranych dni używa dnia startu", () => {
    // 15 cze to poniedziałek → kolejne poniedziałki.
    const { occurrences } = expandOccurrences(
      START,
      END,
      rec({ unit: "week", weekdays: [], end: { type: "count", count: 3 } }),
    );
    expect(
      occurrences.map((o) => `${o.start.getDate()}.${o.start.getMonth() + 1}`),
    ).toEqual(["15.6", "22.6", "29.6"]);
  });

  it("co 2 tygodnie pomija tydzień pośredni", () => {
    const { occurrences } = expandOccurrences(
      START,
      END,
      rec({
        unit: "week",
        interval: 2,
        weekdays: [0],
        end: { type: "count", count: 3 },
      }),
    );
    // 15 cze, +2 tyg = 29 cze, +2 tyg = 13 lip
    expect(
      occurrences.map((o) => `${o.start.getDate()}.${o.start.getMonth() + 1}`),
    ).toEqual(["15.6", "29.6", "13.7"]);
  });

  it("co miesiąc trzyma ten sam dzień miesiąca", () => {
    const { occurrences } = expandOccurrences(
      START,
      END,
      rec({ unit: "month", end: { type: "count", count: 3 } }),
    );
    expect(
      occurrences.map((o) => `${o.start.getDate()}.${o.start.getMonth() + 1}`),
    ).toEqual(["15.6", "15.7", "15.8"]);
  });

  it("nie generuje terminów przed startem i kończy zgodnie z datą", () => {
    const { occurrences } = expandOccurrences(
      START,
      END,
      rec({ unit: "day", end: { type: "date", date: "2026-06-17" } }),
    );
    expect(occurrences.map((o) => o.start.getDate())).toEqual([15, 16, 17]);
  });

  it("tnie listę do MAX_OCCURRENCES i ustawia truncated", () => {
    const { occurrences, truncated } = expandOccurrences(
      START,
      END,
      rec({ unit: "day", end: { type: "count", count: 500 } }),
    );
    expect(occurrences).toHaveLength(MAX_OCCURRENCES);
    expect(truncated).toBe(true);
  });

  it("dla niepoprawnych dat zwraca pustą listę", () => {
    const { occurrences } = expandOccurrences("", "", rec({ unit: "day" }));
    expect(occurrences).toHaveLength(0);
  });
});
