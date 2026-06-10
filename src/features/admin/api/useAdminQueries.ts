import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export interface UserDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "Student" | "Organizer" | "Admin";
  createdAt: string;
  hasActiveEvents: boolean;
}

export interface AuditLog {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  details: string | null;
  createdAt: string;
  userEmail: string;
}

export const useAllUsers = () => {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async (): Promise<UserDTO[]> => {
      const response = await apiClient("/admin/users");
      const json = await response.json();
      return json.data;
    },
  });
};

export const useSystemLogs = () => {
  return useQuery({
    queryKey: ["admin", "logs"],
    queryFn: async (): Promise<AuditLog[]> => {
      const response = await apiClient("/admin/logs");
      const json = await response.json();
      return json.data;
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      newRole,
    }: {
      userId: string | number;
      newRole: string;
    }) => {
      const response = await apiClient(`/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ newRole }),
      });
      return response.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string | number) => {
      const response = await apiClient(`/admin/users/${userId}`, {
        method: "DELETE",
      });
      return response.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};
