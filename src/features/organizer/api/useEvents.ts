import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// TODO: need mapping for .NET event entity
export interface OrganizerEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  ticketsSold: number;
  capacity: number;
  status: "draft" | "published" | "completed";
}

export interface Attendee {
  id: string; // ticket ID
  studentEmail: string;
  registrationDate: string;
  isUsed: boolean;
}

/**
 * @description Custom hook to fetch events created by the logged-in organizer. 
 * 
 * @param none
 * @returns {OrganizerEvent[]}      list of events with basic info for dashboard display
 */
export const useOrganizerEvents = () => {
  return useQuery({
    queryKey: ["organizer", "events"],
    queryFn: async (): Promise<OrganizerEvent[]> => {
      const response = await apiClient("/events/my-events");
      return response.json();
    },
  });
};

/**
 * @description Custom hook to fetch detailed information about a specific event created by the organizer. 
 *              This is used in the event details page where more in-depth info is required.
 * 
 * @param {string | undefined} eventId  the ID of the event to fetch details for
 * @returns {OrganizerEvent}            detailed information about the event
 */
export const useOrganizerEventDetails = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ["organizer", "events", eventId],
    queryFn: async (): Promise<OrganizerEvent> => {
      if (!eventId) throw new Error("Brak ID");
      const response = await apiClient(`/events/my-events/${eventId}`);
      return response.json();
    },
    enabled: !!eventId,
  });
};

/**
 * @description Custom hook to fetch the list of attendees for a specific event.
 * 
 * @param {string | undefined} eventId  the ID of the event to fetch attendees for
 * @returns {Attendee[]}                list of attendees for the event
 */
export const useEventAttendees = (eventId: string | undefined) => {
  return useQuery({
    queryKey: ["organizer", "events", eventId, "attendees"],
    queryFn: async (): Promise<Attendee[]> => {
      if (!eventId) throw new Error("Brak ID");
      const response = await apiClient(`/events/${eventId}/attendees`);
      return response.json();
    },
    enabled: !!eventId,
  });
};

/**
 * @description Custom hook to perform manual check-in of an attendee by ticket ID.
 *              This is used in the attendee list where the organizer can mark a ticket as used.
 * 
 * @param eventId   the ID of the event for which the check-in is being performed
 * @returns         mutation object with a function to trigger the check-in and handles cache invalidation on success
 */
export const useManualCheckIn = (eventId: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ticketId: string) => {
      const response = await apiClient("/tickets/verify", {
        method: "POST",
        body: JSON.stringify({ ticketId, eventId }),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizer", "events", eventId, "attendees"] });
    },
  });
};