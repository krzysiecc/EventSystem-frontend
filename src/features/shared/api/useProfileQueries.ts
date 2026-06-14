import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiFetch } from "@/lib/apiClient";
import { useAuthStore } from "@/store/useAuthStore";

export interface SocialLinkDto {
  platformName: string;
  url: string;
}

export interface UserProfileDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  bio: string | null;
  role: string;
  createdAt: string;
  socialLinks: SocialLinkDto[];
}

export const useMyProfile = () => {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => apiFetch<UserProfileDto>("/users/me"),
  });
};

export const useUpdateDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      firstName: string;
      lastName: string;
      email: string;
    }) => {
      const response = await apiClient("/users/details", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] }),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      bio: string | null;
      socialLinks: SocialLinkDto[];
    }) => {
      const response = await apiClient("/users/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] }),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient("/users/password", {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response.json();
    },
  });
};

export const useDeleteAccount = () => {
  const logout = useAuthStore((state) => state.logout);
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const response = await apiClient("/users", {
        method: "DELETE",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      logout();
      window.location.href = "/";
    },
  });
};

export const usePublicProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profile", "public", userId],
    queryFn: () => apiFetch<UserProfileDto>(`/users/public/${userId}`),
    enabled: !!userId,
  });
};
