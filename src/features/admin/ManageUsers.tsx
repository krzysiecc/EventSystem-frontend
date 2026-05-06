import { useAllUsers } from "./api/useAdminQueries";

const ManageUsers = () => {
  const { data: users, isLoading } = useAllUsers();

  if (isLoading)
    return <div className="p-6 text-text-muted">Ładowanie użytkowników...</div>;

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
              <th className="p-4 font-semibold">Status</th>
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
                  <span
                    className={`px-2 py-1 text-xs rounded font-bold uppercase
                    ${
                      user.role === "Admin"
                        ? "bg-status-error-bg text-status-error"
                        : user.role === "Organizer"
                          ? "bg-accent-subtle text-accent-primary"
                          : "bg-status-info-bg text-status-info"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-text-secondary">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  {user.isActive ? (
                    <span className="text-status-success text-sm font-medium">
                      Aktywny
                    </span>
                  ) : (
                    <span className="text-status-error text-sm font-medium">
                      Zablokowany
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button className="text-sm font-medium text-accent-primary hover:underline">
                    Edytuj
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
