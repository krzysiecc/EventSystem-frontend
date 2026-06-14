import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/apiClient";

/**
 * @description Wszystkie publiczne wydarzenia (GET /events) — wspólne źródło dla
 * kalendarza studenta i organizatora. Zwraca pola potrzebne do rozłożenia
 * wydarzeń na dni oraz pokazania szczegółów w popupie.
 */
export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  startDate?: string;
  endDate?: string;
  location: string;
  locationName?: string | null;
}

export const useCalendarEvents = () =>
  useQuery({
    queryKey: ["events", "public", "calendar"],
    queryFn: () => apiFetch<CalendarEvent[]>("/events"),
  });
