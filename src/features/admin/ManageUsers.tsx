import { useState } from "react";
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
    <div className="layout-container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-text-primary">Użytkownicy</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-accent-primary text-text-on-accent px-4 py-2 rounded-md hover:bg-accent-hover"
        >
          + Dodaj użytkownika
        </button>
      </div>

      <div className="bg-surface-raised border border-border-light rounded-xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-secondary text-text-secondary text-sm border-b border-border-light">
              <th className="p-4 font-semibold">Imię i Nazwisko</th>
              <th className="p-4 font-semibold">E-mail</th>
              <th className="p-4 font-semibold">Rola</th>
              <th className="p-4 font-semibold">Data dołączenia</th>
              <th className="p-4 font-semibold text-right">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {users?.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-bg-secondary transition-colors"
              >
                <td className="p-4 text-text-primary">
                  {user.firstName} {user.lastName}
                </td>
                <td className="p-4 font-medium text-text-primary">
                  {user.firstName} {user.lastName}
                </td>
                <td className="p-4 text-text-secondary">{user.email}</td>
                <td className="p-4">
                  {user.role === "Admin" ? (
                    <span className="px-2 py-1 text-sm font-medium text-text-secondary">
                      Admin
                    </span>
                  ) : (
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      disabled={updateRoleMutation.isPending}
                      className="bg-bg-tertiary border border-border-medium rounded px-2 py-1 text-sm font-medium"
                    >
                      <option value="Student">Student</option>
                      <option value="Organizer">Organizer</option>
                    </select>
                  )}
                </td>
                <td className="p-4 text-text-secondary">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="text-sm font-medium text-accent-primary hover:underline"
                  >
                    Edytuj
                  </button>
                  {user.role !== "Admin" && (
                    <button
                      onClick={() => handleDelete(user.id, user.email)}
                      className="text-sm font-medium text-status-error hover:underline"
                    >
                      Usuń
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODALE */}
      {/* Modal: Dodaj Użytkownika */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-bg-overlay/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-raised p-6 rounded-xl w-full max-w-md border border-border-light">
            <h2 className="text-xl font-bold mb-4">Nowy użytkownik</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="email"
                required
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="w-full p-2 rounded-md border border-border-medium bg-bg-tertiary text-text-primary"
              />
              <input
                type="text"
                required
                placeholder="Imię"
                value={newUser.firstName}
                onChange={(e) =>
                  setNewUser({ ...newUser, firstName: e.target.value })
                }
                className="w-full p-2 rounded-md border border-border-medium bg-bg-tertiary text-text-primary"
              />
              <input
                type="text"
                required
                placeholder="Nazwisko"
                value={newUser.lastName}
                onChange={(e) =>
                  setNewUser({ ...newUser, lastName: e.target.value })
                }
                className="w-full p-2 rounded-md border border-border-medium bg-bg-tertiary text-text-primary"
              />
              <input
                type="password"
                required
                placeholder="Hasło startowe"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="w-full p-2 rounded-md border border-border-medium bg-bg-tertiary text-text-primary"
              />
              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({
                    ...newUser,
                    role: e.target.value as UserDTO["role"],
                  })
                }
                className="w-full p-2 rounded-md border border-border-medium bg-bg-tertiary text-text-primary"
              >
                <option value="Student">Student</option>
                <option value="Organizer">Organizer</option>
                <option value="Admin">Admin</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2 border border-border-medium rounded-md text-text-secondary"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-accent-primary text-text-on-accent rounded-md"
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
        <div className="fixed inset-0 bg-bg-overlay/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-raised p-6 rounded-xl w-full max-w-md border border-border-light space-y-6">
            <h2 className="text-xl font-bold">Edycja: {selectedUser.email}</h2>

            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="email"
                required
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
                className="w-full p-2 rounded-md border border-border-medium bg-bg-tertiary text-text-primary"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={editData.firstName}
                  onChange={(e) =>
                    setEditData({ ...editData, firstName: e.target.value })
                  }
                  className="w-full p-2 rounded-md border border-border-medium bg-bg-tertiary text-text-primary"
                />
                <input
                  type="text"
                  required
                  value={editData.lastName}
                  onChange={(e) =>
                    setEditData({ ...editData, lastName: e.target.value })
                  }
                  className="w-full p-2 rounded-md border border-border-medium bg-bg-tertiary text-text-primary"
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
                className="w-full p-2 rounded-md border border-border-medium bg-bg-tertiary text-text-primary"
              >
                <option value="Student">Student</option>
                <option value="Organizer">Organizer</option>
                <option value="Admin">Admin</option>
              </select>
              <button
                type="submit"
                className="w-full py-2 bg-accent-primary text-text-on-accent rounded-md"
              >
                Zapisz dane
              </button>
            </form>

            <div className="border-t border-border-light pt-4">
              <h3 className="font-semibold text-status-warning mb-2 text-sm">
                Reset hasła
              </h3>
              <form onSubmit={handleResetPassword} className="flex gap-2">
                <input
                  type="password"
                  placeholder="Nowe hasło"
                  required
                  value={resetPass}
                  onChange={(e) => setResetPass(e.target.value)}
                  className="flex-1 p-2 rounded-md border border-border-medium bg-bg-tertiary text-text-primary"
                />
                <button
                  type="submit"
                  className="bg-status-warning text-bg-primary px-4 py-2 rounded-md font-medium"
                >
                  Zresetuj
                </button>
              </form>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full py-2 text-text-muted hover:text-text-secondary transition"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
