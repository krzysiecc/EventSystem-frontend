import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiFetch } from "@/lib/apiClient";
import type { EventDateLike } from "@/lib/eventDate";

export interface PublicEvent {
  id: number;
  title: string;
  date: string;
  /** Zakres start/koniec — backend dostosuje DTO; na razie `date` = start. */
  startDate?: string;
  endDate?: string;
  location: string;
  /** Nazwa własna miejsca (opcjonalna). */
  locationName?: string | null;
  maxCapacity: number;
  enrolledCount: number;
  description: string;
  /** Kliknięcia w ostatnich 24h (popularność). Dostarcza backend — patrz
   *  docs/api-contract.md. Brak → traktujemy jak 0 przy sortowaniu. */
  clicks24h?: number;
  /** ISO: kiedy otwiera się właściwa rejestracja. Brak → rejestracja zawsze otwarta. */
  registrationOpensAt?: string | null;
  /** ISO: kiedy otwiera się pre-rejestracja („presave") — okno przed rejestracją. */
  presaveOpensAt?: string | null;
}

export interface Ticket {
  id: number;
  /** ID wydarzenia — pozwala pewnie dopasować bilet do wydarzenia na liście.
   *  Opcjonalne: gdy backend go nie zwraca, dopasowujemy po tytule. */
  eventId?: number;
  eventTitle: string;
  /** Start wydarzenia (zachowane dla zgodności; równe `startDate`). */
  eventDate: string;
  /** Zakres start/koniec — gdy backend zwraca od→do na bilecie. */
  startDate?: string;
  endDate?: string;
  location: string;
  qrCodeContent: string;
  isScanned: boolean;
  studentId: number;
  /** Wydarzenie już się zakończyło → bilet przedawniony (wygasły). Wyznacza
   *  backend; frontend dolicza go też „na żywo" przez {@link isEventEnded}. */
  isExpired?: boolean;
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

/**
 * @description Łączy bilet z pasującym wydarzeniem (po `eventId`, a w razie braku
 * po tytule) i zwraca pola dat w formacie `EventDateLike`. Dzięki temu zakres
 * start→koniec działa nawet gdy backend nie dołącza go bezpośrednio do biletu, a
 * zna go z listy wydarzeń.
 */
export const ticketDateLike = (t: Ticket, evt?: PublicEvent): EventDateLike => ({
  date: t.eventDate,
  startDate: t.startDate ?? evt?.startDate ?? evt?.date,
  endDate: t.endDate ?? evt?.endDate,
});

/**
 * @description Zwraca funkcję dopasowującą wydarzenie do biletu na podstawie listy
 * `/events`. Wydarzenia, które już się rozpoczęły, backend może z tej listy
 * usuwać — wtedy dla biletu zostają jego własne pola (eventDate/startDate/endDate).
 */
export const useEventForTicket = () => {
  const { data: events } = useAllEvents();
  return useMemo(() => {
    const byId = new Map<number, PublicEvent>();
    const titleCount = new Map<string, number>();
    (events ?? []).forEach((e) => {
      byId.set(e.id, e);
      const k = e.title.trim().toLowerCase();
      titleCount.set(k, (titleCount.get(k) ?? 0) + 1);
    });
    // Po tytule dopasowujemy tylko unikalne tytuły — w serii cyklicznej terminy
    // współdzielą tytuł, więc po tytule nie da się wskazać właściwego terminu
    // (dopasowanie wtedy wyłącznie po `eventId`).
    const byTitle = new Map<string, PublicEvent>();
    (events ?? []).forEach((e) => {
      const k = e.title.trim().toLowerCase();
      if ((titleCount.get(k) ?? 0) === 1) byTitle.set(k, e);
    });
    return (t: Ticket): PublicEvent | undefined =>
      (t.eventId != null ? byId.get(t.eventId) : undefined) ??
      byTitle.get(t.eventTitle.trim().toLowerCase());
  }, [events]);
};
