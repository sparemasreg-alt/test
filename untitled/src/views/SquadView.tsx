import React, { useState, useMemo, useEffect } from 'react';
import { useMarketStore } from '../store';
import { PlayerCard3D } from '../components/PlayerCard3D';
import { CreateAuctionModal } from '../components/CreateAuctionModal';
import { UpgradePlayerModal } from '../components/UpgradePlayerModal';
import { LeaderboardView } from './LeaderboardView';
import { Gavel, Search, Users, Briefcase, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { managersData, ManagerData } from '../data/managers';
import { findPlayerById } from '../utils/playerMatcher';

export const SquadView = () => {
    const user = useMarketStore(state => state.user);
    const players = useMarketStore(state => state.players);
    const sellPlayer = useMarketStore(state => state.sellPlayer);
    const reclaimPlayer = useMarketStore(state => state.reclaimPlayer);
    const upgradePlayer = useMarketStore(state => state.upgradePlayer);
    
    const [selectedAuctionPlayer, setSelectedAuctionPlayer] = useState<any | null>(null);
    const [selectedUpgradePlayer, setSelectedUpgradePlayer] = useState<any | null>(null);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'players' | 'managers' | 'leaderboard'>('players');
    const buyManager = useMarketStore(state => state.buyManager);
    const setActiveManager = useMarketStore(state => state.setActiveManager);
    
    const ownedPlayers = useMemo(() => {
        return user.portfolio.map(port => {
            const p = findPlayerById(players, port.id);
            if(!p) return null;
            return { ...p, docId: port.docId, level: port.level, overall: port.overall, onAuction: port.onAuction, onTrade: port.onTrade, auctionId: port.auctionId };
        }).filter(Boolean) as (typeof players[0] & { docId: string, level: number, overall?: number, onAuction?: boolean, onTrade?: boolean, auctionId?: string | null })[];
    }, [user.portfolio, players]);

    const squadOVR = useMemo(() => {
        if (ownedPlayers.length === 0) return 0;
        const total = ownedPlayers.reduce((sum, p) => sum + (p.overall || p.stats.overall || 80), 0);
        return Math.round(total / ownedPlayers.length);
    }, [ownedPlayers]);

    const filteredPlayers = useMemo(() => {
        return ownedPlayers.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }, [ownedPlayers, search]);

    const filteredManagers = useMemo(() => {
        return managersData.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));
    }, [search]);

    const renderHeader = () => (
        <div className="flex flex-col gap-4 mb-6 shrink-0 border-b border-white/10 pb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-[#e0e0e0] italic">Squad<span className="text-[#48A111]">.</span></h1>
                    <p className="text-[#e0e0e0] opacity-40 font-mono tracking-widest text-sm uppercase mb-3">Manage Your Team, Managers & Leaderboard</p>
                    <div className="inline-flex items-center gap-2 bg-[#48A111]/10 border border-[#48A111]/30 rounded-xl px-4 py-2">
                        <span className="text-xs uppercase tracking-widest font-bold opacity-60 text-[#48A111]">Team OVR</span>
                        <span className="text-xl font-mono font-black text-[#48A111]">{squadOVR}</span>
                        {user.activeManager && (
                            <div className="ml-4 border-l border-[#48A111]/30 pl-4 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-[#48A111]" />
                                <span className="text-xs font-bold text-[#e0e0e0] opacity-80">{managersData.find(m => m.id === user.activeManager)?.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl w-fit">
                    <button 
                        onClick={() => setActiveTab('players')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'players' 
                            ? 'bg-[#48A111] text-black' 
                            : 'text-[#e0e0e0] opacity-50 hover:opacity-100 hover:bg-white/5'
                        }`}
                    >
                        <Users className="w-4 h-4" /> Players
                    </button>
                    <button 
                        onClick={() => setActiveTab('managers')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'managers' 
                            ? 'bg-[#48A111] text-black' 
                            : 'text-[#e0e0e0] opacity-50 hover:opacity-100 hover:bg-white/5'
                        }`}
                    >
                        <Briefcase className="w-4 h-4" /> Managers
                    </button>
                    <button 
                        onClick={() => setActiveTab('leaderboard')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'leaderboard' 
                            ? 'bg-[#48A111] text-black' 
                            : 'text-[#e0e0e0] opacity-50 hover:opacity-100 hover:bg-white/5'
                        }`}
                    >
                        <Trophy className="w-4 h-4" /> Leaderboard
                    </button>
                </div>

                {activeTab !== 'leaderboard' && (
                  <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e0e0e0] opacity-40" />
                      <Input 
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          className="w-full bg-white/5 border-white/10 text-[#e0e0e0] pl-10 focus-visible:ring-[#48A111]" 
                          placeholder={activeTab === 'players' ? "Search your squad..." : "Search managers..."}
                      />
                  </div>
                )}
            </div>
        </div>
    );

    const renderManagers = () => {
        if (filteredManagers.length === 0) return <div className="text-center text-white/40 mt-10">No managers found.</div>;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-12">
                {filteredManagers.map(manager => {
                    const isOwned = user.managers.some(m => m.managerId === manager.id);
                    const isActive = user.activeManager === manager.id;

                    const rarityColors: Record<string, string> = {
                        Bronze: 'from-[#CD7F32] to-[#8B4513]',
                        Silver: 'from-[#C0C0C0] to-[#808080]',
                        Gold: 'from-[#FFD700] to-[#DAA520]',
                        Elite: 'from-[#e100ff] to-[#7f00ff]',
                        Master: 'from-[#ff0000] to-[#8b0000]',
                        Icon: 'from-[#ffffff] to-[#cccccc]'
                    };

                    return (
                        <div key={manager.id} className={`bg-[#0a0a0a] border rounded-2xl overflow-hidden flex flex-col relative transition-all ${
                            isActive ? 'border-[#48A111] shadow-[0_0_20px_rgba(72,161,17,0.2)]' : 'border-white/10 hover:border-white/30'
                        }`}>
                            <div className={`h-2 w-full bg-gradient-to-r ${rarityColors[manager.rarity]} opacity-80`} />
                            
                            <div className="p-5 flex-1 flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-black text-lg text-white uppercase tracking-tight">{manager.name}</h3>
                                        <p className="text-xs text-white/50">{manager.nationality} • {manager.club}</p>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-xs font-black bg-gradient-to-r ${rarityColors[manager.rarity]} text-black`}>
                                        {manager.overall} OVR
                                    </div>
                                </div>
                                
                                <div className="bg-white/5 p-3 rounded-lg flex-1">
                                    <p className="text-xs text-[#48A111] mb-1 font-bold">TACTICS</p>
                                    <p className="text-sm text-white/80 font-mono leading-tight">{manager.tactics}</p>
                                </div>
                                
                                <div className="bg-white/5 p-3 rounded-lg">
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Legacy</p>
                                    <p className="text-xs text-white/60">{manager.achievements}</p>
                                </div>
                            </div>

                            <div className="p-4 bg-white/[0.02] border-t border-white/5">
                                {isOwned ? (
                                    <button 
                                        onClick={() => !isActive && setActiveManager(manager.id)}
                                        disabled={isActive}
                                        className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                            isActive 
                                            ? 'bg-[#48A111]/20 text-[#48A111] border border-[#48A111]/50 cursor-default' 
                                            : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                                        }`}
                                    >
                                        {isActive ? 'Active Manager' : 'Set Active'}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => buyManager(manager.id)}
                                        className="w-full bg-[#48A111]/20 hover:bg-[#48A111]/40 border border-[#48A111]/50 text-[#48A111] font-bold uppercase tracking-widest py-2.5 rounded-lg transition-colors font-mono text-xs flex justify-between px-4 items-center"
                                    >
                                        <span>Hire Manager</span>
                                        <span>${manager.price.toLocaleString()}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="p-6 bg-[#050505] flex flex-col h-full overflow-y-auto">
            {renderHeader()}

            <div className="flex-1 overflow-y-auto pt-2">
                {activeTab === 'managers' ? (
                    renderManagers()
                ) : activeTab === 'leaderboard' ? (
                    <LeaderboardView />
                ) : (
                    filteredPlayers.length === 0 ? (
                        <div className="text-center text-white/40 mt-10">No players found.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-16 pb-12 pt-4">
                            {filteredPlayers.map(player => (
                                <div key={player.docId} className={`bg-white/5 border rounded-[24px] overflow-hidden flex flex-col items-center gap-6 p-6 relative group transition-all ${
                                    (player.onAuction || player.onTrade)
                                    ? 'border-purple-600/30 bg-purple-950/5 shadow-[0_0_30px_rgba(147,51,234,0.05)]' 
                                    : 'border-white/10 hover:border-[#48A111]/50 hover:shadow-[0_0_30px_rgba(72,161,17,0.15)]'
                                }`}>
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity" style={{backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 10px)'}}></div>
                                    <div className="w-full shrink-0 relative z-10 mb-4">
                                        <div className="absolute top-0 right-0 flex flex-col gap-1 z-20">
                                            <div className="bg-[#48A111] text-black font-black text-xs px-2 py-1 rounded-bl-lg">LVL {player.level}</div>
                                            <div className="bg-black/60 backdrop-blur text-white font-black text-xs px-2 py-1 rounded-bl-lg border border-white/10">OVR {player.overall}</div>
                                        </div>
                                        <PlayerCard3D player={player} level={player.level} overall={player.overall} height="h-[280px]" />
                                    </div>
                                    <div className="w-full relative z-10 mt-auto flex flex-col gap-2">
                                        {(player.onAuction || player.onTrade) ? (
                                            <div className="bg-purple-600/10 border border-purple-500/30 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                                                <div className="flex items-center gap-1.5 text-purple-400 text-xs font-black uppercase tracking-wider">
                                                    <Gavel className="w-4 h-4 animate-bounce" />
                                                    {player.onAuction ? 'On Active Auction' : 'On Active Exchange'}
                                                </div>
                                                <p className="text-[10px] text-purple-300/60 font-mono text-center mb-1">
                                                    Escrow locked in deals chamber
                                                </p>
                                                <button 
                                                    onClick={() => reclaimPlayer(player.docId)}
                                                    className="w-full bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 text-purple-300 font-bold uppercase tracking-widest py-2 rounded-lg transition-colors font-mono text-[10px]"
                                                >
                                                    Reclaim Player
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => setSelectedUpgradePlayer(player)}
                                                    className="w-full bg-[#48A111]/20 hover:bg-[#48A111]/40 border border-[#48A111]/50 text-[#48A111] font-bold uppercase tracking-widest py-3 rounded-xl transition-colors font-mono text-xs flex justify-between px-4 items-center"
                                                >
                                                    <span>Upgrade</span>
                                                    <span>-${player.level * 500}</span>
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        sellPlayer(player.docId);
                                                    }}
                                                    className="w-full bg-red-600/20 hover:bg-red-600/40 border border-red-500/50 text-red-500 font-bold uppercase tracking-widest py-3 rounded-xl transition-colors font-mono text-xs flex justify-between px-4 items-center"
                                                >
                                                    <span>Sell (Instant)</span>
                                                    <span>+${player.market.currentPrice.toLocaleString()}</span>
                                                </button>
                                                <button 
                                                    onClick={() => setSelectedAuctionPlayer(player)}
                                                    className="w-full bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/50 text-purple-500 font-bold uppercase tracking-widest py-3 rounded-xl transition-colors font-mono text-xs text-center"
                                                >
                                                    Send to Auction
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        const duration = 60;
                                                        if (duration > 0) {
                                                            useMarketStore.getState().createTrade(player.docId, duration);
                                                        }
                                                    }}
                                                    className="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 text-blue-500 font-bold uppercase tracking-widest py-3 rounded-xl transition-colors font-mono text-xs text-center"
                                                >
                                                    List for Exchange
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            <CreateAuctionModal
                player={selectedAuctionPlayer}
                isOpen={selectedAuctionPlayer !== null}
                onClose={() => setSelectedAuctionPlayer(null)}
            />

            <UpgradePlayerModal
                player={selectedUpgradePlayer}
                isOpen={selectedUpgradePlayer !== null}
                onClose={() => setSelectedUpgradePlayer(null)}
            />
        </div>
    );
};

