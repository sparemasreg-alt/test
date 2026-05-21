import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, TrendingUp, TrendingDown, Coins, Shield, Globe2, Award, Zap, Sparkles, Lock } from 'lucide-react';
import { PlayerCard, useMarketStore } from '../store';
import { PlayerCard3D } from './PlayerCard3D';
import { getFlagImageUrl, getClubImageUrl } from '../utils/images';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

const rarityColors: Record<string, string> = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Elite: '#FF3333',
  Master: '#9D4EDD',
  Icon: '#FADD75'
};

const rarityGlows: Record<string, string> = {
  Bronze: 'shadow-[0_0_30px_rgba(205,127,50,0.2)] border-[#CD7F32]/30',
  Silver: 'shadow-[0_0_30px_rgba(192,192,192,0.25)] border-[#C0C0C0]/30',
  Gold: 'shadow-[0_0_40px_rgba(255,215,0,0.3)] border-[#FFD700]/30',
  Elite: 'shadow-[0_0_45px_rgba(255,51,51,0.35)] border-[#FF3333]/30',
  Master: 'shadow-[0_0_50px_rgba(157,78,221,0.4)] border-[#9D4EDD]/30',
  Icon: 'shadow-[0_0_60px_rgba(250,221,117,0.45)] border-[#FADD75]/30'
};

interface PlayerDetailsModalProps {
  player: PlayerCard | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerDetailsModal: React.FC<PlayerDetailsModalProps> = ({ player, isOpen, onClose }) => {
  const { buyPlayer, setActiveTab } = useMarketStore();
  const [selectedLevel, setSelectedLevel] = useState<string>('base');
  const [unlockCode, setUnlockCode] = useState<string>('');
  const { profile } = useAuth();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!player) return null;

  const levelMultipliers: Record<string, number> = {
      base: 1.0,
      rare: 1.5,
      special: 2.0,
      ultimate: 3.5
  };
  
  const multiplier = levelMultipliers[selectedLevel] || 1.0;
  const finalPrice = Math.floor(player.market.currentPrice * multiplier);

  const levelMap: Record<string, number> = { base: 1, rare: 2, special: 3, ultimate: 4 };
  const numericLevel = levelMap[selectedLevel] || 1;

  const rarityColor = rarityColors[player.card.rarity] || '#ffffff';
  const rarityGlow = rarityGlows[player.card.rarity] || 'border-white/10';

  // Construct chart data for price history
  const priceHistory = player.market.priceHistory || [];
  const chartData = priceHistory.length > 0
    ? priceHistory.map((price, index) => ({
        time: index === priceHistory.length - 1 ? 'Current' : `T - ${priceHistory.length - 1 - index}`,
        price: price
      }))
    : [
        { time: 'Initial', price: player.market.currentPrice * 0.9 },
        { time: 'Previous', price: player.market.currentPrice * 0.95 },
        { time: 'Current', price: player.market.currentPrice }
      ];

  const highestPrice = priceHistory.length > 0 ? Math.max(...priceHistory) : player.market.currentPrice;
  const lowestPrice = priceHistory.length > 0 ? Math.min(...priceHistory) : player.market.currentPrice * 0.9;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.1 }}
            className={`relative w-full max-w-5xl rounded-[32px] bg-[#0c0d12]/95 border ${rarityGlow} overflow-hidden flex flex-col lg:flex-row shadow-2xl z-10`}
          >
            {/* Ambient Background Gradient Glow */}
            <div 
              className="absolute top-0 left-0 w-full h-full opacity-[0.08] pointer-events-none transition-opacity"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${rarityColor} 0%, transparent 70%)`
              }}
            />
            
            {/* Left Box: 3D interactive Card Visualizer */}
            <div className="w-full lg:w-[42%] bg-black/40 p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-white/5 relative">
              <div className="absolute top-6 left-6 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: rarityColor }} />
                <span className="text-[10px] font-mono tracking-widest text-[#8e9299] uppercase">3D interactive view</span>
              </div>

              {/* Rarity and Badge indicator */}
              <div className="absolute top-6 right-6 px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" style={{ color: rarityColor }} />
                <span className="text-xs font-bold text-[#e0e0e0] uppercase tracking-wider">{player.card.rarity}</span>
              </div>

              {/* Interactive R3F Interactive Card Canvas */}
              <div className="w-full py-4 flex justify-center max-w-[340px]">
                <PlayerCard3D 
                  player={player} 
                  height="h-[380px]" 
                  overall={player.levels?.[selectedLevel] || player.stats.overall}
                  level={numericLevel}
                />
              </div>

              <p className="text-xs text-center text-[#8e9299] mt-2 italic font-medium">
                Hold drag to rotate and inspect the card shine effect
              </p>
            </div>

            {/* Right Box: Attributes, Charts, and Details Panel */}
            <div className="flex-1 p-8 overflow-y-auto max-h-[85vh] lg:max-h-[600px] flex flex-col gap-6 scrollbar-thin">
              {/* Close button */}
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 lg:right-8 bg-white/5 border border-white/10 p-2.5 rounded-full text-white hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer z-20"
                id="close-player-details"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header Title */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-3 py-0.5 bg-amber-500/10 text-amber-500 text-xs font-mono font-bold rounded">
                    {player.position}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-[#8e9299] font-medium">
                    <Award className="w-3.5 h-3.5 text-violet-400" />
                    <span>{player.league}</span>
                  </div>
                </div>
                <h2 className="text-3xl lg:text-4xl font-black italic tracking-tighter text-white uppercase">
                  {player.name}
                </h2>
                
                {/* Meta Attributes Row */}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#8e9299]">
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Club: </span>
                    <img src={getClubImageUrl(player.club)} alt={player.club} className="w-6 h-6 object-contain filter drop-shadow" title={player.club} onError={(e) => { if (!e.currentTarget.src.includes('ui-avatars')) e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.club)}&background=random&color=fff&rounded=true&font-size=0.4`; }} />
                    <strong className="text-white font-semibold">{player.club}</strong>
                  </div>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                    <Globe2 className="w-4 h-4 text-sky-400" />
                    <span>Nation: </span>
                    <img src={getFlagImageUrl(player.nation)} alt={player.nation} className="w-6 h-4 object-cover rounded-[2px] shadow-sm" title={player.nation} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    <strong className="text-white font-semibold">{player.nation}</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                {/* 1. Skill Scores breakdown */}
                <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                  <h3 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Ability Breakdown
                  </h3>
                  
                  <div className="flex flex-col gap-3">
                    {/* Overall Badge */}
                    <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                      <span className="text-xs font-bold text-[#8e9299] uppercase">Overall Quality</span>
                      <span className="text-xl font-black px-3 py-0.5 rounded text-black font-mono" style={{ backgroundColor: rarityColor }}>
                        {player.levels?.[selectedLevel] || player.stats.overall}
                      </span>
                    </div>

                    {/* Stats columns */}
                    {(() => {
                      const statsArr = [
                        { label: 'pace', title: 'Pace', abbr: 'PAC', color: 'bg-amber-500' },
                        { label: 'shooting', title: 'Shooting', abbr: 'SHO', color: 'bg-red-500' },
                        { label: 'passing', title: 'Passing', abbr: 'PAS', color: 'bg-blue-500' },
                        { label: 'dribbling', title: 'Dribbling', abbr: 'DRI', color: 'bg-emerald-500' },
                        { label: 'defending', title: 'Defending', abbr: 'DEF', color: 'bg-sky-500' },
                        { label: 'physical', title: 'Physical', abbr: 'PHY', color: 'bg-purple-500' }
                      ];
                      const adjustStatVal = (val: number) => Math.min(99, val + (numericLevel - 1));
                      const statValues = statsArr.map(s => adjustStatVal(player.stats[s.label as keyof typeof player.stats] || 50));
                      const maxScore = Math.max(...statValues);
                      return (
                        <div className="grid grid-cols-1 gap-2.5">
                        {statsArr.map((item) => {
                          const score = adjustStatVal(player.stats[item.label as keyof typeof player.stats] || 50);
                          const isHighest = score === maxScore;
                          return (
                            <div key={item.label} className="flex flex-col gap-1">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-sm font-semibold ${isHighest ? 'text-white' : 'text-gray-200'}`}>{item.title}</span>
                                  <span className="font-mono text-[10px] text-[#8e9299] px-1.5 py-0.5 bg-white/5 rounded font-bold">{item.abbr}</span>
                                  {isHighest && <Award className="w-3.5 h-3.5 text-amber-500" />}
                                </div>
                                <span className={`text-sm font-black font-mono ${isHighest ? 'text-amber-500' : 'text-white'}`}>{score}</span>
                              </div>
                              <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${score}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }}
                                  className={`h-full ${isHighest ? 'bg-amber-500' : item.color} rounded-full`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      )
                    })()}
                  </div>
                </div>

                {/* 2. Trading Indicators and historical stats */}
                <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 justify-between">
                  <div>
                    <h3 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
                      <Coins className="w-4 h-4 text-[#48A111]" />
                      Market valuation
                    </h3>
                    
                    <div className="mt-4 flex flex-col gap-1.5">
                      <div className="text-xs text-[#8e9299] font-medium">Estimated trade price</div>
                      <div className="text-3xl font-black italic tracking-tighter text-[#48A111]">
                        ${finalPrice.toLocaleString()}
                      </div>
                      
                      {/* 24h variation badge */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`flex items-center gap-1 font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          player.market.change24h >= 0 ? 'bg-[#48A111]/15 text-[#48A111]' : 'bg-red-500/15 text-red-500'
                        }`}>
                          {player.market.change24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          {player.market.change24h >= 0 ? '+' : ''}{player.market.change24h}%
                        </span>
                        <span className="text-[10px] text-[#8e9299] uppercase font-semibold">24h Change</span>
                      </div>
                    </div>
                  </div>

                  {/* Market record labels */}
                  <div className="grid grid-cols-2 gap-3 mt-4 border-t border-white/5 pt-4">
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <div className="text-[10px] text-[#8e9299] uppercase font-mono font-bold">Historical Max</div>
                      <div className="text-sm font-black text-white">${highestPrice.toLocaleString()}</div>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <div className="text-[10px] text-[#8e9299] uppercase font-mono font-bold">Historical Min</div>
                      <div className="text-sm font-black text-white">${lowestPrice.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Added: Card Progression Levels */}
                <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
                    <h3 className="text-sm font-black tracking-wider text-white uppercase flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-400" />
                        Card progression levels
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                        {Object.entries(player.levels || {}).map(([key, ovr]) => (
                            <div 
                                key={key} 
                                onClick={() => setSelectedLevel(key)}
                                className={`bg-white/5 p-2 rounded-lg text-center flex flex-col gap-1 items-center border ${selectedLevel === key ? 'border-purple-500' : 'border-white/5'} hover:border-purple-500/50 transition-colors cursor-pointer`}
                            >
                                <span className="text-[9px] font-bold text-gray-400 uppercase">{key}</span>
                                <span className="text-lg font-black text-purple-400 font-mono">{ovr}</span>
                                <span className="text-[8px] text-gray-600 font-mono">OVR</span>
                            </div>
                        ))}
                    </div>
                </div>
              </div>

              {/* Price Trend Chart Section */}
              <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col gap-3">
                <h3 className="text-xs font-black tracking-wider text-[#8e9299] uppercase">Price History Trend</h3>
                <div className="h-[150px] w-full mt-2 font-mono text-[10px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={rarityColor} stopOpacity={0.8}/>
                          <stop offset="100%" stopColor={rarityColor} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                      <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" tickLine={false} />
                      <YAxis 
                        stroke="rgba(255,255,255,0.4)" 
                        tickLine={false} 
                        domain={['auto', 'auto']}
                        tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0c0d12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                        labelStyle={{ color: '#8e9299', fontWeight: 'bold' }}
                        itemStyle={{ color: rarityColor, fontWeight: 'black' }}
                        formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={rarityColor} 
                        strokeWidth={3}
                        fillOpacity={0.2}
                        fill="url(#colorPrice)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Trade Button */}
               <div className="mt-3">
                 {player.subscriberOnly ? (
                    <div className="flex flex-col gap-3">
                        <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg flex items-center justify-center gap-2 mb-1">
                           <Lock className="w-4 h-4 text-amber-500" />
                           <span className="text-amber-500 font-bold uppercase text-xs tracking-widest">Locked for Subscribers</span>
                        </div>
                        <div className="flex flex-col lg:flex-row gap-3">
                           <input 
                             type="text"
                             placeholder="ENTER PROMO CODE" 
                             onClick={(e) => e.stopPropagation()}
                             value={unlockCode}
                             onChange={(e) => setUnlockCode(e.target.value)}
                             className="flex-1 bg-black/80 border border-amber-500/30 text-sm px-4 py-3 rounded-xl outline-none focus:border-amber-500 transition-colors uppercase font-mono"
                           />
                           <button 
                             onClick={async (e) => {
                                 e.stopPropagation();
                                 if (unlockCode) {
                                   await buyPlayer(player.id, selectedLevel, unlockCode, undefined, profile?.subscription);
                                   setUnlockCode('');
                                   onClose();
                                 } else {
                                   toast.error("Please enter a valid promo code!");
                                 }
                             }}
                             className="bg-amber-500 text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-amber-400 transition-colors"
                           >
                             UNLOCK
                           </button>
                         </div>
                         {!profile?.subscription && (
                           <button 
                              onClick={() => {
                                  onClose();
                                  setActiveTab('pricing');
                              }}
                              className="w-full bg-amber-500/20 text-amber-500 border border-amber-500/50 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-amber-500/30 transition-colors text-xs text-center"
                            >
                              GET SUBSCRIPTION
                            </button>
                         )}
                    </div>
                 ) : (
                    <div className="flex flex-col gap-2">
                           <div className="flex flex-col lg:flex-row gap-2 mt-2">
                               <input 
                                 type="text"
                                 placeholder="HAVE A PROMO CODE? (OPTIONAL DISCOUNT)" 
                                 value={unlockCode}
                                 onChange={(e) => setUnlockCode(e.target.value)}
                                 className="flex-1 bg-black/80 border border-[#48A111]/30 text-[10px] px-3 py-2 rounded-xl outline-none focus:border-[#48A111] transition-colors uppercase font-mono"
                               />
                           </div>
                        <button 
                          onClick={async () => {
                            await buyPlayer(player.id, selectedLevel, unlockCode, undefined, profile?.subscription);
                            onClose();
                          }}
                          className="w-full bg-[#48A111] text-[#0a0a0a] py-4 rounded-xl font-black italic text-xl uppercase tracking-tight hover:bg-[#3d8a0f] transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[0_4px_20px_rgba(72,161,17,0.3)] duration-300"
                        >
                          <Coins className="w-5 h-5 shrink-0" />
                          Trade and acquire now
                        </button>
                    </div>
                 )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
