import React, { useState, useEffect } from 'react';
import { LandingPage as Landing } from './components/LandingPage';
import { ActOne as Fallout } from './components/ActOne';
import { ActTwo as Recovery } from './components/ActTwo';
import { ActThree as BehaviorShift } from './components/ActThree';
import { ExecutiveSummary as Summary } from './components/ExecutiveSummary';
import './index.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState<number>(0);

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
        return <Fallout onNext={goNext} />;
      case 2:
        return <Recovery onNext={goNext} />;
      case 3:
        return <BehaviorShift onNext={goNext} />;
      case 4:
        return <Summary />;
      default:
        return <Landing onBegin={goNext} />;
    }
  };

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
