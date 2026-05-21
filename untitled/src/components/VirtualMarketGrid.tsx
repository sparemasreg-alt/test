import React, { useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { PlayerCard, useMarketStore } from '../store';
import { PlayerCard3D } from './PlayerCard3D';
import { getFlagImageUrl } from '../utils/images';
import { PlayerDetailsModal } from './PlayerDetailsModal';
import { useAuth } from '../hooks/useAuth';
import { Lock } from 'lucide-react';
import { toast } from 'sonner';

const getStatColor = (val: number) => {
    if (val >= 90) return 'bg-[#48A111] shadow-[0_0_8px_#48A111]';
    if (val >= 80) return 'bg-[#84cc16] shadow-[0_0_8px_rgba(132,204,22,0.8)]';
    if (val >= 70) return 'bg-[#eab308] shadow-[0_0_8px_rgba(234,179,8,0.8)]';
    if (val >= 60) return 'bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.8)]';
    return 'bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.8)]';
};

const StatBar = ({ label, value }: { label: string, value: number }) => {
    const colorClass = getStatColor(value);
    return (
        <div className="flex flex-col gap-1 group/stat cursor-help relative p-1 rounded-md hover:bg-white/5 transition-colors">
            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-[#8e9299] group-hover/stat:text-white transition-colors">
                <span>{label}</span>
                <span className="text-white font-black">{value}</span>
            </div>
            <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden relative border border-white/5">
                <div 
                    className={`absolute top-0 left-0 h-full rounded-full ${colorClass} transition-all duration-1000 ease-out`} 
                    style={{ width: `${value}%` }}
                />
            </div>
            {/* Tooltip-like popup */}
            <div className="absolute opacity-0 group-hover/stat:opacity-100 bottom-full left-1/2 -translate-x-1/2 mb-1 bg-[#1a1c23] text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap pointer-events-none transition-opacity z-50 border border-white/10 shadow-xl font-mono backdrop-blur-sm">
                {label}: {value}/100
            </div>
        </div>
    );
};

export const VirtualMarketGrid = ({ players }: { players: PlayerCard[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { buyPlayer, setActiveTab } = useMarketStore();
  const { profile } = useAuth();
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerCard | null>(null);
  const [unlockCodeInputs, setUnlockCodeInputs] = useState<Record<string, string>>({});
  
  // Dynamic columns state for robust responsive layout and correct virtualization
  const [cols, setCols] = useState(4);

  useEffect(() => {
    const updateCols = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCols(1);
      } else if (width < 1024) {
        setCols(2);
      } else if (width < 1280) {
        setCols(3);
      } else {
        setCols(4);
      }
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  const numColumns = cols;
  const rowCount = Math.ceil(players.length / numColumns);
  
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 640, // Elevated row height representing card height + safety spacing + stats + actions
    overscan: 2,
  });

  return (
    <div
      ref={parentRef}
      className="h-[calc(100vh-200px)] overflow-y-auto overflow-x-hidden w-full px-6"
    >
      <div
        className="w-full relative"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const rowStartIndex = virtualRow.index * numColumns;
          const rowItems = players.slice(rowStartIndex, rowStartIndex + numColumns);
          
          return (
            <div
              key={virtualRow.index}
              className="absolute top-0 left-0 w-full grid gap-16 py-8"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
                height: `${virtualRow.size}px`,
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
              }}
            >
              {rowItems.map(player => (
                <div 
                  key={player.id} 
                  className="w-full flex justify-center group hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                  onClick={() => setSelectedPlayer(player)}
                >
                  <div className="w-full sm:max-w-[320px] bg-white/5 rounded-[24px] overflow-hidden border border-white/10 p-4 sm:p-6 transition-all hover:border-[#48A111]/50 hover:shadow-[0_0_30px_rgba(72,161,17,0.15)] relative">
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity" style={{backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 10px)'}}></div>
                    <PlayerCard3D player={player} height="h-[320px]" />
                    <div className="mt-4 flex flex-col px-2 gap-3 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-2xl font-black italic tracking-tighter text-[#e0e0e0]">${player.market.currentPrice.toLocaleString()}</div>
                                <div className={`text-sm font-mono font-bold flex items-center gap-2 ${player.market.change24h >= 0 ? 'text-[#48A111]' : 'text-red-500'}`}>
                                    {player.market.change24h >= 0 ? '+' : ''}{player.market.change24h}%
                                    <div className="w-5 h-3.5 overflow-hidden rounded-[2px] shadow-sm" title={player.nation}>
                                      <img src={getFlagImageUrl(player.nation)} alt={player.nation} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                    </div>
                                </div>
                            </div>
                            <div className="px-3 py-1 rounded-full border border-white/10 flex items-center justify-center bg-white/5 text-[10px] font-bold text-[#e0e0e0]">
                                {player.card.rarity.toUpperCase()}
                            </div>
                        </div>

                        {/* Player Stats Grid */}
                        <div className="grid grid-cols-3 gap-x-2 gap-y-1 bg-[#0a0a0c]/80 border border-white/10 rounded-xl p-2 mt-2 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] backdrop-blur-md">
                          <StatBar label="PAC" value={player.stats.pace} />
                          <StatBar label="SHO" value={player.stats.shooting} />
                          <StatBar label="PAS" value={player.stats.passing} />
                          <StatBar label="DRI" value={player.stats.dribbling} />
                          <StatBar label="DEF" value={player.stats.defending} />
                          <StatBar label="PHY" value={player.stats.physical} />
                        </div>

                        {player.subscriberOnly ? (
                            <div className="mt-2 flex flex-col gap-2 relative">
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-3 z-20 pointer-events-none">
                                    <Lock className="w-5 h-5 text-amber-500 mb-1" />
                                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest text-center">Locked for Subscribers</span>
                                </div>
                                <div className="w-full relative z-30 flex flex-col gap-2 pointer-events-auto">
                                    <div className="flex gap-2">
                                      <input 
                                        type="text"
                                        placeholder="PROMO CODE" 
                                        onClick={(e) => e.stopPropagation()}
                                        value={unlockCodeInputs[player.id] || ''}
                                        onChange={(e) => setUnlockCodeInputs(prev => ({...prev, [player.id]: e.target.value}))}
                                        className="w-full bg-black/80 border border-amber-500/30 text-xs px-2 py-2 rounded-lg outline-none focus:border-amber-500 transition-colors uppercase font-mono"
                                      />
                                      <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (unlockCodeInputs[player.id]) {
                                              buyPlayer(player.id, 'base', unlockCodeInputs[player.id], undefined, profile?.subscription);
                                              setUnlockCodeInputs(prev => ({...prev, [player.id]: ''}));
                                            } else {
                                              toast.error("Please enter a valid promo code!");
                                            }
                                        }}
                                        className="bg-amber-500 text-black px-3 rounded-lg font-black uppercase text-xs"
                                      >
                                        UNLOCK
                                      </button>
                                    </div>
                                    {!profile?.subscription && (
                                     <button 
                                       onClick={(e) => {
                                           e.stopPropagation();
                                           setActiveTab('pricing');
                                       }}
                                       className="w-full bg-amber-500/20 text-amber-500 border border-amber-500/50 py-2 rounded-xl font-bold uppercase tracking-widest hover:bg-amber-500/30 transition-colors text-xs"
                                     >
                                         Get Subscription
                                     </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                          <button 
                              onClick={(e) => {
                                  e.stopPropagation();
                                  buyPlayer(player.id, 'base', undefined, undefined, profile?.subscription);
                              }}
                              className="w-full bg-[#48A111] text-[#0a0a0a] py-3 rounded-xl font-black italic text-lg uppercase tracking-tight hover:bg-[#3d8a0f] transition-colors mt-2"
                          >
                              TRADE NOW
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <PlayerDetailsModal 
        player={selectedPlayer}
        isOpen={selectedPlayer !== null}
        onClose={() => setSelectedPlayer(null)}
      />
    </div>
  );
};
