import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LandingPageProps {
  onBegin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onBegin }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const duration = 1500; // 1.5 seconds
    const target = 29;
    const delay = 500; // starts at 0.5s

    let animationFrame: number;
    let timeout: ReturnType<typeof setTimeout>;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (progress < duration) {
        setCount(Math.min(target, Math.floor((progress / duration) * target)));
        animationFrame = requestAnimationFrame(updateCount);
      } else {
        setCount(target);
      }
    };

    timeout = setTimeout(() => {
      animationFrame = requestAnimationFrame(updateCount);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
      {/* Background Visual: Ghost Gap Area Chart */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Fill between lines - Gap */}
          <motion.path
            d="M 0 150 C 200 150, 400 180, 500 250 C 600 280, 800 220, 1000 200 L 1000 350 C 800 370, 600 450, 500 450 C 400 380, 200 150, 0 150 Z"
            fill="#E24B4A"
            initial={{ fillOpacity: 0 }}
            animate={{ fillOpacity: 0.03 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Applications Line (Top) */}
          <motion.path
            d="M 0 150 C 200 150, 400 180, 500 250 C 600 280, 800 220, 1000 200"
            stroke="#ffffff"
            strokeOpacity="0.04"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Originations Line (Bottom) */}
          <motion.path
            d="M 0 150 C 200 150, 400 380, 500 450 C 600 450, 800 370, 1000 350"
            stroke="#ffffff"
            strokeOpacity="0.04"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center text-sans">
        {/* 1. Pill Label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{
            fontSize: '11px',
            letterSpacing: '0.1em',
            color: '#444',
            border: '0.5px solid #222',
            padding: '4px 12px',
            borderRadius: '20px',
            marginBottom: '48px',
          }}
        >
          HMDA · 170 million loan records · 2007–2017
        </motion.div>

        {/* 2. Large Animated Number */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col items-center"
        >
          <div style={{ fontSize: '120px', fontWeight: 200, color: 'white', lineHeight: 1 }}>
            {count}
          </div>
          <div className="text-[#666] mt-2 mb-2 tracking-wide font-light" style={{ fontSize: '14px' }}>
            percentage points
          </div>
          <div className="text-[#888] font-light tracking-wide" style={{ fontSize: '16px' }}>
            The drop in approval rates from 2007 to 2009
          </div>
        </motion.div>

        {/* 3. Stat Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="mt-[48px] flex flex-row items-center justify-center gap-6"
        >
          <div className="flex flex-col items-center">
            <span style={{ color: 'white', fontSize: '14px', marginBottom: '2px' }}>6.8M applications</span>
            <span style={{ color: '#555', fontSize: '12px' }}>2007 peak</span>
          </div>
          <div style={{ width: '0.5px', height: '32px', backgroundColor: '#222' }}></div>
          <div className="flex flex-col items-center">
            <span style={{ color: 'white', fontSize: '14px', marginBottom: '2px' }}>2.3M originated</span>
            <span style={{ color: '#555', fontSize: '12px' }}>2009 floor</span>
          </div>
          <div style={{ width: '0.5px', height: '32px', backgroundColor: '#222' }}></div>
          <div className="flex flex-col items-center">
            <span style={{ color: 'white', fontSize: '14px', marginBottom: '2px' }}>4 years</span>
            <span style={{ color: '#555', fontSize: '12px' }}>to begin recovery</span>
          </div>
        </motion.div>

        {/* 4. Start Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 2.2 }}
          onClick={onBegin}
          style={{
            marginTop: '64px',
            background: 'none',
            border: '0.5px solid #333',
            color: '#888',
            padding: '12px 28px',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 200ms ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'white';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#333';
            e.currentTarget.style.color = '#888';
          }}
        >
          See what happened &rarr;
        </motion.button>
      </div>
    </div>
  );
};
