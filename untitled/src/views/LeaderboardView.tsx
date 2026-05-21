import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Star, Flame, Target } from 'lucide-react';

export const LeaderboardView = () => {
    const [users, setUsers] = useState<any[]>([]);
    
    useEffect(() => {
        const unsub = (globalThis as any).onSnapshot((globalThis as any).collection((globalThis as any).db, 'users'), (snap: any) => {
            const list = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
            // sort by coins
            list.sort((a: any, b: any) => (b.coins || 0) - (a.coins || 0));
            setUsers(list);
        });
        return () => unsub();
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#050505] p-6 lg:p-10 hide-scrollbar overflow-y-auto">
            <div className="mb-8">
                <h1 className="text-4xl font-black uppercase tracking-tighter text-[#e0e0e0] italic flex items-center gap-3">
                    <Trophy className="w-8 h-8 text-yellow-400" />
                    Global Rankings<span className="text-[#48A111]">.</span>
                </h1>
                <p className="text-[#e0e0e0] opacity-40 font-mono tracking-widest text-sm uppercase mt-2">
                    Top Managers by Club Value
                </p>
            </div>

            <div className="flex flex-col gap-3 max-w-4xl mx-auto w-full">
                {users.map((u, idx) => {
                    const isTop3 = idx < 3;
                    return (
                        <div key={u.id} className={`flex items-center p-4 rounded-2xl border transition-all ${
                            idx === 0 ? 'bg-yellow-500/10 border-yellow-500/50 scale-[1.02] shadow-[0_0_30px_rgba(234,179,8,0.15)]' :
                            idx === 1 ? 'bg-gray-400/10 border-gray-400/50' :
                            idx === 2 ? 'bg-amber-700/10 border-amber-700/50' :
                            'bg-white/5 border-white/5 hover:bg-white/10'
                        }`}>
                            
                            <div className="flex items-center justify-center w-12 font-black text-2xl italic opacity-50 mr-4 font-mono">
                                #{idx + 1}
                            </div>
                            
                            <div className="flex-1 flex items-center justify-between">
                                 <div className="flex items-center gap-4">
                                    <div className="relative">
                                        {u.photoURL ? (
                                            <img
                                                src={u.photoURL}
                                                alt={u.username || u.email}
                                                className="w-10 h-10 rounded-full border border-white/20 object-cover"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-black ${
                                                idx === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600' :
                                                idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                                                idx === 2 ? 'bg-gradient-to-br from-amber-500 to-amber-800' :
                                                'bg-gradient-to-br from-[#48A111] to-[#1a1a1a] text-white border border-white/20'
                                            }`}>
                                                {(u.username || u.email || 'U')[0].toUpperCase()}
                                            </div>
                                        )}
                                        {u.nationality && (
                                            <div className="absolute -bottom-1 -right-1 bg-black text-[#48A111] px-1 py-0.5 rounded border border-[#48A111]/30 text-[8px] font-bold font-mono leading-none scale-90">
                                                {u.nationality.slice(0, 3).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-extrabold text-[#e0e0e0]">
                                                {u.username || u.email?.split('@')[0]}
                                            </span>
                                            {u.club && (
                                                <span className="text-[10px] bg-white/5 border border-white/10 text-[#48A111] px-1.5 py-0.5 rounded font-mono uppercase tracking-wide">
                                                    {u.club}
                                                </span>
                                            )}
                                        </div>
                                        {u.bio ? (
                                            <span className="text-xs text-white/50 italic mt-0.5 max-w-sm sm:max-w-md md:max-w-lg truncate">
                                                "{u.bio}"
                                            </span>
                                        ) : (
                                            u.email && <span className="text-[11px] text-white/30 truncate">{u.email}</span>
                                        )}
                                        {idx === 0 && (
                                            <span className="text-[10px] text-yellow-500 uppercase tracking-widest font-black flex items-center gap-1 mt-1">
                                                <Medal className="w-3 h-3 animate-bounce" /> Reigning Champion
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] uppercase font-bold tracking-widest opacity-40 font-mono">Wealth</span>
                                    <span className={`text-xl font-black font-mono flex items-center gap-1 ${
                                        idx === 0 ? 'text-yellow-400' : 
                                        idx === 1 ? 'text-gray-300' : 
                                        idx === 2 ? 'text-amber-600' : 
                                        'text-[#48A111]'
                                    }`}>
                                        ${(u.coins || 0).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                        </div>
                    )
                })}
            </div>
        </div>
    );
};
