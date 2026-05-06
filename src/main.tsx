import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/styles/index.css";
import App from "./App.tsx";

// FIX: initializing MSW only in dev environment
async function enableMocking() {
  if (import.meta.env.PROD) {
    return;
  }
  const { worker } = await import('./mocks/browser');
  
  return worker.start({ 
    onUnhandledRequest(request, print) {
      if (request.url.includes('chrome-extension') || request.url.includes('node_modules') || request.url.includes('src/')) {
        return;
      }
      if (request.url.includes('/api/')) {
        print.warning();
      }
    },
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
