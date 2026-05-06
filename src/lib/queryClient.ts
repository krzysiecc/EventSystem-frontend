import { QueryClient } from "@tanstack/react-query";

/**
 * @description Global instance of QueryClient. This client will be used throughout the app to manage server state and caching.
 *
 * @param none
 * @return {QueryClient}      configured QueryClient instance for use with React Query.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // data remains fresh for 5 minutes
      // during this time, repeated queries are served from cache without hitting backend
      staleTime: 1000 * 60 * 5,

      // only for generic network errors
      // 401 handled separately in apiClient
      retry: 1,

      // MOBILE: not refetching automatically when the user clicks back to the tab
      refetchOnWindowFocus: false,
    },
  },
});
