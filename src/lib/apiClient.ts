const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * @description Process the queue of failed requests after token refresh attempt.
 *
 * @param error   Error object if token refresh failed, otherwise null
 * @param token   new access token if refresh succeeded, otherwise null
 * @returns       void
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
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
  let token = localStorage.getItem("accessToken");

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("Brak refresh tokena");

        // TODO: customize path to .NET endpoint
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error("Sesja wygasła");
        }

        const data = await refreshResponse.json();

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        token = data.accessToken;

        processQueue(null, token);

        headers.set("Authorization", `Bearer ${token}`);
        response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...config,
          headers,
        });
      } catch (error) {
        processQueue(error as Error, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    } else {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          headers.set("Authorization", `Bearer ${newToken}`);
          return fetch(`${API_BASE_URL}${endpoint}`, { ...config, headers });
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }
  }

  // other errors than 401
  if (!response.ok) {
    // TODO: may push error message from .NET
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || `Błąd HTTP: ${response.status}`;
    return Promise.reject(new Error(errorMessage));
  }

  return response;
};
