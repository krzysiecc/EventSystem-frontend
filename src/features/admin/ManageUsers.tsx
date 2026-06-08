import {
  useAllUsers,
  useUpdateUserRole,
  useDeleteUser,
} from "./api/useAdminQueries";
import { useToastStore } from "@/store/useToastStore";

const ManageUsers = () => {
  const { data: users, isLoading } = useAllUsers();
  const updateRoleMutation = useUpdateUserRole();
  const deleteUserMutation = useDeleteUser();
  const addToast = useToastStore((state) => state.addToast);

  if (isLoading)
    return <div className="p-6 text-text-muted">Ładowanie użytkowników...</div>;

  const handleRoleChange = (userId: string | number, newRole: string) => {
    if (window.confirm(`Czy na pewno chcesz zmienić rolę na ${newRole}?`)) {
      updateRoleMutation.mutate(
        { userId, newRole },
        {
          onSuccess: () => addToast("Rola zaktualizowana pomyślnie", "success"),
          onError: (err: unknown) => addToast((err as Error).message, "error"),
        },
      );
    }
  };

  const handleDeleteUser = (userId: string | number, email: string) => {
    if (
      window.confirm(
        `NIEODWRACALNE! Czy na pewno chcesz usunąć użytkownika ${email} i wszystkie jego dane?`,
      )
    ) {
      deleteUserMutation.mutate(userId, {
        onSuccess: () => addToast("Użytkownik usunięty", "success"),
        onError: (err: unknown) => addToast((err as Error).message, "error"),
      });
    }
  };

  return (
    <div className="layout-container py-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Użytkownicy w systemie
      </h1>

      <div className="bg-surface-raised border border-border-light rounded-xl overflow-hidden shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg-secondary text-text-secondary text-sm border-b border-border-light">
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
                <td className="p-4 font-medium text-text-primary">
                  {user.email}
                </td>
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={
                      user.role === "Admin" || updateRoleMutation.isPending
                    }
                    className="bg-bg-tertiary border border-border-medium rounded px-2 py-1 text-sm font-medium"
                  >
                    <option value="Student">Student</option>
                    <option value="Organizer">Organizer</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td className="p-4 text-text-secondary">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleDeleteUser(user.id, user.email)}
                    disabled={
                      user.role === "Admin" || deleteUserMutation.isPending
                    }
                    className="text-sm font-medium text-status-error hover:underline disabled:opacity-50"
                  >
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
