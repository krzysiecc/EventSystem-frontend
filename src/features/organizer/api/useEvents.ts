import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiFetch } from "@/lib/apiClient";
import { useAuthStore } from "@/store/useAuthStore";
import type { AdminEventDTO } from "@/features/admin/api/useAdminQueries";

export interface OrganizerEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  /** Nowe pola start/koniec — backend dostosuje DTO; na razie `date` = start. */
  startDate?: string;
  endDate?: string;
  location: string;
  /** Nazwa własna miejsca (opcjonalna), np. „Budynek A-1, wejście od ul. Hoene". */
  locationName?: string | null;
  /** Współrzędne z OpenStreetMap (opcjonalne). */
  lat?: number | null;
  lng?: number | null;
  enrolledCount: number;
  maxCapacity: number;
  scannedCount?: number;
  imageUrl?: string | null;
}

export interface Attendee {
  id: number;
  scanToken: string;
  studentEmail: string;
  firstName: string;
  lastName: string;
  isScanned: boolean;
}

/**
 * @description Mapuje adminowy DTO listy wydarzeń na kształt `OrganizerEvent`
 * używany przez panel. Lista admina (`/admin/events`) nie zwraca pól
 * lokalizacji / opisu / obrazka, więc uzupełniamy je bezpiecznymi wartościami —
 * panel ich w tej tabeli/kartach nie pokazuje.
 */
const adminEventToOrganizerEvent = (e: AdminEventDTO): OrganizerEvent => ({
  id: e.id,
  title: e.title,
  description: "",
  date: e.date,
  startDate: e.startDate,
  endDate: e.endDate,
  location: "",
  locationName: null,
  lat: null,
  lng: null,
  enrolledCount: e.enrolledCount,
  maxCapacity: e.maxCapacity,
  scannedCount: e.scannedCount,
  imageUrl: null,
});

/**
 * @description Custom hook to fetch events for the events panel. Branches by
 * role: Organizer → `/events/my` (own events), Admin → `/admin/events` (all
 * events). For an admin `/events/my` would return an empty list because the
 * backend filters by `OrganizerId == userId`, so the admin must hit the admin
 * endpoint and we map its different DTO (`AdminEventDTO`) onto `OrganizerEvent`.
 *
 * @returns {OrganizerEvent[]}      list of events with basic info for dashboard display
 */
export const useOrganizerEvents = () => {
  const isAdmin = useAuthStore((state) => state.user?.role === "Admin");
  return useQuery({
    queryKey: ["organizer", "events", { admin: isAdmin }],
    queryFn: async (): Promise<OrganizerEvent[]> => {
      if (isAdmin) {
        const events = await apiFetch<AdminEventDTO[]>("/admin/events");
        return events.map(adminEventToOrganizerEvent);
      }
      return apiFetch<OrganizerEvent[]>("/events/my");
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
  const isAdmin = useAuthStore((state) => state.user?.role === "Admin");
  return useQuery({
    queryKey: ["organizer", "events", eventId],
    queryFn: async (): Promise<OrganizerEvent> => {
      if (!eventId) throw new Error("Brak ID");
      // Admin edytuje/ogląda cudze wydarzenia → adminowy endpoint
      // (AdminEventDto jest supersetem OrganizerEvent — ma komplet pól do edycji).
      return apiFetch<OrganizerEvent>(
        isAdmin ? `/admin/events/${eventId}` : `/events/${eventId}`,
      );
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
  const isAdmin = useAuthStore((state) => state.user?.role === "Admin");
  return useQuery({
    queryKey: ["organizer", "events", eventId, "attendees"],
    queryFn: async (): Promise<Attendee[]> => {
      if (!eventId) throw new Error("Brak ID");
      // Admin ogląda cudze wydarzenia → endpoint adminowy (bez sprawdzania właściciela)
      return apiFetch<Attendee[]>(
        isAdmin
          ? `/admin/events/${eventId}/attendees`
          : `/events/${eventId}/attendees`,
      );
    },
    enabled: !!eventId,
  });
};

/**
 * @description Custom hook to perform manual check-in of an attendee by their ticket's scan token (GUID).
 *              This is used in the attendee list where the organizer can mark a ticket as used.
 *
 * @param eventId   the ID of the event for which the check-in is being performed
 * @returns         mutation object with a function to trigger the check-in and handles cache invalidation on success
 */
export const useManualCheckIn = (eventId: string | undefined) => {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.user?.role === "Admin");

  return useMutation({
    mutationFn: async (scanToken: string) => {
      // Admin wpuszcza na dowolne wydarzenie → adminowy scan (bez checku właściciela)
      const response = await apiClient(
        isAdmin
          ? `/admin/tickets/${scanToken}/scan`
          : `/tickets/scan/${scanToken}`,
        { method: "POST" },
      );
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
 * @description (ADMIN) Reset skanu biletu — cofa „zużyty" z powrotem na „oczekuje",
 * gdy ktoś został błędnie zeskanowany. Wymaga nowego endpointu na backendzie:
 *   POST /admin/tickets/{scanToken}/reset  → ustawia IsScanned = false.
 */
export const useResetTicketScan = (eventId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (scanToken: string) => {
      const response = await apiClient(`/admin/tickets/${scanToken}/reset`, {
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
 * @description (ADMIN) Usuwa bilet/zapis uczestnika (np. przypadkowe kliknięcie
 * „Pobierz bilet"). Wymaga nowego endpointu na backendzie:
 *   DELETE /admin/tickets/{ticketId}  → usuwa wpis biletu i zwalnia miejsce.
 */
export const useDeleteTicket = (eventId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticketId: number) => {
      const response = await apiClient(`/admin/tickets/${ticketId}`, {
        method: "DELETE",
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
  const isAdmin = useAuthStore((state) => state.user?.role === "Admin");
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<OrganizerEvent>;
    }) => {
      const response = await apiClient(
        isAdmin ? `/admin/events/${id}` : `/events/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        },
      );
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
  const isAdmin = useAuthStore((state) => state.user?.role === "Admin");
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient(
        isAdmin ? `/admin/events/${id}` : `/events/${id}`,
        { method: "DELETE" },
      );
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
  const isAdmin = useAuthStore((state) => state.user?.role === "Admin");
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await apiClient(
        isAdmin
          ? `/admin/events/${id}/upload-image`
          : `/events/${id}/upload-image`,
        {
          method: "POST",
          body: formData,
        },
      );
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["organizer", "events", variables.id],
      });
    },
  });
};
