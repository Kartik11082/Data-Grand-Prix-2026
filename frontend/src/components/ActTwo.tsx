import React, { useState, useEffect } from 'react';
import { Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, ComposedChart, ReferenceArea } from 'recharts';
import { motion } from 'framer-motion';

interface ActTwoProps {
  onNext: () => void;
}

const beat1Data = [
  { year: 2007, applications: 6.82, originations: 5.74, gap_fill: 6.82 },
  { year: 2008, applications: 5.93, originations: 4.13, gap_fill: 5.93 },
  { year: 2009, applications: 4.21, originations: 2.31, gap_fill: 4.21 },
  { year: 2010, applications: 4.48, originations: 2.52, gap_fill: 4.48 },
  { year: 2011, applications: 4.79, originations: 2.84, gap_fill: 4.79 },
  { year: 2012, applications: 5.41, originations: 3.52, gap_fill: 5.41 },
  { year: 2013, applications: 5.12, originations: 3.31, gap_fill: 5.12 },
  { year: 2014, applications: 5.28, originations: 3.61, gap_fill: 5.28 },
  { year: 2015, applications: 5.63, originations: 3.89, gap_fill: 5.63 },
  { year: 2016, applications: 5.84, originations: 4.11, gap_fill: 5.84 },
  { year: 2017, applications: 6.09, originations: 4.48, gap_fill: 6.09 },
];

export const ActTwo: React.FC<ActTwoProps> = ({ onNext }) => {
  const [kpiStyle, setKpiStyle] = useState({ opacity: 0, transform: 'translateY(-4px)' });

  useEffect(() => {
    setKpiStyle({ opacity: 0, transform: 'translateY(-4px)' });
    const timer = setTimeout(() => {
      setKpiStyle({ opacity: 1, transform: 'translateY(0)' });
    }, 20);
    return () => clearTimeout(timer);
  }, []);

  const currentKPI = { label: "Origination rate", value: "74%", delta: "↑ Recovering toward baseline", deltaColor: "#639922" };

  return (
    <div className="flex w-full min-h-screen bg-[#111] text-white font-sans overflow-x-hidden">
      {/* Left Column: Fixed/Sticky */}
      <div className="w-[35%] h-screen sticky top-0 p-12 flex flex-col justify-center border-r border-white/5 bg-[#111] z-20">
        <label className="text-[10px] font-bold uppercase tracking-[2px] text-white/50 mb-2">
          ACT II — THE CLIMB BACK
        </label>
        <div className="inline-flex items-center">
            <span className="bg-[#3B6D11] text-white text-[12px] font-bold px-3 py-1 rounded-full mb-6">
                2011 – 2017
            </span>
        </div>
        <h2 className="text-2xl font-light mb-6 leading-relaxed">
          Recovery didn't announce itself. It showed up quietly in the data — first as a narrowing gap, then as a refinancing surge, then as a structural shift that never reversed.
        </h2>

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
          <div className="absolute -right-4 -bottom-4 w-24 h-24 blur-[60px]" style={{ backgroundColor: currentKPI.deltaColor, opacity: 0.2 }}></div>
        </div>
      </div>

      {/* Right Column: Scrollable Content */}
      <div className="w-[65%] min-h-screen p-12 bg-[#0a0a0a]">
        
        {/* Beat 1 Section */}
        <section className="min-h-[80vh] mb-32 flex flex-col justify-center translate-y-20">
          <div className="mb-4">
            <h3 className="text-[18px] text-white font-[400] mb-1">The gap started closing</h3>
            <p className="text-[13px] text-[#666] m-0">Full decade view — applications vs originations, 2007–2017</p>
          </div>

          <div className="flex w-[90%] mx-auto text-[11px] uppercase tracking-[0.08em] font-medium mb-3 mt-4 text-center">
            <div className="flex-[1] text-[#378ADD]">Act I</div>
            <div className="flex-[3] text-[#E24B4A]">Act II</div>
            <div className="flex-[6] text-[#639922]">Act III</div>
          </div>
          
          <div className="bg-[#1a1a1a] rounded-lg p-4 w-full h-[340px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={beat1Data}>
                <XAxis dataKey="year" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis 
                  domain={[0, 8]}
                  ticks={[0, 2, 4, 6, 8]}
                  label={{ value: 'Millions', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 11 }}
                  stroke="#666" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                
                <ReferenceArea x1={2007} x2={2008} fill="#378ADD" fillOpacity={0.03} />
                <ReferenceArea x1={2008} x2={2011} fill="#E24B4A" fillOpacity={0.03} />
                <ReferenceArea x1={2011} x2={2017} fill="#639922" fillOpacity={0.03} />

                <ReferenceLine 
                  x={2009} 
                  stroke="#E24B4A" 
                  strokeDasharray="3 3"
                  strokeOpacity={0.8}
                  label={{ position: 'top', value: 'The floor', fill: '#E24B4A', fontSize: 11 }}
                />
                <ReferenceLine 
                  x={2012} 
                  stroke="#639922" 
                  strokeDasharray="3 3"
                  strokeOpacity={0.4}
                  label={{ position: 'top', value: 'Recovery begins', fill: '#639922', fontSize: 11 }}
                />

                <Area type="monotone" dataKey="gap_fill" stroke="none" fill="#E24B4A" fillOpacity={0.3} isAnimationActive={true} />
                <Area type="monotone" dataKey="originations" stroke="none" fill="#1a1a1a" fillOpacity={1} isAnimationActive={false} activeDot={false} />
                <Area type="monotone" dataKey="applications" stroke="#378ADD" strokeWidth={2} fill="#378ADD" fillOpacity={0.15} isAnimationActive={true} />
                <Area type="monotone" dataKey="originations" stroke="#639922" strokeWidth={2} fill="#639922" fillOpacity={0.15} isAnimationActive={true} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex gap-6 mt-6 items-center flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#378ADD]"></div>
              <span className="text-[12px] text-white/80">Applications</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#639922]"></div>
              <span className="text-[12px] text-white/80">Originations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#E24B4A]"></div>
              <span className="text-[12px] text-white/80">Denial gap</span>
            </div>
          </div>
        </section>

        {/* Bottom Page Transition */}
        <div className="w-full flex flex-col items-center justify-center py-[48px] mt-20">
          <div className="text-[24px] font-[300] text-[#666] italic flex items-center justify-center text-center">
            Then, something happened...
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
