import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiFetch } from "@/lib/apiClient";

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
    queryFn: () => apiFetch<PublicEvent[]>("/events"),
  });
};

export const useMyTickets = () => {
  return useQuery({
    queryKey: ["student", "tickets"],
    queryFn: () => apiFetch<Ticket[]>("/tickets/my"),
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
    queryFn: () => apiFetch<PublicEvent>(`/events/${id}`),
    enabled: !!id,
  });
};
