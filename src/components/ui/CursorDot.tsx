import { useEffect, useRef } from "react";

/**
 * @description Miękko podążająca kropka pod kursorem (tylko mysz/desktop, bez
 * reduced-motion). Używa mix-blend-difference, więc wizualnie „reaguje" na to,
 * co pod nią — w tym na animowane tło PixelBlast.
 */
const CursorDot = () => {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    const dot = dotRef.current;
    if (!dot) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let x = mouseX;
    let y = mouseY;
    let raf = 0;
    let shown = false;

    const onMove = (e: PointerEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!shown) {
        shown = true;
        dot.style.opacity = "1";
      }
    };
    const onLeave = () => {
      shown = false;
      dot.style.opacity = "0";
    };

    const loop = () => {
      x += (mouseX - x) * 0.4;
      y += (mouseY - y) * 0.4;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
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
