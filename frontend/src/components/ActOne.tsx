import { useLayoutEffect, useRef, useState } from "react";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { CollapseData } from "../dataService";

interface ActOneProps {
  onPrev: () => void;
  onNext: () => void;
  story: CollapseData;
}

interface ApprovalCollapseCardProps {
  story: CollapseData;
}

function ApprovalCollapseCard({ story }: ApprovalCollapseCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [frontHeight, setFrontHeight] = useState(188);
  const [backHeight, setBackHeight] = useState(188);
  const frontMeasureRef = useRef<HTMLDivElement | null>(null);
  const backMeasureRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const measureHeights = () => {
      const nextFrontHeight = frontMeasureRef.current?.offsetHeight ?? 188;
      const nextBackHeight = backMeasureRef.current?.offsetHeight ?? nextFrontHeight;
      setFrontHeight(nextFrontHeight);
      setBackHeight(nextBackHeight);
    };

    measureHeights();
    window.addEventListener("resize", measureHeights);

    return () => {
      window.removeEventListener("resize", measureHeights);
    };
  }, [story]);

  return (
    <div
      className="flip-card mt-8"
      style={{ height: `${isFlipped ? backHeight : frontHeight}px` }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onFocus={() => setIsFlipped(true)}
      onBlur={() => setIsFlipped(false)}
      tabIndex={0}
    >
      <div ref={frontMeasureRef} className="pointer-events-none absolute inset-x-0 top-0 -z-10 opacity-0">
        <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-coral-soft)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Approval collapse</p>
          <p className="mt-4 text-5xl font-semibold text-[var(--color-coral)]">-31 pp</p>
        </div>
      </div>

      <div ref={backMeasureRef} className="pointer-events-none absolute inset-x-0 top-0 -z-10 opacity-0">
        <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-ink)] p-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/65">What this shows</p>
          <p className="mt-4 text-base leading-7">
            This card captures how sharply approvals fell once credit conditions tightened. The drop matters because it marks the moment demand was still there, but lenders stopped converting applications into loans.
          </p>
        </div>
      </div>

      <div className="flip-card-inner">
        <div className="flip-face rounded-[28px] border border-[var(--color-border)] bg-[var(--color-coral-soft)] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Approval collapse</p>
          <p className="mt-4 text-5xl font-semibold text-[var(--color-coral)]">-31 pp</p>
        </div>

        <div className="flip-face flip-face-back rounded-[28px] border border-[var(--color-border)] bg-[var(--color-ink)] p-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/65">What this shows</p>
          <p className="mt-4 text-base leading-7">
            This card captures how sharply approvals fell once credit conditions tightened. The drop matters because it marks the moment demand was still there, but lenders stopped converting applications into loans.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-[var(--color-border)] bg-white/80 p-4 text-sm leading-6 text-[var(--color-ink)] md:hidden">
        This card captures how sharply approvals fell once credit conditions tightened, which is why it anchors the collapse story.
      </div>
    </div>
  );
}

export function ActOne({ onPrev, onNext, story }: ActOneProps) {
  const gapSeries = story.gapSeries.map((point) => ({
    ...point,
    gapFill: point.applications,
  }));
  const loanTypeSeries = story.loanTypeSeries;
  const mix2009 = loanTypeSeries.find((point) => point.year === 2009) ?? loanTypeSeries[2] ?? null;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 py-8 md:px-8 md:py-10">
      <section className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">Act one</p>
          <h2 className="mt-4 text-4xl leading-tight text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            The collapse
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--color-ink)]">The market froze fast, then lending standards shifted.</p>

          <ApprovalCollapseCard story={story} />

          <div className="mt-6 space-y-3">
            {[
              `${story.kpis.applicationsPeak} applications at the peak`,
              `${story.kpis.originationsFloor} originated at the floor`,
              `${story.kpis.approvalDrop} total approval-rate drop`,
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
                <h3 className="text-2xl font-semibold text-[var(--color-ink)]">
                  Mortgage approvals broke sharply between 2007 and 2009.
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                  X-axis: year. Y-axis: loan volume in millions, with applications above originations.
                </p>
              </div>
              <div className="rounded-full bg-[var(--color-coral-soft)] px-4 py-2 text-sm text-[var(--color-coral)]">
                Marker year: {story.approvalShift.floorYear}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--color-ink)]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
                <span>Applications</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-mint)]" />
                <span>Originations</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-coral-soft)]" />
                <span>Gap between applications and originations</span>
              </div>
            </div>

            <div className="mt-6 h-[340px] rounded-[24px] border border-[var(--color-border)] bg-[var(--color-page)] p-4">
              {gapSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gapSeries}>
                    <XAxis dataKey="year" axisLine={false} tickLine={false} stroke="var(--color-muted)" />
                    <YAxis axisLine={false} tickLine={false} stroke="var(--color-muted)" />
                    {story.markers.floorYear !== null ? <ReferenceLine x={story.markers.floorYear} stroke="var(--color-coral)" strokeDasharray="4 4" /> : null}
                    <Area type="monotone" dataKey="gapFill" stroke="none" fill="var(--color-coral-soft)" />
                    <Area type="monotone" dataKey="originations" stroke="var(--color-mint)" fill="var(--color-mint-soft)" fillOpacity={0.8} />
                    <Area type="monotone" dataKey="applications" stroke="var(--color-accent)" fill="var(--color-accent-soft)" fillOpacity={0.65} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-[16px] border border-dashed border-[var(--color-border)] text-sm text-[var(--color-muted)]">
                  X chart data missing
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {(gapSeries.length > 0
                ? gapSeries.slice(0, 3).map((point) => (
                    <div key={point.year} className="rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">{point.year}</p>
                      <p className="mt-3 text-sm text-[var(--color-ink)]">{point.applications}M applications</p>
                      <p className="mt-1 text-sm text-[var(--color-ink)]">{point.originations}M originations</p>
                      <p className="mt-1 text-sm text-[var(--color-coral)]">{point.approvalRate ?? "X"}% approval rate</p>
                    </div>
                  ))
                : [
                    <div key="gap-x-1" className="rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4 text-sm text-[var(--color-muted)]">X</div>,
                    <div key="gap-x-2" className="rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4 text-sm text-[var(--color-muted)]">X</div>,
                    <div key="gap-x-3" className="rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4 text-sm text-[var(--color-muted)]">X</div>,
                  ])}
            </div>
          </article>

          <article className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-soft)] md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-[var(--color-ink)]">
                  Private lending gave ground to government-backed production.
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                  X-axis: year. Y-axis: share of originated loans, split between conventional and government-backed lending.
                </p>
              </div>
              <div className="rounded-full bg-[var(--color-mint-soft)] px-4 py-2 text-sm text-[var(--color-mint)]">
                2009 mix: {mix2009 ? `${mix2009.conventional}% conventional / ${mix2009.govtBacked}% government-backed` : "X"}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-[var(--color-ink)]">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
                <span>Conventional share</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-mint)]" />
                <span>Government-backed share</span>
              </div>
            </div>

            <div className="mt-6 h-[320px] rounded-[24px] border border-[var(--color-border)] bg-[var(--color-page)] p-4">
              {loanTypeSeries.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={loanTypeSeries} stackOffset="expand">
                    <XAxis dataKey="year" axisLine={false} tickLine={false} stroke="var(--color-muted)" />
                    <YAxis axisLine={false} tickLine={false} stroke="var(--color-muted)" tickFormatter={(value) => `${Math.round(value * 100)}%`} />
                    {mix2009 ? <ReferenceLine x={mix2009.year} stroke="var(--color-accent)" strokeDasharray="4 4" /> : null}
                    <Area type="monotone" dataKey="conventional" stackId="1" stroke="none" fill="var(--color-accent)" fillOpacity={0.85} />
                    <Area type="monotone" dataKey="govtBacked" stackId="1" stroke="none" fill="var(--color-mint)" fillOpacity={0.85} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center rounded-[16px] border border-dashed border-[var(--color-border)] text-sm text-[var(--color-muted)]">
                  X chart data missing
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {(loanTypeSeries.length > 0
                ? loanTypeSeries.map((point) => (
                    <div key={point.year} className="rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">{point.year}</p>
                      <p className="mt-2 text-sm text-[var(--color-accent)]">{point.conventional}% conventional</p>
                      <p className="mt-1 text-sm text-[var(--color-mint)]">{point.govtBacked}% government-backed</p>
                    </div>
                  ))
                : [
                    <div key="loan-x-1" className="rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4 text-sm text-[var(--color-muted)]">X</div>,
                    <div key="loan-x-2" className="rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4 text-sm text-[var(--color-muted)]">X</div>,
                    <div key="loan-x-3" className="rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4 text-sm text-[var(--color-muted)]">X</div>,
                    <div key="loan-x-4" className="rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4 text-sm text-[var(--color-muted)]">X</div>,
                  ])}
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
          className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-ink)]"
        >
          Continue to recovery
        </button>
      </div>
    </div>
  );
}
