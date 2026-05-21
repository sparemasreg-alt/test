import React, { useMemo, useState } from 'react';
import { useMarketStore } from '../store';
import { VirtualMarketGrid } from '../components/VirtualMarketGrid';
import { EventView } from './EventView';
import { Input } from '@/components/ui/input';
import { Search, LayoutGrid, CalendarDays } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const MarketView = () => {
    const { players } = useMarketStore();
    const [search, setSearch] = useState('');
    const [positionFilter, setPositionFilter] = useState<string>('all');
    const [rarityFilter, setRarityFilter] = useState<string>('all');
    const [nationFilter, setNationFilter] = useState<string>('all');
    const [clubFilter, setClubFilter] = useState<string>('all');
    const [activeTab, setActiveTab] = useState<'market' | 'event'>('market');

    const uniqueNations = useMemo(() => Array.from(new Set(players.map(p => p.nation).filter(Boolean))).sort(), [players]);
    const uniqueClubs = useMemo(() => Array.from(new Set(players.map(p => p.club).filter(Boolean))).sort(), [players]);

    const filteredPlayers = useMemo(() => {
        return players.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
            const matchesPosition = positionFilter === 'all' || p.position === positionFilter;
            const matchesRarity = rarityFilter === 'all' || p.card.rarity === rarityFilter;
            const matchesNation = nationFilter === 'all' || p.nation === nationFilter;
            const matchesClub = clubFilter === 'all' || p.club === clubFilter;
            return matchesSearch && matchesPosition && matchesRarity && matchesNation && matchesClub;
        });
    }, [players, search, positionFilter, rarityFilter, nationFilter, clubFilter]);

    return (
        <div className="flex flex-col h-full bg-[#050505]">
            <div className="p-6 border-b border-white/10 shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-[#e0e0e0] italic">Market<span className="text-[#48A111]">.</span></h1>
                        <p className="text-[#e0e0e0] opacity-40 font-mono tracking-widest text-sm uppercase">Live Transfer Market & Events</p>
                    </div>
                </div>

                <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl w-fit mb-6">
                    <button 
                        onClick={() => setActiveTab('market')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'market' 
                            ? 'bg-[#48A111] text-black' 
                            : 'text-[#e0e0e0] opacity-50 hover:opacity-100 hover:bg-white/5'
                        }`}
                    >
                        <LayoutGrid className="w-4 h-4" /> Market
                    </button>
                    <button 
                        onClick={() => setActiveTab('event')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'event' 
                            ? 'bg-[#48A111] text-black' 
                            : 'text-[#e0e0e0] opacity-50 hover:opacity-100 hover:bg-white/5'
                        }`}
                    >
                        <CalendarDays className="w-4 h-4" /> Events
                    </button>
                </div>
                
                {activeTab === 'market' && (
                  <div className="flex gap-4 flex-wrap">
                      <div className="relative flex-1 min-w-[200px]">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e0e0e0] opacity-40" />
                          <Input 
                              value={search}
                              onChange={(e) => setSearch(e.target.value)}
                              className="w-full bg-white/5 border-white/10 text-[#e0e0e0] pl-10 focus-visible:ring-[#48A111]" 
                              placeholder="SEARCH PLAYERS..."
                          />
                      </div>
                      <Select value={positionFilter} onValueChange={setPositionFilter}>
                          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-[#e0e0e0] focus:ring-[#48A111]">
                              <SelectValue placeholder="Position" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0c0d12] border-white/10 text-[#e0e0e0]">
                              <SelectItem value="all">All Positions</SelectItem>
                              <SelectItem value="ST">ST</SelectItem>
                              <SelectItem value="LW">LW</SelectItem>
                              <SelectItem value="RW">RW</SelectItem>
                              <SelectItem value="CAM">CAM</SelectItem>
                              <SelectItem value="CM">CM</SelectItem>
                              <SelectItem value="CDM">CDM</SelectItem>
                              <SelectItem value="CB">CB</SelectItem>
                              <SelectItem value="LB">LB</SelectItem>
                              <SelectItem value="RB">RB</SelectItem>
                              <SelectItem value="GK">GK</SelectItem>
                          </SelectContent>
                      </Select>
                      <Select value={rarityFilter} onValueChange={setRarityFilter}>
                          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-[#e0e0e0] focus:ring-[#48A111]">
                              <SelectValue placeholder="Rarity" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0c0d12] border-white/10 text-[#e0e0e0] max-h-60 overflow-y-auto w-[250px]">
                              <SelectItem value="all">All Rarities</SelectItem>
                              <SelectItem value="Bronze">Bronze</SelectItem>
                              <SelectItem value="Silver">Silver</SelectItem>
                              <SelectItem value="Gold">Gold</SelectItem>
                              <SelectItem value="Elite">Elite</SelectItem>
                              <SelectItem value="Master">Master</SelectItem>
                              <SelectItem value="Icon">Icon</SelectItem>
                          </SelectContent>
                      </Select>
                      <Select value={nationFilter} onValueChange={setNationFilter}>
                          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-[#e0e0e0] focus:ring-[#48A111]">
                              <SelectValue placeholder="Nation" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0c0d12] border-white/10 text-[#e0e0e0] max-h-60 overflow-y-auto">
                              <SelectItem value="all">All Nations</SelectItem>
                              {uniqueNations.map(nat => (
                                  <SelectItem key={nat} value={nat}>{nat}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                      <Select value={clubFilter} onValueChange={setClubFilter}>
                          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-[#e0e0e0] focus:ring-[#48A111]">
                              <SelectValue placeholder="Club" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0c0d12] border-white/10 text-[#e0e0e0] max-h-60 overflow-y-auto">
                              <SelectItem value="all">All Clubs</SelectItem>
                              {uniqueClubs.map(club => (
                                  <SelectItem key={club} value={club}>{club}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                      {(search || positionFilter !== 'all' || rarityFilter !== 'all' || nationFilter !== 'all' || clubFilter !== 'all') && (
                          <button
                              onClick={() => {
                                  setSearch('');
                                  setPositionFilter('all');
                                  setRarityFilter('all');
                                  setNationFilter('all');
                                  setClubFilter('all');
                              }}
                              className="text-xs font-bold text-red-400 hover:text-red-300 uppercase tracking-widest px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all"
                          >
                              Clear Filters
                          </button>
                      )}
                  </div>
                )}
            </div>

            <div className="flex-1 min-h-0 pt-6">
                {activeTab === 'market' ? (
                  <div className="h-full flex flex-col">
                      <div className="px-6 pb-2 text-xs font-mono text-[#8e9299]">
                          Showing {filteredPlayers.length} {filteredPlayers.length === 1 ? 'player' : 'players'}
                      </div>
                      <VirtualMarketGrid players={filteredPlayers} />
                  </div>
                ) : (
                  <EventView />
                )}
            </div>
        </div>
    );
};
