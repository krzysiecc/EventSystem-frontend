import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, ShieldOff, Send } from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useToastStore } from "@/store/useToastStore";
import { useSendTokenEmail } from "./api/useAdminQueries";
import PageHeader from "@/components/ui/PageHeader";

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
    <div className="mx-auto max-w-4xl">
      <PageHeader
        kicker="Administrator"
        title="Tokeny organizacyjne"
        subtitle="Generuj i unieważniaj tokeny rejestracyjne dla Organizatorów."
      />

      <div className="space-y-5">
        {/* Generowanie — pełna szerokość */}
        <div className="rounded-xl border border-border-light bg-surface-raised p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent-subtle text-accent-primary">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Wygeneruj token
              </h2>
              <p className="text-sm text-text-secondary">
                Przekaż token osobie na rejestrację Organizatora.
              </p>
            </div>
          </div>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-accent-primary py-2.5 text-text-on-accent transition hover:bg-accent-hover disabled:opacity-50"
          >
            <KeyRound size={16} />
            {generateMutation.isPending
              ? "Generowanie..."
              : "Generuj nowy token"}
          </button>

          {generatedToken && (
            <div className="mt-4 rounded-lg border border-status-success bg-status-success-bg p-4">
              <span className="mb-2 block font-mono text-xs font-bold uppercase tracking-wider text-status-success">
                Twój nowy token:
              </span>
              <code className="block select-all break-all rounded border border-status-success/40 bg-bg-tertiary p-2 font-mono text-xs text-text-primary">
                {generatedToken}
              </code>

              <form onSubmit={handleSendEmail} className="mt-3 flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Wyślij na email..."
                  value={sendEmailInput}
                  onChange={(e) => setSendEmailInput(e.target.value)}
                  className="flex-1 rounded-md border border-status-success bg-bg-tertiary p-2 text-sm text-text-primary"
                />
                <button
                  type="submit"
                  disabled={sendEmailMutation.isPending}
                  className="flex items-center gap-1.5 rounded-md bg-status-success px-3 py-2 text-sm font-medium text-text-on-accent disabled:opacity-50"
                >
                  <Send size={14} />
                  Wyślij
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Rewokowanie — małe okno w osobnej linii, mniejszy font */}
        <div className="max-w-sm rounded-lg border border-status-error bg-status-error-bg p-4 text-sm">
          <div className="mb-3 flex items-center gap-2 text-status-error">
            <ShieldOff size={15} />
            <h2 className="text-sm font-semibold">Unieważnij token</h2>
          </div>
          <input
            type="text"
            placeholder="Token do blokady"
            value={revokeInput}
            onChange={(e) => setRevokeInput(e.target.value)}
            className="mb-2 w-full rounded-md border border-status-error bg-bg-tertiary p-1.5 font-mono text-xs text-text-primary"
          />
          <button
            onClick={() => revokeMutation.mutate(revokeInput)}
            disabled={!revokeInput || revokeMutation.isPending}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-status-error py-1.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            <ShieldOff size={14} />
            Unieważnij
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminTokens;
