import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface OrganizerEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  enrolledCount: number;
  maxCapacity: number;
  status: "draft" | "published" | "completed";
}

export interface Attendee {
  id: string;
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
      const response = await apiClient("/events/my");
      const json = await response.json();
      return json.data;
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
      const response = await apiClient(`/events/${eventId}`);
      const json = await response.json();
      return json.data;
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
      const json = await response.json();
      return json.data;
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
      const response = await apiClient(`/tickets/scan/${ticketId}`, {
        method: "POST",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organizer", "events", eventId, "attendees"],
      });
    },
  });
};

/**
 * @description Custom hook to update event information.
 *
 * @returns         mutation object with a function to trigger the update and handles cache invalidation on success
 */
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<OrganizerEvent>;
    }) => {
      const response = await apiClient(`/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["organizer", "events"] });
      queryClient.invalidateQueries({
        queryKey: ["organizer", "events", variables.id],
      });
    },
  });
};

/**
 * @description Custom hook to delete an event.
 *
 * @returns         mutation object with a function to trigger the deletion and handles cache invalidation on success
 */
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient(`/events/${id}`, { method: "DELETE" });
      return response.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["organizer", "events"] }),
  });
};

/**
 * @description Custom hook to upload an image for an event. This is used in the event edit page where the organizer can add or change the event image.
 *
 * @returns      mutation object with a function to trigger the upload and handles cache invalidation on success
 */
export const useUploadEventImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await apiClient(`/events/${id}/upload-image`, {
        method: "POST",
        body: formData,
      });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["organizer", "events", variables.id],
      });
    },
  });
};
