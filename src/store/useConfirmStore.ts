import { create } from "zustand";

export interface ConfirmOptions {
  /** Nagłówek okna (np. „Usunąć użytkownika?"). */
  title?: string;
  /** Treść/opis akcji do potwierdzenia. */
  message: string;
  /** Etykieta przycisku potwierdzenia (domyślnie „Potwierdź"). */
  confirmText?: string;
  /** Etykieta przycisku anulowania (domyślnie „Anuluj"). */
  cancelText?: string;
  /** „danger" = czerwony przycisk dla akcji nieodwracalnych. */
  variant?: "danger" | "default";
}

interface ConfirmState {
  isOpen: boolean;
  options: ConfirmOptions | null;
  _resolve: ((value: boolean) => void) | null;
  /** Otwiera modal i zwraca Promise<boolean> — zamiennik `window.confirm`. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** Zamyka modal, rozwiązując Promise wartością wyboru użytkownika. */
  respond: (value: boolean) => void;
}

/**
 * @description Globalny store dla aplikacyjnego okna potwierdzenia (zamiast
 * natywnego `window.confirm`). Użycie: `const ok = await confirm({ ... })`.
 * Pojedynczy `ConfirmDialog` montowany w RootLayout renderuje aktualny stan.
 */
export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  options: null,
  _resolve: null,
  confirm: (options) =>
    new Promise<boolean>((resolve) => {
      // Gdyby jakieś okno było już otwarte — odrzuć poprzednie oczekiwanie.
      get()._resolve?.(false);
      set({ isOpen: true, options, _resolve: resolve });
    }),
  respond: (value) => {
    get()._resolve?.(value);
    set({ isOpen: false, options: null, _resolve: null });
  },
}));
