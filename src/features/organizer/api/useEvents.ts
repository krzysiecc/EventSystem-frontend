import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export interface OrganizerEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  maxCapacity: number;
  enrolledCount: number; // Musi być tak jak w Swaggerze (zamiast ticketsSold)
}

export interface Attendee {
  id: number;
  studentEmail: string;
  registrationDate: string;
  isUsed: boolean;
}

/**
 * @description Pobiera listę wszystkich wydarzeń organizatora
 */
export const useOrganizerEvents = () => {
  return useQuery({
    queryKey: ["organizer", "events"],
    queryFn: async (): Promise<OrganizerEvent[]> => {
      const response = await apiClient("/api/Events");
      if (!response.ok) throw new Error("Nie udało się pobrać listy wydarzeń");
      return response.json();
    },
  });
};

/**
 * @description Pobiera szczegóły jednego konkretnego wydarzenia
 */
export const useOrganizerEventDetails = (eventId: string | number | undefined) => {
  return useQuery({
    queryKey: ["organizer", "events", eventId],
    queryFn: async (): Promise<OrganizerEvent> => {
      if (!eventId) throw new Error("Brak ID");
      const response = await apiClient(`/api/Events/${eventId}`);
      if (!response.ok) throw new Error("Błąd serwera: " + response.status);
      return response.json();
    },
    enabled: !!eventId,
  });
};

/**
 * @description Pobiera listę uczestników zapisaną na wydarzenie
 */
export const useEventAttendees = (eventId: string | number | undefined) => {
  return useQuery({
    queryKey: ["organizer", "events", eventId, "attendees"],
    queryFn: async (): Promise<Attendee[]> => {
      if (!eventId) throw new Error("Brak ID");
      const response = await apiClient(`/api/Events/${eventId}/attendees`);
      if (!response.ok) throw new Error("Błąd pobierania uczestników");
      return response.json();
    },
    enabled: !!eventId,
  });
};

/**
 * @description Manualne i QR oznaczanie obecności
 */
export const useManualCheckIn = (eventId: string | number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: string | number) => {
      const response = await apiClient(`/api/Tickets/scan/${ticketId}`, { method: "POST" });
      const text = await response.text();
      if (text !== "Success") throw new Error(text);
      return text;
    },
    onSuccess: () => {
      // Odświeżamy dane wydarzenia (licznik) i listę osób
      queryClient.invalidateQueries({ queryKey: ["organizer", "events", eventId] });
      queryClient.invalidateQueries({ queryKey: ["organizer", "events", eventId, "attendees"] });
    },
  });
};