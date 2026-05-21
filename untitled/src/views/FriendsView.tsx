import React, { useState, useEffect } from 'react';
import { useMarketStore } from '../store';
import { useAuth } from '../hooks/useAuth';
import { Search, UserPlus, Users, Coins, UserRound, ArrowRight, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const FriendsView = () => {
    const { user, searchUsers, addFriend, transferCoins, transferPlayer, players } = useMarketStore();
    const { profile } = useAuth();
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);
    
    const [selectedFriend, setSelectedFriend] = useState<any | null>(null);
    const [transferMode, setTransferMode] = useState<'coins' | 'player' | null>(null);
    const [transferAmount, setTransferAmount] = useState('');
    const [selectedPlayerDocId, setSelectedPlayerDocId] = useState('');

    const [allUsers, setAllUsers] = useState<any[]>([]);

    useEffect(() => {
        const fetchInitialUsers = async () => {
            setSearching(true);
            const results = await searchUsers('');
            setSearchResults(results);
            setAllUsers(results);
            setSearching(false);
        };
        fetchInitialUsers();
    }, [searchUsers]);

    const liveFriendDetails = (friendObj: any) => {
        const found = allUsers.find(u => u.uid === friendObj.uid);
        return found || friendObj;
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setSearching(true);
        const results = await searchUsers(search.trim());
        setSearchResults(results);
        setSearching(false);
    };

    const handleAdd = async (u: any) => {
        await addFriend(u.uid, u.username, u.email);
        setSearchResults(prev => prev.filter(r => r.uid !== u.uid));
    };

    const handleSendCoins = async () => {
        const amount = parseInt(transferAmount);
        if (!selectedFriend || isNaN(amount) || amount <= 0) return;
        await transferCoins(selectedFriend.uid, amount);
        setTransferMode(null);
        setTransferAmount('');
    };

    const handleSendPlayer = async () => {
        if (!selectedFriend || !selectedPlayerDocId) return;
        await transferPlayer(selectedFriend.uid, selectedPlayerDocId);
        setTransferMode(null);
        setSelectedPlayerDocId('');
    };

    const squadPlayers = user.portfolio.map(p => ({
        ...p,
        details: players.find(player => player.id === p.id)
    }));

    return (
        <div className="p-6 bg-[#050505] flex flex-col h-full overflow-y-auto">
            <div className="flex flex-col gap-4 mb-6 shrink-0 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-[#e0e0e0] italic">Friends<span className="text-[#48A111]">.</span></h1>
                    <p className="text-[#e0e0e0] opacity-40 font-mono tracking-widest text-sm uppercase">Manage Connections & Transfers</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* LEFT SIDE: My Friends & Transfer Modals */}
                <div className="space-y-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#e0e0e0] opacity-50 flex items-center gap-2">
                        <Users className="w-4 h-4" /> My Friends
                    </h2>
                    
                    {user.friends.length === 0 ? (
                        <div className="text-center text-white/40 py-10 bg-white/5 rounded-2xl border border-white/10">
                            No friends yet. Search and add them!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {user.friends.map(f => {
                                const friend = liveFriendDetails(f);
                                return (
                                    <div key={friend.uid} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-white/10">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                {friend.photoURL ? (
                                                    <img 
                                                        src={friend.photoURL} 
                                                        alt={friend.username || friend.email} 
                                                        className="w-11 h-11 rounded-full border border-white/15 object-cover"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                ) : (
                                                    <div className="w-11 h-11 rounded-full bg-[#48A111]/15 border border-[#48A111]/30 flex items-center justify-center text-[#48A111] font-bold">
                                                        {(friend.username || friend.email || 'U')[0].toUpperCase()}
                                                    </div>
                                                )}
                                                {friend.nationality && (
                                                    <div className="absolute -bottom-1 -right-1 bg-black text-[#48A111] px-1 py-0.5 rounded border border-[#48A111]/20 text-[7px] font-mono font-bold leading-none scale-90">
                                                        {friend.nationality.slice(0, 3).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-white tracking-wide">{friend.username || friend.email?.split('@')[0]}</p>
                                                    {friend.club && (
                                                        <span className="text-[9px] bg-white/5 border border-white/10 text-[#48A111] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                                                            {friend.club}
                                                        </span>
                                                    )}
                                                </div>
                                                {friend.bio ? (
                                                    <p className="text-xs text-white/50 italic mt-0.5 max-w-xs">{friend.bio}</p>
                                                ) : (
                                                    <p className="text-xs text-white/40">{friend.email}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => { setSelectedFriend(friend); setTransferMode('coins'); }}
                                                className="px-3 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1"
                                            >
                                                <Coins className="w-3 h-3" /> Coins
                                            </button>
                                            <button 
                                                onClick={() => { setSelectedFriend(friend); setTransferMode('player'); }}
                                                className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-500 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-1"
                                            >
                                                <UserRound className="w-3 h-3" /> Player
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* TRANSFER AREA */}
                    {selectedFriend && transferMode && (
                        <div className="mt-8 p-6 bg-[#0a0a0a] border border-[#48A111]/30 rounded-2xl shadow-[0_0_30px_rgba(72,161,17,0.1)] relative">
                            <button onClick={() => setTransferMode(null)} className="absolute top-4 right-4 text-white/40 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                            <h3 className="text-lg font-black uppercase text-white tracking-tighter mb-4 flex items-center gap-2">
                                Transfer to <span className="text-[#48A111]">{selectedFriend.username}</span>
                            </h3>

                            {transferMode === 'coins' && (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Amount</p>
                                        <Input
                                            type="number"
                                            value={transferAmount}
                                            onChange={e => setTransferAmount(e.target.value)}
                                            placeholder="e.g. 5000"
                                            className="bg-white/5 border-white/10 text-white"
                                        />
                                        <p className="text-xs text-white/40 mt-2">Available Balance: <span className="text-[#48A111] font-mono">${(profile?.coins || 0).toLocaleString()}</span></p>
                                    </div>
                                    <button 
                                        onClick={handleSendCoins}
                                        className="w-full py-3 bg-[#48A111] text-black font-black uppercase tracking-widest rounded-lg hover:bg-[#48A111]/80 transition-all flex justify-center items-center gap-2"
                                    >
                                        Send Coins <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}

                            {transferMode === 'player' && (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Select Player</p>
                                        <select 
                                            value={selectedPlayerDocId}
                                            onChange={e => setSelectedPlayerDocId(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 text-white p-3 rounded-lg text-sm"
                                        >
                                            <option value="">-- Choose a player --</option>
                                            {squadPlayers.map(p => (
                                                <option key={p.docId} value={p.docId} disabled={p.onAuction}>
                                                    {p.details?.name} (OVR: {p.overall || p.details?.stats.overall}) {p.onAuction ? '- ON AUCTION' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button 
                                        onClick={handleSendPlayer}
                                        disabled={!selectedPlayerDocId}
                                        className="w-full py-3 bg-blue-600 text-white font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                                    >
                                        Transfer Player <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE: Search Users */}
                <div className="space-y-6">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[#e0e0e0] opacity-50 flex items-center gap-2">
                        <Search className="w-4 h-4" /> Find Users
                    </h2>
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <Input 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Enter username or email..."
                            className="bg-white/5 border-white/10 text-[#e0e0e0] focus-visible:ring-[#48A111] flex-1"
                        />
                        <button 
                            type="submit"
                            disabled={searching}
                            className="px-6 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest rounded-lg transition-all"
                        >
                            {searching ? '...' : 'Search'}
                        </button>
                    </form>

                    <div className="space-y-4">
                        {searchResults.map(u => {
                            const isFriend = user.friends.some(f => f.uid === u.uid);
                            return (
                                 <div key={u.uid} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-white/10">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            {u.photoURL ? (
                                                <img 
                                                    src={u.photoURL} 
                                                    alt={u.username || u.email} 
                                                    className="w-11 h-11 rounded-full border border-white/15 object-cover"
                                                    referrerPolicy="no-referrer"
                                                />
                                            ) : (
                                                <div className="w-11 h-11 rounded-full bg-[#48A111]/20 border border-[#48A111]/30 flex items-center justify-center text-[#48A111] font-bold">
                                                    {(u.username || u.email || 'U')[0].toUpperCase()}
                                                </div>
                                            )}
                                            {u.nationality && (
                                                <div className="absolute -bottom-1 -right-1 bg-black text-[#48A111] px-1 py-0.5 rounded border border-[#48A111]/20 text-[7px] font-mono font-bold leading-none scale-90">
                                                    {u.nationality.slice(0, 3).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="font-bold text-white tracking-wide">{u.username || u.email?.split('@')[0]}</p>
                                                {u.club && (
                                                    <span className="text-[9px] bg-white/5 border border-white/10 text-[#48A111] px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                                                        {u.club}
                                                    </span>
                                                )}
                                            </div>
                                            {u.bio ? (
                                                <p className="text-xs text-white/50 italic mt-0.5 max-w-xs">{u.bio}</p>
                                            ) : (
                                                <p className="text-xs text-white/40">{u.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAdd(u)}
                                        disabled={isFriend}
                                        className={`p-2.5 rounded-lg transition-all shrink-0 ${
                                            isFriend 
                                            ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/5' 
                                            : 'bg-[#48A111]/20 text-[#48A111] hover:bg-[#48A111]/40 border border-[#48A111]/50'
                                        }`}
                                    >
                                        <UserPlus className="w-4 h-4" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
};
