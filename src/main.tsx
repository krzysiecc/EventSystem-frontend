import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/index.css";
import App from "./App.tsx";
import { useAuthStore } from "@/store/useAuthStore";

useAuthStore.getState().initializeFromStorage();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
