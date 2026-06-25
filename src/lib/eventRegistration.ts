/**
 * @description Logika okien rejestracji na wydarzenie liczona z dwóch
 * opcjonalnych dat dostarczanych przez backend:
 *   - `registrationOpensAt` — kiedy otwiera się właściwa rejestracja,
 *   - `presaveOpensAt`       — kiedy otwiera się pre-rejestracja („presave"),
 *     czyli wcześniejsze okno, w którym chętni mogą się już zapisywać.
 *
 * Brak `registrationOpensAt` oznacza, że rejestracja jest otwarta zawsze
 * (zachowanie zgodne ze starym backendem, który tych pól nie zwraca).
 * Trzymane poza UI, żeby dało się to przetestować.
 */

export interface RegistrationWindow {
  registrationOpensAt?: string | null;
  presaveOpensAt?: string | null;
}

export type RegistrationPhase = "open" | "presave" | "closed";

export interface RegistrationStatus {
  /** „open" – pełna rejestracja, „presave" – tylko pre-rejestracja, „closed" – jeszcze zamknięte. */
  phase: RegistrationPhase;
  /** Kiedy otwiera się właściwa rejestracja (jeśli ustawiona i jeszcze nie nastąpiła). */
  opensAt: Date | null;
  /** Kiedy otwiera się pre-rejestracja (jeśli ustawiona). */
  presaveAt: Date | null;
}

const parse = (iso: string | null | undefined): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};

export const registrationStatus = (
  e: RegistrationWindow,
  now: Date = new Date(),
): RegistrationStatus => {
  const opensAt = parse(e.registrationOpensAt);
  const presaveAt = parse(e.presaveOpensAt);

  // Brak daty otwarcia → rejestracja otwarta (kompatybilność wstecz).
  if (!opensAt || now >= opensAt) {
    return { phase: "open", opensAt: null, presaveAt };
  }

  // Przed otwarciem rejestracji: jeśli trwa okno pre-rejestracji → „presave".
  if (presaveAt && now >= presaveAt) {
    return { phase: "presave", opensAt, presaveAt };
  }

  // Jeszcze przed jakimkolwiek oknem zapisów.
  return { phase: "closed", opensAt, presaveAt };
};

/** Czy w danej fazie wolno odebrać BILET (tylko pełna rejestracja). Backend
 *  twardo blokuje `/tickets/enroll` przed `registrationOpensAt` (409), więc
 *  pre-rejestracja NIE jest zapisem na bilet — patrz {@link canPresave}. */
export const canEnroll = (phase: RegistrationPhase): boolean => phase === "open";

/** Czy w danej fazie wolno się PRE-rejestrować (zapis chęci przez osobny
 *  endpoint `/events/{id}/presave`, bez tworzenia biletu). */
export const canPresave = (phase: RegistrationPhase): boolean =>
  phase === "presave";
