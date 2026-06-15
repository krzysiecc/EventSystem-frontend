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

  // Strzałki zostają zamontowane, a pojawianie/znikanie robimy przez przejście
  // opacity (fade), więc nie „skaczą" — wewnętrzny element nadal pulsuje
  // (animate-scroll-hint), a opakowanie steruje płynnym wygaszaniem.
  return (
    <div className="pointer-events-none fixed right-2.5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 sm:flex">
      {/* Powrót na samą górę — nad podpowiedziami, bez osobnego boksu */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Przewiń na samą górę"
        title="Na samą górę"
        aria-hidden={!showUp}
        tabIndex={showUp ? 0 : -1}
        className={`text-text-secondary transition-opacity duration-500 hover:text-accent-primary ${
          showUp
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <ChevronsUp size={28} strokeWidth={2.25} />
      </button>
      <span
        aria-hidden="true"
        className={`transition-opacity duration-500 ${
          showUp ? "opacity-100" : "opacity-0"
        }`}
      >
        <ChevronUp size={24} className="animate-scroll-hint text-text-muted" />
      </span>
      <span
        aria-hidden="true"
        className={`transition-opacity duration-500 ${
          showDown ? "opacity-100" : "opacity-0"
        }`}
      >
        <ChevronDown size={24} className="animate-scroll-hint text-text-muted" />
      </span>
    </div>
  );
};

export default ScrollHint;
