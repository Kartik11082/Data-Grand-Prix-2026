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
  const [era, setEra] = useState<"2007" | "2017">("2007");
  const eraData = story.eras[era];

  const stateLookup = useMemo(
    () => new Map(eraData.geography.states.map((item) => [item.state, item])),
    [eraData],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 py-8 md:px-8 md:py-10">
      <section className="rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">Act three</p>
            <h2 className="mt-4 text-4xl leading-tight text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
              The behavior shift
            </h2>
            <p className="mt-5 max-w-[42rem] text-base leading-7 text-[var(--color-ink)]">
              Compare the pre-crisis and post-recovery market. Missing API values appear as X.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {(["2007", "2017"] as const).map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => setEra(year)}
                className={`rounded-full border px-5 py-3 text-sm font-semibold transition ${
                  era === year
                    ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                    : "border-[var(--color-border)] bg-white text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)]"
                }`}
              >
                {year}
              </button>
            ))}
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
                  <div className="h-3 rounded-full bg-[var(--color-accent)]" style={{ width: toPercentWidth(eraData.lenderMix.conventional) }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-[var(--color-ink)]">
                  <span>Government-backed share</span>
                  <span>{eraData.lenderMix.govtBacked}</span>
                </div>
                <div className="h-3 rounded-full bg-white/80">
                  <div className="h-3 rounded-full bg-[var(--color-mint)]" style={{ width: toPercentWidth(eraData.lenderMix.govtBacked) }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-[var(--color-ink)]">
                  <span>Second mortgages</span>
                  <span>{eraData.lenderMix.secondMortgages}</span>
                </div>
                <div className="h-3 rounded-full bg-white/80">
                  <div className="h-3 rounded-full bg-[var(--color-coral)]" style={{ width: toPercentWidth(eraData.lenderMix.secondMortgages) }} />
                </div>
              </div>
            </div>
            <div className="mt-8 rounded-[20px] border border-[var(--color-border)] bg-white/85 p-4 text-sm leading-6 text-[var(--color-ink)]">
              {era === "2007" ? story.comparison.lender2007 : story.comparison.lender2017}
            </div>
          </article>

          <article className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-page)] p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Geography</p>
                <h3 className="mt-2 text-xl font-semibold text-[var(--color-ink)]">
                  {era === "2007" ? "Loan volume concentration" : "Recovery index dispersion"}
                </h3>
              </div>
              <div className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-xs text-[var(--color-muted)]">API-backed</div>
            </div>

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

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/85 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Top states</p>
                <div className="mt-4 space-y-3">
                  {eraData.geography.topStates.map((item, index) => (
                    <div key={`${item.state}-${item.value}-${index}`} className="flex items-center justify-between text-sm text-[var(--color-ink)]">
                      <span>{item.state}</span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] border border-[var(--color-border)] bg-white/85 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Bottom states</p>
                <div className="mt-4 space-y-3">
                  {eraData.geography.bottomStates.map((item, index) => (
                    <div key={`${item.state}-${item.value}-${index}`} className="flex items-center justify-between text-sm text-[var(--color-ink)]">
                      <span>{item.state}</span>
                      <span>{item.value}</span>
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
            <div className="mt-8 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-accent-soft)] p-4 text-sm leading-6 text-[var(--color-ink)]">
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
          className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent)]"
        >
          Continue to summary
        </button>
      </div>
    </div>
  );
}
