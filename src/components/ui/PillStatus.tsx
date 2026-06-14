import { useEffect, useState } from "react";
import { useMyProfile } from "@/features/shared/api/useProfileQueries";

const DAYS = ["niedz.", "pon.", "wt.", "śr.", "czw.", "pt.", "sob."];

/**
 * @description Status na pływającym pasku nawigacji: zegar (dzień + godzina)
 * oraz imię i nazwisko zalogowanej osoby pisane małymi literami. Ukryty na
 * najmniejszych ekranach, by nie ścieśniać docka.
 */
const PillStatus = () => {
  const { data: profile } = useMyProfile();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = now.toLocaleDateString("pl-PL", {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <div className="hidden flex-col items-end leading-tight md:flex">
      <span className="font-mono text-xs text-text-secondary">
        {DAYS[now.getDay()]} {date} · {time}
      </span>
      {profile && (
        <span className="text-[11px] lowercase text-text-muted">
          {profile.firstName} {profile.lastName}
        </span>
      )}
    </div>
  );
};

export default PillStatus;
