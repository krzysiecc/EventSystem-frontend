import { useEffect, useRef } from "react";

/**
 * @description Niestandardowy kursor: zastępuje natywny wskaźnik małym
 * kwadracikiem z `mix-blend-difference`, więc „zmienia kolor" zależnie od tego,
 * co jest pod nim — w tym od animowanego tła PixelBlast. W odróżnieniu od dawnej
 * podążającej kropki śledzi kursor 1:1 (bez opóźnienia) i chowa natywny wskaźnik,
 * żeby to on BYŁ kursorem. Tylko mysz/desktop, bez reduced-motion.
 */
const CursorDot = () => {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const dot = dotRef.current;
    if (!dot) return;

    // Schowaj natywny kursor wszędzie — także na elementach z własnym `cursor`
    // (przyciski, linki, pola). Dzięki temu widać tylko nasz, zmieniający kolor.
    const style = document.createElement("style");
    style.textContent = "* { cursor: none !important; }";
    document.head.appendChild(style);

    let shown = false;
    const onMove = (e: PointerEvent) => {
      // Pozycja dokładnie pod kursorem (bez wygładzania — to ma być kursor).
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      if (!shown) {
        shown = true;
        dot.style.opacity = "1";
      }
    };
    const onLeave = () => {
      shown = false;
      dot.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      style.remove();
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      style={{ willChange: "transform", opacity: 0 }}
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden h-3 w-3 rounded-[2px] bg-white mix-blend-difference transition-opacity duration-300 md:block"
    />
  );
};

export default CursorDot;
