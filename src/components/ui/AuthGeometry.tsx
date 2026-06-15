import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

/**
 * @description Dekoracyjna geometria ekranów logowania. Kształty losują się przy
 * każdym wejściu (typ, pozycja, rozmiar, obrót, kolor), więc tło zawsze wygląda
 * inaczej. Po najechaniu kształt rozsypuje się w drobny pył (cząsteczki), a
 * potem z wielką prędkością wraca do swojej formy (GSAP). Ukryta na małych
 * ekranach i przy prefers-reduced-motion (wtedy zostaje statyczna).
 */

type ShapeKind = "square" | "circle" | "ring" | "triangle" | "cross";
type ShapeColor = "accent" | "signal" | "secondary";

interface ShapeSpec {
  kind: ShapeKind;
  top: number;
  left: number;
  size: number;
  rotation: number;
  opacity: number;
  color: ShapeColor;
  floatDist: number;
  floatDur: number;
  spinDur: number;
  spinDir: 1 | -1;
  delay: number;
}

const KINDS: ShapeKind[] = ["square", "circle", "ring", "triangle", "cross"];
const COLORS: ShapeColor[] = ["accent", "signal", "secondary"];

const COLOR_BG: Record<ShapeColor, string> = {
  accent: "bg-accent-primary",
  signal: "bg-signal",
  secondary: "bg-accent-secondary",
};
const COLOR_BORDER: Record<ShapeColor, string> = {
  accent: "border-accent-primary",
  signal: "border-signal",
  secondary: "border-accent-secondary",
};

const CLIP: Partial<Record<ShapeKind, string>> = {
  triangle: "polygon(50% 0%, 0% 100%, 100% 100%)",
  cross:
    "polygon(35% 0,65% 0,65% 35%,100% 35%,100% 65%,65% 65%,65% 100%,35% 100%,35% 65%,0 65%,0 35%,35% 35%)",
};

// Siatka pozycji „pyłu” pokrywająca kształt — z niej cząsteczki rozlatują się i
// do niej wracają. Sama jest stała; losowy jest dopiero rozrzut przy najechaniu.
const GRID_N = 5;
const DUST = Array.from({ length: GRID_N * GRID_N }, (_, i) => ({
  x: ((i % GRID_N) + 0.5) / GRID_N,
  y: (Math.floor(i / GRID_N) + 0.5) / GRID_N,
}));

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const makeShapes = (): ShapeSpec[] => {
  const count = Math.round(rand(4, 6));
  return Array.from({ length: count }, () => ({
    kind: pick(KINDS),
    top: rand(4, 80),
    left: rand(4, 76),
    size: rand(44, 108),
    rotation: rand(0, 360),
    opacity: rand(0.45, 0.85),
    color: pick(COLORS),
    floatDist: rand(8, 26),
    floatDur: rand(5, 10),
    spinDur: rand(22, 46),
    spinDir: Math.random() > 0.5 ? 1 : -1,
    delay: rand(0, 4),
  }));
};

const formClass = (s: ShapeSpec): string => {
  switch (s.kind) {
    case "circle":
      return `rounded-full ${COLOR_BG[s.color]}`;
    case "ring":
      return `rounded-full border-2 ${COLOR_BORDER[s.color]}`;
    case "square":
      return `rounded-[2px] ${COLOR_BG[s.color]}`;
    default:
      return COLOR_BG[s.color];
  }
};

const AuthGeometry = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  // Losujemy raz na zamontowanie → przy każdym wejściu na ekran inny układ.
  const shapes = useMemo(() => makeShapes(), []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const canHover = window.matchMedia("(hover: hover)").matches;
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const shapeEls = gsap.utils.toArray<HTMLElement>(".geo-shape");

      const entries = shapeEls.map((shapeEl, idx) => {
        const spec = shapes[idx];
        const form = shapeEl.querySelector<HTMLElement>(".geo-form");
        const dust = gsap.utils.toArray<HTMLElement>(
          shapeEl.querySelectorAll(".geo-dust > span"),
        );

        if (form) {
          gsap.set(form, { rotation: spec.rotation, transformOrigin: "50% 50%" });
          if (!reduce) {
            // Spokojny ruch tła: unoszenie (yoyo) + powolny obrót w pętli.
            gsap.to(form, {
              yPercent: spec.floatDist,
              duration: spec.floatDur,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
              delay: spec.delay,
            });
            gsap.to(form, {
              rotation: `+=${spec.spinDir * 360}`,
              duration: spec.spinDur,
              ease: "none",
              repeat: -1,
            });
          }
        }
        gsap.set(dust, { opacity: 0, transformOrigin: "50% 50%" });

        return { shapeEl, form, dust, spec, busy: false, inside: false };
      });

      if (reduce || !canHover) return;

      const burst = (e: (typeof entries)[number]) => {
        const form = e.form;
        if (e.busy || !form) return;
        e.busy = true;
        const radius = e.spec.size * 1.3;
        gsap
          .timeline({ onComplete: () => (e.busy = false) })
          // forma znika, w jej miejscu pojawia się pył
          .to(form, { opacity: 0, scale: 0.4, duration: 0.22, ease: "power2.in" }, 0)
          .set(e.dust, { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0 }, 0.04)
          // rozsypanie w drobny pył (losowo, więc za każdym razem inaczej)
          .to(
            e.dust,
            {
              x: () => gsap.utils.random(-radius, radius),
              y: () => gsap.utils.random(-radius, radius),
              rotation: () => gsap.utils.random(-120, 120),
              scale: 0.5,
              opacity: 0.2,
              duration: 0.55,
              ease: "power2.out",
              stagger: { each: 0.006, from: "random" },
            },
            0.05,
          )
          // …i z wielką prędkością powrót do formy
          .to(
            e.dust,
            {
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              opacity: 1,
              duration: 0.16,
              ease: "power4.in",
            },
            ">-0.05",
          )
          .to(form, { opacity: 1, scale: 1, duration: 0.14, ease: "power2.out" }, ">-0.04")
          .set(e.dust, { opacity: 0 });
      };

      // Hover wykrywamy globalnie: geometria leży pod treścią strony (pełno-
      // ekranowy kontener formularza przechwytywałby pointerenter), więc liczymy
      // pozycję kursora względem prostokąta każdego kształtu i odpalamy efekt
      // w momencie wejścia w jego obszar.
      let raf = 0;
      let last: { x: number; y: number } | null = null;
      const PAD = 12;
      const check = () => {
        raf = 0;
        if (!last) return;
        for (const e of entries) {
          const r = e.shapeEl.getBoundingClientRect();
          const inside =
            last.x >= r.left - PAD &&
            last.x <= r.right + PAD &&
            last.y >= r.top - PAD &&
            last.y <= r.bottom + PAD;
          if (inside && !e.inside) {
            e.inside = true;
            burst(e);
          } else if (!inside && e.inside) {
            e.inside = false;
          }
        }
      };
      const onMove = (ev: PointerEvent) => {
        last = { x: ev.clientX, y: ev.clientY };
        if (!raf) raf = requestAnimationFrame(check);
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        if (raf) cancelAnimationFrame(raf);
      });
    }, root);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [shapes]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute -right-15 top-1/2 -z-10 hidden h-[min(46vw,560px)] w-[min(46vw,560px)] -translate-y-1/2 sm:block"
    >
      {shapes.map((s, i) => (
        <div
          key={i}
          className="geo-shape absolute"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
          }}
        >
          <div
            className={`geo-form absolute inset-0 ${formClass(s)}`}
            style={{ opacity: s.opacity, clipPath: CLIP[s.kind] }}
          />
          <div className="geo-dust pointer-events-none absolute inset-0">
            {DUST.map((d, j) => (
              <span
                key={j}
                className={`absolute block rounded-full ${COLOR_BG[s.color]}`}
                style={{
                  width: 4,
                  height: 4,
                  left: `${d.x * 100}%`,
                  top: `${d.y * 100}%`,
                  marginLeft: -2,
                  marginTop: -2,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuthGeometry;
