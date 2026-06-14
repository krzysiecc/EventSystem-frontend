import { useState } from "react";
import { UserPlus, Pencil, Trash2, KeyRound, X } from "lucide-react";
import {
  useAllUsers,
  useCreateUser,
  useUpdateUser,
  useResetUserPassword,
  useUpdateUserRole,
  useDeleteUser,
  type UserDTO,
} from "./api/useAdminQueries";
import { useToastStore } from "@/store/useToastStore";
import PageHeader from "@/components/ui/PageHeader";

const inputClass =
  "w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

const ManageUsers = () => {
  const { data: users, isLoading } = useAllUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const resetPassMutation = useResetUserPassword();
  const updateRoleMutation = useUpdateUserRole();
  const deleteUserMutation = useDeleteUser();
  const addToast = useToastStore((state) => state.addToast);

  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "Student" as UserDTO["role"],
  });
  const [resetPass, setResetPass] = useState("");
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "Student" as UserDTO["role"],
  });

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
          setSelectedUser(null);
        },
        onError: (err) =>
          addToast(err instanceof Error ? err.message : "Błąd", "error"),
      },
    );
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (!resetPass) return;
    resetPassMutation.mutate(
      { id: selectedUser.id, newPassword: resetPass },
      {
        onSuccess: () => {
          addToast("Hasło zresetowane", "success");
          setResetPass("");
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

  const handleDelete = (userId: number, email: string) => {
    if (window.confirm(`NIEODWRACALNE! Usunąć ${email}?`)) {
      deleteUserMutation.mutate(userId, {
        onSuccess: () => addToast("Usunięto", "success"),
        onError: (err) =>
          addToast(err instanceof Error ? err.message : "Błąd", "error"),
      });
    }
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
              <h2 className="text-xl font-bold text-text-primary">
                Edycja:{" "}
                <span className="font-mono text-base text-text-secondary">
                  {selectedUser.email}
                </span>
              </h2>
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
              <button
                type="submit"
                className="w-full rounded-md bg-accent-primary py-2 text-text-on-accent transition hover:bg-accent-hover"
              >
                Zapisz dane
              </button>
            </form>

            <div className="border-t border-border-light pt-4">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-status-warning">
                <KeyRound size={15} />
                Reset hasła
              </h3>
              <form onSubmit={handleResetPassword} className="flex gap-2">
                <input
                  type="password"
                  placeholder="Nowe hasło"
                  required
                  value={resetPass}
                  onChange={(e) => setResetPass(e.target.value)}
                  className="flex-1 rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:border-status-warning focus:outline-none focus:ring-1 focus:ring-status-warning"
                />
                <button
                  type="submit"
                  className="rounded-md bg-status-warning px-4 py-2 font-medium text-bg-primary"
                >
                  Zresetuj
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
