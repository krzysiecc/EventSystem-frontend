import { useSystemLogs } from "./api/useAdminQueries";

const SystemLogs = () => {
  const { data: logs, isLoading } = useSystemLogs();

  if (isLoading)
    return <div className="p-6 text-text-muted">Ładowanie logów...</div>;

  return (
    <div className="layout-container py-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">
        Logi systemowe (audyt aplikacji)
      </h1>

      <div className="bg-surface-sunken border border-border-medium rounded-xl p-4 font-mono text-sm overflow-x-auto h-[70vh] overflow-y-auto">
        {logs?.length === 0 ? (
          <p className="text-text-muted">Brak logów w systemie.</p>
        ) : (
          <div className="space-y-2 flex flex-col-reverse">
            {logs?.map((log) => (
              <div
                key={log.id}
                className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-border-light last:border-0 hover:bg-surface-raised transition-colors p-2 rounded"
              >
                <div className="text-text-secondary whitespace-nowrap min-w-40">
                  {log.timestamp
                    ? new Date(log.timestamp).toLocaleString()
                    : "Brak daty"}
                </div>
                <div className="min-w-20">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold uppercase
                    ${
                      log.level === "Error"
                        ? "bg-status-error text-text-on-accent"
                        : log.level === "Warning"
                          ? "bg-status-warning text-bg-primary"
                          : "bg-status-info text-text-on-accent"
                    }`}
                  >
                    {log.level}
                  </span>
                </div>
                <div className="font-semibold text-text-secondary min-w-30">
                  [{log.source}]
                </div>
                <div className="text-text-primary break-all">{log.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;
