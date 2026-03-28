import {
  Area,
  AreaChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { BackendRequirementsPanel } from "./BackendRequirementsPanel";
import { backendRequirements, storySeed } from "../storySeed";

interface ActTwoProps {
  onPrev: () => void;
  onNext: () => void;
}

export function ActTwo({ onPrev, onNext }: ActTwoProps) {
  const recovery = storySeed.recovery;
  const gapSeries = recovery.gapSeries.value.map((point) => ({ ...point, gapFill: point.applications }));
  const refiSeries = recovery.refiSeries.value;
  const loanTypeSeries = recovery.loanTypeSeries.value;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 py-8 md:px-8 md:py-10">
      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">Act two</p>
          <h2 className="mt-4 text-4xl leading-tight text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            The climb back
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--color-ink)]">
            Recovery appears in three beats: the gap starts closing, refinancing surges after rate cuts, and government-backed lending stays elevated.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-mint-soft)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Recovery start</p>
              <p className="mt-3 text-4xl font-semibold text-[var(--color-mint)]">
                {recovery.milestones.recoveryStartYear.value}
              </p>
            </div>
            <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-amber-soft)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Refi wave peak</p>
              <p className="mt-3 text-4xl font-semibold text-[var(--color-amber)]">
                {recovery.refiPeak.deltaFromBaseline.value}
              </p>
              <p className="mt-2 text-sm text-[var(--color-ink)]">in {recovery.refiPeak.year.value}</p>
            </div>
            <div className="rounded-[24px] border border-[var(--color-border)] bg-[var(--color-accent-soft)] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">New normal</p>
              <p className="mt-3 text-4xl font-semibold text-[var(--color-accent)]">
                {recovery.structuralShift.govtShare2017.value}
              </p>
              <p className="mt-2 text-sm text-[var(--color-ink)]">government-backed share by 2017</p>
            </div>
          </div>
        </aside>

        <div className="space-y-6">
          <article className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Beat 1</p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">The approval gap finally started to close after 2012.</h3>
            <div className="mt-6 h-[320px] rounded-[24px] border border-[var(--color-border)] bg-[var(--color-page)] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gapSeries}>
                  <XAxis dataKey="year" axisLine={false} tickLine={false} stroke="var(--color-muted)" />
                  <YAxis axisLine={false} tickLine={false} stroke="var(--color-muted)" />
                  <ReferenceLine x={recovery.milestones.floorYear.value} stroke="var(--color-coral)" strokeDasharray="4 4" />
                  <ReferenceLine x={recovery.milestones.recoveryStartYear.value} stroke="var(--color-mint)" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="gapFill" stroke="none" fill="var(--color-coral-soft)" />
                  <Area type="monotone" dataKey="originations" stroke="var(--color-mint)" fill="var(--color-mint-soft)" fillOpacity={0.85} />
                  <Area type="monotone" dataKey="applications" stroke="var(--color-accent)" fill="var(--color-accent-soft)" fillOpacity={0.65} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {[
                { year: recovery.milestones.floorYear.value, value: recovery.milestones.approval2009.value },
                { year: recovery.milestones.recoveryStartYear.value, value: recovery.milestones.approval2012.value },
                { year: 2017, value: recovery.milestones.approval2017.value },
                { year: 2007, value: recovery.milestones.approval2007.value },
              ].map((milestone) => (
                <div key={milestone.year} className="rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">{milestone.year}</p>
                  <p className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">{milestone.value}%</p>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">approval rate milestone</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Beat 2</p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">Rate cuts sent refinancing volume sharply higher.</h3>
            <div className="mt-6 h-[300px] rounded-[24px] border border-[var(--color-border)] bg-[var(--color-page)] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={refiSeries}>
                  <XAxis dataKey="year" axisLine={false} tickLine={false} stroke="var(--color-muted)" />
                  <YAxis axisLine={false} tickLine={false} stroke="var(--color-muted)" />
                  <ReferenceLine y={100} stroke="var(--color-muted)" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="refiIndex" stroke="var(--color-amber)" fill="var(--color-amber-soft)" fillOpacity={0.9} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-amber-soft)] p-5 text-sm leading-7 text-[var(--color-ink)]">
              The hardcoded callout now points directly to <span className="font-semibold">GET /story/recovery</span> for the
              peak year and delta instead of burying the number in component markup.
            </div>
          </article>

          <article className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] md:p-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Beat 3</p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">Government-backed lending stayed elevated well after the recovery.</h3>
            <div className="mt-6 h-[320px] rounded-[24px] border border-[var(--color-border)] bg-[var(--color-page)] p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={loanTypeSeries} stackOffset="expand">
                  <XAxis dataKey="year" axisLine={false} tickLine={false} stroke="var(--color-muted)" />
                  <YAxis axisLine={false} tickLine={false} stroke="var(--color-muted)" tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                  <ReferenceLine y={0.12} stroke="var(--color-mint)" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="conventional" stackId="1" stroke="none" fill="var(--color-accent)" fillOpacity={0.86} />
                  <Area type="monotone" dataKey="govtBacked" stackId="1" stroke="none" fill="var(--color-mint)" fillOpacity={0.86} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-[var(--color-border)] bg-white/80 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Baseline</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--color-ink)]">{recovery.structuralShift.govtShare2007.value}</p>
              </div>
              <div className="rounded-[24px] border border-[var(--color-border)] bg-white/80 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">By 2017</p>
                <p className="mt-3 text-3xl font-semibold text-[var(--color-ink)]">{recovery.structuralShift.govtShare2017.value}</p>
              </div>
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
          Back to collapse
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent)]"
        >
          Continue to behavior shift
        </button>
      </div>

      <BackendRequirementsPanel title="Recovery page API contract" items={backendRequirements.recovery} />
    </div>
  );
}
