import { useMyProfile } from "@/features/shared/api/useProfileQueries";

/**
 * @description Imię i nazwisko zalogowanej osoby (małymi literami) na pływającym
 * pasku nawigacji. Ukryte na najmniejszych ekranach, by nie ścieśniać docka.
 */
const PillStatus = () => {
  const { data: profile } = useMyProfile();

  if (!profile) return null;

  return (
    <span className="hidden max-w-40 truncate pr-1 text-[11px] lowercase text-text-muted md:inline">
      {profile.firstName} {profile.lastName}
    </span>
  );
};

export default PillStatus;
