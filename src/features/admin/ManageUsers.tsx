import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { UserPlus, Pencil, Trash2, Mail, ShieldAlert, X } from "lucide-react";
import {
  useAllUsers,
  useCreateUser,
  useUpdateUser,
  useUpdateUserRole,
  useDeleteUser,
  type UserDTO,
} from "./api/useAdminQueries";
import { apiClient } from "@/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";
import { useConfirmStore } from "@/store/useConfirmStore";
import PageHeader from "@/components/ui/PageHeader";

const inputClass =
  "w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

const ManageUsers = () => {
  const { data: users, isLoading } = useAllUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const updateRoleMutation = useUpdateUserRole();
  const deleteUserMutation = useDeleteUser();
  const addToast = useToastStore((state) => state.addToast);
  const confirm = useConfirmStore((state) => state.confirm);

  // Admin wysyła użytkownikowi maila z linkiem resetu (reuse public flow).
  const sendResetLinkMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiClient("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return res.json();
    },
    onSuccess: () => addToast("Wysłano link do resetu hasła", "success"),
    onError: (err) =>
      addToast(err instanceof Error ? err.message : "Błąd", "error"),
  });

  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "Student" as UserDTO["role"],
  });
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Student" as UserDTO["role"],
  });
  // Monit potwierdzenia hasłem przy promocji do Admina (na razie tylko front).
  const [adminPassword, setAdminPassword] = useState("");

  if (isLoading)
    return <div className="p-6 text-text-muted">Ładowanie użytkowników...</div>;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createUserMutation.mutate(newUser, {
      onSuccess: () => {
        addToast("Użytkownik dodany", "success");
        setShowCreateModal(false);
        setNewUser({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          role: "Student",
        });
      },
      onError: (err) =>
        addToast(err instanceof Error ? err.message : "Błąd", "error"),
    });
  };

  const openEditModal = (user: UserDTO) => {
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    setAdminPassword("");
    setSelectedUser(user);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    updateUserMutation.mutate(
      { id: selectedUser.id, data: editData },
      {
        onSuccess: () => {
          addToast("Zaktualizowano", "success");
          setAdminPassword("");
          setSelectedUser(null);
        },
        onError: (err) =>
          addToast(err instanceof Error ? err.message : "Błąd", "error"),
      },
    );
  };

  const handleRoleChange = (userId: number, newRole: string) => {
    updateRoleMutation.mutate(
      { userId, newRole },
      {
        onSuccess: () => addToast("Rola zaktualizowana", "success"),
        onError: (err) =>
          addToast(err instanceof Error ? err.message : "Błąd", "error"),
      },
    );
  };

  const handleDelete = async (userId: number, email: string) => {
    const ok = await confirm({
      title: "Usunąć użytkownika?",
      message: `Konto ${email} zostanie trwale usunięte. Tej operacji nie można cofnąć.`,
      confirmText: "Usuń użytkownika",
      variant: "danger",
    });
    if (!ok) return;
    deleteUserMutation.mutate(userId, {
      onSuccess: () => addToast("Usunięto", "success"),
      onError: (err) =>
        addToast(err instanceof Error ? err.message : "Błąd", "error"),
    });
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Administrator"
        title="Użytkownicy"
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-md bg-accent-primary px-4 py-2 text-text-on-accent transition hover:bg-accent-hover"
          >
            <UserPlus size={16} />
            Dodaj użytkownika
          </button>
        }
      />

      <div className="overflow-x-auto rounded-xl border border-border-light bg-surface-raised shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border-light font-mono text-xs uppercase tracking-wider text-text-muted">
              <th className="p-4 font-medium">Imię i Nazwisko</th>
              <th className="p-4 font-medium">E-mail</th>
              <th className="p-4 font-medium">Rola</th>
              <th className="p-4 font-medium">Data dołączenia</th>
              <th className="p-4 text-right font-medium">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {users?.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-bg-secondary"
              >
                <td className="p-4 font-medium text-text-primary">
                  {user.firstName} {user.lastName}
                </td>
                <td className="p-4 font-mono text-sm text-text-secondary">
                  {user.email}
                </td>
                <td className="p-4">
                  {user.role === "Admin" ? (
                    <span className="rounded bg-accent-subtle px-2 py-1 text-sm font-medium text-accent-secondary">
                      Admin
                    </span>
                  ) : (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={updateRoleMutation.isPending}
                      className="rounded border border-border-medium bg-bg-tertiary px-2 py-1 text-sm font-medium focus:border-accent-primary focus:outline-none"
                    >
                      <option value="Student">Student</option>
                      <option value="Organizer">Organizer</option>
                    </select>
                  )}
                </td>
                <td className="p-4 font-mono text-sm text-text-secondary">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => openEditModal(user)}
                      className="flex items-center gap-1.5 text-sm font-medium text-accent-primary hover:underline"
                    >
                      <Pencil size={14} />
                      Edytuj
                    </button>
                    {user.role !== "Admin" && (
                      <button
                        onClick={() => handleDelete(user.id, user.email)}
                        className="flex items-center gap-1.5 text-sm font-medium text-status-error hover:underline"
                      >
                        <Trash2 size={14} />
                        Usuń
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALE */}
      {/* Modal: Dodaj Użytkownika */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-border-light bg-surface-raised p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-text-primary">
                Nowy użytkownik
              </h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                aria-label="Zamknij"
                className="text-text-muted transition hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="email"
                required
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className={inputClass}
              />
              <input
                type="text"
                required
                placeholder="Imię"
                value={newUser.firstName}
                onChange={(e) =>
                  setNewUser({ ...newUser, firstName: e.target.value })
                }
                className={inputClass}
              />
              <input
                type="text"
                required
                placeholder="Nazwisko"
                value={newUser.lastName}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastName: e.target.value })
                }
                className={inputClass}
              />
              <input
                type="password"
                required
                placeholder="Hasło startowe"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className={inputClass}
              />
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    role: e.target.value as UserDTO["role"],
                  })
                }
                className={inputClass}
              >
                <option value="Student">Student</option>
                <option value="Organizer">Organizer</option>
                <option value="Admin">Admin</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 rounded-md border border-border-medium py-2 text-text-secondary transition hover:bg-bg-secondary"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-md bg-accent-primary py-2 text-text-on-accent transition hover:bg-accent-hover"
                >
                  Dodaj
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edytuj / Resetuj Hasło */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay/50 p-4">
          <div className="w-full max-w-md space-y-6 rounded-xl border border-border-light bg-surface-raised p-6 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-text-primary">Edycja</h2>
                <p className="mt-1 font-mono text-xs text-text-muted">
                  ID: {selectedUser.id} · {selectedUser.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                aria-label="Zamknij"
                className="text-text-muted transition hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="email"
                required
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className={inputClass}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={editData.firstName}
                  onChange={(e) =>
                    setEditData({ ...editData, firstName: e.target.value })
                  }
                  className={inputClass}
                />
                <input
                  type="text"
                  required
                  value={editData.lastName}
                  onChange={(e) =>
                    setEditData({ ...editData, lastName: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <select
                value={editData.role}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    role: e.target.value as UserDTO["role"],
                  })
                }
                className={inputClass}
              >
                <option value="Student">Student</option>
                <option value="Organizer">Organizer</option>
                <option value="Admin">Admin</option>
              </select>
              {editData.role === "Admin" && selectedUser.role !== "Admin" && (
                <div className="rounded-md border border-status-warning bg-status-warning-bg p-3">
                  <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-status-warning">
                    <ShieldAlert size={14} />
                    Nadajesz uprawnienia administratora
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Potwierdź swoim hasłem administratora"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-text-muted">
                    Weryfikacja hasła po stronie serwera w przygotowaniu.
                  </p>
                </div>
              )}
              <button
                type="submit"
                className="w-full rounded-md bg-accent-primary py-2 text-text-on-accent transition hover:bg-accent-hover"
              >
                Zapisz dane
              </button>
            </form>

            <div className="border-t border-border-light pt-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-status-warning">
                <Mail size={15} />
                Reset hasła
              </h3>
              <p className="mb-3 text-sm text-text-secondary">
                Wyślij użytkownikowi e-mail z linkiem do samodzielnego
                zresetowania hasła.
              </p>
              <button
                type="button"
                onClick={() => sendResetLinkMutation.mutate(selectedUser.email)}
                disabled={sendResetLinkMutation.isPending}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-status-warning py-2 font-medium text-bg-primary transition hover:opacity-90 disabled:opacity-50"
              >
                <Mail size={16} />
                {sendResetLinkMutation.isPending
                  ? "Wysyłanie..."
                  : "Wyślij link do resetu hasła"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
