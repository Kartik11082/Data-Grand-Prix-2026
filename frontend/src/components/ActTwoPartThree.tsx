import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, ReferenceArea, ReferenceDot } from 'recharts';
import { motion } from 'framer-motion';

interface ActTwoPartThreeProps {
  onNext: () => void;
  chartData: any;
}

export const ActTwoPartThree: React.FC<ActTwoPartThreeProps> = ({ onNext, chartData }) => {
  const [kpiStyle, setKpiStyle] = useState({ opacity: 0, transform: 'translateY(-4px)' });

  useEffect(() => {
    setKpiStyle({ opacity: 0, transform: 'translateY(-4px)' });
    const timer = setTimeout(() => {
      setKpiStyle({ opacity: 1, transform: 'translateY(0)' });
    }, 20);
    return () => clearTimeout(timer);
  }, [chartData]);

  const loanTypeDataFull = chartData?.chart2 ?? [];
  const beat3Data = loanTypeDataFull;

  const row2017LoanType = loanTypeDataFull.find((d: any) => d.year === 2017);
  const govBacked2017 = row2017LoanType
    ? Math.round(row2017LoanType.govt_backed)
    : 33;

  const currentKPI = { 
    label: "Gov-backed 2017", 
    value: `${govBacked2017}%`, 
    delta: "Was 12% in 2007 — new structural normal", 
    deltaColor: "#639922" 
  };

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
            <h3 className="text-[18px] text-white font-[400] mb-1">Government lending never retreated.</h3>
            <p className="text-[13px] text-[#666] m-0">Loan type composition 2007–2017 — share of originated loans</p>
          </div>
          
          <div className="bg-[#1a1a1a] rounded-lg p-4 w-full h-[320px] relative">
            {!beat3Data || beat3Data.length === 0 ? (
              <div className="w-full h-full bg-[#1a1a1a] rounded-[8px] flex items-center justify-center text-[#666]">
                —
              </div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={beat3Data} stackOffset="expand">
                <XAxis dataKey="year" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis 
                  domain={[0, 1]}
                  ticks={[0, 0.25, 0.5, 0.75, 1]}
                  tickFormatter={(tick) => `${Math.round(tick * 100)}%`}
                  stroke="#666" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false} 
                />
                
                <ReferenceArea 
                  x1={2008} 
                  x2={2011} 
                  fill="#E24B4A" 
                  fillOpacity={0.05} 
                  label={{ position: 'top', value: 'Crisis period', fill: '#E24B4A', opacity: 0.4, fontSize: 10 }} 
                />

                <ReferenceLine 
                  y={0.12} 
                  stroke="#639922" 
                  strokeDasharray="6 3" 
                  strokeWidth={1.5}
                  label={{ position: 'insideBottomRight', value: '2007 baseline: 12%', fill: '#639922', fontSize: 11 }}
                />

                <Area 
                  type="monotone" 
                  dataKey="conventional" 
                  stackId="1" 
                  stroke="none" 
                  fill="#378ADD" 
                  fillOpacity={0.8}
                  isAnimationActive={true}
                />
                <Area 
                  type="monotone" 
                  dataKey="govt_backed" 
                  stackId="1" 
                  stroke="none" 
                  fill="#639922" 
                  fillOpacity={0.8}
                  isAnimationActive={true}
                />
                
                <ReferenceDot 
                  x={2015} 
                  y={0.84} 
                  r={0} 
                  label={{ position: 'center', value: `New normal: ~${govBacked2017}%`, fill: 'white', fontSize: 11, fontWeight: 500 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>
          
          <div className="mt-8 border-l-[3px] border-[#639922] bg-[#0f1f0f] p-[12px_16px] rounded-r text-[13px] text-[#9ca3af] leading-[1.6]">
            Gov-backed lending never returned to pre-crisis levels. What began as emergency intervention became a permanent feature of the American mortgage market.
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
            The market came back. But the players had changed
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
