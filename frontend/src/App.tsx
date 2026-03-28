import React, { useState, useEffect } from 'react';
import { LandingPage as Landing } from './components/LandingPage';
import { ActOne as Fallout } from './components/ActOne';
import { ActTwo as Recovery } from './components/ActTwo';
import { ActThree as BehaviorShift } from './components/ActThree';
import { ExecutiveSummary as Summary } from './components/ExecutiveSummary';
import { fetchAllChartData } from './dataService';
import './index.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [chartData, setChartData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const loadData = async () => {
    setDataError(null);
    setDataLoading(true);
    const result = await fetchAllChartData();
    if (result) {
      setChartData(result);
      setDataLoading(false);
    } else {
      setDataError("Failed to load data");
      setDataLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const goNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, 4));
  };

  const goPrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for spacebar if we want it strictly for navigation
      if (e.code === 'Space') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowRight') {
         goNext();
      } else if (e.key === 'ArrowLeft') {
         goPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 0:
        return <Landing onBegin={goNext} />;
      case 1:
        return <Fallout chartData={chartData} onNext={goNext} onPrev={goPrev} />;
      case 2:
        return <Recovery chartData={chartData} onNext={goNext} onPrev={goPrev} />;
      case 3:
        return <BehaviorShift onNext={goNext} />;
      case 4:
        return <Summary />;
      default:
        return <Landing onBegin={goNext} />;
    }
  };

  if (dataLoading) {
    return (
      <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden text-white flex flex-col items-center justify-center">
        <style>{`
          @keyframes pulseKeyframe {
            0%, 100% { opacity: 0.3; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.1); }
          }
          .pulse-dot-1 { animation: pulseKeyframe 1.4s infinite 0s; }
          .pulse-dot-2 { animation: pulseKeyframe 1.4s infinite 0.2s; }
          .pulse-dot-3 { animation: pulseKeyframe 1.4s infinite 0.4s; }
        `}</style>
        <div className="flex gap-2 mb-4">
          <div className="w-[10px] h-[10px] bg-white rounded-full pulse-dot-1"></div>
          <div className="w-[10px] h-[10px] bg-white rounded-full pulse-dot-2"></div>
          <div className="w-[10px] h-[10px] bg-white rounded-full pulse-dot-3"></div>
        </div>
        <div className="text-[#666] text-[13px] tracking-wide mt-2">
          Loading mortgage data...
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden text-white flex flex-col items-center justify-center">
        <div className="text-[#E24B4A] text-[15px] tracking-wide mb-6">
          Could not connect to data server.
        </div>
        <button
          onClick={loadData}
          className="px-6 py-2 bg-white text-[#111] text-[13px] font-bold rounded-lg hover:bg-white/90 transition-all cursor-pointer"
        >
          RETRY
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-[#0a0a0a] overflow-hidden text-white">
      
      {/* Progress Indicator */}
      <div className="absolute top-8 right-8 z-50 flex gap-4">
        {[0, 1, 2, 3, 4].map((index) => {
          const isActive = index === currentPage;
          return (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className="group relative flex items-center justify-center w-8 h-8 focus:outline-none cursor-pointer"
              aria-label={`Go to page ${index + 1}`}
            >
              <div
                className={`transition-all duration-300 rounded-full border border-white ${
                  isActive
                    ? 'w-[8px] h-[8px] bg-white'
                    : 'w-[6px] h-[6px] bg-transparent opacity-50 hover:opacity-100'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Page Content with Fade Transition */}
      <div key={currentPage} className="w-full h-full animate-fade-in overflow-y-auto">
        {renderPage()}
      </div>
    </div>
  );
}
