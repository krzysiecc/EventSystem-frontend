/**
 * @description Wskaźnik „na czasie" (🔥) dla wydarzeń. Na froncie liczymy go
 * z już dostępnych pól zajętości (`enrolledCount`/`maxCapacity`): gdy zajęta jest
 * ponad połowa miejsc, wydarzenie uznajemy za „gorące". Liczbę kliknięć w 24h
 * (drugie kryterium popularności) dostarczy backend — patrz docs/api-contract.md.
 */

/** Próg „gorącego" wydarzenia: zajęte > 50% pojemności. */
export const isNearlyFull = (
  enrolledCount: number,
  maxCapacity: number,
): boolean => maxCapacity > 0 && enrolledCount > maxCapacity / 2;
