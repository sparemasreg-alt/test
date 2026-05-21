import React from 'react';
import { useMarketStore } from '../store';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, TrendingUp, Trophy, Users, Gift } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

export const DashboardView = () => {
    const { user: marketUser, players } = useMarketStore();
    const { user: authUser, profile } = useAuth();
    
    const handleClaimDaily = async () => {
        if (!authUser?.uid) return;
        try {
            const userRef = (globalThis as any).doc((globalThis as any).db, 'users', authUser.uid);
            const userSnap = await (globalThis as any).getDoc(userRef);
            if (!userSnap.exists()) return;
            const userData = userSnap.data();
            
            // simple check if lastClaim is from a different day
            const now = new Date();
            const lastClaimDate = userData.lastClaim ? new Date(userData.lastClaim) : null;
            
            if (lastClaimDate && lastClaimDate.toDateString() === now.toDateString()) {
                toast.error("You already claimed your daily reward today!");
                return;
            }

            // Fetch custom rewards from admin settings
            const settingsRef = (globalThis as any).doc((globalThis as any).db, 'admin_settings', 'daily_rewards');
            const settingsSnap = await (globalThis as any).getDoc(settingsRef);
            
            let rewardAmount = 1000;
            if (settingsSnap.exists()) {
                const conf = settingsSnap.data();
                const sub = profile?.subscription as string;
                if (sub === 'elite-pkg') {
                    rewardAmount = conf.elite || 5000;
                } else if (sub === 'pro-pkg') {
                    rewardAmount = conf.pro || 2500;
                } else if (sub === 'starter-pkg') {
                    rewardAmount = conf.starter || 1500;
                } else {
                    rewardAmount = conf.basic || 1000;
                }
            } else {
                // Default fallback if not configured by admin yet
                const sub = profile?.subscription as string;
                if (sub === 'elite-pkg') rewardAmount = 5000;
                else if (sub === 'pro-pkg') rewardAmount = 2500;
                else if (sub === 'starter-pkg') rewardAmount = 1500;
            }
            
            await (globalThis as any).updateDoc(userRef, {
                coins: (globalThis as any).increment(rewardAmount),
                lastClaim: now.toISOString()
            });
            toast.success(`Successfully claimed ${rewardAmount.toLocaleString()} daily coins! 🎁`);
        } catch (e: any) {
            toast.error("Error claiming daily reward: " + e.message);
        }
    };

    // Calculate portfolio value
    const portfolioValue = marketUser.portfolio.reduce((sum, p) => {
        const basePlayer = players.find(player => player.id === p.id);
        const value = basePlayer ? basePlayer.market.currentPrice * (1 + (p.level - 1) * 0.1) : 0; // Simplified formula
        return sum + value;
    }, 0);

    // Generate dummy portfolio data (keeping for now as requested by user to be 'functional')
    const data = Array.from({length: 30}).map((_, i) => ({
        day: i,
        value: 20000 + Math.random() * 10000 + (i * 200)
    }));

    return (
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex flex-col h-full overflow-y-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-[#e0e0e0] italic">Dashboard<span className="text-[#48A111]">.</span></h1>
                    <p className="text-[#e0e0e0] opacity-40 font-mono tracking-widest text-sm uppercase">
                        Welcome back, {profile?.username || profile?.email.split('@')[0] || 'Manager'}{profile?.club ? ` • ${profile.club}` : ''}
                    </p>
                </div>
                <button 
                  onClick={handleClaimDaily}
                  className="bg-[#48A111] text-black font-black uppercase text-xs py-2 px-4 rounded-xl flex items-center gap-2 hover:bg-[#58c115] shadow-lg shadow-[#48A111]/20 transition-all font-mono"
                >
                    <Gift className="w-4 h-4" /> Claim Daily Bonus</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10 rounded-xl shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] opacity-40 font-bold uppercase tracking-tighter text-[#e0e0e0]">Total Balance</CardTitle>
                        <TrendingUp className="w-4 h-4 text-[#48A111]" />
                    </CardHeader>
                    <CardContent className="mt-1 pb-4">
                        <div className="text-2xl font-black italic tracking-tighter text-[#e0e0e0]">${(profile?.coins || 0).toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-xl shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] opacity-40 font-bold uppercase tracking-tighter text-[#e0e0e0]">Portfolio Value</CardTitle>
                        <Activity className="w-4 h-4 text-blue-500" />
                    </CardHeader>
                    <CardContent className="mt-1 pb-4">
                        <div className="text-2xl font-black italic tracking-tighter text-[#e0e0e0]">${Math.round(portfolioValue).toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-xl shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] opacity-40 font-bold uppercase tracking-tighter text-[#e0e0e0]">Cards Owned</CardTitle>
                        <Users className="w-4 h-4 text-orange-500" />
                    </CardHeader>
                    <CardContent className="mt-1 pb-4">
                        <div className="text-2xl font-black italic tracking-tighter text-[#e0e0e0]">{marketUser.portfolio.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-[#48A111]/5 border-[#48A111]/30 rounded-xl shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] text-[#48A111] font-bold uppercase tracking-tighter">Win Rate</CardTitle>
                        <Trophy className="w-4 h-4 text-[#48A111]" />
                    </CardHeader>
                    <CardContent className="mt-1 pb-4">
                        <div className="text-2xl font-black italic tracking-tighter text-[#e0e0e0]">68.5%</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white/5 border-white/10 rounded-2xl p-6 shadow-none flex flex-col flex-1 min-h-[300px]">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h4 className="text-xs font-bold opacity-40 uppercase text-[#e0e0e0]">Balance History (Live)</h4>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="text-3xl font-black italic text-[#e0e0e0]">${(profile?.coins || 0).toLocaleString()}</span>
                            <span className="text-[#48A111] text-sm font-mono">+14.2%</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-white/10 rounded text-[10px] font-bold text-[#e0e0e0]">1D</button>
                        <button className="px-3 py-1 bg-[#48A111] text-[#050505] rounded text-[10px] font-bold">1W</button>
                        <button className="px-3 py-1 bg-white/10 rounded text-[10px] font-bold text-[#e0e0e0]">1M</button>
                    </div>
                </div>
                <div className="flex-1 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#48A111" stopOpacity={0.8}/>
                                    <stop offset="100%" stopColor="#48A111" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="day" hide />
                            <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />
                            <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="value" stroke="#48A111" strokeWidth={3} fillOpacity={0.2} fill="url(#chartGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}
