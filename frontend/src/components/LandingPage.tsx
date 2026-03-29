import { motion } from "framer-motion";
import type { LandingData } from "../dataService";

interface LandingPageProps {
  onBegin: () => void;
  story: LandingData;
  isTransitioning: boolean;
}

export function LandingPage({ onBegin, story, isTransitioning }: LandingPageProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1400px] items-center justify-center px-4 py-8 md:px-8 md:py-10">
      <motion.section
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={
          isTransitioning
            ? { opacity: 0, scale: 1.22, y: -18, filter: "blur(8px)" }
            : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
        }
        transition={{
          duration: isTransitioning ? 0.95 : 0.45,
          ease: isTransitioning ? [0.22, 1, 0.36, 1] : [0.22, 1, 0.36, 1],
        }}
        className="w-full max-w-[980px]"
      >
        <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
          <h2
            className="max-w-[13ch] text-4xl leading-tight text-[var(--color-ink)] md:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            APEX
          </h2>

          <div className="mt-10 flex w-full flex-wrap items-center justify-center gap-3">
            {story.narrativeArc.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                {index > 0 ? <span className="hidden h-px w-10 bg-[var(--color-border)] md:block" /> : null}
                <span className="rounded-full border border-[var(--color-border)] bg-white/45 px-4 py-2 text-sm text-[var(--color-ink)] backdrop-blur-sm">
                  {step}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm italic text-[var(--color-muted)]">Based on {story.totalRecords} analyzed HMDA records.</p>

          <button
            type="button"
            onClick={onBegin}
            disabled={isTransitioning}
            className="mt-10 rounded-full bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-ink)] disabled:cursor-default disabled:opacity-80"
          >
            {isTransitioning ? "Entering story..." : "Begin"}
          </button>
        </div>
      </motion.section>
    </div>
  );
}
