/**
 * Centralna konfiguracja aplikacji
 * Wszystkie zmienne są brane z .env lub .env.local
 */

export const APP_CONFIG = {
  hostIp: import.meta.env.VITE_HOST_IP || 'localhost',
  hostPort: import.meta.env.VITE_HOST_PORT || '3000',
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5064',
};

/**
 * Zwraca pełny URL hosta (np. http://192.168.18.65:3000)
 */
export const getHostUrl = (): string => {
  return `http://${APP_CONFIG.hostIp}:${APP_CONFIG.hostPort}`;
};

/**
 * Zwraca URL dla kodów QR (z parametrami)
 */
export const getQRCodeUrl = (ticketId: string): string => {
  return `${getHostUrl()}/public/profile/unknown?ticketId=${ticketId}`;
};
