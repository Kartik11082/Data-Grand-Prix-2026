import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { BackendRequirementsPanel } from "./BackendRequirementsPanel";
import { backendRequirements, storySeed } from "../storySeed";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface ExecutiveSummaryProps {
  onPrev: () => void;
}

const bucketFill = {
  high: "var(--color-mint)",
  medium: "var(--color-amber)",
  low: "var(--color-coral)",
} as const;

export function ExecutiveSummary({ onPrev }: ExecutiveSummaryProps) {
  const summary = storySeed.summary;
  const donutData = [
    {
      label: "2007 government-backed share",
      value: summary.structuralShiftCard.share2007.value,
      color: "var(--color-accent)",
    },
    {
      label: "2017 government-backed share",
      value: summary.structuralShiftCard.share2017.value,
      color: "var(--color-mint)",
    },
  ];

  const stateLookup = new Map(
    summary.recoveryCard.states.value.map((item) => [item.state, item]),
  );

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 py-8 md:px-8 md:py-10">
      <section className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">Executive summary</p>
            <h2 className="mt-4 text-4xl leading-tight text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
              A sponsor-ready close
            </h2>
            <p className="mt-5 max-w-[42rem] text-base leading-7 text-[var(--color-ink)]">
              This page keeps the summary visual language simple and clearly tags the backend payloads needed to make it fully live.
            </p>
          </div>
          <button
            type="button"
            onClick={onPrev}
            className="rounded-full border border-[var(--color-border)] bg-white/80 px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:border-[var(--color-accent)]"
          >
            Back to behavior shift
          </button>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <article className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-coral-soft)] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">The crisis</p>
            <p className="mt-4 text-6xl font-semibold text-[var(--color-coral)]">{summary.crisisCard.gapPeak.value}</p>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink)]">
              Peak gap year: {summary.crisisCard.peakYear.value}. Applications were {summary.crisisCard.applications.value} and originations were{" "}
              {summary.crisisCard.originations.value}.
            </p>

            <div className="mt-6 h-[170px] rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary.crisisCard.sparkline.value}>
                  <Area type="monotone" dataKey="applications" stroke="var(--color-accent)" fill="var(--color-accent-soft)" fillOpacity={0.7} />
                  <Area type="monotone" dataKey="originations" stroke="var(--color-mint)" fill="var(--color-mint-soft)" fillOpacity={0.85} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-page)] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">The structural shift</p>
            <div className="mt-6 h-[250px] rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} dataKey="value" innerRadius={55} outerRadius={82} paddingAngle={4} stroke="none">
                    {donutData.map((entry) => (
                      <Cell key={entry.label} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {donutData.map((item) => (
                <div key={item.label} className="rounded-[18px] border border-[var(--color-border)] bg-white/90 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">{item.value}%</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-mint-soft)] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">The recovery map</p>
            <div className="mt-6 rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4">
              <ComposableMap projection="geoAlbersUsa" className="h-[220px] w-full">
                <Geographies geography={geoUrl}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const state = stateLookup.get(geo.properties.name);
                      const fill = state ? bucketFill[state.bucket] : "#ebe5da";

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fill}
                          stroke="#f7f4ed"
                          strokeWidth={0.8}
                          style={{
                            default: { outline: "none" },
                            hover: { outline: "none", fill: "var(--color-accent)" },
                            pressed: { outline: "none" },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ComposableMap>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="flex flex-wrap gap-2">
                {summary.recoveryCard.topStates.value.map((item) => (
                  <span key={item.state} className="rounded-full border border-[var(--color-border)] bg-white/85 px-3 py-2 text-sm text-[var(--color-ink)]">
                    {item.state} {item.value}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {summary.recoveryCard.bottomStates.value.map((item) => (
                  <span key={item.state} className="rounded-full border border-[var(--color-border)] bg-white/85 px-3 py-2 text-sm text-[var(--color-ink)]">
                    {item.state} {item.value}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-6 text-sm leading-7 text-[var(--color-ink)]">{summary.recoveryCard.summarySentence.value}</p>
          </article>
        </div>

        <div className="mt-8 rounded-[28px] border border-[var(--color-border)] bg-white/85 p-8 text-center">
          <p className="text-3xl leading-[1.4] text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            {summary.footer.headline.value}
          </p>
          <p className="mt-4 text-sm text-[var(--color-muted)]">{summary.footer.sourceLabel.value}</p>
        </div>
      </section>

      <BackendRequirementsPanel title="Executive summary API contract" items={backendRequirements.summary} />
    </div>
  );
}
