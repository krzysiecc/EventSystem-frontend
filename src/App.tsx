import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AppRouter } from "@/routes";
import ToastContainer from "@/components/ui/ToastContainer";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer />
      <AppRouter />
    </QueryClientProvider>
  );
}

export default App;
