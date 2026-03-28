import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, ComposedChart, ReferenceArea, ReferenceDot } from 'recharts';
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

const beat3Data = [
  { year: 2007, conventional: 88, govt_backed: 12 },
  { year: 2008, conventional: 72, govt_backed: 28 },
  { year: 2009, conventional: 54, govt_backed: 46 },
  { year: 2010, conventional: 56, govt_backed: 44 },
  { year: 2011, conventional: 60, govt_backed: 40 },
  { year: 2012, conventional: 62, govt_backed: 38 },
  { year: 2013, conventional: 63, govt_backed: 37 },
  { year: 2014, conventional: 65, govt_backed: 35 },
  { year: 2015, conventional: 66, govt_backed: 34 },
  { year: 2016, conventional: 67, govt_backed: 33 },
  { year: 2017, conventional: 67, govt_backed: 33 },
];

export const ActTwo: React.FC<ActTwoProps> = ({ onNext }) => {
  const [activeBeat, setActiveBeat] = useState<number>(1);
  const beat1Ref = useRef<HTMLDivElement>(null);
  const beat2Ref = useRef<HTMLDivElement>(null);
  const beat3Ref = useRef<HTMLDivElement>(null);

  const [kpiStyle, setKpiStyle] = useState({ opacity: 0, transform: 'translateY(-4px)' });

  useEffect(() => {
    setKpiStyle({ opacity: 0, transform: 'translateY(-4px)' });
    const timer = setTimeout(() => {
      setKpiStyle({ opacity: 1, transform: 'translateY(0)' });
    }, 20);
    return () => clearTimeout(timer);
  }, [activeBeat]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.4,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === beat1Ref.current) setActiveBeat(1);
          if (entry.target === beat2Ref.current) setActiveBeat(2);
          if (entry.target === beat3Ref.current) setActiveBeat(3);
        }
      });
    }, options);

    if (beat1Ref.current) observer.observe(beat1Ref.current);
    if (beat2Ref.current) observer.observe(beat2Ref.current);
    if (beat3Ref.current) observer.observe(beat3Ref.current);

    return () => observer.disconnect();
  }, []);

  const kpiConfig: Record<number, any> = {
    1: { label: "Origination rate", value: "74%", delta: "↑ Recovering toward baseline", deltaColor: "#639922" },
    2: { label: "Refi volume peak", value: "+240%", delta: "2012 vs 2010 baseline", deltaColor: "#EF9F27" },
    3: { label: "Gov-backed 2017", value: "33%", delta: "New structural normal", deltaColor: "#639922" },
  };

  const currentKPI = kpiConfig[activeBeat] || kpiConfig[1];

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
          <div key={activeBeat} style={{ ...kpiStyle, transition: 'opacity 0.3s ease, transform 0.3s ease' }}>
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
        <section ref={beat1Ref} className="min-h-[80vh] mb-32 flex flex-col justify-center translate-y-20">
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

        {/* Beat 2 Section */}
        <section ref={beat2Ref} className="min-h-[80vh] mb-32 flex flex-col justify-center">
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

        {/* Beat 3 Section */}
        <section ref={beat3Ref} className="min-h-[80vh] mb-12 flex flex-col justify-center">
          <div className="mb-4">
            <h3 className="text-[18px] text-white font-[400] mb-1">Government lending never retreated.</h3>
            <p className="text-[13px] text-[#666] m-0">Loan type composition 2007–2017 — share of originated loans</p>
          </div>
          
          <div className="bg-[#1a1a1a] rounded-lg p-4 w-full h-[320px] relative">
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
                  label={{ position: 'center', value: 'New normal: ~33%', fill: 'white', fontSize: 11, fontWeight: 500 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
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
