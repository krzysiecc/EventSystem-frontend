import { useSystemLogs } from "./api/useAdminQueries";

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
    <div className="layout-container py-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Logi systemowe (audyt aplikacji)
      </h1>

      <div className="bg-surface-sunken border border-border-medium rounded-xl p-4 font-mono text-sm overflow-x-auto h-[70vh] overflow-y-auto">
        {logs?.length === 0 ? (
          <p className="text-text-muted">Brak logów w systemie.</p>
        ) : (
          <div className="space-y-2">
            {logs?.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-border-light last:border-0 hover:bg-surface-raised transition-colors p-2 rounded"
              >
                <div className="text-text-secondary whitespace-nowrap min-w-40">
                  {formatTimestamp(log.createdAt)}
                </div>
                <div className="min-w-28">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${actionBadgeClass(log.action)}`}
                  >
                    {log.action}
                  </span>
                </div>
                <div className="font-semibold text-text-secondary min-w-40 break-all">
                  [{log.userEmail}]
                </div>
                <div className="text-text-primary break-all">
                  {log.details ??
                    `${log.entityType}${log.entityId != null ? ` #${log.entityId}` : ""}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;
