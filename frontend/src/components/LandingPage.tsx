import { motion } from 'framer-motion';

interface LandingPageProps {
  onBegin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onBegin }) => {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
      {/* Background Visual: Ghost Gap Area Chart */}
      <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Fill between lines */}
          <path
            d="M 0 150 
               C 200 150, 300 160, 400 180 
               C 500 210, 600 220, 1000 230
               L 1000 450
               C 600 430, 500 400, 400 380 
               C 300 250, 200 150, 0 150 Z"
            fill="#ff0000"
            fillOpacity="0.1"
          />

          {/* Applications Line (Top) */}
          <motion.path
            id="line-apps"
            d="M 0 150 C 200 150, 300 160, 400 180 C 500 210, 600 220, 1000 230"
            stroke="white"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Originations Line (Bottom) */}
          <motion.path
            id="line-orig"
            d="M 0 150 C 200 150, 300 250, 400 380 C 500 400, 600 430, 1000 450"
            stroke="white"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </svg>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <motion.h1 
          className="text-[64px] font-light text-white tracking-[-1px] leading-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          The Decade That Broke <br /> American Lending
        </motion.h1>

        <motion.p
          className="text-base text-[#666] mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          2007 – 2017 · HMDA Mortgage Data · 170M+ loan records
        </motion.p>

        <motion.button
          onClick={onBegin}
          className="mt-12 px-8 py-3 bg-transparent border border-white text-white font-medium uppercase tracking-wider text-sm transition-all duration-300 hover:bg-white hover:text-[#0a0a0a] cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          Begin &rarr;
        </motion.button>
      </div>
    </div>
  );
};
