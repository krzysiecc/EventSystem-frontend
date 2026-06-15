import { useEffect, useState } from "react";

/**
 * @description Zwraca aktualny czas (ms) i odświeża go co `intervalMs`, dzięki
 * czemu komponenty zależne od „fazy” wydarzenia (nadchodzące → trwa →
 * zakończone) same się przerysowują bez ręcznego odpytywania. Domyślnie co 30 s
 * — wystarczająco płynnie dla statusu wydarzenia, a tanio dla baterii.
 */
export const useNow = (intervalMs = 30_000): number => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};
