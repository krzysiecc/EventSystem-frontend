import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";
import { useSendTokenEmail } from "./api/useAdminQueries";

const AdminTokens = () => {
  const addToast = useToastStore((state) => state.addToast);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [revokeInput, setRevokeInput] = useState("");
  const [sendEmailInput, setSendEmailInput] = useState("");

  const sendEmailMutation = useSendTokenEmail();

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient("/admin/generate-token", {
        method: "POST",
      });
      const json = await response.json();
      return json.data.token;
    },
    onSuccess: (token) => {
      setGeneratedToken(token);
      addToast("Pomyślnie wygenerowano nowy token", "success");
    },
    onError: () => addToast("Błąd generowania tokenu", "error"),
  });

  const revokeMutation = useMutation({
    mutationFn: async (tokenValue: string) => {
      const response = await apiClient("/admin/revoke-token", {
        method: "POST",
        body: JSON.stringify(tokenValue),
      });
      return response.json();
    },
    onSuccess: () => {
      addToast("Token unieważniony", "success");
      setRevokeInput("");
    },
    onError: (err: unknown) =>
      addToast(
        err instanceof Error ? err.message : "Nie udało się unieważnić",
        "error",
      ),
  });

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedToken) return;
    sendEmailMutation.mutate(
      { token: generatedToken, email: sendEmailInput },
      {
        onSuccess: () => {
          addToast(`Wysłano token na ${sendEmailInput}`, "success");
          setSendEmailInput("");
        },
        onError: (err) =>
          addToast(
            err instanceof Error ? err.message : "Błąd wysyłki",
            "error",
          ),
      },
    );
  };

  return (
    <div className="layout-container py-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Tokeny Organizacyjne
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Generowanie */}
        <div className="bg-surface-raised border border-border-light p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-2">Wygeneruj token</h2>
          <p className="text-sm text-text-secondary mb-4">
            Przekaż token osobie na rejestrację Organizatora.
          </p>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="w-full bg-accent-primary text-text-on-accent py-2 rounded-md hover:bg-accent-hover transition disabled:opacity-50"
          >
            {generateMutation.isPending
              ? "Generowanie..."
              : "Generuj nowy token"}
          </button>

          {generatedToken && (
            <div className="mt-4 p-4 bg-status-success-bg border border-status-success rounded-lg text-center">
              <span className="block text-xs font-bold text-status-success uppercase mb-1">
                Twój nowy token:
              </span>
              <code className="text-lg font-mono text-text-primary select-all">
                {generatedToken}
              </code>

              <form onSubmit={handleSendEmail} className="mt-4 flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Wyślij na email..."
                  value={sendEmailInput}
                  onChange={(e) => setSendEmailInput(e.target.value)}
                  className="flex-1 p-2 text-sm rounded-md border border-status-success bg-bg-tertiary text-text-primary"
                />
                <button
                  type="submit"
                  disabled={sendEmailMutation.isPending}
                  className="bg-status-success text-text-on-accent px-3 py-2 text-sm rounded-md font-medium"
                >
                  Wyślij
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Rewokowanie */}
        <div className="bg-status-error-bg border border-status-error p-6 rounded-xl">
          <h2 className="text-lg font-semibold text-status-error mb-2">
            Unieważnij token
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Zablokuj wyciekły token.
          </p>
          <input
            type="text"
            placeholder="Podaj token do blokady"
            value={revokeInput}
            onChange={(e) => setRevokeInput(e.target.value)}
            className="w-full rounded-md border border-status-error bg-bg-tertiary p-2 text-text-primary mb-4"
          />
          <button
            onClick={() => revokeMutation.mutate(revokeInput)}
            disabled={!revokeInput || revokeMutation.isPending}
            className="w-full bg-status-error text-white font-bold py-2 rounded-md hover:opacity-90 disabled:opacity-50"
          >
            Unieważnij token
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTokens;
