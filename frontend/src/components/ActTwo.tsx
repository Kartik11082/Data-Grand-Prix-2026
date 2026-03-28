import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface ActTwoProps {
  onNext: () => void;
}

const beat1Data = [
  { year: 2007, apps: 6.8, orig: 5.7 },
  { year: 2008, apps: 5.9, orig: 4.1 },
  { year: 2009, apps: 4.2, orig: 2.3 },
  { year: 2010, apps: 4.5, orig: 2.5 },
  { year: 2011, apps: 4.8, orig: 2.8 },
  { year: 2012, apps: 5.4, orig: 3.5 },
  { year: 2013, apps: 5.1, orig: 3.3 },
  { year: 2014, apps: 5.3, orig: 3.6 },
  { year: 2015, apps: 5.6, orig: 3.9 },
  { year: 2016, apps: 5.8, orig: 4.1 },
  { year: 2017, apps: 6.1, orig: 4.5 },
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

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-30% 0px -30% 0px',
      threshold: 0,
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

  const kpiData = {
    1: { label: "Origination Rate", value: "74%", delta: "↑ Recovering", color: "#3B6D11" },
    2: { label: "Refi Volume Peak", value: "+340%", delta: "2012–2013", color: "#EF9F27" },
    3: { label: "Gov-backed 2017", value: "33%", delta: "New normal", color: "#639922" },
  };

  const currentKPI = kpiData[activeBeat as 1 | 2 | 3] || kpiData[1];

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
          <div className="absolute -right-4 -bottom-4 w-24 h-24 blur-[60px]" style={{ backgroundColor: currentKPI.color, opacity: 0.2 }}></div>
        </div>
      </div>

      {/* Right Column: Scrollable Content */}
      <div className="w-[65%] min-h-screen p-12 bg-[#0a0a0a]">
        
        {/* Beat 1 Section */}
        <section ref={beat1Ref} className="min-h-[80vh] mb-32 flex flex-col justify-center translate-y-20">
          <h3 className="text-3xl font-light mb-12">The gap started closing</h3>
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-white/5 shadow-xl h-[400px] relative">
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
            
            <div className="absolute left-[24%] top-[68%] flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-white mb-2"></div>
                <span className="text-[10px] text-white/50 uppercase tracking-widest bg-black/50 px-1 py-0.5 rounded">The floor</span>
            </div>
            <div className="absolute left-[54%] top-[40%] flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-white mb-2"></div>
                <span className="text-[10px] text-white/50 uppercase tracking-widest bg-black/50 px-1 py-0.5 rounded">Recovery begins</span>
            </div>
          </div>
        </section>

        {/* Beat 2 Section */}
        <section ref={beat2Ref} className="min-h-[80vh] mb-32 flex flex-col justify-center">
          <h3 className="text-3xl font-light mb-12">The Fed cut rates. Borrowers refinanced en masse.</h3>
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-white/5 shadow-xl h-[400px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={beat2Data}>
                <XAxis dataKey="year" stroke="#333" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Area 
                  type="monotone" 
                  dataKey="refi_index" 
                  stroke="#EF9F27" 
                  fill="#EF9F27" 
                  fillOpacity={0.2} 
                  strokeWidth={2}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
            
            <div className="absolute left-[34%] top-[20%] flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-white mb-2"></div>
                <span className="text-[11px] font-bold text-white bg-[#EF9F27]/20 border border-[#EF9F27]/50 px-2 py-1 backdrop-blur-sm rounded">Fed rate cuts</span>
            </div>
          </div>
          
          <div className="flex gap-4 mt-8">
            <span className="bg-[#EF9F27]/10 text-white/90 text-[12px] font-medium px-4 py-2 rounded-full border border-[#EF9F27]/30 uppercase tracking-wider">
              Refi volume +340% from 2010 to 2013 peak
            </span>
          </div>
        </section>

        {/* Beat 3 Section */}
        <section ref={beat3Ref} className="min-h-[80vh] mb-12 flex flex-col justify-center">
          <h3 className="text-3xl font-light mb-12">Government lending never retreated.</h3>
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-white/5 shadow-xl h-[400px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={beat3Data} stackOffset="expand">
                <XAxis dataKey="year" stroke="#333" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis hide />
                <ReferenceLine y={0.12} stroke="white" strokeDasharray="3 3" opacity={0.5} />
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
            
            <div className="absolute right-0 top-[83%] pointer-events-none translate-x-[110%] w-max hidden 2xl:block">
                <span className="text-[11px] font-medium text-white/70 tracking-wider">2007 baseline: 12%</span>
            </div>
            <div className="absolute right-8 top-[80%] pointer-events-none bg-black/50 px-2 py-1 rounded">
                <span className="text-[11px] font-medium text-white/70 tracking-wider">2007 baseline: 12%</span>
            </div>
            
             <div className="absolute right-8 top-[63%] pointer-events-none bg-black/50 px-2 py-1 rounded">
                <span className="text-[11px] font-bold text-white tracking-wider">New normal: 33%</span>
            </div>
          </div>
        </section>

        {/* Bottom Page Transition */}
        <div className="w-full flex flex-col items-center justify-center py-24">
          <div className="text-3xl font-light flex items-center">
            The market came back. But it came back different.
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
