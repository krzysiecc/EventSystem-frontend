import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import {
  useMyProfile,
  useUpdateDetails,
  useUpdateProfile,
  useChangePassword,
  useDeleteAccount,
  type SocialLinkDto,
} from "./api/useProfileQueries";
import { useToastStore } from "@/store/useToastStore";

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

  return (
    <div className="layout-container py-6 max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-text-primary">
        Zarządzanie profilem
      </h1>

      {/* DANE PODSTAWOWE */}
      <section className="bg-surface-raised p-6 border border-border-light rounded-xl">
        <h2 className="text-lg font-semibold mb-4 text-text-primary">
          Dane podstawowe
        </h2>
        <form
          onSubmit={detailsForm.handleSubmit(handleUpdateDetails)}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                {...detailsForm.register("firstName")}
                className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
              />
              {detailsForm.formState.errors.firstName && (
                <p className="text-xs text-status-error mt-1">
                  {detailsForm.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                {...detailsForm.register("lastName")}
                className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
              />
              {detailsForm.formState.errors.lastName && (
                <p className="text-xs text-status-error mt-1">
                  {detailsForm.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <input
              type="email"
              {...detailsForm.register("email")}
              className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
            />
            {detailsForm.formState.errors.email && (
              <p className="text-xs text-status-error mt-1">
                {detailsForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={updateDetailsMutation.isPending}
            className="bg-accent-primary text-text-on-accent px-4 py-2 rounded-md hover:bg-accent-hover transition"
          >
            Zapisz dane
          </button>
        </form>
      </section>

      {/* PROFIL PUBLICZNY */}
      <section className="bg-surface-raised p-6 border border-border-light rounded-xl">
        <h2 className="text-lg font-semibold mb-1 text-text-primary">
          Profil publiczny
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          Bio i linki widoczne dla innych użytkowników na Twoim profilu.
        </p>
        <form onSubmit={handleUpdatePublicProfile} className="space-y-4">
          <textarea
            rows={4}
            placeholder="Napisz coś o sobie..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
          />

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
                  className="w-1/3 rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
                />
                <input
                  type="url"
                  placeholder="https://..."
                  value={link.url}
                  onChange={(e) =>
                    handleLinkChange(index, "url", e.target.value)
                  }
                  className="flex-1 rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveLink(index)}
                  className="text-status-error font-bold px-2 hover:underline"
                  aria-label="Usuń link"
                >
                  ✕
                </button>
              </div>
            ))}
            {socialLinks.length < MAX_SOCIAL_LINKS && (
              <button
                type="button"
                onClick={handleAddLink}
                className="text-sm font-medium text-accent-primary hover:underline"
              >
                + Dodaj link ({socialLinks.length}/{MAX_SOCIAL_LINKS})
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="bg-accent-primary text-text-on-accent px-4 py-2 rounded-md hover:bg-accent-hover transition"
          >
            Zapisz profil publiczny
          </button>
        </form>
      </section>

      {/* ZMIANA HASŁA */}
      <section className="bg-surface-raised p-6 border border-border-light rounded-xl">
        <h2 className="text-lg font-semibold mb-4 text-text-primary">
          Zmień hasło
        </h2>
        <form
          onSubmit={passwordForm.handleSubmit(handleChangePassword)}
          className="space-y-4"
        >
          <div>
            <input
              type="password"
              placeholder="Obecne hasło"
              {...passwordForm.register("currentPassword")}
              className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Nowe hasło"
              {...passwordForm.register("newPassword")}
              className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
            />
          </div>
          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="bg-accent-primary text-text-on-accent px-4 py-2 rounded-md hover:bg-accent-hover transition"
          >
            Zaktualizuj hasło
          </button>
        </form>
      </section>

      {/* DANGER ZONE */}
      <section className="bg-status-error-bg p-6 border border-status-error rounded-xl">
        <h2 className="text-lg font-semibold mb-4 text-status-error">
          Strefa niebezpieczna
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          Usunięcie konta jest nieodwracalne. Wszystkie Twoje dane zostaną
          zniszczone.
        </p>
        <div className="flex gap-4">
          <input
            type="password"
            placeholder="Potwierdź hasłem"
            value={deletePass}
            onChange={(e) => setDeletePass(e.target.value)}
            className="w-full rounded-md border border-status-error bg-bg-tertiary p-2 text-text-primary focus:ring-2 focus:ring-status-error"
          />
          <button
            onClick={handleDeleteAccount}
            disabled={!deletePass || deleteAccountMutation.isPending}
            className="bg-status-error text-white px-4 py-2 rounded-md font-bold whitespace-nowrap disabled:opacity-50"
          >
            Usuń konto
          </button>
        </div>
      </section>
    </div>
  );
};

export default Profile;
