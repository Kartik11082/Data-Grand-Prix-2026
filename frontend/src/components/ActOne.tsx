import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ComposedChart, ReferenceLine } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface ActOneProps {
  onPrev: () => void;
  onNext: () => void;
  chartData: any;
}

export const ActOne: React.FC<ActOneProps> = ({ onPrev, onNext, chartData }) => {
  const section1Ref = useRef<HTMLElement>(null);
  const section2Ref = useRef<HTMLElement>(null);
  const [activeBeat, setActiveBeat] = useState<number>(1);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === 'beat-1') setActiveBeat(1);
            if (entry.target.id === 'beat-2') setActiveBeat(2);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (section1Ref.current) observer.observe(section1Ref.current);
    if (section2Ref.current) observer.observe(section2Ref.current);

    return () => observer.disconnect();
  }, []);

  // Compute Data
  const gapDataFull = chartData?.chart1 ?? [];
  const gapData = gapDataFull
    .filter((d: any) => d.year <= 2010)
    .map((d: any) => ({ ...d, gap_fill: d.applications }));

  const loanTypeDataFull = chartData?.chart2 ?? [];
  const beat2Data = loanTypeDataFull.filter((d: any) => d.year <= 2010);

  // Dynamic Left Column Logic
  const gaugeFillHeight = activeBeat === 1 ? '65%' : '80%';
  const gaugeValue = activeBeat === 1 ? '55%' : '46%';
  const gaugeSubLabel = activeBeat === 1 ? 'loans originated' : 'govt-backed';
  const provQuestion = activeBeat === 1 
    ? "What happens when a bank stops trusting its customers?" 
    : "Who lends when private banks won't?";

  return (
    <div className="flex w-full min-h-screen bg-[#111] text-white font-sans overflow-x-hidden">
      
      {/* Left Column: Fixed/Sticky */}
      <div className="w-[35%] h-screen sticky top-0 px-12 py-16 flex flex-col border-r border-white/5 bg-[#111] z-20">
        
        {/* Pressure Gauge */}
        <div className="flex flex-col mb-12">
          <label className="text-[11px] text-[#444] mb-3 uppercase tracking-wider">Crisis severity</label>
          <div className="flex gap-6 items-end">
            <div className="w-[40px] h-[200px] rounded-full bg-[#1a1a1a] border border-[#222] relative overflow-hidden flex flex-col justify-end">
              <div 
                className="w-full bg-[#E24B4A] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full"
                style={{ height: gaugeFillHeight }}
              />
            </div>
            <div className="flex flex-col pb-2">
              <span className="text-[48px] font-light text-white leading-none tracking-tight">{gaugeValue}</span>
              <span className="text-[13px] text-[#888] mt-1">{gaugeSubLabel}</span>
            </div>
          </div>
        </div>

        {/* You Are Here */}
        <div className="flex flex-col mb-8">
          <div className="flex gap-1 mb-3">
            <div className="h-[2px] w-[24px] bg-white rounded-full transition-colors duration-300"></div>
            <div className="h-[2px] w-[12px] bg-[#333] rounded-full transition-colors duration-300"></div>
            <div className="h-[2px] w-[12px] bg-[#333] rounded-full transition-colors duration-300"></div>
          </div>
          <div className="text-[13px] text-[#888]">The Collapse · 2008–2010</div>
        </div>

        {/* Filler */}
        <div className="flex-1"></div>

        {/* Provocative Question */}
        <div 
          className="text-[13px] text-[#555] italic max-w-[160px] mb-8 transition-opacity duration-300"
          key={activeBeat}
        >
          {provQuestion}
        </div>

        {/* Footer Nav */}
        <div className="flex items-center gap-6 mt-auto border-t border-white/5 pt-6">
          <button 
            onClick={onPrev}
            className="text-[13px] text-[#555] hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            &larr; Before
          </button>
          <span className="text-[12px] text-[#333]">2 of 5</span>
          <button 
            onClick={onNext}
            className="text-[13px] text-[#555] hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            After &rarr;
          </button>
        </div>
      </div>

      {/* Right Column: Scrollable Pages */}
      <div className="w-[65%] min-h-screen bg-[#0a0a0a]">
        
        {/* Beat 1 Section */}
        <section id="beat-1" ref={section1Ref} className="min-h-screen px-12 py-32 flex flex-col justify-center">
          
          {/* Moment Card */}
          <div className="w-full bg-[#0f0f0f] border-l-[3px] border-[#E24B4A] p-[20px_24px] mb-12">
            <div className="inline-block bg-[#E24B4A]/10 text-[#E24B4A] text-[11px] font-bold px-2 py-0.5 rounded-full mb-4 uppercase tracking-wider">
              2008
            </div>
            <div className="text-[16px] text-white font-light mb-1">
              Banks approved 84 of every 100 applications in 2007.
            </div>
            <div className="text-[16px] text-[#E24B4A] font-light">
              By 2009, that number was 55.
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-4 w-full h-[320px] relative">
            
            {/* Tooltip Button */}
            <div className="absolute top-4 right-4 z-10">
              <button 
                className="w-6 h-6 rounded-full bg-[#222] border border-[#333] flex items-center justify-center text-[#888] text-[12px] hover:text-white hover:bg-[#333] transition-colors cursor-pointer"
                onClick={() => setShowTooltip(!showTooltip)}
              >
                ?
              </button>
              
              <AnimatePresence>
                {showTooltip && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowTooltip(false)} 
                    />
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-8 right-0 w-[240px] bg-[#111] border border-[#333] rounded-md p-4 shadow-xl z-50 text-[12px] text-[#aaa] leading-relaxed"
                    >
                      Blue line = everyone who applied for a mortgage.<br/><br/>
                      Green line = everyone who actually got one.<br/><br/>
                      <span className="text-[#E24B4A]">Red zone = people who got denied.</span>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Gap Chart */}
            {!gapData || gapData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-[#666]">—</div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={gapData}>
                <XAxis dataKey="year" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 8]} ticks={[0, 2, 4, 6, 8]} stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <ReferenceLine x={2009} stroke="#E24B4A" strokeDasharray="3 3" strokeOpacity={0.6} />
                <Area type="monotone" dataKey="gap_fill" stroke="none" fill="#E24B4A" fillOpacity={0.3} isAnimationActive={true} />
                <Area type="monotone" dataKey="originations" stroke="none" fill="#1a1a1a" fillOpacity={1} isAnimationActive={false} activeDot={false} />
                <Area type="monotone" dataKey="applications" stroke="#378ADD" strokeWidth={2} fill="#378ADD" fillOpacity={0.15} isAnimationActive={true} />
                <Area type="monotone" dataKey="originations" stroke="#639922" strokeWidth={2} fill="#639922" fillOpacity={0.15} isAnimationActive={true} />
              </ComposedChart>
            </ResponsiveContainer>
            )}
          </div>

          {/* Key Insight Strip */}
          <div className="w-full bg-[#0a0a0a] py-6 mt-12 flex items-center justify-start">
            <div className="flex flex-col pr-8 border-r border-[#222]">
              <span className="text-[24px] text-white font-light">6.8M</span>
              <span className="text-[11px] text-[#555] uppercase tracking-wider mt-1">Applications, 2007</span>
            </div>
            <div className="flex flex-col px-8 border-r border-[#222]">
              <span className="text-[24px] text-white font-light">2.3M</span>
              <span className="text-[11px] text-[#555] uppercase tracking-wider mt-1">Originated, 2009</span>
            </div>
            <div className="flex flex-col pl-8">
              <span className="text-[24px] text-white font-light">&minus;66%</span>
              <span className="text-[11px] text-[#555] uppercase tracking-wider mt-1">Drop in approvals</span>
            </div>
          </div>
        </section>

        {/* Beat 2 Section */}
        <section id="beat-2" ref={section2Ref} className="min-h-screen px-12 py-32 flex flex-col justify-center border-t border-[#111]">
          
          {/* Moment Card */}
          <div className="w-full bg-[#0f0f0f] border-l-[3px] border-[#639922] p-[20px_24px] mb-12">
            <div className="inline-block bg-[#639922]/10 text-[#639922] text-[11px] font-bold px-2 py-0.5 rounded-full mb-4 uppercase tracking-wider">
              2009
            </div>
            <div className="text-[16px] text-white font-light mb-1">
              Private lenders had two choices: lend and risk losses,
            </div>
            <div className="text-[16px] text-[#639922] font-light">
              or let the government do it instead.
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-4 w-full h-[320px] relative">
            {!beat2Data || beat2Data.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-[#666]">—</div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={beat2Data} stackOffset="expand">
                <XAxis dataKey="year" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(tick) => `${Math.round(tick * 100)}%`} ticks={[0, 0.25, 0.5, 0.75, 1]} stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <ReferenceLine x={2009} stroke="#fff" strokeDasharray="3 3" strokeOpacity={0.3} />
                <Area type="monotone" dataKey="conventional" stackId="1" stroke="none" fill="#378ADD" fillOpacity={0.85} isAnimationActive={true} />
                <Area type="monotone" dataKey="govt_backed" stackId="1" stroke="none" fill="#639922" fillOpacity={0.85} isAnimationActive={true} />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>

          {/* Shift Visualizer */}
          <div className="w-full mt-16 mb-12 flex flex-col items-center">
            <div className="flex items-center justify-center gap-12 w-full">
              <div className="flex flex-col items-center">
                <span className="text-[#378ADD] text-[48px] font-[200] leading-none mb-2">88%</span>
                <span className="text-[#555] text-[12px] uppercase tracking-wider">Conventional</span>
                <span className="text-[#333] text-[11px] mt-1 font-bold">2007</span>
              </div>
              <div className="text-[#333] text-[32px] font-light">&rarr;</div>
              <div className="flex flex-col items-center">
                <span className="text-[#378ADD] text-[48px] font-[200] leading-none mb-2">54%</span>
                <span className="text-[#555] text-[12px] uppercase tracking-wider">Conventional</span>
                <span className="text-[#E24B4A] text-[11px] mt-1 font-bold">2009</span>
              </div>
            </div>
            <div className="text-[#555] text-[12px] mt-8 tracking-wide">
              34 point collapse in two years
            </div>
          </div>
        </section>

        {/* Bridge Section */}
        <div className="w-full h-[180px] flex flex-col items-center justify-center pb-12 relative" 
             style={{ background: 'linear-gradient(to bottom, #0a0a0a, #050505)' }}>
          <div className="text-[32px] text-white font-[200]">
            Then the floor held.
          </div>
          <div className="text-[14px] text-[#333] mt-2 font-bold tracking-wider">
            2010
          </div>
          <div className="w-[60px] h-[1px] bg-[#222] mt-6 mb-6" />
          <div className="text-[12px] text-[#444] tracking-wide relative">
            <style>{`
              @keyframes chevron-bob {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(4px); }
              }
              .animate-chevron { animation: chevron-bob 2s ease-in-out infinite; }
            `}</style>
            Scroll to see the recovery
          </div>
          <div className="text-[#444] mt-3 animate-chevron">
            <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
