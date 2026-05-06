import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/index.css";
import App from "./App.tsx";

// FIX: initializing MSW only in dev environment
async function enableMocking() {
  if (import.meta.env.PROD) {
    return;
  }
  const { worker } = await import("./mocks/browser");
  // @param passing over images and/or CSS files
  return worker.start({ onUnhandledRequest: "bypass" });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
