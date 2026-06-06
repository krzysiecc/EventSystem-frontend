const API_BASE_URL = import.meta.env.VITE_API_URL;

export const apiClient = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Tworzymy kopię nagłówków
  const headers = new Headers(options.headers);

  // NAPRAWA BŁĘDU 415: Wymuszamy JSON dla zapytań z body (np. Login)
  if (options.body && !headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Opcjonalnie: Jeśli używasz nagłówka zamiast ciasteczek, odkomentuj poniższe:
  /*
  const authStorage = localStorage.getItem("auth-storage");
  if (authStorage) {
    const token = JSON.parse(authStorage).state?.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  */

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Ważne dla Twoich ciasteczek
  };

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, config);

  if (!response.ok) {
    if (response.status === 401) {
      // Zapobiegamy pętli przekierowań na stronie logowania
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // Próbujemy wyciągnąć sensowny błąd z serwera
    const errorData = await response.json().catch(() => null);
    const msg = errorData?.message || `Błąd ${response.status}`;
    return Promise.reject(new Error(msg));
  }

  return response;
};