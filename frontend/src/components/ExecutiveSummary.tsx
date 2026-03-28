import React from 'react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const gapData = [
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

const data2007 = [
  { name: 'Conventional', value: 88, color: '#378ADD' },
  { name: 'Gov-backed', value: 12, color: '#639922' },
];

const data2017 = [
  { name: 'Conventional', value: 67, color: '#378ADD' },
  { name: 'Gov-backed', value: 33, color: '#639922' },
];

const HIGH_STATES = ["Texas", "Colorado", "District of Columbia", "North Dakota", "South Dakota", "Wyoming", "Montana"];
const MED_STATES = ["California", "New York", "Washington", "Oregon", "Minnesota", "Illinois", "Virginia"];
const LOW_STATES = ["Florida", "Nevada", "Arizona", "Michigan", "Ohio", "Georgia", "North Carolina"];

const getStateColor = (stateName: string) => {
  if (HIGH_STATES.includes(stateName)) return "#639922";
  if (MED_STATES.includes(stateName)) return "#EF9F27";
  if (LOW_STATES.includes(stateName)) return "#E24B4A";
  return "#222222";
};

export const ExecutiveSummary: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-screen bg-[#0a0a0a] text-white p-6 overflow-hidden">
      
      {/* HEADER */}
      <div className="w-full text-center mb-6">
        <span className="text-[10px] tracking-widest uppercase font-bold text-white/50">
          EXECUTIVE SUMMARY · 2018 LENS
        </span>
      </div>

      {/* THREE PANELS */}
      <div className="flex flex-1 w-full gap-6 px-12 mb-8 h-[60vh] min-h-0">
        
        {/* PANEL 1 - The Crisis */}
        <div className="flex-1 flex flex-col border border-[#1f1f1f] rounded-xl p-8 relative items-center text-center justify-between">
          <div className="w-full text-left">
            <span className="text-[10px] tracking-widest uppercase text-white/50">THE CRISIS</span>
          </div>
          
          <div className="flex flex-col items-center mt-[-20px]">
            <div className="text-[96px] font-[200] leading-none text-[#E24B4A]">−29pp</div>
            <div className="text-sm text-white/50 mt-2">Peak origination gap, 2009</div>
          </div>

          {/* Sparkline */}
          <div className="w-[80%] h-[60px] my-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={gapData}>
                <Area 
                  type="monotone" 
                  dataKey="apps" 
                  stroke="#378ADD" 
                  fill="#378ADD" 
                  fillOpacity={0.05} 
                  strokeWidth={1}
                />
                <Area 
                  type="monotone" 
                  dataKey="orig" 
                  stroke="#639922" 
                  fill="#E24B4A" 
                  fillOpacity={0.25} 
                  strokeWidth={1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Stat Pills */}
          <div className="flex gap-4 mt-auto">
            <span className="bg-[#1f1f1f] text-white/80 text-[11px] px-4 py-2 rounded-full border border-white/5">
              Applications 2009: 4.2M
            </span>
            <span className="bg-[#1f1f1f] text-white/80 text-[11px] px-4 py-2 rounded-full border border-white/5">
              Originated 2009: 2.3M
            </span>
          </div>
        </div>

        {/* PANEL 2 - The Structural Shift */}
        <div className="flex-1 flex flex-col border border-[#1f1f1f] rounded-xl p-8 relative items-center text-center justify-between">
          <div className="w-full text-left">
            <span className="text-[10px] tracking-widest uppercase text-white/50">THE STRUCTURAL SHIFT</span>
          </div>
          
          <div className="flex items-center justify-center w-full gap-8 my-auto">
            <div className="flex flex-col items-center">
              <div className="w-[120px] h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data2007}
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {data2007.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <span className="text-sm text-white/60 font-medium mt-2">2007</span>
            </div>

            <div className="text-2xl text-white/20 font-light">&rarr;</div>

            <div className="flex flex-col items-center">
              <div className="w-[120px] h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data2017}
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {data2017.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <span className="text-sm text-white/60 font-medium mt-2">2017</span>
            </div>
          </div>

          <div className="mt-auto text-sm font-light text-white/90">
            Gov-backed share tripled. It never went back.
          </div>
        </div>

        {/* PANEL 3 - The Recovery */}
        <div className="flex-1 flex flex-col border border-[#1f1f1f] rounded-xl p-8 relative items-center text-center justify-between">
           <div className="w-full text-left">
            <span className="text-[10px] tracking-widest uppercase text-white/50">THE RECOVERY</span>
          </div>
          
          <div className="w-full h-[200px] flex items-center justify-center -mt-4">
            <ComposableMap projection="geoAlbersUsa" className="w-full h-full">
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map(geo => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getStateColor(geo.properties.name)}
                      stroke="#0a0a0a"
                      strokeWidth={1}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>
            </ComposableMap>
          </div>

          <div className="flex flex-col items-center gap-3 w-full px-4 mb-4">
            <div className="flex justify-between w-full">
              <span className="bg-[#639922]/20 text-[#639922] border border-[#639922]/50 text-[11px] font-bold px-4 py-1.5 rounded-full">TX +42%</span>
              <span className="bg-[#639922]/20 text-[#639922] border border-[#639922]/50 text-[11px] font-bold px-4 py-1.5 rounded-full">CO +38%</span>
              <span className="bg-[#639922]/20 text-[#639922] border border-[#639922]/50 text-[11px] font-bold px-4 py-1.5 rounded-full">DC +31%</span>
            </div>
            <div className="flex justify-between w-full">
              <span className="bg-[#E24B4A]/20 text-[#E24B4A] border border-[#E24B4A]/50 text-[11px] font-bold px-4 py-1.5 rounded-full">NV −48%</span>
              <span className="bg-[#E24B4A]/20 text-[#E24B4A] border border-[#E24B4A]/50 text-[11px] font-bold px-4 py-1.5 rounded-full">FL −39%</span>
              <span className="bg-[#E24B4A]/20 text-[#E24B4A] border border-[#E24B4A]/50 text-[11px] font-bold px-4 py-1.5 rounded-full">AZ −36%</span>
            </div>
          </div>

          <div className="mt-auto text-sm font-light text-white/90">
            TX, CO, DC recovered by 2014. NV, FL still below baseline in 2017.
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="w-full text-center mt-auto pb-6">
        <div className="text-[24px] font-[300] text-white leading-relaxed mb-6">
          The crisis lasted 2 years.<br/>
          The structural change it caused lasted a decade.
        </div>
        <div className="text-[10px] text-white/30 tracking-wider">
          Source: HMDA Historic Data 2007–2017 · Consumer Financial Protection Bureau
        </div>
      </div>

    </div>
  );
};
