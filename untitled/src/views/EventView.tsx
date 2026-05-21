import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMarketStore } from '../store';
import { PackOpeningOverlay } from '../components/PackOpeningOverlay';
import { toast } from 'sonner';

export const EventView = () => {
    const [packs, setPacks] = useState<any[]>([]);
    const [isOpening, setIsOpening] = useState(false);
    const [resultPlayers, setResultPlayers] = useState<any[]>([]);
    const { user, loading } = useAuth();
    const buyPack = useMarketStore(state => state.buyPack);

    useEffect(() => {
        if (loading || !user) return;
        const unsubPacks = onSnapshot(collection((globalThis as any).db, 'packs'), (snap: any) => {
            const list = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
            // Add some design colors since they aren't in DB
            const coloredPacks = list.map((p: any) => ({
                ...p,
                color: p.id === 'bronze' ? 'from-amber-700 to-[#0a0a0a]' : 
                       p.id === 'silver' ? 'from-gray-400 to-[#0a0a0a]' : 
                       p.id === 'gold' ? 'from-yellow-400 to-[#0a0a0a]' : 
                       'from-blue-600 to-[#0a0a0a]'
            }));
            setPacks(coloredPacks);
        });

        return () => unsubPacks();
    }, [user, loading]);

    const handlePurchase = async (packId: string) => {
        try {
            setIsOpening(true);
            const players = await buyPack(packId);
            setResultPlayers(players);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error buying pack");
            setIsOpening(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#050505]">
            <PackOpeningOverlay 
                isOpen={isOpening} 
                players={resultPlayers} 
                onComplete={() => {
                    setIsOpening(false);
                    setResultPlayers([]);
                }} 
            />
            <div className="p-6 border-b border-white/10 shrink-0">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-[#e0e0e0] italic">Event<span className="text-[#48A111]">.</span></h1>
                        <p className="text-[#e0e0e0] opacity-40 font-mono tracking-widest text-sm uppercase">Active World Events</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {packs.map(pack => (
                        <div key={pack.id} className={`relative rounded-[32px] overflow-hidden aspect-[3/4] flex flex-col items-center justify-between p-8 group cursor-pointer border-2 border-white/10 bg-white/5`}>
                            {/* Colorful background representing the pack */}
                            <div className={`absolute inset-0 opacity-20 bg-gradient-to-b ${pack.color || 'from-blue-600 to-[#0a0a0a]'} group-hover:opacity-40 transition-opacity`}></div>
                            <div className="absolute inset-0 pointer-events-none" style={{backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 0, transparent 10px)'}}></div>
                            
                            <div className="relative z-10 text-center mt-12">
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-[#e0e0e0] italic drop-shadow-lg">{pack.name}</h2>
                                <p className="text-[#e0e0e0] opacity-60 font-bold uppercase tracking-widest text-xs mt-4">Limited Event Packs</p>
                            </div>
                            
                            <div className="relative z-10 w-full">
                                <button 
                                    onClick={() => handlePurchase(pack.id)}
                                    className="w-full bg-[#e0e0e0] text-[#0a0a0a] py-4 rounded-xl font-black text-xl uppercase tracking-tighter italic hover:bg-white transition-colors shadow-xl"
                                >
                                    ${pack.price.toLocaleString()}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
