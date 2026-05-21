import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Play } from 'lucide-react';

interface LandingViewProps {
  onGetStarted: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onGetStarted }) => {
  // Generate random stock market metrics for the background
  const metrics = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    symbol: ['MBP', 'MES', 'RND', 'HLD', 'VNI', 'BGL', 'KDB', 'SSN'][Math.floor(Math.random() * 8)],
    price: (Math.random() * 5000 + 100).toFixed(2),
    change: (Math.random() * 10 - 5).toFixed(2),
    isUp: Math.random() > 0.5,
    delay: Math.random() * 2,
  }));

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#020205] text-white flex flex-col justify-center items-center font-sans [perspective:1000px]">
      
      {/* Background Stock Market Board */}
      <div className="absolute inset-0 z-0 opacity-10 overflow-hidden flex flex-col justify-center">
         <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-8 blur-[1px]">
            {metrics.map((m) => (
               <motion.div 
                 key={m.id}
                 initial={{ opacity: 0.3 }}
                 animate={{ opacity: [0.3, 0.8, 0.3] }}
                 transition={{ repeat: Infinity, duration: 3 + m.delay, delay: m.delay }}
                 className="flex flex-col font-mono text-xs"
               >
                  <span className="text-white/50">{m.symbol}/USD</span>
                  <div className={`flex items-center gap-1 ${m.isUp ? 'text-[#48A111]' : 'text-red-500'}`}>
                     <span>${m.price}</span>
                     {m.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  </div>
               </motion.div>
            ))}
         </div>
      </div>

      {/* Floating 3D Cards */}
      <div className="absolute inset-0 z-10 pointer-events-none perspective-[2000px] flex items-center justify-center">
         {/* Card 1 */}
         <motion.div
           animate={{ 
             y: [-20, 20, -20],
             rotateX: [10, -10, 10],
             rotateY: [-15, 15, -15],
             z: [0, 50, 0]
           }}
           transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
           className="absolute left-[10%] md:left-[20%] top-[20%] w-32 md:w-48 aspect-[2.5/3.5] bg-gradient-to-br from-[#48A111] to-black rounded-xl border border-[#48A111]/40 shadow-[0_0_30px_rgba(72,161,17,0.2)] p-4 flex flex-col justify-between"
           style={{ transformStyle: 'preserve-3d' }}
         >
            <div className="flex justify-between items-start font-black italic">
               <span className="text-xl md:text-3xl text-white drop-shadow-md border-b-2 border-white/20 pb-1">99</span>
               <span className="text-sm md:text-base text-[#48A111] bg-black/50 px-2 py-1 rounded">ATT</span>
            </div>
            <div className="text-center font-black text-lg md:text-2xl uppercase tracking-tighter italic">MBAPPE</div>
         </motion.div>

         {/* Card 2 */}
         <motion.div
           animate={{ 
             y: [20, -20, 20],
             rotateX: [-15, 15, -15],
             rotateY: [10, -10, 10],
             z: [0, 80, 0]
           }}
           transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }}
           className="absolute right-[10%] md:right-[20%] top-[30%] w-32 md:w-48 aspect-[2.5/3.5] bg-gradient-to-br from-purple-600 to-black rounded-xl border border-purple-500/40 shadow-[0_0_30px_rgba(147,51,234,0.2)] p-4 flex flex-col justify-between"
           style={{ transformStyle: 'preserve-3d' }}
         >
            <div className="flex justify-between items-start font-black italic">
               <span className="text-xl md:text-3xl text-white drop-shadow-md border-b-2 border-white/20 pb-1">94</span>
               <span className="text-sm md:text-base text-purple-400 bg-black/50 px-2 py-1 rounded">MID</span>
            </div>
            <div className="text-center font-black text-lg md:text-2xl uppercase tracking-tighter italic">MESSI</div>
         </motion.div>

         {/* Card 3 */}
         <motion.div
           animate={{ 
             y: [-10, 30, -10],
             rotateX: [20, -5, 20],
             rotateY: [-20, 20, -20],
             z: [0, -30, 0]
           }}
           transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 2 }}
           className="absolute left-[30%] md:left-[50%] bottom-[15%] w-28 md:w-40 aspect-[2.5/3.5] bg-gradient-to-br from-blue-600 to-black rounded-xl border border-blue-500/40 shadow-[0_0_30px_rgba(37,99,235,0.2)] p-4 flex flex-col justify-between opacity-60 md:opacity-100"
           style={{ transformStyle: 'preserve-3d' }}
         >
            <div className="flex justify-between items-start font-black italic">
               <span className="text-lg md:text-2xl text-white drop-shadow-md border-b-2 border-white/20 pb-1">96</span>
               <span className="text-xs md:text-sm text-blue-400 bg-black/50 px-2 py-1 rounded">MID</span>
            </div>
            <div className="text-center font-black text-base md:text-xl uppercase tracking-tighter italic">DE BRUYNE</div>
         </motion.div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto h-full space-y-12 backdrop-blur-[2px]">
         
         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
         >
            <div className="w-16 h-16 bg-[#48A111] rounded-xl rotate-45 flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(72,161,17,0.4)]">
                <span className="-rotate-45 font-black text-black text-2xl">TFC</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none text-white drop-shadow-2xl">
               Foot<span className="text-transparent bg-clip-text bg-gradient-to-b from-[#48A111] to-[#2d610b]">ex</span><span className="text-[#48A111]">.</span>
            </h1>
         </motion.div>

         <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="max-w-2xl bg-black/40 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-3xl"
         >
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed font-light">
               Welcome to the ultimate fantasy football trading platform. 
               <strong className="text-white font-bold ml-1">Buy, sell, and trade</strong> player cards in a real-time stock market driven by supply, demand, and player performance. Build your squad, dominate the auctions, and rise to the top of the leaderboard.
            </p>
         </motion.div>

         <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
         >
            <button
               onClick={onGetStarted}
               className="group relative px-10 py-5 bg-[#48A111] text-black font-black text-xl italic uppercase tracking-widest rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(72,161,17,0.3)] hover:shadow-[0_0_60px_rgba(72,161,17,0.5)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3"
            >
               <span className="relative z-10">Get Started</span>
               <Play className="w-6 h-6 relative z-10 fill-black group-hover:translate-x-1 transition-transform" />
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
            </button>
         </motion.div>

      </div>
    </div>
  );
};
