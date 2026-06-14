import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import {
  User,
  Globe,
  KeyRound,
  AlertTriangle,
  Plus,
  X,
  Palette,
} from "lucide-react";
import {
  useMyProfile,
  useUpdateDetails,
  useUpdateProfile,
  useChangePassword,
  useDeleteAccount,
  type SocialLinkDto,
} from "./api/useProfileQueries";
import { useToastStore } from "@/store/useToastStore";
import PageHeader from "@/components/ui/PageHeader";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import PasswordInput from "@/components/ui/PasswordInput";

const MAX_SOCIAL_LINKS = 5;

const detailsSchema = z.object({
  firstName: z.string().min(2, "Min. 2 znaki"),
  lastName: z.string().min(2, "Min. 2 znaki"),
  email: z.string().email("Niepoprawny e-mail"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Min. 6 znaków"),
  newPassword: z.string().min(6, "Min. 6 znaków"),
});

type DetailsInputs = z.infer<typeof detailsSchema>;
type PasswordInputs = z.infer<typeof passwordSchema>;

const inputClass =
  "w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

const Profile = () => {
  const { data: profile, isLoading } = useMyProfile();
  const updateDetailsMutation = useUpdateDetails();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const deleteAccountMutation = useDeleteAccount();
  const addToast = useToastStore((state) => state.addToast);

  const detailsForm = useForm<DetailsInputs>({
    resolver: zodResolver(detailsSchema),
  });
  const { reset: resetDetails } = detailsForm;

  const passwordForm = useForm<PasswordInputs>({
    resolver: zodResolver(passwordSchema),
  });

  const [deletePass, setDeletePass] = useState("");

  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLinkDto[]>([]);
  const [loadedProfileId, setLoadedProfileId] = useState<number | null>(null);

  // Seed the editable public-profile state once per loaded profile, during
  // render (React's recommended pattern for syncing state to changing data).
  if (profile && profile.id !== loadedProfileId) {
    setBio(profile.bio ?? "");
    setSocialLinks(profile.socialLinks ?? []);
    setLoadedProfileId(profile.id);
  }

  // Pre-fill the details form with the fetched values so the inputs show the
  // current data; the grayed "Teraz:" lines below keep showing the original
  // (server) value so the user sees what they are changing it from.
  useEffect(() => {
    if (profile) {
      resetDetails({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
      });
    }
  }, [profile, resetDetails]);

  if (isLoading) return <div className="p-6">Ładowanie profilu...</div>;

  const handleUpdateDetails = (data: DetailsInputs) => {
    updateDetailsMutation.mutate(data, {
      onSuccess: () => addToast("Dane zaktualizowane", "success"),
      onError: (err) =>
        addToast(err instanceof Error ? err.message : "Błąd", "error"),
    });
  };

  const handleUpdatePublicProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanLinks = socialLinks.filter(
      (l) => l.platformName.trim() && l.url.trim(),
    );
    updateProfileMutation.mutate(
      { bio: bio.trim() || null, socialLinks: cleanLinks },
      {
        onSuccess: () => addToast("Profil publiczny zapisany", "success"),
        onError: (err: unknown) =>
          addToast(
            err instanceof Error ? err.message : "Nie udało się zapisać",
            "error",
          ),
      },
    );
  };

  const handleLinkChange = (
    index: number,
    field: keyof SocialLinkDto,
    value: string,
  ) => {
    setSocialLinks((links) =>
      links.map((link, i) =>
        i === index ? { ...link, [field]: value } : link,
      ),
    );
  };

  const handleAddLink = () => {
    if (socialLinks.length < MAX_SOCIAL_LINKS) {
      setSocialLinks((links) => [...links, { platformName: "", url: "" }]);
    }
  };

  const handleRemoveLink = (index: number) => {
    setSocialLinks((links) => links.filter((_, i) => i !== index));
  };

  const handleChangePassword = (data: PasswordInputs) => {
    changePasswordMutation.mutate(data, {
      onSuccess: () => {
        addToast("Hasło zmienione", "success");
        passwordForm.reset();
      },
      onError: (err) =>
        addToast(err instanceof Error ? err.message : "Błąd", "error"),
    });
  };

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Zostaniesz wylogowany. Usunięcie jest nieodwracalne. Jesteś pewien?",
      )
    ) {
      deleteAccountMutation.mutate(
        { password: deletePass },
        {
          onError: (err) =>
            addToast(err instanceof Error ? err.message : "Błąd", "error"),
        },
      );
    }
  };

  // Grayed reference to the currently-saved value (what the user is editing
  // away from). Stays constant until the profile query refetches after a save.
  const current = (label: string) => (
    <p className="mt-1 truncate font-mono text-xs text-text-muted">
      Teraz: <span className="text-text-secondary">{label || "—"}</span>
    </p>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader kicker="Konto" title="Zarządzanie profilem" />

      {/* DANE PODSTAWOWE */}
      <section className="rounded-xl border border-border-light bg-surface-raised p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
          <User size={18} className="text-accent-primary" />
          Dane podstawowe
        </h2>
        <form
          onSubmit={detailsForm.handleSubmit(handleUpdateDetails)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <input
                type="text"
                placeholder="Imię"
                {...detailsForm.register("firstName")}
                className={inputClass}
              />
              {detailsForm.formState.errors.firstName ? (
                <p className="mt-1 text-xs text-status-error">
                  {detailsForm.formState.errors.firstName.message}
                </p>
              ) : (
                current(profile?.firstName ?? "")
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="Nazwisko"
                {...detailsForm.register("lastName")}
                className={inputClass}
              />
              {detailsForm.formState.errors.lastName ? (
                <p className="mt-1 text-xs text-status-error">
                  {detailsForm.formState.errors.lastName.message}
                </p>
              ) : (
                current(profile?.lastName ?? "")
              )}
            </div>
          </div>
          <div>
            <input
              type="email"
              placeholder="E-mail"
              {...detailsForm.register("email")}
              className={inputClass}
            />
            {detailsForm.formState.errors.email ? (
              <p className="mt-1 text-xs text-status-error">
                {detailsForm.formState.errors.email.message}
              </p>
            ) : (
              current(profile?.email ?? "")
            )}
          </div>
          <button
            type="submit"
            disabled={updateDetailsMutation.isPending}
            className="rounded-md bg-accent-primary px-4 py-2 text-text-on-accent transition hover:bg-accent-hover disabled:opacity-50"
          >
            Zapisz dane
          </button>
        </form>
      </section>

      {/* WYGLĄD / MOTYW */}
      <section className="rounded-xl border border-border-light bg-surface-raised p-6 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-text-primary">
          <Palette size={18} className="text-accent-primary" />
          Wygląd
        </h2>
        <p className="mb-4 text-sm text-text-secondary">
          Wybierz motyw kolorystyczny. Ustawienie zapisuje się na tym
          urządzeniu.
        </p>
        <ThemeSwitcher />
      </section>

      {/* PROFIL PUBLICZNY */}
      <section className="rounded-xl border border-border-light bg-surface-raised p-6 shadow-sm">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-text-primary">
          <Globe size={18} className="text-accent-primary" />
          Profil publiczny
        </h2>
        <p className="mb-4 text-sm text-text-secondary">
          Bio i linki widoczne dla innych użytkowników na Twoim profilu.
        </p>
        <form onSubmit={handleUpdatePublicProfile} className="space-y-4">
          <div>
            <textarea
              rows={4}
              placeholder="Napisz coś o sobie..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={inputClass}
            />
            {current(profile?.bio ?? "")}
          </div>

          <div className="space-y-2">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Platforma (np. GitHub)"
                  value={link.platformName}
                  onChange={(e) =>
                    handleLinkChange(index, "platformName", e.target.value)
                  }
                  className={`w-1/3 ${inputClass}`}
                />
                <input
                  type="url"
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) =>
                    handleLinkChange(index, "url", e.target.value)
                  }
                  className={`flex-1 ${inputClass}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveLink(index)}
                  className="grid w-10 shrink-0 place-items-center rounded-md text-status-error transition hover:bg-status-error-bg"
                  aria-label="Usuń link"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            {socialLinks.length < MAX_SOCIAL_LINKS && (
              <button
                type="button"
                onClick={handleAddLink}
                className="flex items-center gap-1.5 text-sm font-medium text-accent-primary hover:underline"
              >
                <Plus size={14} />
                Dodaj link ({socialLinks.length}/{MAX_SOCIAL_LINKS})
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="rounded-md bg-accent-primary px-4 py-2 text-text-on-accent transition hover:bg-accent-hover disabled:opacity-50"
          >
            Zapisz profil publiczny
          </button>
        </form>
      </section>

      {/* ZMIANA HASŁA */}
      <section className="rounded-xl border border-border-light bg-surface-raised p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-text-primary">
          <KeyRound size={18} className="text-accent-primary" />
          Zmień hasło
        </h2>
        <form
          onSubmit={passwordForm.handleSubmit(handleChangePassword)}
          className="space-y-4"
        >
          <div>
            <PasswordInput
              placeholder="Obecne hasło"
              {...passwordForm.register("currentPassword")}
              className={inputClass}
            />
          </div>
          <div>
            <PasswordInput
              placeholder="Nowe hasło"
              {...passwordForm.register("newPassword")}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="rounded-md bg-accent-primary px-4 py-2 text-text-on-accent transition hover:bg-accent-hover disabled:opacity-50"
          >
            Zaktualizuj hasło
          </button>
        </form>
      </section>

      {/* DANGER ZONE */}
      <section className="rounded-xl border border-status-error bg-status-error-bg p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-status-error">
          <AlertTriangle size={18} />
          Strefa niebezpieczna
        </h2>
        <p className="mb-4 text-sm text-text-secondary">
          Usunięcie konta jest nieodwracalne. Wszystkie Twoje dane zostaną
          zniszczone.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <PasswordInput
            placeholder="Potwierdź hasłem"
            value={deletePass}
            onChange={(e) => setDeletePass(e.target.value)}
            className="w-full rounded-md border border-status-error bg-bg-tertiary p-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-status-error"
          />
          <button
            onClick={handleDeleteAccount}
            disabled={!deletePass || deleteAccountMutation.isPending}
            className="whitespace-nowrap rounded-md bg-status-error px-4 py-2 font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            Usuń konto
          </button>
        </div>
      </section>
    </div>
  );
};

export default Profile;
