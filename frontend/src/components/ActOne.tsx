import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ComposedChart, ReferenceArea, ReferenceLine } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface ActOneProps {
  onNext: () => void;
}

const beat1Data = [
  { year: 2007, apps: 6.8, orig: 5.7 },
  { year: 2008, apps: 5.9, orig: 4.1 },
  { year: 2009, apps: 4.2, orig: 2.3 },
  { year: 2010, apps: 4.5, orig: 2.5 },
];

const beat2Data = [
  { year: 2007, conventional: 88, govt_backed: 12 },
  { year: 2008, conventional: 72, govt_backed: 28 },
  { year: 2009, conventional: 54, govt_backed: 46 },
  { year: 2010, conventional: 56, govt_backed: 44 },
];

export const ActOne: React.FC<ActOneProps> = ({ onNext }) => {
  const [activeBeat, setActiveBeat] = useState<number>(1);
  const beat1Ref = useRef<HTMLDivElement>(null);
  const beat2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === beat1Ref.current) setActiveBeat(1);
          if (entry.target === beat2Ref.current) setActiveBeat(2);
        }
      });
    }, options);

    if (beat1Ref.current) observer.observe(beat1Ref.current);
    if (beat2Ref.current) observer.observe(beat2Ref.current);

    return () => observer.disconnect();
  }, []);

  const kpiData = {
    1: { label: "Origination Rate", value: "55%", delta: "↓ 29pp from 2007", color: "#E24B4A" },
    2: { label: "Gov-backed Share", value: "46%", delta: "↑ 34pp from 2007", color: "#639922" },
  };

  const currentKPI = kpiData[activeBeat as 1 | 2];

  return (
    <div className="flex w-full min-h-screen bg-[#111] text-white font-sans overflow-x-hidden">
      {/* Left Column: Fixed/Sticky */}
      <div className="w-[35%] h-screen sticky top-0 p-12 flex flex-col justify-center border-r border-white/5 bg-[#111] z-20">
        <label className="text-[10px] font-bold uppercase tracking-[2px] text-white/50 mb-2">
          ACT I — THE COLLAPSE
        </label>
        <div className="inline-flex items-center">
            <span className="bg-[#E24B4A] text-white text-[12px] font-bold px-3 py-1 rounded-full mb-6">
                2008 – 2010
            </span>
        </div>
        <h2 className="text-2xl font-light mb-6 leading-relaxed">
          In 2008, the mortgage market didn't slow down — it seized. Here's what that looks like in data.
        </h2>

        {/* Dynamic KPI Card */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 border border-white/5 shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeBeat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{currentKPI.label}</p>
              <div className="text-5xl font-light mb-2">{currentKPI.value}</div>
              <p className={`text-sm font-medium`} style={{ color: currentKPI.color }}>
                {currentKPI.delta}
              </p>
            </motion.div>
          </AnimatePresence>
          {/* Subtle background glow */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 blur-[60px]" style={{ backgroundColor: currentKPI.color, opacity: 0.2 }}></div>
        </div>
      </div>

      {/* Right Column: Scrollable Content */}
      <div className="w-[65%] min-h-screen p-12 bg-[#0a0a0a]">
        {/* Beat 1 Section */}
        <section ref={beat1Ref} className="min-h-[80vh] mb-32 flex flex-col justify-center translate-y-20">
          <h3 className="text-3xl font-light mb-12">Credit froze overnight</h3>
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-white/5 shadow-xl h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={beat1Data}>
                <XAxis dataKey="year" stroke="#333" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Area 
                  type="monotone" 
                  dataKey="apps" 
                  stroke="#378ADD" 
                  fill="#378ADD" 
                  fillOpacity={0.05} 
                  strokeWidth={2}
                  isAnimationActive={true}
                />
                <Area 
                  type="monotone" 
                  dataKey="orig" 
                  stroke="#639922" 
                  fill="#E24B4A" 
                  fillOpacity={0.25} 
                  strokeWidth={2}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
            {/* Annotation Overlay */}
            <div className="absolute left-[54%] top-[68%] flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-white mb-2"></div>
                <span className="text-[10px] text-white/50 uppercase tracking-widest">The floor</span>
            </div>
          </div>
        </section>

        {/* Beat 2 Section */}
        <section ref={beat2Ref} className="min-h-[80vh] mb-32 flex flex-col justify-center">
          <h3 className="text-3xl font-light mb-12">Private lenders fled. Government stepped in.</h3>
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-white/5 shadow-xl h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={beat2Data} stackOffset="expand">
                <XAxis dataKey="year" stroke="#333" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Area 
                  type="monotone" 
                  dataKey="govt_backed" 
                  stackId="1" 
                  stroke="#639922" 
                  fill="#639922" 
                  fillOpacity={0.8}
                  isAnimationActive={true}
                />
                <Area 
                  type="monotone" 
                  dataKey="conventional" 
                  stackId="1" 
                  stroke="#378ADD" 
                  fill="#378ADD" 
                  fillOpacity={0.8}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
            {/* Annotation */}
            <div className="absolute left-[54%] top-[55%] pointer-events-none">
                <span className="text-[11px] font-bold text-white bg-black/60 px-2 py-1 backdrop-blur-sm rounded">FHA/VA surges to 46%</span>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <span className="bg-white/5 text-white/70 text-[11px] font-medium px-4 py-2 rounded border border-white/10 uppercase tracking-wider">
              Conventional 2007: 88%
            </span>
            <span className="bg-white/5 text-white/70 text-[11px] font-medium px-4 py-2 rounded border border-white/10 uppercase tracking-wider">
              Conventional 2009: 54%
            </span>
          </div>
        </section>

        {/* Bottom Page Transition */}
        <div className="w-full flex flex-col items-center justify-center py-24 mt-20">
          <div className="text-3xl font-light flex items-center">
            Then, slowly, something changed.
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, times: [0, 0.5, 1] }}
              className="ml-2"
            >
              ...
            </motion.span>
          </div>
          <motion.button
            onClick={onNext}
            className="mt-12 px-10 py-4 bg-white text-[#111] font-bold rounded-lg hover:bg-white/90 transition-all cursor-pointer shadow-white/10 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            CONTINUE
          </motion.button>
        </div>
      </div>
    </div>
  );
};
