import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiFetch } from "@/lib/apiClient";

export interface UserDTO {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
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

export interface AdminEventDTO {
  id: number;
  title: string;
  organizerName: string;
  date: string;
  enrolledCount: number;
  maxCapacity: number;
  status: string;
}

// --- QUERIES ---
export const useAllUsers = () => {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiFetch<UserDTO[]>("/admin/users"),
  });
};

export const useSystemLogs = () => {
  return useQuery({
    queryKey: ["admin", "logs"],
    queryFn: () => apiFetch<AuditLog[]>("/admin/logs"),
  });
};

export const useAllEvents = () => {
  return useQuery({
    queryKey: ["admin", "events"],
    queryFn: () => apiFetch<AdminEventDTO[]>("/admin/events"),
  });
};

// --- MUTATIONS ---
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: unknown) => {
      const res = await apiClient("/admin/users", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string | number;
      data: Partial<UserDTO>;
    }) => {
      const res = await apiClient(`/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};

export const useResetUserPassword = () => {
  return useMutation({
    mutationFn: async ({
      id,
      newPassword,
    }: {
      id: string | number;
      newPassword: string;
    }) => {
      const res = await apiClient(`/admin/users/${id}/reset-password`, {
        method: "POST",
        body: JSON.stringify({ newPassword }),
      });
      return res.json();
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
      const res = await apiClient(`/admin/users/${userId}/role`, {
        method: "PUT",
        body: JSON.stringify({ newRole }),
      });
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string | number) => {
      const res = await apiClient(`/admin/users/${userId}`, {
        method: "DELETE",
      });
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
};

export const useSendTokenEmail = () => {
  return useMutation({
    mutationFn: async ({ token, email }: { token: string; email: string }) => {
      const res = await apiClient("/admin/send-token-email", {
        method: "POST",
        body: JSON.stringify({ token, email }),
      });
      return res.json();
    },
  });
};
