import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email") || "";
  const resetToken = searchParams.get("token") || "";
  const addToast = useToastStore((state) => state.addToast);

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await apiClient("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, resetToken, newPassword: password }),
      });
      addToast("Hasło zostało zmienione. Możesz się zalogować.", "success");
      navigate("/login");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Wystąpił błąd";
      addToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !resetToken) {
    return (
      <div className="p-8 text-center text-status-error">
        Nieprawidłowy link resetujący.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl bg-surface-raised p-8 shadow-lg border border-border-light text-center">
        <h2 className="mb-6 text-2xl font-bold text-text-primary">
          Ustaw nowe hasło
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border-medium bg-bg-tertiary p-2 text-text-primary focus:ring-2 focus:ring-accent-primary"
            placeholder="Nowe hasło (min. 6 znaków)"
          />
          <button
            type="submit"
            disabled={isLoading || password.length < 6}
            className="w-full rounded-md bg-accent-primary py-2 text-text-on-accent transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {isLoading ? "Zapisywanie..." : "Zmień hasło"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
