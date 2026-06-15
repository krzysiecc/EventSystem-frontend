import { ArrowDownUp } from "lucide-react";
import { EVENT_SORT_OPTIONS, type EventSortKey } from "@/lib/eventSort";

/**
 * @description Wspólny selektor sortowania list wydarzeń. Używany na liście
 * studenta oraz w tabelach organizatora i admina, żeby wszędzie był ten sam
 * zestaw opcji (data ↑/↓, liczba zapisanych, popularność).
 */

interface Props {
  value: EventSortKey;
  onChange: (next: EventSortKey) => void;
  className?: string;
}

const SortSelect = ({ value, onChange, className = "" }: Props) => (
  <label className={`inline-flex items-center gap-2 ${className}`}>
    <span className="whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-text-muted">
      <ArrowDownUp size={13} className="mr-1 inline" aria-hidden="true" />
      Sortuj
    </span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as EventSortKey)}
      aria-label="Sortuj wydarzenia"
      className="rounded-md border border-border-medium bg-bg-tertiary px-2.5 py-2 text-sm text-text-primary focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary"
    >
      {EVENT_SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  </label>
);

export default SortSelect;
