import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import type { SummaryData } from "../dataService";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface ExecutiveSummaryProps {
  story: SummaryData;
}

const bucketFill = {
  high: "var(--color-mint)",
  medium: "var(--color-amber)",
  low: "var(--color-coral)",
} as const;

const percentValue = (value: string): number => {
  const match = value.match(/-?\d+(\.\d+)?/);
  if (!match) {
    return 0;
  }
  return Number.parseFloat(match[0]);
};

export function ExecutiveSummary({ story }: ExecutiveSummaryProps) {
  const donutData = [
    {
      label: "2007 government-backed share",
      value: percentValue(story.structuralShiftCard.share2007),
      display: story.structuralShiftCard.share2007,
      color: "var(--color-accent)",
    },
    {
      label: "2017 government-backed share",
      value: percentValue(story.structuralShiftCard.share2017),
      display: story.structuralShiftCard.share2017,
      color: "var(--color-mint)",
    },
  ];

  const stateLookup = new Map(story.recoveryCard.states.map((item) => [item.state, item]));

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 py-8 md:px-8 md:py-10">
      <section className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">Executive summary</p>
          <h2 className="mt-4 text-4xl leading-tight text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            Closing Insights
          </h2>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-3">
          <article className="group relative overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-coral-soft)] p-6">
            <div className="relative z-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">The crisis</p>
              <p className="mt-4 text-6xl font-semibold text-[var(--color-coral)]">-31pp</p>
              <p className="mt-4 text-sm leading-7 text-[var(--color-ink)]">
                Peak gap year: {story.crisisCard.peakYear}. Applications were {story.crisisCard.applications} and originations were {story.crisisCard.originations}.
              </p>
              <p className="mt-2 text-xs text-[var(--color-muted)]">X-axis: year. Y-axis: volume in millions of loans.</p>

              <div className="mt-6 h-[170px] rounded-[20px] border border-[var(--color-border)] bg-white/80 p-4">
                {story.crisisCard.sparkline.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={story.crisisCard.sparkline}>
                      <XAxis dataKey="year" axisLine={false} tickLine={false} stroke="var(--color-muted)" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid var(--color-border)', fontSize: 12 }} formatter={(value: any, name: any) => [`${value}M`, String(name).charAt(0).toUpperCase() + String(name).slice(1)]} labelFormatter={(label) => `${label}`} />
                      <Area type="monotone" dataKey="applications" stroke="var(--color-accent)" fill="var(--color-accent-soft)" fillOpacity={0.7} />
                      <Area type="monotone" dataKey="originations" stroke="var(--color-mint)" fill="var(--color-mint-soft)" fillOpacity={0.85} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[16px] border border-dashed border-[var(--color-border)] text-sm text-[var(--color-muted)]">
                    X chart data missing
                  </div>
                )}
              </div>
              <div className="mt-4 rounded-[18px] border border-[var(--color-border)] bg-white/80 p-4 text-sm leading-6 text-[var(--color-ink)] md:hidden">
                This card shows how sharply the market broke when applications stopped turning into actual loans.
              </div>
            </div>
            <div className="absolute inset-0 hidden items-end bg-[color:rgba(34,49,58,0.88)] p-6 text-white opacity-0 transition duration-300 md:flex md:group-hover:opacity-100">
              <p className="text-sm leading-7">
                This card shows the collapse itself: applications stayed above originations, which means many borrowers were trying to get credit but far fewer loans were actually made.
              </p>
            </div>
          </article>

          <article className="group relative overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-page)] p-6">
            <div className="relative z-0">
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
              <p className="mt-2 text-xs text-[var(--color-muted)]">Unit: percent share of originated loans.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {donutData.map((item) => (
                  <div key={item.label} className="rounded-[18px] border border-[var(--color-border)] bg-white/90 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">{item.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">{item.display}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-[18px] border border-[var(--color-border)] bg-white/80 p-4 text-sm leading-6 text-[var(--color-ink)] md:hidden">
                This card shows that government-backed loans took a much larger share of the market after the crash.
              </div>
            </div>
            <div className="absolute inset-0 hidden items-end bg-[color:rgba(34,49,58,0.88)] p-6 text-white opacity-0 transition duration-300 md:flex md:group-hover:opacity-100">
              <p className="text-sm leading-7">
                This card shows the market did not simply bounce back to normal. The loan mix changed, and government-backed lending remained much more important after the crisis.
              </p>
            </div>
          </article>

          <article className="group relative overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-mint-soft)] p-6">
            <div className="relative z-0">
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
              <p className="mt-2 text-xs text-[var(--color-muted)]">Color buckets are terciles of recovery index values by state.</p>

              <div className="mt-6 grid gap-3">
                <div className="flex flex-wrap gap-2">
                  {story.recoveryCard.topStates.map((item, index) => (
                    <span
                      key={`${item.state}-${item.value}-${index}`}
                      className="rounded-full border border-[var(--color-border)] bg-white/85 px-3 py-2 text-sm text-[var(--color-ink)]"
                    >
                      {item.state} {item.value}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {story.recoveryCard.bottomStates.map((item, index) => (
                    <span
                      key={`${item.state}-${item.value}-${index}`}
                      className="rounded-full border border-[var(--color-border)] bg-white/85 px-3 py-2 text-sm text-[var(--color-ink)]"
                    >
                      {item.state} {item.value}
                    </span>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-sm leading-7 text-[var(--color-ink)]">{story.recoveryCard.summarySentence}</p>
              <div className="mt-4 rounded-[18px] border border-[var(--color-border)] bg-white/80 p-4 text-sm leading-6 text-[var(--color-ink)] md:hidden">
                This card shows where recovery was strongest and weakest across states after the crisis.
              </div>
            </div>
            <div className="absolute inset-0 hidden items-end bg-[color:rgba(34,49,58,0.88)] p-6 text-white opacity-0 transition duration-300 md:flex md:group-hover:opacity-100">
              <p className="text-sm leading-7">
                This card shows that recovery was uneven. Some states regained lending strength much faster, while others lagged well behind.
              </p>
            </div>
          </article>
        </div>

        <div className="mt-8 rounded-[28px] border border-[var(--color-border)] bg-white/85 p-8 text-center">
          <p className="text-3xl leading-[1.4] text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
            {story.footer.headline}
          </p>
          <p className="mt-4 text-sm text-[var(--color-muted)]">{story.footer.sourceLabel}</p>
        </div>
      </section>
    </div>
  );
}
