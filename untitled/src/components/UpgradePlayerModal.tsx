import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Coins, ArrowUp, Sparkles, Trophy, Star, ShieldCheck, ChevronRight } from 'lucide-react';
import { useMarketStore, PlayerCard } from '../store';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { PlayerCard3D } from './PlayerCard3D';

interface UpgradePlayerModalProps {
  player: (PlayerCard & { docId: string, level: number, overall?: number }) | null;
  isOpen: boolean;
  onClose: () => void;
}

const rarityColors: Record<string, string> = {
  Common: '#8B7355',
  Rare: '#C0C0C0',
  Epic: '#FFD700',
  Legend: '#9D4EDD',
  Icon: '#00D9FF',
  Mythic: '#FF006E'
};

export const UpgradePlayerModal: React.FC<UpgradePlayerModalProps> = ({ player, isOpen, onClose }) => {
  const upgradePlayer = useMarketStore(state => state.upgradePlayer);
  const { profile } = useAuth();
  
  const [phase, setPhase] = useState<'confirm' | 'upgrading' | 'success'>('confirm');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset phase when opening/closing
  useEffect(() => {
    if (isOpen) {
      setPhase('confirm');
    }
  }, [isOpen]);

  if (!player) return null;

  const currentCoins = profile?.coins || 0;
  const upgradeCost = player.level * 500;
  const canAfford = currentCoins >= upgradeCost;

  // Rating and Stats adjustments
  const currentOverall = player.stats.overall + (player.level - 1);
  const nextOverall = player.stats.overall + player.level;
  
  // Adjusted base stats based on level
  const adjustStat = (val: number, level: number) => Math.min(99, val + (level - 1));

  const statsList = [
    { label: 'Pace', current: adjustStat(player.stats.pace, player.level), next: adjustStat(player.stats.pace, player.level + 1) },
    { label: 'Shooting', current: adjustStat(player.stats.shooting, player.level), next: adjustStat(player.stats.shooting, player.level + 1) },
    { label: 'Passing', current: adjustStat(player.stats.passing, player.level), next: adjustStat(player.stats.passing, player.level + 1) },
    { label: 'Dribbling', current: adjustStat(player.stats.dribbling, player.level), next: adjustStat(player.stats.dribbling, player.level + 1) },
    { label: 'Defending', current: adjustStat(player.stats.defending, player.level), next: adjustStat(player.stats.defending, player.level + 1) },
    { label: 'Physical', current: adjustStat(player.stats.physical, player.level), next: adjustStat(player.stats.physical, player.level + 1) },
  ];

  const handleUpgrade = async () => {
    if (!canAfford) {
      toast.error('Insufficient coins to upgrade!');
      return;
    }

    setIsSubmitting(true);
    setPhase('upgrading');

    try {
      // Artificially delay slightly for high-impact visual excitement (tunes with gaming aesthetics)
      await new Promise((resolve) => setTimeout(resolve, 1800));
      await upgradePlayer(player.docId);
      setPhase('success');
    } catch (error: any) {
      setPhase('confirm');
      toast.error('Upgrade failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rarityColor = rarityColors[player.card.rarity] || '#ffffff';

  // 3D Player objects adjusted for level/overall
  const updatedPlayerForPreview = {
    ...player,
    stats: {
      ...player.stats,
      overall: currentOverall
    }
  };

  const upgradedPlayerForSuccess = {
    ...player,
    stats: {
      ...player.stats,
      overall: nextOverall
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={phase === 'upgrading' ? undefined : onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Card content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className={`relative w-full max-w-2xl rounded-[28px] bg-gradient-to-b from-[#0e1017] to-[#06070a] border border-white/10 overflow-hidden shadow-2xl z-10 p-6 md:p-8 flex flex-col gap-6 ${
              phase === 'success' ? 'ring-2 ring-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)]' : ''
            }`}
          >
            {/* Header - Hidden on success to make space for Level Up banner */}
            {phase !== 'success' && (
              <div className="flex justify-between items-center border-b border-white/5 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#48A111]/10 rounded-xl border border-[#48A111]/20">
                    <Zap className="w-5 h-5 text-[#48A111] animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                      Player Upgrade Chamber<span className="text-[#48A111]">.</span>
                    </h3>
                    <p className="text-xs text-[#8e9299] font-mono mt-0.5 uppercase tracking-wider">
                      Boost stats & overall rating of {player.name}
                    </p>
                  </div>
                </div>
                {phase !== 'upgrading' && (
                  <button
                    onClick={onClose}
                    className="bg-white/5 hover:bg-white/10 p-2 rounded-full border border-white/10 text-white transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Content Switcher */}
            <div className="flex-1 min-h-[360px] flex flex-col justify-center">
              
              {/* PHASE 1: CONFIRM */}
              {phase === 'confirm' && (
                <div className="flex flex-col md:flex-row gap-6 items-center">
                  
                  {/* Left Column: Card visualizer */}
                  <div className="w-full md:w-1/2 flex flex-col items-center select-none">
                    <div className="relative w-full h-[280px]">
                      {/* Special glow background */}
                      <div 
                        className="absolute inset-x-8 inset-y-12 rounded-full blur-[60px] opacity-25"
                        style={{ backgroundColor: rarityColor }}
                      ></div>
                      <div className="absolute top-2 right-4 bg-[#48A111] text-black font-black text-xs px-2.5 py-1 rounded-bl-xl z-20 shadow-lg border-l border-b border-[#48A111]">
                        LVL {player.level}
                      </div>
                      <PlayerCard3D player={updatedPlayerForPreview} height="h-[280px]" />
                    </div>
                    {/* Position and Rarity Label */}
                    <span 
                      className="mt-2 text-[10px] font-black tracking-widest uppercase font-mono px-3 py-1 rounded-full border"
                      style={{ color: rarityColor, borderColor: `${rarityColor}30`, backgroundColor: `${rarityColor}08` }}
                    >
                      {player.card.rarity} {player.position}
                    </span>
                  </div>

                  {/* Right Column: Comparative Stats & Cost */}
                  <div className="w-full md:w-1/2 flex flex-col gap-4">
                    
                    {/* Overall Score progression block */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                      <div className="text-left font-mono">
                        <span className="text-[10px] text-gray-500 block uppercase font-bold">CURRENT RATING</span>
                        <div className="text-3xl font-black text-gray-300 italic flex items-baseline gap-1">
                          {currentOverall} <span className="text-[10px] text-gray-500 font-normal">ovr</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#48A111]">
                        <ChevronRight className="w-6 h-6 animate-pulse" />
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-[10px] text-[#48A111] block uppercase font-black tracking-wider">UPGRADED RATING</span>
                        <div className="text-3xl font-black text-[#48A111] italic flex items-baseline gap-1 justify-end">
                          {nextOverall} <span className="text-[10.5px] font-black">ovr</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats List comparative */}
                    <div className="bg-black/40 rounded-2xl p-4 border border-white/5 flex flex-col gap-2">
                      <span className="text-[10px] font-black font-mono text-gray-400 uppercase tracking-widest pl-1">Target Skill Growth:</span>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-1">
                        {statsList.map((st) => (
                          <div key={st.label} className="flex justify-between items-center text-xs font-mono py-1 border-b border-white/[0.03]">
                            <span className="text-gray-400 font-medium">{st.label}</span>
                            <div className="flex items-center gap-1.5 font-bold">
                              <span className="text-gray-400">{st.current}</span>
                              <ArrowUp className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="text-[#48A111]">{st.next}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cost ledger */}
                    <div className="border border-white/5 rounded-2xl p-4 bg-[#111219] flex flex-col gap-2 font-mono">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Facility Fee:</span>
                        <span className="font-bold flex items-center gap-1 text-white">
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                          {upgradeCost.toLocaleString()} coins
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Club Balance:</span>
                        <span className="font-bold text-white">
                          {currentCoins.toLocaleString()} coins
                        </span>
                      </div>
                      <div className="border-t border-white/5 my-1.5"></div>
                      <div className="flex justify-between text-xs items-center">
                        <span className="font-bold text-gray-300">Remaining Balance:</span>
                        {canAfford ? (
                          <span className="font-black text-emerald-400">
                            {(currentCoins - upgradeCost).toLocaleString()} coins
                          </span>
                        ) : (
                          <span className="font-black text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 text-[10px]">
                            Short by {(upgradeCost - currentCoins).toLocaleString()} coins
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Upgrade action Button */}
                    <button
                      onClick={handleUpgrade}
                      disabled={!canAfford || isSubmitting}
                      className="w-full bg-[#48A111] disabled:bg-[#48A111]/25 disabled:text-[#e0e0e0]/45 hover:bg-[#5fc519] text-black font-black uppercase italic tracking-wide text-md py-4 rounded-xl transition-all shadow-lg hover:shadow-[#48A111]/20 duration-300 flex items-center justify-center gap-2"
                    >
                      {canAfford ? (
                        <>
                          <Zap className="w-5 h-5 text-black" />
                          CONFIRM FACILITY UPGRADE
                        </>
                      ) : (
                        'INSUFFICIENT FUNDS IN BANK'
                      )}
                    </button>
                    
                  </div>

                </div>
              )}

              {/* PHASE 2: UPGRADING ANIMATION */}
              {phase === 'upgrading' && (
                <div className="flex flex-col items-center text-center gap-6 py-12">
                  <div className="relative">
                    {/* Ring spinning under the card or logo */}
                    <div className="w-24 h-24 rounded-full border-4 border-[#48A111]/20 border-t-[#48A111] animate-spin"></div>
                    
                    {/* Floating icons */}
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 flex items-center justify-center text-3xl"
                    >
                      ⚡
                    </motion.div>
                  </div>
                  
                  <div className="flex flex-col gap-2 font-mono">
                    <h4 className="text-xl font-black text-white uppercase tracking-widest animate-pulse">
                      Upgrading Squad Member...
                    </h4>
                    <span className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed uppercase tracking-wider text-[10px]">
                      Hiring facility coaches, running custom drills, and boosting structural attributes. Please hold.
                    </span>
                  </div>
                </div>
              )}

              {/* PHASE 3: SUCCESS SHOWDOWN */}
              {phase === 'success' && (
                <div className="flex flex-col items-center text-center gap-6 py-4">
                  {/* Flashing Particle Level Up Effects */}
                  <div className="relative w-full max-w-[340px] flex items-center justify-center select-none">
                    
                    {/* Spinning gold and green flares */}
                    <div className="absolute inset-0 w-80 h-80 rounded-full bg-[#48A111]/10 blur-3xl pointer-events-none transform -translate-y-1/2"></div>
                    
                    {/* Custom sparklers particles */}
                    <div className="absolute top-0 animate-bounce text-4xl">🌟</div>
                    <div className="absolute left-6 top-1/2 animate-pulse text-3xl">✨</div>
                    <div className="absolute right-6 top-1/2 animate-pulse text-3xl">✨</div>

                    {/* Show Upgraded level */}
                    <div className="absolute -top-4 bg-gradient-to-r from-yellow-400 to-[#48A111] text-black font-black text-sm px-4 py-1.5 rounded-full z-20 shadow-xl border-2 border-white/20 uppercase tracking-widest animate-bounce">
                      🚀 LEVEL UP!
                    </div>

                    {/* The beautiful updated card itself */}
                    <div className="w-full h-[280px]">
                      <PlayerCard3D player={upgradedPlayerForSuccess} height="h-[280px]" />
                    </div>
                  </div>

                  <div className="font-mono">
                    <h3 className="text-2xl font-black uppercase text-white tracking-widest">
                      UPGRADE SUCCESSFUL!
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      {player.name} has unlocked higher athletic thresholds. Their skills are permanently fortified!
                    </p>

                    {/* Growth Metrics feedback */}
                    <div className="flex justify-center items-center gap-8 mt-4 bg-white/5 border border-white/10 rounded-2xl py-3 px-6 max-w-sm mx-auto">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase block font-bold">SQUAD LEVEL</span>
                        <div className="text-xl font-black text-white">
                          lvl {player.level} → <span className="text-[#48A111]">{player.level + 1}</span>
                        </div>
                      </div>
                      <div className="h-8 w-px bg-white/10"></div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase block font-bold">CARD OVERALL</span>
                        <div className="text-xl font-black text-white">
                          {currentOverall} OVR → <span className="text-yellow-400">{nextOverall} OVR</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Complete flow Button */}
                  <button
                    onClick={onClose}
                    className="w-full max-w-sm bg-gradient-to-r from-emerald-500 to-[#48A111] hover:from-emerald-600 hover:to-[#5fc519] text-black font-black uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-lg shadow-[#48A111]/25 border border-white/15"
                  >
                    AWESOME! LET'S GO ✓
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
