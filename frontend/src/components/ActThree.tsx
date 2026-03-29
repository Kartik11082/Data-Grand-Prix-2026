import { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import type { BehaviorShiftData } from "../dataService";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

interface ActThreeProps {
  onPrev: () => void;
  onNext: () => void;
  story: BehaviorShiftData;
}

const bucketFill = {
  high: "var(--color-mint)",
  medium: "var(--color-amber)",
  low: "var(--color-coral)",
} as const;

const toPercentWidth = (value: string): string => {
  const normalized = value.trim();
  return /^\d+(\.\d+)?%$/.test(normalized) ? normalized : "0%";
};

export function ActThree({ onPrev, onNext, story }: ActThreeProps) {
  const explorer = story.geographyExplorer;
  const years = useMemo(() => (explorer?.years.length ? explorer.years : [2007, 2017]), [explorer]);
  const minYear = years[0] ?? 2007;
  const maxYear = years[years.length - 1] ?? 2017;
  const [selectedYear, setSelectedYear] = useState(maxYear);

  const era: "2007" | "2017" = selectedYear <= 2012 ? "2007" : "2017";
  const eraData = story.eras[era];

  // Single metric: recovery index (% of 2007 lending volume)
  const explorerData = explorer?.yearly[String(selectedYear)]?.recovery_index;

  const geographyData = explorerData && explorerData.states.length > 0
    ? explorerData
    : {
      title: era === "2007" ? "Loan volume concentration" : "Recovery index vs 2007",
      states: eraData.geography.states,
      topStates: eraData.geography.topStates,
      bottomStates: eraData.geography.bottomStates,
    };

  const stateLookup = useMemo(
    () => new Map(geographyData.states.map((item) => [item.state, item])),
    [geographyData.states],
  );

  // Narrative text changes per year phase
  const yearPhase = selectedYear <= 2007
    ? "baseline"
    : selectedYear <= 2009
      ? "crash"
      : selectedYear <= 2012
        ? "trough"
        : selectedYear <= 2015
          ? "recovery"
          : "present";

  const narrativeText: Record<string, string> = {
    baseline: "This is the 2007 baseline — every state starts at 100%. Drag the slider forward to watch the crisis unfold geographically.",
    crash: `By ${selectedYear}, the crash is spreading unevenly. States with housing bubbles (FL, AZ, NV, CA) are losing lending volume fastest. Heartland states hold steadier.`,
    trough: `The market is bottoming out. Some states are starting to show signs of recovery while others remain deeply depressed. The geographic inequality is becoming structural.`,
    recovery: `Recovery is underway but uneven. Energy and tech states (TX, CO, ND) are rebounding fast. Former bubble states (FL, NV, NJ) remain well below their 2007 levels.`,
    present: "By 2017, the recovery map is locked in. States that avoided the bubble recovered. States that rode it hardest — especially in the Northeast and Sun Belt — never returned to pre-crisis volumes.",
  };

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 py-8 md:px-8 md:py-10">
      <section className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">Act three</p>
            <h2 className="mt-4 text-4xl leading-tight text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
              The behavior shift
            </h2>
            <p className="mt-5 max-w-[42rem] text-base leading-7 text-[var(--color-ink)]">Compare the pre-crisis and post-recovery market.</p>
          </div>

          <div className="rounded-full border border-[var(--color-border)] bg-white/85 px-4 py-2 text-sm text-[var(--color-muted)]">
            View year: <span className="font-semibold text-[var(--color-ink)]">{selectedYear}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.2fr_0.95fr]">
          <article className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-sand)] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Lenders</p>
            <div className="mt-6 space-y-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-[var(--color-ink)]">
                  <span>Conventional share</span>
                  <span>{eraData.lenderMix.conventional}</span>
                </div>
                <div className="h-3 rounded-full bg-white/80">
                  <div className="h-3 rounded-full bg-[var(--color-accent)] transition-all duration-500" style={{ width: toPercentWidth(eraData.lenderMix.conventional) }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-[var(--color-ink)]">
                  <span>Government-backed share</span>
                  <span>{eraData.lenderMix.govtBacked}</span>
                </div>
                <div className="h-3 rounded-full bg-white/80">
                  <div className="h-3 rounded-full bg-[var(--color-mint)] transition-all duration-500" style={{ width: toPercentWidth(eraData.lenderMix.govtBacked) }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-[var(--color-ink)]">
                  <span>Second mortgages</span>
                  <span>{eraData.lenderMix.secondMortgages}</span>
                </div>
                <div className="h-3 rounded-full bg-white/80">
                  <div className="h-3 rounded-full bg-[var(--color-coral)] transition-all duration-500" style={{ width: toPercentWidth(eraData.lenderMix.secondMortgages) }} />
                </div>
              </div>
            </div>
            <div className="mt-8 rounded-[20px] border border-[var(--color-border)] bg-white/85 p-4 text-center text-sm leading-6 text-[var(--color-ink)]">
              {era === "2007" ? story.comparison.lender2007 : story.comparison.lender2017}
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-page)] p-6">
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  Recovery index by state
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--color-ink)]">
                  % of 2007 lending volume retained
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                  Each state is colored by how much of its pre-crisis origination volume it has in {selectedYear}.
                  Green = recovered, amber = partial, red = still depressed.
                </p>
              </div>

              {/* Year slider */}
              <div className="rounded-[18px] border border-[var(--color-border)] bg-white/75 p-4">
                <label htmlFor="geography-year-slider" className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
                  Scrub through the crisis
                </label>
                <input
                  id="geography-year-slider"
                  type="range"
                  min={minYear}
                  max={maxYear}
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(Number(event.target.value))}
                  className="mt-2 w-full accent-[var(--color-accent)]"
                />
                <div className="mt-2 flex items-center justify-between text-xs text-[var(--color-muted)]">
                  <span>{minYear}</span>
                  <span className="rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-1 font-semibold text-[var(--color-ink)]">
                    {selectedYear}
                  </span>
                  <span>{maxYear}</span>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="mt-6 rounded-[24px] border border-[var(--color-border)] bg-white/80 p-4">
              <ComposableMap projection="geoAlbersUsa" className="h-[320px] w-full">
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

            {/* Narrative explanation */}
            <div className="mt-4 rounded-[18px] border border-[var(--color-border)] bg-white/85 p-4 text-sm leading-6 text-[var(--color-ink)]">
              {narrativeText[yearPhase]}
            </div>

            {/* Top / bottom states */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/85 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-mint)]">Strongest recovery</p>
                <div className="mt-4 space-y-3">
                  {(geographyData.topStates.length > 0
                    ? geographyData.topStates
                    : [{ state: "—", value: "—" }, { state: "—", value: "—" }, { state: "—", value: "—" }]
                  ).map((item, index) => (
                    <div key={`${item.state}-${item.value}-${index}`} className="flex items-center justify-between text-sm text-[var(--color-ink)]">
                      <span>{item.state}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/85 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-coral)]">Weakest recovery</p>
                <div className="mt-4 space-y-3">
                  {(geographyData.bottomStates.length > 0
                    ? geographyData.bottomStates
                    : [{ state: "—", value: "—" }, { state: "—", value: "—" }, { state: "—", value: "—" }]
                  ).map((item, index) => (
                    <div key={`${item.state}-${item.value}-${index}`} className="flex items-center justify-between text-sm text-[var(--color-ink)]">
                      <span>{item.state}</span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Borrowers</p>
            <div className="mt-6 space-y-5">
              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/85 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">Median income</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">{eraData.borrowerProfile.medianIncome}</p>
              </div>
              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/85 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">Approval rate</p>
                <p className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">{eraData.borrowerProfile.approvalRate}</p>
              </div>
              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/85 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">Dominant purpose</p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">
                  {eraData.borrowerProfile.dominantPurpose} ({eraData.borrowerProfile.dominantPurposeShare})
                </p>
              </div>
              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/85 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">Typical loan type received</p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-ink)]">{eraData.borrowerProfile.receivedLoanType}</p>
              </div>
            </div>
            <div className="mt-8 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-accent-soft)] p-4 text-center text-sm leading-6 text-[var(--color-ink)]">
              {era === "2007" ? story.comparison.borrower2007 : story.comparison.borrower2017}
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
          Back to recovery
        </button>
        <button
          type="button"
          onClick={onNext}
          className="rounded-full bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-ink)]"
        >
          Continue to summary
        </button>
      </div>
    </div>
  );
}
