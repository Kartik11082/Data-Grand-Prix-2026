import type { BackendRequirementItem } from "../storySeed";

interface BackendRequirementsPanelProps {
  title: string;
  items: BackendRequirementItem[];
}

export function BackendRequirementsPanel({ title, items }: BackendRequirementsPanelProps) {
  return (
    <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)]">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
            Backend Expectations
          </p>
          <h3 className="mt-2 text-lg font-semibold text-[var(--color-ink)]">{title}</h3>
        </div>
        <div className="rounded-full border border-[var(--color-border)] bg-[var(--color-sand)] px-3 py-1 text-[11px] font-medium text-[var(--color-muted)]">
          Hardcoded for now
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={`${item.label}-${item.futureField}`}
            className="rounded-[20px] border border-[var(--color-border)] bg-white/90 p-4"
          >
            <div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between">
              <h4 className="text-sm font-semibold text-[var(--color-ink)]">{item.label}</h4>
              <p className="text-xs text-[var(--color-muted)]">Current: {item.currentValue}</p>
            </div>
            <p className="mt-2 text-sm text-[var(--color-ink)]">
              <span className="font-semibold text-[var(--color-accent)]">{item.futureEndpoint}</span>
              {" -> "}
              <span className="font-mono text-[12px]">{item.futureField}</span>
            </p>
            <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">{item.notes}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
