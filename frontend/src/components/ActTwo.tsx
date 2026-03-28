import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, ComposedChart, ReferenceArea, ReferenceDot } from 'recharts';

interface ActTwoProps {
  onPrev: () => void;
  onNext: () => void;
  chartData: any;
}

export const ActTwo: React.FC<ActTwoProps> = ({ onPrev, onNext, chartData }) => {
  const section1Ref = useRef<HTMLElement>(null);
  const section2Ref = useRef<HTMLElement>(null);
  const section3Ref = useRef<HTMLElement>(null);
  const [activeBeat, setActiveBeat] = useState<number>(1);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === 'beat-1') setActiveBeat(1);
            if (entry.target.id === 'beat-2') setActiveBeat(2);
            if (entry.target.id === 'beat-3') setActiveBeat(3);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (section1Ref.current) observer.observe(section1Ref.current);
    if (section2Ref.current) observer.observe(section2Ref.current);
    if (section3Ref.current) observer.observe(section3Ref.current);

    return () => observer.disconnect();
  }, []);

  // Compute Data Mappings
  const gapDataFull = chartData?.chart1 ?? [];
  const beat1Data = gapDataFull.map((d: any) => ({ ...d, gap_fill: d.applications }));

  const refiData = chartData?.chart4 ?? [];
  const beat2Data = refiData;

  const loanTypeDataFull = chartData?.chart2 ?? [];
  const beat3Data = loanTypeDataFull;
  
  const govBacked2017 = loanTypeDataFull.find((d: any) => d.year === 2017)
    ? Math.round(loanTypeDataFull.find((d: any) => d.year === 2017).govt_backed)
    : 33;

  // Dynamic Metrics mapped to active timeline bounds
  const gaugeFillHeight = activeBeat === 1 ? '40%' : activeBeat === 2 ? '65%' : '80%';
  const gaugeSubLabel = activeBeat === 1 ? 'recovery starting' : activeBeat === 2 ? 'refi wave accelerating' : 'new normal established';
  const provQuestion = activeBeat === 1 
    ? "When does a crisis stop getting worse?" 
    : activeBeat === 2 
    ? "What does a government rate cut look like in data?"
    : "What if the recovery came with a catch?";

  return (
    <div className="flex w-full min-h-screen bg-[#111] text-white font-sans overflow-x-hidden">
      
      {/* Left Column: Fixed/Sticky */}
      <div className="w-[35%] h-screen sticky top-0 px-12 py-16 flex flex-col border-r border-white/5 bg-[#111] z-20">
        
        {/* Recovery Meter */}
        <div className="flex flex-col mb-12">
          <label className="text-[11px] text-[#444] mb-3 uppercase tracking-wider">Recovery progress</label>
          <div className="flex gap-6 items-end">
            <div className="w-[40px] h-[200px] rounded-full bg-[#1a1a1a] border border-[#222] relative overflow-hidden flex flex-col justify-end">
              <div 
                className="w-full bg-[#639922] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full"
                style={{ height: gaugeFillHeight }}
              />
            </div>
            <div className="flex flex-col pb-2">
              <span className="text-[14px] font-bold text-white tracking-wide">{gaugeSubLabel}</span>
            </div>
          </div>
        </div>

        {/* You Are Here */}
        <div className="flex flex-col mb-8">
          <div className="flex gap-1 mb-3">
            <div className={`h-[2px] rounded-full transition-all duration-300 ${activeBeat === 1 ? 'w-[24px] bg-white' : 'w-[12px] bg-[#333]'}`}></div>
            <div className={`h-[2px] rounded-full transition-all duration-300 ${activeBeat === 2 ? 'w-[24px] bg-white' : 'w-[12px] bg-[#333]'}`}></div>
            <div className={`h-[2px] rounded-full transition-all duration-300 ${activeBeat === 3 ? 'w-[24px] bg-white' : 'w-[12px] bg-[#333]'}`}></div>
          </div>
          <div className="text-[13px] text-[#888]">The Climb Back · 2011–2017</div>
        </div>

        {/* Filler */}
        <div className="flex-1"></div>

        {/* Provocative Question */}
        <div className="text-[13px] text-[#555] italic max-w-[170px] mb-8 transition-opacity duration-300" key={activeBeat}>
          {provQuestion}
        </div>

        {/* Footer Nav */}
        <div className="flex items-center gap-6 mt-auto border-t border-white/5 pt-6">
          <button onClick={onPrev} className="text-[13px] text-[#555] hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0">
            &larr; Before
          </button>
          <span className="text-[12px] text-[#333]">3 of 5</span>
          <button onClick={onNext} className="text-[13px] text-[#555] hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0">
            After &rarr;
          </button>
        </div>
      </div>

      {/* Right Column: Content */}
      <div className="w-[65%] min-h-screen bg-[#0a0a0a]">
        
        {/* Beat 1 Section */}
        <section id="beat-1" ref={section1Ref} className="min-h-screen px-12 py-32 flex flex-col justify-center">
          
          {/* Moment Card */}
          <div className="w-full bg-[#0f0f0f] border-l-[3px] border-[#639922] p-[20px_24px] mb-12">
            <div className="inline-block bg-[#639922]/10 text-[#639922] text-[11px] font-bold px-2 py-0.5 rounded-full mb-4 uppercase tracking-wider">
              2012
            </div>
            <div className="text-[16px] text-white font-light mb-1">
              For three straight years, the gap only grew.
            </div>
            <div className="text-[16px] text-[#639922] font-light">
              Then, in 2012, it started closing.
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-4 w-full h-[340px] relative">
            {!beat1Data || beat1Data.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-[#666]">—</div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={beat1Data}>
                <XAxis dataKey="year" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 8]} ticks={[0, 2, 4, 6, 8]} label={{ value: 'Millions', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 11 }} stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                
                <ReferenceArea x1={2007} x2={2008} fill="#378ADD" fillOpacity={0.03} />
                <ReferenceArea x1={2008} x2={2011} fill="#E24B4A" fillOpacity={0.03} />
                <ReferenceArea x1={2011} x2={2017} fill="#639922" fillOpacity={0.03} />

                <ReferenceLine x={2009} stroke="#E24B4A" strokeDasharray="3 3" strokeOpacity={0.8} label={{ position: 'top', value: 'The floor', fill: '#E24B4A', fontSize: 11 }} />
                <ReferenceLine x={2012} stroke="#639922" strokeDasharray="3 3" strokeOpacity={0.4} label={{ position: 'top', value: 'Recovery begins', fill: '#639922', fontSize: 11 }} />

                <Area type="monotone" dataKey="gap_fill" stroke="none" fill="#E24B4A" fillOpacity={0.3} isAnimationActive={true} />
                <Area type="monotone" dataKey="originations" stroke="none" fill="#1a1a1a" fillOpacity={1} isAnimationActive={false} activeDot={false} />
                <Area type="monotone" dataKey="applications" stroke="#378ADD" strokeWidth={2} fill="#378ADD" fillOpacity={0.15} isAnimationActive={true} />
                <Area type="monotone" dataKey="originations" stroke="#639922" strokeWidth={2} fill="#639922" fillOpacity={0.15} isAnimationActive={true} />
              </ComposedChart>
            </ResponsiveContainer>
            )}
          </div>

          {/* Turning Point Highlight */}
          <div className="w-full bg-[#0a1a0a] border border-[#1a3a1a] rounded p-[16px_20px] mt-12 flex flex-col justify-center">
            <div className="text-[11px] text-[#639922] uppercase tracking-wider font-bold mb-1">2012</div>
            <div className="text-[16px] text-white font-light mb-6">The inflection point</div>
            <div className="flex items-center gap-4">
              <div className="border border-[#333] p-[6px_10px] flex flex-col items-center">
                <span className="text-white text-[14px]">84%</span>
                <span className="text-[#555] text-[10px] mt-1">2007</span>
              </div>
              <span className="text-[#333]">&rarr;</span>
              <div className="border border-[#E24B4A] p-[6px_10px] flex flex-col items-center">
                <span className="text-white text-[14px]">55%</span>
                <span className="text-[#E24B4A] text-[10px] mt-1">2009</span>
              </div>
              <span className="text-[#333]">&rarr;</span>
              <div className="border border-[#639922] p-[6px_10px] flex flex-col items-center shadow-[0_0_15px_rgba(99,153,34,0.1)]">
                <span className="text-white text-[14px] font-bold">65%</span>
                <span className="text-[#639922] text-[10px] mt-1 font-bold">2012</span>
              </div>
              <span className="text-[#333]">&rarr;</span>
              <div className="border border-[#333] p-[6px_10px] flex flex-col items-center">
                <span className="text-white text-[14px]">74%</span>
                <span className="text-[#555] text-[10px] mt-1">2017</span>
              </div>
            </div>
          </div>
        </section>

        {/* Beat 2 Section */}
        <section id="beat-2" ref={section2Ref} className="min-h-screen px-12 py-32 flex flex-col justify-center border-t border-[#111]">
          
          {/* Moment Card */}
          <div className="w-full bg-[#0f0f0f] border-l-[3px] border-[#EF9F27] p-[20px_24px] mb-12">
            <div className="inline-block bg-[#EF9F27]/10 text-[#EF9F27] text-[11px] font-bold px-2 py-0.5 rounded-full mb-4 uppercase tracking-wider">
              2012–2013
            </div>
            <div className="text-[16px] text-white font-light mb-1">
              The Fed cut rates to near zero.
            </div>
            <div className="text-[16px] text-[#EF9F27] font-light">
              Homeowners refinanced en masse.
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-4 w-full h-[300px] relative">
            {!beat2Data || beat2Data.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-[#666]">—</div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={beat2Data}>
                <XAxis dataKey="year" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 400]} ticks={[0, 100, 200, 300, 400]} label={{ value: 'Index (2010=100)', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 11 }} stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <ReferenceLine y={100} stroke="#666" strokeDasharray="4 4" label={{ position: 'left', value: '2010 baseline', fill: '#666', fontSize: 11 }} />
                <Area type="monotone" dataKey="refi_index" stroke="#EF9F27" strokeWidth={2} fill="#EF9F27" fillOpacity={0.2} isAnimationActive={true} dot={(props: any) => {
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
            )}
          </div>

          {/* Cause & Effect Display */}
          <div className="w-full mt-16 flex items-center justify-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-[#555] text-[10px] uppercase tracking-wider mb-2 font-bold">FED ACTION</span>
              <span className="text-white text-[28px] font-[200] leading-none">Near-zero</span>
              <span className="text-[#555] text-[12px] mt-2">interest rates</span>
              <span className="text-[#333] text-[11px] mt-1">2008–2015</span>
            </div>
            
            <div className="flex flex-col items-center justify-center px-4">
              <span className="text-[#333] text-[32px] font-light">&rarr;</span>
              <span className="text-[#444] text-[11px] italic mt-1">led to</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[#555] text-[10px] uppercase tracking-wider mb-2 font-bold">MARKET RESPONSE</span>
              <span className="text-[#EF9F27] text-[28px] font-[200] leading-none">+240%</span>
              <span className="text-[#555] text-[12px] mt-2">refi volume</span>
              <span className="text-[#333] text-[11px] mt-1">by 2013</span>
            </div>
          </div>
        </section>

        {/* Beat 3 Section */}
        <section id="beat-3" ref={section3Ref} className="min-h-screen px-12 py-32 flex flex-col justify-center border-t border-[#111]">
          
          {/* Moment Card */}
          <div className="w-full bg-[#0f0f0f] border-l-[3px] border-[#639922] p-[20px_24px] mb-12">
            <div className="inline-block bg-[#639922]/10 text-[#639922] text-[11px] font-bold px-2 py-0.5 rounded-full mb-4 uppercase tracking-wider">
              2017
            </div>
            <div className="text-[16px] text-white font-light mb-1">
              The market recovered.
            </div>
            <div className="text-[16px] text-[#639922] font-light">
              But government lending never went back to 12%.
            </div>
            <div className="text-[#555] text-[12px] mt-3 tracking-wide">
              That dashed line below? That's where it used to be.
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-4 w-full h-[320px] relative">
            {!beat3Data || beat3Data.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-[#666]">—</div>
            ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={beat3Data} stackOffset="expand">
                <XAxis dataKey="year" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 1]} ticks={[0, 0.25, 0.5, 0.75, 1]} tickFormatter={(tick) => `${Math.round(tick * 100)}%`} stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
                
                <ReferenceArea x1={2008} x2={2011} fill="#E24B4A" fillOpacity={0.05} label={{ position: 'top', value: 'Crisis period', fill: '#E24B4A', opacity: 0.4, fontSize: 10 }} />
                <ReferenceLine y={0.12} stroke="#639922" strokeDasharray="6 3" strokeWidth={1.5} label={{ position: 'insideBottomRight', value: '2007 baseline: 12%', fill: '#639922', fontSize: 11 }} />

                <Area type="monotone" dataKey="conventional" stackId="1" stroke="none" fill="#378ADD" fillOpacity={0.8} isAnimationActive={true} />
                <Area type="monotone" dataKey="govt_backed" stackId="1" stroke="none" fill="#639922" fillOpacity={0.8} isAnimationActive={true} />
                
                <ReferenceDot x={2015} y={0.84} r={0} label={{ position: 'center', value: `New normal: ~${govBacked2017}%`, fill: 'white', fontSize: 11, fontWeight: 500 }} />
              </AreaChart>
            </ResponsiveContainer>
            )}
          </div>

          {/* Forward Looking Sponsor Card */}
          <div className="w-full bg-[#0a0f0a] border border-[#1a2a1a] rounded p-[20px_24px] mt-16">
            <div className="text-[#555] text-[11px] uppercase tracking-wider mb-6 font-bold">
              If you're a banker in 2018, this matters because:
            </div>
            
            <div className="border-l-[2px] border-[#639922] pl-[12px] mb-[10px]">
              <div className="text-[13px] text-[#9ca3af] leading-[1.6]">
                FHA/VA compliance is now a core competency, not a niche
              </div>
            </div>
            <div className="border-l-[2px] border-[#639922] pl-[12px] mb-[10px]">
              <div className="text-[13px] text-[#9ca3af] leading-[1.6]">
                33% of your loan book is government-risk, not market-risk
              </div>
            </div>
            <div className="border-l-[2px] border-[#639922] pl-[12px] mb-[10px]">
              <div className="text-[13px] text-[#9ca3af] leading-[1.6]">
                The borrower who gets a conventional loan is a different person than they were in 2007
              </div>
            </div>
          </div>
        </section>

        {/* Bridge Section */}
        <div className="w-full bg-[#050505] flex flex-col items-center justify-center py-24 relative mt-16 pb-32">
          <div className="text-[32px] text-white font-[200]">
            The market changed.
          </div>
          <div className="text-[28px] text-[#639922] font-[200] mt-1">
            So did the people in it.
          </div>
          
          <style>{`
            @keyframes arrowPulse {
              0%, 100% { transform: translateX(0); opacity: 0.5; }
              50% { transform: translateX(8px); opacity: 1; }
            }
            .animate-arrow { animation: arrowPulse 2s ease-in-out infinite; }
          `}</style>
          <div className="text-[#333] text-[32px] font-light mt-8 animate-arrow cursor-pointer" onClick={onNext}>
            &rarr;
          </div>
          <div className="text-[12px] text-[#444] tracking-wide mt-2">
            See how behavior shifted
          </div>
        </div>

      </div>
    </div>
  );
};
