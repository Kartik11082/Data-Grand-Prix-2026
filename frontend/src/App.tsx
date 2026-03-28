import { useEffect, useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { ActOne } from "./components/ActOne";
import { ActTwo } from "./components/ActTwo";
import { ActThree } from "./components/ActThree";
import { ExecutiveSummary } from "./components/ExecutiveSummary";
import { EMPTY_STORY_DATA, fetchStoryData } from "./dataService";
import "./index.css";

const pageLabels = ["Overview", "Collapse", "Recovery", "Behavior Shift", "Summary"];

export default function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [storyData, setStoryData] = useState(EMPTY_STORY_DATA);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const goNext = () => {
    setCurrentPage((previousPage) => Math.min(previousPage + 1, pageLabels.length - 1));
  };

  const goPrev = () => {
    setCurrentPage((previousPage) => Math.max(previousPage - 1, 0));
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      try {
        const data = await fetchStoryData();
        if (!isCancelled) {
          setStoryData(data);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingData(false);
        }
      }
    };

    void loadData();

    return () => {
      isCancelled = true;
    };
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 0:
        return <LandingPage onBegin={goNext} story={storyData.landing} />;
      case 1:
        return <ActOne onNext={goNext} onPrev={goPrev} story={storyData.collapse} />;
      case 2:
        return <ActTwo onNext={goNext} onPrev={goPrev} story={storyData.recovery} />;
      case 3:
        return <ActThree onNext={goNext} onPrev={goPrev} story={storyData.behaviorShift} />;
      case 4:
        return <ExecutiveSummary onPrev={goPrev} story={storyData.summary} />;
      default:
        return <LandingPage onBegin={goNext} story={storyData.landing} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-page)] text-[var(--color-ink)]">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[color:rgba(247,244,237,0.88)] backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-4 py-4 md:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">
              Data Grand Prix 2026
            </p>
            <h1 className="mt-1 text-xl text-[var(--color-ink)]" style={{ fontFamily: "var(--font-display)" }}>
              HMDA mortgage story
            </h1>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {isLoadingData ? "Syncing API data..." : "API data synced"}
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-end gap-2">
            {pageLabels.map((label, index) => {
              const isActive = index === currentPage;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setCurrentPage(index)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    isActive
                      ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                      : "border-[var(--color-border)] bg-white/80 text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main key={currentPage} className="animate-fade-in">
        {renderPage()}
      </main>
    </div>
  );
}
