import { motion } from "framer-motion";
import type { LandingData } from "../dataService";

interface LandingPageProps {
  onBegin: () => void;
  story: LandingData;
}

export function LandingPage({ onBegin, story }: LandingPageProps) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-[1400px] flex-col gap-10 px-4 py-8 md:px-8 md:py-10">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[32px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-soft)] md:p-12"
        >
          <div className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-sand)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
            {story.datasetLabel} · {story.totalRecords} records · {story.startYear}-{story.endYear}
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_260px] lg:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-muted)]">Mortgage credit under stress</p>
              <h2
                className="mt-4 max-w-[10ch] text-6xl leading-none text-[var(--color-ink)] md:text-8xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {story.heroMetricValue}
              </h2>
              <p className="mt-4 text-lg text-[var(--color-muted)]">{story.heroMetricUnit}</p>
              <p className="mt-6 max-w-[32rem] text-lg leading-8 text-[var(--color-ink)]">{story.heroDescription}</p>
            </div>

            <div className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-accent-soft)] p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Data mode</p>
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-sm text-[var(--color-muted)]">Source</p>
                  <p className="text-xl font-semibold text-[var(--color-ink)]">Live API response</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-muted)]">Missing fields</p>
                  <p className="text-base leading-7 text-[var(--color-ink)]">
                    Any field not returned by the API is rendered as <span className="font-semibold">X</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {story.chips.map((chip) => (
              <div key={`${chip.label}-${chip.year}`} className="rounded-[24px] border border-[var(--color-border)] bg-white/80 p-5">
                <p className="text-3xl font-semibold text-[var(--color-ink)]">{chip.value}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-ink)]">{chip.label}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">{chip.year}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onBegin}
              className="rounded-full bg-[var(--color-ink)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent)]"
            >
              Start the story
            </button>
            <p className="text-sm text-[var(--color-muted)]">Use the page pills in the header or the keyboard arrows to move through the narrative.</p>
          </div>
        </motion.article>

        <motion.aside
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-[32px] border border-[var(--color-border)] bg-[linear-gradient(180deg,#fffaf1_0%,#eef6f8_100%)] p-8 shadow-[var(--shadow-soft)]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">Narrative arc</p>
          <div className="mt-6 space-y-5">
            {[
              "1. Overview: frame the scale of the shock.",
              "2. Collapse: show approval rates and lender retreat.",
              "3. Recovery: show the gap closing, rate cuts, and structural shifts.",
              "4. Behavior shift: compare the market in 2007 and 2017.",
              "5. Summary: collapse the story into a sponsor-ready close.",
            ].map((line) => (
              <div key={line} className="rounded-[24px] border border-[var(--color-border)] bg-white/70 p-4 text-sm leading-6 text-[var(--color-ink)]">
                {line}
              </div>
            ))}
          </div>
        </motion.aside>
      </section>
    </div>
  );
}
