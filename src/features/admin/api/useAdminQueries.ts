import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

// TODO: check if types correctly ensure DTOs
export interface UserDTO {
  id: string;
  email: string;
  role: "Student" | "Organizer" | "Admin";
  isActive: boolean;
  createdAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: "Info" | "Warning" | "Error";
  message: string;
  source: string;
}

export const useAllUsers = () => {
  return useQuery({
    queryKey: ["admin", "users"],
    queryFn: async (): Promise<UserDTO[]> => {
      const response = await apiClient("/admin/users");
      return response.json();
    },
  });
};

export const useSystemLogs = () => {
  return useQuery({
    queryKey: ["admin", "logs"],
    queryFn: async (): Promise<SystemLog[]> => {
      const response = await apiClient("/admin/logs");
      return response.json();
    },
  });
};
