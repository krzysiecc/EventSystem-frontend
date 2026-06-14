import { useEffect, useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUp } from "lucide-react";

/**
 * @description Zastępuje ukryty natywny pasek przewijania. Pokazuje migającą
 * podpowiedź po prawej: na górze tylko „w dół", w środku „w górę/w dół", na dole
 * „w górę". Po odjechaniu od góry dochodzi przycisk powrotu na samą górę
 * (podwójna strzałka). Renderuje się tylko gdy strona faktycznie się przewija.
 */
const ScrollHint = () => {
  const [{ scrollable, atTop, atBottom }, setState] = useState({
    scrollable: false,
    atTop: true,
    atBottom: false,
  });

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setState({
        scrollable: max > 24,
        atTop: window.scrollY <= 8,
        atBottom: window.scrollY >= max - 8,
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, []);

  if (!scrollable) return null;

  const showUp = !atTop;
  const showDown = !atBottom;

  return (
    <div className="pointer-events-none fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 sm:flex">
      {showUp && (
        <ChevronUp size={18} className="animate-scroll-hint text-text-muted" />
      )}
      {showDown && (
        <ChevronDown size={18} className="animate-scroll-hint text-text-muted" />
      )}
      {showUp && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Przewiń na samą górę"
          title="Na samą górę"
          className="pointer-events-auto grid h-9 w-9 place-items-center rounded-md border border-border-light bg-surface-raised/85 text-text-secondary shadow-md backdrop-blur transition hover:text-accent-primary"
        >
          <ChevronsUp size={18} />
        </button>
      )}
    </div>
  );
};

export default ScrollHint;
