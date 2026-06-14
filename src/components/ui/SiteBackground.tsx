import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";

// Lazy — three.js ładuje się tylko gdy tło jest faktycznie włączone (desktop).
const PixelBlast = lazy(() => import("./PixelBlast"));

// Kolor pikseli dopasowany do motywu (mono = żółć, reszta = fiolet akcentu).
const THEME_COLOR: Record<string, string> = {
  dark: "#6A1FE6",
  light: "#6A1FE6",
  mono: "#FFC21A",
};

/**
 * @description Globalne animowane tło (PixelBlast) — tylko desktop, wyłączone
 * przy prefers-reduced-motion. Kontener ma pointer-events:none, więc ruch
 * kursora jest ręcznie przekazywany do canvasa, by działała interakcja „liquid".
 */
const SiteBackground = () => {
  const theme = useThemeStore((s) => s.theme);
  const [enabled, setEnabled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compute = () => setEnabled(desktop.matches && !reduce.matches);
    compute();
    desktop.addEventListener("change", compute);
    reduce.addEventListener("change", compute);
    return () => {
      desktop.removeEventListener("change", compute);
      reduce.removeEventListener("change", compute);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let pending: { x: number; y: number } | null = null;
    const flush = () => {
      raf = 0;
      const canvas = containerRef.current?.querySelector("canvas");
      if (pending && canvas) {
        canvas.dispatchEvent(
          new PointerEvent("pointermove", {
            clientX: pending.x,
            clientY: pending.y,
          }),
        );
      }
      pending = null;
    };
    const onMove = (e: PointerEvent) => {
      pending = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(flush);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 opacity-60"
    >
      <Suspense fallback={null}>
        <PixelBlast
          variant="circle"
          pixelSize={6}
          color={THEME_COLOR[theme] ?? "#6A1FE6"}
          patternScale={3}
          patternDensity={0.9}
          speed={0.4}
          edgeFade={0.4}
          enableRipples={false}
          liquid
          liquidStrength={0.1}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          transparent
        />
      </Suspense>
    </div>
  );
};

export default SiteBackground;
