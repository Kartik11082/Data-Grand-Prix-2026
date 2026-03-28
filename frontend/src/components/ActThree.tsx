import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

interface ActThreeProps {
  onNext: () => void;
}

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const HIGH_STATES = ["Texas", "Colorado", "District of Columbia", "North Dakota", "South Dakota", "Wyoming", "Montana"];
const MED_STATES = ["California", "New York", "Washington", "Oregon", "Minnesota", "Illinois", "Virginia"];
const LOW_STATES = ["Florida", "Nevada", "Arizona", "Michigan", "Ohio", "Georgia", "North Carolina"];

const groupScores: Record<number, { HIGH: number, MED: number, LOW: number }> = {
  2017: { HIGH: 1.30, MED: 0.95, LOW: 0.75 },
};

const getStateScore = (stateName: string, year: number) => {
  if (HIGH_STATES.includes(stateName)) return groupScores[year]?.HIGH;
  if (MED_STATES.includes(stateName)) return groupScores[year]?.MED;
  if (LOW_STATES.includes(stateName)) return groupScores[year]?.LOW;
  return null;
};

// Map Colors
const get2017Fill = (score: number | null) => {
  if (score === null) return "#222222";
  if (score >= 1.0) return "#639922";
  if (score >= 0.8) return "#EF9F27";
  return "#E24B4A";
};
const get2007Fill = (stateName: string) => {
  if (['California', 'Florida', 'Texas', 'New York', 'Illinois'].includes(stateName)) return '#2563eb'; // High Vol
  if (['Wyoming', 'North Dakota', 'South Dakota', 'Vermont', 'Alaska'].includes(stateName)) return '#1e3a8a'; // Low Vol
  return '#3b82f6'; // Med
};

// Leaderboard Data Arrays
const leaderboard2017_top = [
  { name: "TX", val: "1.42", w: "100%", c: "#639922" },
  { name: "CO", val: "1.38", w: "95%", c: "#639922" },
  { name: "DC", val: "1.31", w: "88%", c: "#639922" },
  { name: "ND", val: "1.28", w: "85%", c: "#639922" },
  { name: "WA", val: "1.19", w: "78%", c: "#639922" },
];
const leaderboard2017_bottom = [
  { name: "NV", val: "0.52", w: "35%", c: "#E24B4A" },
  { name: "FL", val: "0.61", w: "45%", c: "#E24B4A" },
  { name: "AZ", val: "0.64", w: "48%", c: "#E24B4A" },
  { name: "MI", val: "0.67", w: "52%", c: "#E24B4A" },
  { name: "OH", val: "0.71", w: "58%", c: "#E24B4A" },
];
const leaderboard2007_top = [
  { name: "CA", val: "1.2M", w: "100%", c: "#378ADD" },
  { name: "FL", val: "850K", w: "70%", c: "#378ADD" },
  { name: "TX", val: "780K", w: "65%", c: "#378ADD" },
  { name: "NY", val: "690K", w: "58%", c: "#378ADD" },
  { name: "IL", val: "540K", w: "45%", c: "#378ADD" },
];
const leaderboard2007_bottom = [
  { name: "WY", val: "18K", w: "8%", c: "#1e3a8a" },
  { name: "ND", val: "22K", w: "12%", c: "#1e3a8a" },
  { name: "SD", val: "26K", w: "15%", c: "#1e3a8a" },
  { name: "VT", val: "31K", w: "18%", c: "#1e3a8a" },
  { name: "AK", val: "34K", w: "22%", c: "#1e3a8a" },
];

export const ActThree: React.FC<ActThreeProps> = ({ onNext }) => {
  const [era, setEra] = useState<'2007'|'2017'>('2007');

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden font-sans pb-24">
      
      {/* Top Page-Level Framing Strip */}
      <div className="w-full bg-[#0a0a0a] border-b-[0.5px] border-[#1a1a1a] px-6 py-5 sticky top-0 z-50 flex items-center justify-between">
        <div className="text-white text-[18px] font-light">The Behavior Shift</div>
        <div className="flex flex-col items-end">
          <div className="flex gap-2 mb-1">
            <button 
              onClick={() => setEra('2007')}
              className={`px-6 py-1.5 rounded-full text-[13px] transition-colors focus:outline-none cursor-pointer ${era === '2007' ? 'bg-white text-[#111] font-bold' : 'bg-transparent text-[#555] border-[0.5px] border-[#333]'}`}
            >
              2007
            </button>
            <button 
              onClick={() => setEra('2017')}
              className={`px-6 py-1.5 rounded-full text-[13px] transition-colors focus:outline-none cursor-pointer ${era === '2017' ? 'bg-white text-[#111] font-bold' : 'bg-transparent text-[#555] border-[0.5px] border-[#333]'}`}
            >
              2017
            </button>
          </div>
          <div className="text-[11px] text-[#444] italic">Toggle to see what a decade of crisis and recovery changed</div>
        </div>
      </div>

      {/* THREE COLUMNS */}
      <div className="flex w-full gap-12 px-12 pt-12">
        
        {/* LEFT COLUMN: Lenders */}
        <div className="flex-1 flex flex-col">
          <div className="text-white text-[14px] border-b-[0.5px] border-[#1a1a1a] pb-2 mb-8 uppercase tracking-wider">Lenders</div>
          
          {/* Loan Type Bar */}
          <div className="mb-6">
            <div className="text-[#555] text-[11px] mb-2 uppercase tracking-wide">Loan type</div>
            <div className="w-full h-[28px] rounded overflow-hidden flex">
              <div className="h-full bg-[#378ADD] transition-all duration-400 ease-out" style={{ width: era === '2007' ? '88%' : '67%' }} />
              <div className="h-full bg-[#639922] transition-all duration-400 ease-out" style={{ width: era === '2007' ? '12%' : '33%' }} />
            </div>
            <div className="flex justify-between mt-2 text-[11px]">
              <div className="text-[#378ADD] transition-opacity duration-400" key={`conv-${era}`}>Conv. <span className="font-bold">{era === '2007' ? '88%' : '67%'}</span></div>
              <div className="text-[#639922] transition-opacity duration-400" key={`gov-${era}`}>Govt. <span className="font-bold">{era === '2007' ? '12%' : '33%'}</span></div>
            </div>
          </div>

          <div className="h-[24px]" />

          {/* Lien Risk Bar */}
          <div className="mb-10">
            <div className="text-[#555] text-[11px] mb-2 uppercase tracking-wide">Second mortgages</div>
            <div className="w-full h-[28px] rounded overflow-hidden flex">
              <div className="h-full bg-[#333] transition-all duration-400 ease-out" style={{ width: era === '2007' ? '91%' : '97%' }} />
              <div className="h-full bg-[#E24B4A] transition-all duration-400 ease-out" style={{ width: era === '2007' ? '9%' : '3%' }} />
            </div>
            <div className="flex justify-end mt-2 text-[11px]">
              <div className="text-[#E24B4A] transition-opacity duration-400" key={`sec-${era}`}>Risky second mortgages <span className="font-bold">{era === '2007' ? '9%' : '3%'}</span></div>
            </div>
          </div>

          {/* Lender Mindset Summary */}
          <div className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded p-4 text-[13px] text-[#9ca3af] italic mt-auto min-h-[70px] flex items-center shadow-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={era}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                {era === '2007' ? 'Taking on risk was the business model.' : 'Safety first. Government guarantees preferred.'}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>


        {/* CENTER COLUMN: Map */}
        <div className="flex-[1.5] flex flex-col">
          <div className="text-white text-[14px] border-b-[0.5px] border-[#1a1a1a] pb-2 mb-8 uppercase tracking-wider">Geography</div>
          
          <div className="flex-1 min-h-[250px] relative -mt-4 bg-[#0a0a0a]">
            {/* Map explicitly transitioning fills */}
            <ComposableMap projection="geoAlbersUsa" className="w-full h-full max-h-[100%] drop-shadow-lg">
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const stateName = geo.properties.name;
                    const fillStyle = era === '2007' ? get2007Fill(stateName) : get2017Fill(getStateScore(stateName, 2017));
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillStyle}
                        stroke="#0a0a0a"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none", transition: "fill 0.4s ease" },
                          hover: { outline: "none", fill: "#fff" },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>

          {/* Under Map 3-Item Leaderboard */}
          <div className="w-full mt-4 flex flex-col items-center">
            <div className="text-[#555] text-[11px] uppercase tracking-widest mb-3">
              <AnimatePresence mode="wait">
                <motion.div key={era} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
                  {era === '2007' ? 'Top lending states by volume' : 'Fastest recovered states'}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex gap-6 h-[24px]">
              <AnimatePresence mode="wait">
                <motion.div key={era} initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-5}} className="flex items-center justify-center gap-6">
                  {era === '2007' ? (
                    <>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#2563eb]" /> <span className="text-[12px] font-mono text-white/90">CA</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#2563eb]" /> <span className="text-[12px] font-mono text-white/90">NY</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#2563eb]" /> <span className="text-[12px] font-mono text-white/90">TX</span></div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#639922]" /> <span className="text-[12px] font-mono text-white/90">TX</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#639922]" /> <span className="text-[12px] font-mono text-white/90">CO</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#639922]" /> <span className="text-[12px] font-mono text-white/90">DC</span></div>
                      <span className="text-[#333] mx-2">vs</span>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#E24B4A]" /> <span className="text-[12px] font-mono text-white/90">NV</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#E24B4A]" /> <span className="text-[12px] font-mono text-white/90">FL</span></div>
                      <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#E24B4A]" /> <span className="text-[12px] font-mono text-white/90">AZ</span></div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>


        {/* RIGHT COLUMN: Borrowers */}
        <div className="flex-1 flex flex-col">
          <div className="text-white text-[14px] border-b-[0.5px] border-[#1a1a1a] pb-2 mb-8 uppercase tracking-wider">Borrowers</div>
          
          {/* Profile Card */}
          <div className="w-full bg-[#0f0f0f] border border-[#1a1a1a] rounded p-5 relative overflow-hidden flex flex-col min-h-[350px]">
            <div className="text-[#555] text-[11px] uppercase tracking-widest mb-6 font-bold">Typical borrower</div>
            
            <div className="flex flex-col gap-6">
              
              {/* Row 1 */}
              <div className="flex flex-col">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[#555] text-[12px]">Median income</span>
                  <AnimatePresence mode="wait"><motion.span key={`inc-${era}`} initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className="text-white text-[14px]">{era === '2007' ? '$72,000' : '$91,000'}</motion.span></AnimatePresence>
                </div>
                <div className="w-full h-[3px] bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full bg-[#378ADD] transition-all duration-400" style={{ width: era === '2007' ? '60%' : '85%' }} />
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[#555] text-[12px]">Approval rate</span>
                  <AnimatePresence mode="wait">
                    <motion.span key={`app-${era}`} initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className={`text-[14px] font-bold ${era === '2007' ? 'text-[#639922]' : 'text-[#EF9F27]'}`}>
                      {era === '2007' ? '84%' : '74%'}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <div className="w-full h-[3px] bg-[#1a1a1a] rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-400" style={{ width: era === '2007' ? '84%' : '74%', backgroundColor: era === '2007' ? '#639922' : '#EF9F27' }} />
                </div>
              </div>

              {/* Row 3 */}
              <div className="flex flex-col">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[#555] text-[12px]">Loan purpose</span>
                  <AnimatePresence mode="wait">
                    <motion.span key={`purp-${era}`} initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className="text-white text-[13px] flex items-center gap-1">
                      {era === '2007' ? 'Buying a home (52%) ↓' : 'Refinancing (48%) ↑'}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

              {/* Row 4 */}
              <div className="flex flex-col">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[#555] text-[12px]">Loan type received</span>
                  <AnimatePresence mode="wait">
                    <motion.span key={`ty-${era}`} initial={{opacity:0, y:-5}} animate={{opacity:1, y:0}} className={`text-[13px] ${era === '2007' ? 'text-white' : 'text-[#639922] font-bold'}`}>
                      {era === '2007' ? 'Conventional (private)' : 'Often FHA-backed (govt)'}
                    </motion.span>
                  </AnimatePresence>
                </div>
              </div>

            </div>

            {/* Bottom Summary */}
            <div className="mt-auto border-t-[0.5px] border-[#1a1a1a] pt-4 text-[12px] text-[#555] italic">
              <AnimatePresence mode="wait">
                <motion.div key={`sum-${era}`} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{ duration: 0.2 }}>
                  {era === '2007' ? "The 2007 borrower had less income but easier access." : "The 2017 borrower earns more but faces tighter standards."}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      {/* FULL WIDTH RECOVERY LEADERBOARD */}
      <div className="w-full mt-16 px-12 pb-12 opacity-90">
        <div className="text-center text-[12px] uppercase tracking-widest text-[#555] mb-8 font-bold border-b border-[#1a1a1a] pb-4">
          <AnimatePresence mode="wait">
            <motion.div key={`lb-${era}`} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
              {era === '2007' ? 'Top 5 / Bottom 5 by loan volume 2007' : 'Recovery index by 2017'}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="flex w-full gap-24">
          {/* Top 5 */}
          <div className="flex-1">
            <div className="flex flex-col gap-3">
              {(era === '2007' ? leaderboard2007_top : leaderboard2017_top).map(item => (
                <div key={`${era}-top-${item.name}`} className="flex items-center gap-4 text-xs font-mono">
                  <span className="w-6 text-white/70">{item.name}</span>
                  <div className="flex-1 h-3 bg-[#111] rounded overflow-hidden">
                    <motion.div 
                      className="h-full" 
                      style={{ backgroundColor: item.c }} 
                      initial={{ width: 0 }} 
                      animate={{ width: item.w }} 
                      transition={{ duration: 0.5, ease: "easeOut" }} 
                    />
                  </div>
                  <span className="w-8 text-right text-white/80">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom 5 */}
          <div className="flex-1">
            <div className="flex flex-col gap-3">
              {(era === '2007' ? leaderboard2007_bottom : leaderboard2017_bottom).map(item => (
                <div key={`${era}-bot-${item.name}`} className="flex items-center gap-4 text-xs font-mono">
                  <span className="w-6 text-white/70">{item.name}</span>
                  <div className="flex-1 h-3 bg-[#111] rounded overflow-hidden">
                    <motion.div 
                      className="h-full" 
                      style={{ backgroundColor: item.c }} 
                      initial={{ width: 0 }} 
                      animate={{ width: item.w }} 
                      transition={{ duration: 0.5, ease: "easeOut" }} 
                    />
                  </div>
                  <span className="w-8 text-right text-white/80">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="w-full flex justify-center pb-8 mt-16">
          <motion.button
            onClick={onNext}
            className="px-10 py-4 bg-white text-[#111] font-bold rounded-lg hover:bg-white/90 transition-all cursor-pointer shadow-white/10 shadow-lg"
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
