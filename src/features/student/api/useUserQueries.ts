import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export interface SocialLinkDto {
  platformName: string;
  url: string;
}

export interface PublicProfile {
  firstName: string;
  lastName: string;
  bio: string | null;
  socialLinks: SocialLinkDto[]; // Teraz to pasuje do C#!
}

export const usePublicProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["publicProfile", userId],
    queryFn: async (): Promise<PublicProfile> => {
      if (!userId) throw new Error("Brak ID");
      const response = await apiClient(`/api/Users/public/${userId}`);
      return response.json();
    },
    enabled: !!userId,
  });
};