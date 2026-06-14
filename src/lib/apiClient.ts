import { useAuthStore } from "@/store/useAuthStore";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5064/api";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: void) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * @description Process the queue of failed requests after token refresh attempt.
 *
 * @param error   Error object if token refresh failed, otherwise null
 * @param token   new access token if refresh succeeded, otherwise null
 * @returns       void
 */
const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};

/**
 * @description A wrapper around the native fetch API that automatically includes the access token in the Authorization header and handles token refresh logic.
 *
 * @param endpoint      API endpoint to call (/users or so)
 * @param options       fetch options (method, headers, body)
 * @returns             Promise that resolves to the Response object from the fetch call
 */
export const apiClient = async (
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> => {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!refreshResponse.ok) throw new Error("Session expired");

        processQueue(null);
        response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      } catch (error) {
        processQueue(error as Error);
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    } else {
      return new Promise<void>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => fetch(`${API_BASE_URL}${endpoint}`, config))
        .catch((err) => Promise.reject(err));
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage =
      errorData?.message || `HTTP error : ${response.status}`;
    return Promise.reject(new Error(errorMessage));
  }

  return response;
};

/**
 * @description Wrapper for apiClient that automatically parses JSON and extracts `data` property.
 * Use this for standard GET queries where backend returns { data: T }.
 */
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const response = await apiClient(endpoint, options);
  const json = await response.json();
  return json.data as T;
};
