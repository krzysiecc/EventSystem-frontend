import { useMemo, useState } from "react";
import {
  Activity,
  HeartPulse,
  Copy,
  Share2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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

const PAGE_SIZES = [20, 50, 100] as const;

const inputClass =
  "rounded-md border border-border-medium bg-bg-tertiary px-2.5 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary";

/** Lokalna data (yyyy-mm-dd) z timestampu — do filtra po dniu. */
const localDay = (ts: string | null | undefined): string => {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

const SystemLogs = () => {
  const { data: logs, isLoading } = useSystemLogs();
  const addToast = useToastStore((state) => state.addToast);

  // --- Filtry + paginacja (po stronie klienta) ---
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);

  // Każda zmiana filtra wraca na pierwszą stronę.
  const resetting =
    <T,>(setter: (v: T) => void) =>
    (v: T) => {
      setter(v);
      setPage(1);
    };

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

  // Lista typów akcji do filtra (unikalne, posortowane alfabetycznie).
  const actionTypes = useMemo(() => {
    const set = new Set<string>();
    (logs ?? []).forEach((l) => set.add(l.action));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pl"));
  }, [logs]);

  // Filtrowanie: po nazwie (e-mail / szczegóły / encja), dacie i typie akcji.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (logs ?? []).filter((log) => {
      if (actionFilter && log.action !== actionFilter) return false;
      if (dateFilter && localDay(log.createdAt) !== dateFilter) return false;
      if (q) {
        const haystack =
          `${log.userEmail} ${log.details ?? ""} ${log.entityType} ${log.action}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [logs, query, actionFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(pageStart, pageStart + pageSize);

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

      {/* Pasek filtrów: szukaj po nazwie, typie akcji, dacie + rozmiar strony */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border-light bg-surface-raised p-3 shadow-sm">
        <div className="relative min-w-50 flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => resetting(setQuery)(e.target.value)}
            placeholder="Szukaj po e-mailu lub szczegółach…"
            className={`${inputClass} w-full pl-8`}
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-text-muted">
          Typ akcji
          <select
            value={actionFilter}
            onChange={(e) => resetting(setActionFilter)(e.target.value)}
            className={inputClass}
          >
            <option value="">Wszystkie</option>
            {actionTypes.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-xs text-text-muted">
          Data
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => resetting(setDateFilter)(e.target.value)}
            className={inputClass}
          />
        </label>

        <label className="flex items-center gap-2 text-xs text-text-muted">
          Na stronie
          <select
            value={pageSize}
            onChange={(e) => resetting(setPageSize)(Number(e.target.value))}
            className={inputClass}
          >
            {PAGE_SIZES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
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
            {pageItems.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-text-muted">
                  {filtered.length === 0 && (logs?.length ?? 0) > 0
                    ? "Brak logów spełniających kryteria."
                    : "Brak logów w systemie."}
                </td>
              </tr>
            )}
            {pageItems.map((log) => (
              <tr
                key={log.id}
                className="align-top transition-colors hover:bg-bg-secondary"
              >
                <td className="whitespace-nowrap p-3 font-mono text-xs text-text-muted">
                  {formatTimestamp(log.createdAt)}
                </td>
                <td className="p-3">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${actionBadgeClass(log.action)}`}
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

      {/* Paginacja + licznik wyników */}
      {filtered.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-text-muted">
          <span>
            {pageStart + 1}–{Math.min(pageStart + pageSize, filtered.length)} z{" "}
            {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 rounded-md border border-border-medium px-2.5 py-1.5 text-text-primary transition hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
              Poprzednia
            </button>
            <span className="font-mono text-xs">
              Strona {currentPage} z {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 rounded-md border border-border-medium px-2.5 py-1.5 text-text-primary transition hover:bg-bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Następna
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;
