import { Radio, CheckCircle2 } from "lucide-react";
import {
  getEventPhase,
  type EventDateLike,
  type EventPhase,
} from "@/lib/eventDate";
import { useNow } from "@/lib/useNow";

/**
 * @description Ruchomy pasek-karuzela ze statusem wydarzenia. Pojawia się dopiero
 * gdy wydarzenie ruszy: przez pierwsze 5 minut głosi „właśnie się rozpoczęło”,
 * potem „trwa”, a po zakończeniu — „zakończone”. Tekst przewija się w pętli
 * (marquee). Sam liczy upływ czasu (useNow), więc status zmienia się na żywo bez
 * odświeżania danych. Dla `upcoming` nic nie renderuje.
 */
const PHASE_CONFIG: Record<
  Exclude<EventPhase, "upcoming">,
  { label: string; icon: typeof Radio; tone: string; pulse: boolean }
> = {
  starting: {
    label: "Wydarzenie właśnie się rozpoczęło",
    icon: Radio,
    tone: "bg-accent-subtle text-accent-secondary",
    pulse: true,
  },
  live: {
    label: "Wydarzenie trwa",
    icon: Radio,
    tone: "bg-accent-subtle text-accent-secondary",
    pulse: true,
  },
  ended: {
    label: "Wydarzenie zakończone",
    icon: CheckCircle2,
    tone: "bg-bg-tertiary text-text-muted",
    pulse: false,
  },
};

interface Props {
  evt: EventDateLike;
  className?: string;
}

const EventLiveBar = ({ evt, className = "" }: Props) => {
  const now = useNow();
  const phase = getEventPhase(evt, now);
  if (phase === "upcoming") return null;

  const cfg = PHASE_CONFIG[phase];
  const Icon = cfg.icon;
  // Dwie identyczne kopie treści — animacja przesuwa tor o -50%, więc pętla jest
  // bezszwowa niezależnie od szerokości kontenera.
  const group = Array.from({ length: 5 });

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative flex overflow-hidden ${cfg.tone} ${className}`}
    >
      <div className="flex w-max shrink-0 animate-marquee [will-change:transform]">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
            {group.map((_, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 px-5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em]"
              >
                <Icon size={13} className={cfg.pulse ? "animate-pulse" : ""} />
                {cfg.label}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventLiveBar;
