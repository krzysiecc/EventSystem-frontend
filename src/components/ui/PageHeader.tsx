import type { ReactNode } from "react";

/**
 * @description Editorial page header: a Space-Mono kicker label, a Syne title
 * (h1 inherits the display font globally) and an optional subtitle + right-side
 * actions slot. Shared across role dashboards for a consistent look.
 */
const PageHeader = ({
  kicker,
  title,
  subtitle,
  actions,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) => (
  <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div className="min-w-0">
      {kicker && (
        <div className="mb-3 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.15em] text-text-muted">
          <span className="h-px w-8 bg-border-medium" aria-hidden="true" />
          {kicker}
        </div>
      )}
      <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-text-secondary">{subtitle}</p>}
    </div>
    {actions && (
      <div className="flex flex-shrink-0 items-center gap-2">{actions}</div>
    )}
  </header>
);

export default PageHeader;
