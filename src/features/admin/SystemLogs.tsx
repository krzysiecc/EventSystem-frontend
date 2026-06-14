import { Activity, HeartPulse, Copy, Share2 } from "lucide-react";
import { useSystemLogs, type AuditLog } from "./api/useAdminQueries";
import { useToastStore } from "@/store/useToastStore";
import PageHeader from "@/components/ui/PageHeader";

/**
 * @description Picks a badge colour for an audit action: destructive actions
 * red, modifying actions amber, read-only actions blue.
 */
const actionBadgeClass = (action: string): string => {
  if (action.startsWith("Delete") || action.startsWith("Revoke"))
    return "bg-status-error text-text-on-accent";
  if (action.startsWith("Update") || action.startsWith("Generate"))
    return "bg-status-warning text-bg-primary";
  return "bg-status-info text-text-on-accent";
};

const SystemLogs = () => {
  const { data: logs, isLoading } = useSystemLogs();
  const addToast = useToastStore((state) => state.addToast);

  const formatTimestamp = (ts: string | null | undefined) => {
    if (!ts) return "Brak daty";
    const date = new Date(ts);
    return isNaN(date.getTime()) ? "Brak daty" : date.toLocaleString("pl-PL");
  };

  const logToText = (log: AuditLog) =>
    `[${formatTimestamp(log.createdAt)}] ${log.action} ${log.userEmail} — ${
      log.details ??
      `${log.entityType}${log.entityId != null ? ` #${log.entityId}` : ""}`
    }`;

  const handleCopy = async (log: AuditLog) => {
    try {
      await navigator.clipboard.writeText(logToText(log));
      addToast("Skopiowano log", "success");
    } catch {
      addToast("Nie udało się skopiować", "error");
    }
  };

  const handleShare = async (log: AuditLog) => {
    const text = logToText(log);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Log systemowy", text });
      } else {
        await navigator.clipboard.writeText(text);
        addToast("Skopiowano (brak udostępniania w przeglądarce)", "info");
      }
    } catch {
      /* użytkownik anulował udostępnianie — ignorujemy */
    }
  };

  if (isLoading)
    return <div className="p-6 text-text-muted">Ładowanie logów...</div>;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Administrator"
        title="Logi systemowe"
        subtitle="Audyt aktywności w aplikacji."
      />

      {/* Placeholdery: wykres aktywności + stan systemu */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border-light bg-surface-raised p-5 shadow-sm">
          <div className="flex items-center gap-2 text-text-primary">
            <Activity size={16} className="text-accent-primary" />
            <h2 className="text-sm font-semibold">Aktywność systemu</h2>
          </div>
          <div className="mt-4 grid h-40 place-items-center rounded-lg border border-dashed border-border-medium bg-bg-secondary font-mono text-xs text-text-muted">
            // WYKRES AKTYWNOŚCI (placeholder)
          </div>
        </div>

        <div className="rounded-xl border border-border-light bg-surface-raised p-5 shadow-sm">
          <div className="flex items-center gap-2 text-text-primary">
            <HeartPulse size={16} className="text-accent-primary" />
            <h2 className="text-sm font-semibold">Stan systemu</h2>
          </div>
          <div className="mt-4 space-y-2 font-mono text-xs">
            {["API", "Baza danych", "Kolejka zadań"].map((svc) => (
              <div
                key={svc}
                className="flex items-center justify-between rounded-lg border border-dashed border-border-medium bg-bg-secondary px-3 py-2"
              >
                <span className="flex items-center gap-2 text-text-secondary">
                  <span className="h-2 w-2 rounded-full bg-text-muted" />
                  {svc}
                </span>
                <span className="text-text-muted">— placeholder</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela logów */}
      <div className="overflow-x-auto rounded-xl border border-border-light bg-surface-raised shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border-light font-mono text-xs uppercase tracking-wider text-text-muted">
              <th className="p-3 font-medium">Czas</th>
              <th className="p-3 font-medium">Akcja</th>
              <th className="p-3 font-medium">Użytkownik</th>
              <th className="p-3 font-medium">Szczegóły</th>
              <th className="p-3 text-right font-medium">Akcje</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {logs?.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-text-muted">
                  Brak logów w systemie.
                </td>
              </tr>
            )}
            {logs?.map((log) => (
              <tr
                key={log.id}
                className="align-top transition-colors hover:bg-bg-secondary"
              >
                <td className="whitespace-nowrap p-3 font-mono text-xs text-text-muted">
                  {formatTimestamp(log.createdAt)}
                </td>
                <td className="p-3">
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-xs font-bold uppercase ${actionBadgeClass(log.action)}`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs text-accent-secondary">
                  {log.userEmail}
                </td>
                <td className="p-3 text-sm text-text-primary">
                  {log.details ??
                    `${log.entityType}${log.entityId != null ? ` #${log.entityId}` : ""}`}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleShare(log)}
                      title="Udostępnij"
                      aria-label="Udostępnij"
                      className="grid h-8 w-8 place-items-center rounded-md text-text-muted transition hover:bg-bg-tertiary hover:text-text-primary"
                    >
                      <Share2 size={15} />
                    </button>
                    <button
                      onClick={() => handleCopy(log)}
                      title="Kopiuj"
                      aria-label="Kopiuj"
                      className="grid h-8 w-8 place-items-center rounded-md text-text-muted transition hover:bg-bg-tertiary hover:text-text-primary"
                    >
                      <Copy size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemLogs;
