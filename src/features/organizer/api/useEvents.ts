import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";

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
