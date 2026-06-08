import { useState } from "react";
import {
  useMyProfile,
  useUpdateDetails,
  useChangePassword,
  useDeleteAccount,
} from "./api/useProfileQueries";
import { useToastStore } from "@/store/useToastStore";

const Profile = () => {
  const { data: profile, isLoading } = useMyProfile();
  const updateDetailsMutation = useUpdateDetails();
  const changePasswordMutation = useChangePassword();
  const deleteAccountMutation = useDeleteAccount();
  const addToast = useToastStore((state) => state.addToast);

  const [detailsForm, setDetailsForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [deletePass, setDeletePass] = useState("");

  if (isLoading) return <div className="p-6">Ładowanie profilu...</div>;

  const handleUpdateDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateDetailsMutation.mutate(
      {
        ...detailsForm,
        firstName: detailsForm.firstName || profile!.firstName,
        lastName: detailsForm.lastName || profile!.lastName,
        email: detailsForm.email || profile!.email,
      },
      { onSuccess: () => addToast("Dane zaktualizowane", "success") },
    );
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    changePasswordMutation.mutate(passForm, {
      onSuccess: () => {
        addToast("Hasło zmienione", "success");
        setPassForm({ currentPassword: "", newPassword: "" });
      },
      onError: (err: unknown) => {
        if (err instanceof Error) {
          addToast(err.message, "error");
        } else {
          addToast("Wystąpił nieoczekiwany błąd", "error");
        }
      },
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
          onError: (err: unknown) => {
            if (err instanceof Error) {
              addToast(err.message, "error");
            } else {
              addToast("Wystąpił nieoczekiwany błąd", "error");
            }
          },
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
        <form onSubmit={handleUpdateDetails} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              defaultValue={profile?.firstName}
              onChange={(e) =>
                setDetailsForm({ ...detailsForm, firstName: e.target.value })
              }
              className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
            />
            <input
              type="text"
              defaultValue={profile?.lastName}
              onChange={(e) =>
                setDetailsForm({ ...detailsForm, lastName: e.target.value })
              }
              className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
            />
          </div>
          <input
            type="email"
            defaultValue={profile?.email}
            onChange={(e) =>
              setDetailsForm({ ...detailsForm, email: e.target.value })
            }
            className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
          />
          <button
            type="submit"
            disabled={updateDetailsMutation.isPending}
            className="bg-accent-primary text-text-on-accent px-4 py-2 rounded-md hover:bg-accent-hover transition"
          >
            Zapisz dane
          </button>
        </form>
      </section>

      {/* ZMIANA HASŁA */}
      <section className="bg-surface-raised p-6 border border-border-light rounded-xl">
        <h2 className="text-lg font-semibold mb-4 text-text-primary">
          Zmień hasło
        </h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input
            type="password"
            placeholder="Obecne hasło"
            required
            value={passForm.currentPassword}
            onChange={(e) =>
              setPassForm({ ...passForm, currentPassword: e.target.value })
            }
            className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
          />
          <input
            type="password"
            placeholder="Nowe hasło"
            required
            minLength={6}
            value={passForm.newPassword}
            onChange={(e) =>
              setPassForm({ ...passForm, newPassword: e.target.value })
            }
            className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary"
          />
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
