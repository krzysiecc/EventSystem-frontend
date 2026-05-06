import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

// TODO: check with DTOs
export interface PublicEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  capacity: number;
  ticketsSold: number;
  description: string;
}

// TODO: check with DTOs
export interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  isUsed: boolean;
}

/**
 * @description Hooks for student queries: fetching events, fetching tickets, registering for events.
 *
 * @param none
 * @returns       useAllEvents - fetches all published events for students
 * @returns       useMyTickets - fetches the logged-in student's tickets
 * @returns       useRegisterForEvent - mutation hook to register the student for an event, invalidates relevant queries on success
 * @returns       useEventDetails - fetches detailed information about a specific event by ID
 */
export const useAllEvents = () => {
  return useQuery({
    queryKey: ["student", "events"],
    queryFn: async (): Promise<PublicEvent[]> => {
      const response = await apiClient("/events/published");
      return response.json();
    },
  });
};

export const useMyTickets = () => {
  return useQuery({
    queryKey: ["student", "tickets"],
    queryFn: async (): Promise<Ticket[]> => {
      const response = await apiClient("/tickets/my-tickets");
      return response.json();
    },
  });
};

export const useRegisterForEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiClient(`/events/${eventId}/register`, {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "events"] });
      queryClient.invalidateQueries({ queryKey: ["student", "tickets"] });
    },
  });
};

export const useEventDetails = (id: string | undefined) => {
  return useQuery({
    queryKey: ["student", "events", id],
    queryFn: async (): Promise<PublicEvent> => {
      if (!id) throw new Error("No ID provided");
      const response = await apiClient(`/events/${id}`);
      return response.json();
    },
    enabled: !!id, // Zapytanie nie wyśle się, jeśli nie ma ID
  });
};
