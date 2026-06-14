import { Terminal } from "lucide-react";
import { useSystemLogs } from "./api/useAdminQueries";
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

  if (isLoading)
    return <div className="p-6 text-text-muted">Ładowanie logów...</div>;

  const formatTimestamp = (ts: string | null | undefined) => {
    if (!ts) return "Brak daty";
    const date = new Date(ts);
    return isNaN(date.getTime()) ? "Brak daty" : date.toLocaleString("pl-PL");
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        kicker="Administrator"
        title="Logi systemowe"
        subtitle="Audyt aktywności w aplikacji."
      />

      <div className="overflow-hidden rounded-xl border border-border-medium bg-surface-sunken shadow-sm">
        <div className="flex items-center gap-2 border-b border-border-light bg-bg-secondary px-4 py-2.5 font-mono text-xs uppercase tracking-wider text-text-muted">
          <Terminal size={14} className="text-signal" aria-hidden="true" />
          audit.log
        </div>

        <div className="h-[70vh] overflow-y-auto overflow-x-auto p-3 font-mono text-sm">
          {logs?.length === 0 ? (
            <p className="p-2 text-text-muted">Brak logów w systemie.</p>
          ) : (
            <div className="space-y-1">
              {logs?.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col rounded p-2 transition-colors hover:bg-surface-raised sm:flex-row sm:gap-4"
                >
                  <div className="min-w-40 whitespace-nowrap text-text-muted">
                    {formatTimestamp(log.createdAt)}
                  </div>
                  <div className="min-w-28">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${actionBadgeClass(log.action)}`}
                    >
                      {log.action}
                    </span>
                  </div>
                  <div className="min-w-40 break-all font-semibold text-accent-secondary">
                    [{log.userEmail}]
                  </div>
                  <div className="break-all text-text-primary">
                    {log.details ??
                      `${log.entityType}${log.entityId != null ? ` #${log.entityId}` : ""}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;
