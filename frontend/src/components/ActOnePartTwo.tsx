import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

interface ActOnePartTwoProps {
  onNext: () => void;
}

const beat2Data = [
  { year: 2007, conventional: 88, govt_backed: 12 },
  { year: 2008, conventional: 72, govt_backed: 28 },
  { year: 2009, conventional: 54, govt_backed: 46 },
  { year: 2010, conventional: 56, govt_backed: 44 },
  { year: 2011, conventional: 60, govt_backed: 40 },
  { year: 2012, conventional: 62, govt_backed: 38 },
];

export const ActOnePartTwo: React.FC<ActOnePartTwoProps> = ({ onNext }) => {
  const [kpiStyle, setKpiStyle] = useState({ opacity: 0, transform: 'translateY(-4px)' });
  
  useEffect(() => {
    setKpiStyle({ opacity: 0, transform: 'translateY(-4px)' });
    const timer = setTimeout(() => {
      setKpiStyle({ opacity: 1, transform: 'translateY(0)' });
    }, 20);
    return () => clearTimeout(timer);
  }, []);

  const currentKPI = { label: "Gov-backed share", value: "46%", delta: "↑ 34pp from baseline", deltaColor: "#639922" };

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
        <div style={{ background: '#1a1a1a', borderRadius: 8, padding: '16px 20px' }} className="border border-white/5 shadow-2xl relative overflow-hidden">
          <div style={{ ...kpiStyle, transition: 'opacity 0.3s ease, transform 0.3s ease' }}>
            <div style={{ fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              {currentKPI.label}
            </div>
            <div style={{ fontSize: 36, fontWeight: 300, color: 'white', lineHeight: 1, marginBottom: 6 }}>
              {currentKPI.value}
            </div>
            <div style={{ fontSize: 13, color: currentKPI.deltaColor }}>
              {currentKPI.delta}
            </div>
          </div>
          {/* Subtle background glow */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 blur-[60px]" style={{ backgroundColor: currentKPI.deltaColor, opacity: 0.2 }}></div>
        </div>
      </div>

      {/* Right Column: Content */}
      <div className="w-[65%] min-h-screen p-12 bg-[#0a0a0a]">
        <section className="min-h-[80vh] flex flex-col justify-center translate-y-20">
          <div className="mb-4">
            <h3 className="text-[18px] text-white font-[400] mb-1">Private lenders fled. Government stepped in.</h3>
            <p className="text-[13px] text-[#666] m-0">Share of originated loans by type, 2007–2012</p>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-4 w-full h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={beat2Data} stackOffset="expand">
                <XAxis dataKey="year" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(tick) => `${Math.round(tick * 100)}%`}
                  ticks={[0, 0.25, 0.5, 0.75, 1]}
                  stroke="#666"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <ReferenceLine
                  x={2009}
                  stroke="#fff"
                  strokeDasharray="3 3"
                  strokeOpacity={0.3}
                  label={{ position: 'top', value: 'FHA/VA surges to 46%', fill: '#639922', fontSize: 11 }}
                />
                <Area
                  type="monotone"
                  dataKey="conventional"
                  stackId="1"
                  stroke="none"
                  fill="#378ADD"
                  fillOpacity={0.85}
                  isAnimationActive={true}
                />
                <Area
                  type="monotone"
                  dataKey="govt_backed"
                  stackId="1"
                  stroke="none"
                  fill="#639922"
                  fillOpacity={0.85}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Manual Legend */}
          <div className="flex gap-6 mt-6 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#378ADD]"></div>
              <span className="text-[12px] text-white/80">Conventional</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#639922]"></div>
              <span className="text-[12px] text-white/80">Gov-backed (FHA/VA/FSA)</span>
            </div>
          </div>

          {/* Stat Pills */}
          <div className="mt-8 flex flex-col">
            <div className="flex items-center gap-4 mb-2">
              <div className="bg-[#1f2937] px-4 py-2 rounded-full inline-flex items-center gap-2">
                <span className="text-[12px] text-white/60">Conventional 2007</span>
                <span className="text-[12px] font-bold text-[#378ADD]">88%</span>
              </div>
              <span className="text-white/40">→</span>
              <div className="bg-[#1f2937] px-4 py-2 rounded-full inline-flex items-center gap-2">
                <span className="text-[12px] text-white/60">Conventional 2009</span>
                <span className="text-[12px] font-bold text-[#378ADD]">54%</span>
              </div>
            </div>
            <p className="text-[12px] text-[#666] m-0 max-w-[480px]">
              By 2010 they're nearly equal — something that had never happened before in the dataset. This is the lender risk appetite story told in one shape.
            </p>
          </div>
        </section>

        {/* Bottom Page Transition */}
        <div className="w-full flex flex-col items-center justify-center py-[48px] mt-20">
          <style>{`
            @keyframes dotFade {
              0%, 100% { opacity: 0; }
              50% { opacity: 1; }
            }
            .dot-1 { animation: dotFade 1.5s infinite 0s; }
            .dot-2 { animation: dotFade 1.5s infinite 0.5s; }
            .dot-3 { animation: dotFade 1.5s infinite 1.0s; }
          `}</style>
          <div className="text-[24px] font-[300] text-[#666] italic flex items-center justify-center text-center">
            Then, slowly, something changed
            <span className="inline-flex tracking-widest ml-1 text-white">
              <span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span>
            </span>
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
