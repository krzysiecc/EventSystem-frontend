import { useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";
import AuthBrand from "@/components/ui/AuthBrand";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      addToast("Jeśli adres istnieje, wysłano link resetujący.", "info");
      setEmail("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Wystąpił błąd";
      addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-xl border border-border-light bg-surface-raised p-8 text-center shadow-lg">
        <AuthBrand />
        <h2 className="mb-2 text-2xl font-bold text-text-primary">
          Odzyskiwanie hasła
        </h2>
        <p className="mb-6 text-sm text-text-secondary">
          Podaj swój e-mail, a wyślemy Ci link do zresetowania hasła.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:ring-2 focus:ring-accent-primary"
            placeholder="Twój adres e-mail"
          />
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full rounded-md bg-accent-primary py-2 text-text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {isLoading ? "Wysyłanie..." : "Wyślij link"}
          </button>
        </form>
        <div className="mt-6 text-sm">
          <Link to="/login" className="text-accent-primary hover:underline">
            Wróć do logowania
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
