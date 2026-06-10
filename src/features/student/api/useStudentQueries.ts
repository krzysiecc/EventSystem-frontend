import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

export interface PublicEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  maxCapacity: number;
  enrolledCount: number;
  description: string;
}

export interface Ticket {
  id: number;
  eventTitle: string;
  eventDate: string;
  location: string;
  qrCodeContent: string;
  isScanned: boolean;
  studentId: number;
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
      const response = await apiClient("/events");
      const json = await response.json();
      return json.data;
    },
  });
};

export const useMyTickets = () => {
  return useQuery({
    queryKey: ["student", "tickets"],
    queryFn: async (): Promise<Ticket[]> => {
      const response = await apiClient("/tickets/my");
      const json = await response.json();
      return json.data;
    },
  });
};

export const useRegisterForEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: string) => {
      const response = await apiClient(`/tickets/enroll/${eventId}`, {
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
      const json = await response.json();
      return json.data;
    },
    enabled: !!id,
  });
};
