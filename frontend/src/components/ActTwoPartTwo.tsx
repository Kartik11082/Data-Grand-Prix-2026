import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

interface ActTwoPartTwoProps {
  onNext: () => void;
}

const beat2Data = [
  { year: 2010, refi_index: 100 },
  { year: 2011, refi_index: 145 },
  { year: 2012, refi_index: 340 },
  { year: 2013, refi_index: 310 },
  { year: 2014, refi_index: 180 },
  { year: 2015, refi_index: 160 },
  { year: 2016, refi_index: 140 },
  { year: 2017, refi_index: 120 },
];

export const ActTwoPartTwo: React.FC<ActTwoPartTwoProps> = ({ onNext }) => {
  const [kpiStyle, setKpiStyle] = useState({ opacity: 0, transform: 'translateY(-4px)' });

  useEffect(() => {
    setKpiStyle({ opacity: 0, transform: 'translateY(-4px)' });
    const timer = setTimeout(() => {
      setKpiStyle({ opacity: 1, transform: 'translateY(0)' });
    }, 20);
    return () => clearTimeout(timer);
  }, []);

  const currentKPI = { label: "Refi volume peak", value: "+240%", delta: "2012 vs 2010 baseline", deltaColor: "#EF9F27" };

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
          <div className="absolute -right-4 -bottom-4 w-24 h-24 blur-[60px]" style={{ backgroundColor: currentKPI.deltaColor, opacity: 0.2 }}></div>
        </div>
      </div>

      {/* Right Column: Content */}
      <div className="w-[65%] min-h-screen p-12 bg-[#0a0a0a]">
        <section className="min-h-[80vh] flex flex-col justify-center translate-y-20">
          <div className="mb-4">
            <h3 className="text-[18px] text-white font-[400] mb-1">The Fed cut rates. Borrowers refinanced en masse.</h3>
            <p className="text-[13px] text-[#666] m-0">Refinancing volume index, 2010–2017 (2010 = 100)</p>
          </div>
          
          <div className="bg-[#1a1a1a] rounded-lg p-4 w-full h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={beat2Data}>
                <XAxis dataKey="year" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis 
                  domain={[0, 400]}
                  ticks={[0, 100, 200, 300, 400]}
                  label={{ value: 'Index (2010=100)', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 11 }}
                  stroke="#666" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <ReferenceLine 
                  y={100} 
                  stroke="#666" 
                  strokeDasharray="4 4" 
                  label={{ position: 'left', value: '2010 baseline', fill: '#666', fontSize: 11 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="refi_index" 
                  stroke="#EF9F27" 
                  strokeWidth={2}
                  fill="#EF9F27" 
                  fillOpacity={0.2} 
                  isAnimationActive={true}
                  dot={(props: any) => {
                    if (props.payload.year === 2012) {
                      return (
                        <g key="custom-peak-dot">
                          <circle cx={props.cx} cy={props.cy} r={6} stroke="#111" strokeWidth={2} fill="#EF9F27" />
                          <rect x={props.cx + 8} y={props.cy - 35} width={150} height={32} fill="#1a1a1a" rx={4} stroke="#333" />
                          <text x={props.cx + 16} y={props.cy - 20} fill="#EF9F27" fontSize={11} fontWeight="bold">Fed rate cuts</text>
                          <text x={props.cx + 16} y={props.cy - 8} fill="#9ca3af" fontSize={10}>Peak: +240% above baseline</text>
                        </g>
                      );
                    }
                    return <g key={props.payload.year}></g>;
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-8 flex flex-col items-start">
            <div className="bg-[#1f2937] px-4 py-2 rounded-full inline-flex items-center gap-1 mb-3">
              <span className="text-[12px] text-white/60">Refi volume</span>
              <span className="text-[12px] font-bold text-[#EF9F27] ml-1">+240%</span>
              <span className="text-[12px] text-white/60 ml-1">from 2010 to 2013 peak</span>
            </div>
            <p className="text-[12px] text-[#555] italic max-w-[480px] m-0">When the Federal Reserve cut rates to near zero, millions of homeowners rushed to refinance existing mortgages at lower rates.</p>
          </div>
        </section>

        {/* Bottom Page Transition */}
        <div className="w-full flex flex-col items-center justify-center py-[48px] mt-20">
          <div className="text-[24px] font-[300] text-[#666] italic flex items-center justify-center text-center">
            Borrowers refinanced en masse
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
