import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/index.css";
import App from "./App.tsx";
import { useAuthStore } from "@/store/useAuthStore";

// Inicjalizacja stanu autoryzacji (np. pobranie tokena z localStorage)
useAuthStore.getState().initializeFromStorage();

// Renderowanie aplikacji bez pośrednictwa Mock Service Worker
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);