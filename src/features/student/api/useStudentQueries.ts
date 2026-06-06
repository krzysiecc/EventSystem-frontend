import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export interface PublicEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  maxCapacity: number;
  imageUrl?: string;
  ticketsSold: number;
}

export interface Ticket {
  id: number;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  qrCodeContent: string;
  isUsed: boolean;
}

export const useAllEvents = () => {
  return useQuery({
    queryKey: ["student", "events"],
    queryFn: async (): Promise<PublicEvent[]> => {
      const response = await apiClient("/api/Events");
      return response.json();
    },
  });
};

export const useMyTickets = () => {
  return useQuery({
    queryKey: ["student", "tickets"],
    queryFn: async (): Promise<Ticket[]> => {
      const response = await apiClient("/api/Tickets/my");
      return response.json();
    },
  });
};

// DODAJ TO - Brakujący eksport dla widoku szczegółów
export const useEventDetails = (eventId: number | undefined) => {
  return useQuery({
    queryKey: ["student", "events", eventId],
    queryFn: async (): Promise<PublicEvent> => {
      if (!eventId) throw new Error("Brak ID");
      const response = await apiClient(`/api/Events/${eventId}`);
      return response.json();
    },
    enabled: !!eventId,
  });
};

export const useRegisterForEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiClient(`/api/Tickets/enroll/${eventId}`, {
        method: "POST",
      });
      const text = await response.text();
      if (text !== "Success") throw new Error(text);
      return text;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "events"] });
      queryClient.invalidateQueries({ queryKey: ["student", "tickets"] });
    },
  });
};