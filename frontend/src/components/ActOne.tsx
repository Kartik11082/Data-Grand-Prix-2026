import { Area, AreaChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { BackendRequirementsPanel } from "./BackendRequirementsPanel";
import { backendRequirements, storySeed } from "../storySeed";

interface ActOneProps {
  onPrev: () => void;
  onNext: () => void;
}

export function ActOne({ onPrev, onNext }: ActOneProps) {
  const collapse = storySeed.collapse;
  const gapSeries = collapse.gapSeries.value.map((point) => ({
    ...point,
    gapFill: point.applications,
  }));
  const loanTypeSeries = collapse.loanTypeSeries.value;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 py-8 md:px-8 md:py-10">
      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">Act one</p>
          <h2 className="mt-4 text-4xl leading-tight text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            The collapse
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--color-ink)]">
            The page stays narrative-first, but every metric and chart on it is now coming from the centralized seed instead of inline JSX constants.
          </p>

          <div className="mt-8 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-coral-soft)] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Approval collapse</p>
            <p className="mt-4 text-5xl font-semibold text-[var(--color-coral)]">
              {collapse.approvalShift.dropPp.value}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-ink)]">
              From {collapse.approvalShift.basePct.value}% in {collapse.approvalShift.baseYear.value} to{" "}
              {collapse.approvalShift.floorPct.value}% in {collapse.approvalShift.floorYear.value}.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {[
              `${collapse.kpis.applicationsPeak.value} applications at the peak`,
              `${collapse.kpis.originationsFloor.value} originated at the floor`,
              `${collapse.kpis.approvalDrop.value} total approval-rate drop`,
            ].map((line) => (
              <div key={line} className="rounded-[20px] border border-[var(--color-border)] bg-[var(--color-sand)] px-4 py-3 text-sm text-[var(--color-ink)]">
                {line}
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <article className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Beat 1</p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
                  Mortgage approvals broke sharply between 2007 and 2009.
                </h3>
              </div>
              <div className="rounded-full bg-[var(--color-coral-soft)] px-4 py-2 text-sm text-[var(--color-coral)]">
                Marker year: {collapse.markers.floorYear.value}
              </div>
            </div>

            <div className="mt-6 h-[340px] rounded-[24px] border border-[var(--color-border)] bg-[var(--color-page)] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gapSeries}>
                  <XAxis dataKey="year" axisLine={false} tickLine={false} stroke="var(--color-muted)" />
                  <YAxis axisLine={false} tickLine={false} stroke="var(--color-muted)" />
                  <ReferenceLine x={collapse.markers.floorYear.value} stroke="var(--color-coral)" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="gapFill" stroke="none" fill="var(--color-coral-soft)" />
                  <Area type="monotone" dataKey="originations" stroke="var(--color-mint)" fill="var(--color-mint-soft)" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="applications" stroke="var(--color-accent)" fill="var(--color-accent-soft)" fillOpacity={0.65} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {gapSeries.map((point) => (
                <div key={point.year} className="rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">{point.year}</p>
                  <p className="mt-3 text-sm text-[var(--color-ink)]">{point.applications}M applications</p>
                  <p className="mt-1 text-sm text-[var(--color-ink)]">{point.originations}M originations</p>
                  <p className="mt-1 text-sm text-[var(--color-coral)]">{point.approvalRate}% approval rate</p>
                </div>
              )).slice(0, 3)}
            </div>
          </article>

          <article className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Beat 2</p>
                <h3 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
                  Private lending gave ground to government-backed production.
                </h3>
              </div>
              <div className="rounded-full bg-[var(--color-mint-soft)] px-4 py-2 text-sm text-[var(--color-mint)]">
                2009 mix: {loanTypeSeries[2].conventional}% conventional / {loanTypeSeries[2].govtBacked}% government-backed
              </div>
            </div>

            <div className="mt-6 h-[320px] rounded-[24px] border border-[var(--color-border)] bg-[var(--color-page)] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={loanTypeSeries} stackOffset="expand">
                  <XAxis dataKey="year" axisLine={false} tickLine={false} stroke="var(--color-muted)" />
                  <YAxis axisLine={false} tickLine={false} stroke="var(--color-muted)" tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                  <ReferenceLine x={2009} stroke="var(--color-accent)" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="conventional" stackId="1" stroke="none" fill="var(--color-accent)" fillOpacity={0.85} />
                  <Area type="monotone" dataKey="govtBacked" stackId="1" stroke="none" fill="var(--color-mint)" fillOpacity={0.85} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {loanTypeSeries.map((point) => (
                <div key={point.year} className="rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">{point.year}</p>
                  <p className="mt-2 text-sm text-[var(--color-accent)]">{point.conventional}% conventional</p>
                  <p className="mt-1 text-sm text-[var(--color-mint)]">{point.govtBacked}% government-backed</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-full border border-[var(--color-border)] bg-white/80 px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)]"
        >
          Back to overview
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent)]"
        >
          Continue to recovery
        </button>
      </div>

      <BackendRequirementsPanel title="Collapse page API contract" items={backendRequirements.collapse} />
    </div>
  );
}
