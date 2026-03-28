import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

interface ActThreeProps {
  onNext: () => void;
}

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const HIGH_STATES = ["Texas", "Colorado", "District of Columbia", "North Dakota", "South Dakota", "Wyoming", "Montana"];
const MED_STATES = ["California", "New York", "Washington", "Oregon", "Minnesota", "Illinois", "Virginia"];
const LOW_STATES = ["Florida", "Nevada", "Arizona", "Michigan", "Ohio", "Georgia", "North Carolina"];

const groupScores: Record<number, { HIGH: number, MED: number, LOW: number }> = {
  2011: { HIGH: 0.85, MED: 0.60, LOW: 0.40 },
  2012: { HIGH: 0.95, MED: 0.75, LOW: 0.45 },
  2013: { HIGH: 1.10, MED: 0.85, LOW: 0.55 },
  2014: { HIGH: 1.05, MED: 0.80, LOW: 0.60 },
  2015: { HIGH: 1.15, MED: 0.88, LOW: 0.65 },
  2016: { HIGH: 1.20, MED: 0.92, LOW: 0.70 },
  2017: { HIGH: 1.30, MED: 0.95, LOW: 0.75 },
};

const getStateScore = (stateName: string, year: number) => {
  if (HIGH_STATES.includes(stateName)) return groupScores[year].HIGH;
  if (MED_STATES.includes(stateName)) return groupScores[year].MED;
  if (LOW_STATES.includes(stateName)) return groupScores[year].LOW;
  return null;
};

const getColor = (score: number | null) => {
  if (score === null) return "#222222";
  if (score >= 1.0) return "#639922";
  if (score >= 0.8) return "#EF9F27";
  return "#E24B4A";
};

export const ActThree: React.FC<ActThreeProps> = ({ onNext }) => {
  const [year, setYear] = useState<number>(2017);

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#111] text-white p-6 overflow-hidden">
      {/* TOP ROW: Column Headers */}
      <div className="flex w-full mb-8 opacity-50 text-[10px] tracking-widest uppercase items-center font-bold">
        <div className="flex-1 text-center">Lenders</div>
        <div className="w-[1px] h-6 bg-white/20 mx-4" />
        <div className="flex-1 text-center">Geography</div>
        <div className="w-[1px] h-6 bg-white/20 mx-4" />
        <div className="flex-1 text-center">Borrowers</div>
      </div>

      {/* MIDDLE ROW: Visuals */}
      <div className="flex flex-1 w-full gap-8 mb-8 h-[55vh]">
        
        {/* LEFT COLUMN: Lenders */}
        <div className="flex-1 flex flex-col justify-center px-4">
          <h3 className="text-2xl font-light mb-12">Risk appetite permanently changed</h3>
          
          <div className="mb-12">
            <div className="flex justify-between text-xs mb-2 opacity-70">
              <span>2007: Conv 88% | Gov 12%</span>
            </div>
            <div className="flex w-full h-[32px] rounded overflow-hidden">
              <div style={{ width: '88%', backgroundColor: '#378ADD' }} className="h-full" />
              <div style={{ width: '12%', backgroundColor: '#639922' }} className="h-full opacity-80" />
            </div>

            <div className="h-4"></div>

            <div className="flex justify-between text-xs mb-2 opacity-70">
              <span>2017: Conv 67% | Gov 33%</span>
            </div>
            <div className="flex w-full h-[32px] rounded overflow-hidden">
              <div style={{ width: '67%', backgroundColor: '#378ADD' }} className="h-full" />
              <div style={{ width: '33%', backgroundColor: '#639922' }} className="h-full opacity-80" />
            </div>
          </div>

          <div className="w-full flex items-center mb-6">
            <div className="h-[1px] bg-white/10 flex-1"></div>
            <span className="text-[10px] uppercase tracking-wider px-4 text-white/50 bg-[#111]">Lien risk</span>
            <div className="h-[1px] bg-white/10 flex-1"></div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2 opacity-70">
              <span>2007: 1st 91% | Sub 9%</span>
            </div>
            <div className="flex w-full h-[32px] rounded overflow-hidden">
              <div style={{ width: '91%', backgroundColor: '#333' }} className="h-full" />
              <div style={{ width: '9%', backgroundColor: '#E24B4A' }} className="h-full opacity-80" />
            </div>

            <div className="h-4"></div>

            <div className="flex justify-between text-xs mb-2 opacity-70">
              <span>2017: 1st 97% | Sub 3%</span>
            </div>
            <div className="flex w-full h-[32px] rounded overflow-hidden">
              <div style={{ width: '97%', backgroundColor: '#333' }} className="h-full" />
              <div style={{ width: '3%', backgroundColor: '#E24B4A' }} className="h-full opacity-80" />
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Geography */}
        <div className="flex-[1.5] flex flex-col justify-center items-center border-l border-r border-white/10 px-8">
          <h3 className="text-2xl font-light mb-4 w-full text-left">Recovery was uneven</h3>
          
          <div className="w-full h-full min-h-[300px] flex items-center justify-center -my-6">
            <ComposableMap projection="geoAlbersUsa" className="w-full h-full max-h-[100%]">
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => {
                    const stateName = geo.properties.name;
                    const score = getStateScore(stateName, year);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getColor(score)}
                        stroke="#111"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: "none", transition: "all 0.5s ease" },
                          hover: { outline: "none", fill: "#fff", transition: "all 0.2s ease" },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>

          <div className="w-full mt-4 bg-[#1a1a1a] p-4 rounded-lg">
            <div className="flex justify-between text-[11px] uppercase tracking-wider mb-2 opacity-70">
              <span>Below 2007</span>
              <span>Recovered</span>
            </div>
            <div className="w-full h-1.5 flex rounded overflow-hidden mb-4">
              <div className="flex-1 bg-[#E24B4A]"></div>
              <div className="flex-1 bg-[#EF9F27]"></div>
              <div className="flex-1 bg-[#639922]"></div>
            </div>
            
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="2011" 
                max="2017" 
                step="1" 
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full accent-white"
              />
              <span className="font-mono text-xl">{year}</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Borrowers */}
        <div className="flex-1 flex flex-col justify-center px-4 relative">
          <h3 className="text-2xl font-light mb-12">Who borrowers were changed too</h3>
          
          <div className="flex-1 relative mb-8 flex items-center min-h-[250px]">
            {/* Slope Chart Area */}
            <svg viewBox="0 0 400 300" className="w-full h-full overflow-visible">
              {/* Vertical lines */}
              <line x1="10" y1="20" x2="10" y2="280" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <line x1="390" y1="20" x2="390" y2="280" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              
              {/* Year labels */}
              <text x="10" y="10" fill="rgba(255,255,255,0.5)" fontSize="12" textAnchor="middle">2007</text>
              <text x="390" y="10" fill="rgba(255,255,255,0.5)" fontSize="12" textAnchor="middle">2017</text>

              {/* Approval Rate Line (84% -> 74%) */}
              <line x1="10" y1="50" x2="390" y2="85" stroke="#888" strokeWidth="2" strokeDasharray="5,5" />
              <circle cx="10" cy="50" r="4" fill="#888" />
              <circle cx="390" cy="85" r="4" fill="#888" />
              <text x="-5" y="54" fill="#888" fontSize="11" textAnchor="end">84%</text>
              <text x="405" y="89" fill="#888" fontSize="11" textAnchor="start">74%</text>

              {/* Purchase Share Line (52% -> 45%) */}
              <line x1="10" y1="160" x2="390" y2="185" stroke="#378ADD" strokeWidth="3" />
              <circle cx="10" cy="160" r="4" fill="#378ADD" />
              <circle cx="390" cy="185" r="4" fill="#378ADD" />
              <text x="-5" y="164" fill="#378ADD" fontSize="11" textAnchor="end">52%</text>
              <text x="405" y="189" fill="#378ADD" fontSize="11" textAnchor="start">45%</text>

              {/* Refi Share Line (42% -> 48%) */}
              <line x1="10" y1="195" x2="390" y2="175" stroke="#EF9F27" strokeWidth="3" />
              <circle cx="10" cy="195" r="4" fill="#EF9F27" />
              <circle cx="390" cy="175" r="4" fill="#EF9F27" />
              <text x="-5" y="199" fill="#EF9F27" fontSize="11" textAnchor="end">42%</text>
              <text x="405" y="179" fill="#EF9F27" fontSize="11" textAnchor="start">48%</text>
            </svg>
            
            <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-6 text-[11px] opacity-80">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#378ADD]"></div> Purchase</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#EF9F27]"></div> Refi</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border border-[#888]"></div> Approval</div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-lg p-5 text-center mt-6">
            <div className="flex justify-between items-center px-4">
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-white/50 uppercase">Median income 2007</span>
                <span className="text-2xl font-light">$72k</span>
              </div>
              <div className="text-xl font-light opacity-30 mx-2">&rarr;</div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-white/50 uppercase">Median income 2017</span>
                <span className="text-2xl font-light text-[#EF9F27]">$91k</span>
              </div>
            </div>
            <div className="mt-4 text-[11px] uppercase tracking-wider text-white/40">
              Lenders required higher earners
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Leaderboard */}
      <div className="w-full mt-auto mb-2 opacity-90">
        <h4 className="text-center text-sm font-light mb-6">Who got their market back — and who didn't</h4>
        
        <div className="flex w-full gap-16 px-12 pb-12">
          {/* Top 5 */}
          <div className="flex-1">
            <div className="text-[11px] uppercase tracking-wider text-white/50 mb-4 border-b border-white/10 pb-2">Fully recovered</div>
            <div className="flex flex-col gap-2">
              {[
                { name: "TX", val: 1.42, w: "100%" },
                { name: "CO", val: 1.38, w: "95%" },
                { name: "DC", val: 1.31, w: "88%" },
                { name: "ND", val: 1.28, w: "85%" },
                { name: "WA", val: 1.19, w: "78%" },
              ].map(item => (
                <div key={item.name} className="flex items-center gap-4 text-xs font-mono">
                  <span className="w-6">{item.name}</span>
                  <div className="flex-1 h-3 bg-white/5 rounded overflow-hidden">
                    <div className="h-full bg-[#639922]" style={{ width: item.w }}></div>
                  </div>
                  <span className="w-8 text-right opacity-80">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom 5 */}
          <div className="flex-1">
             <div className="text-[11px] uppercase tracking-wider text-white/50 mb-4 border-b border-white/10 pb-2">Still below 2007</div>
            <div className="flex flex-col gap-2">
              {[
                { name: "NV", val: 0.52, w: "35%" },
                { name: "FL", val: 0.61, w: "45%" },
                { name: "AZ", val: 0.64, w: "48%" },
                { name: "MI", val: 0.67, w: "52%" },
                { name: "OH", val: 0.71, w: "58%" },
              ].map(item => (
                <div key={item.name} className="flex items-center gap-4 text-xs font-mono">
                  <span className="w-6">{item.name}</span>
                  <div className="flex-1 h-3 bg-white/5 rounded overflow-hidden">
                    <div className="h-full bg-[#E24B4A]" style={{ width: item.w }}></div>
                  </div>
                  <span className="w-8 text-right opacity-80">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="w-full flex justify-center pb-8 mt-4">
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
