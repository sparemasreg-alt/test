import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, LayoutGrid, Users, Gavel, Store, LogOut, Shield, Trophy, Swords, Menu, X, Settings, UserPlus, CreditCard, Gem } from 'lucide-react';
import { DashboardView } from './views/DashboardView';
import { MarketView } from './views/MarketView';
import { SquadView } from './views/SquadView';
import { AuctionsView } from './views/AuctionsView';
import { AdminView } from './views/AdminView';
import { AuthView } from './views/AuthView';
import { BankView } from './views/BankView';
import { LeaderboardView } from './views/LeaderboardView';
import { SettingsView } from './views/SettingsView';
import { FriendsView } from './views/FriendsView';
import { PricingView } from './views/PricingView';
import { useMarketStore } from './store';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'sonner';
import { useMobile } from './hooks/useMediaQuery';

import { LandingView } from './views/LandingView';

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const { activeTab, setActiveTab } = useMarketStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();
  const fetchPlayers = useMarketStore(state => state.fetchPlayers);
  const startPolling = useMarketStore(state => state.startPolling);
  const fetchUserSquad = useMarketStore(state => state.fetchUserSquad);
  const { user, profile, loading, logout } = useAuth();

  useEffect(() => {
    fetchPlayers();
    startPolling();
  }, [fetchPlayers, startPolling]);

  useEffect(() => {
    if (user) {
      fetchUserSquad();
    }
  }, [user, fetchUserSquad]);

  if (loading) {
     return <div className="h-screen w-full bg-[#050505] flex items-center justify-center text-[#48A111] animate-pulse font-mono tracking-widest">LOADING...</div>;
  }

  if (!user) {
     if (showAuth) {
         return (
           <div className="h-screen w-full bg-[#050505] text-[#e0e0e0] font-sans">
             <AuthView />
           </div>
         );
     }
     return (
        <div className="h-screen w-full bg-[#050505] text-[#e0e0e0] font-sans">
           <LandingView onGetStarted={() => setShowAuth(true)} />
        </div>
     );
  }

  let tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-6 h-6" /> },
    { id: 'market', label: 'Market', icon: <LayoutGrid className="w-6 h-6" /> },
    { id: 'bank', label: 'Bank', icon: <LayoutGrid className="w-6 h-6" /> },
    { id: 'auctions', label: 'Auctions', icon: <Gavel className="w-6 h-6" /> },
    { id: 'squad', label: 'Squad', icon: <Users className="w-6 h-6" /> },
    { id: 'friends', label: 'Friends', icon: <UserPlus className="w-6 h-6" /> },
    { id: 'pricing', label: 'Pricing', icon: <CreditCard className="w-6 h-6" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-6 h-6" /> },
  ];

  if (profile?.role === 'admin') {
    tabs.push({ id: 'admin', label: 'Admin', icon: <Shield className="w-6 h-6" /> });
  }

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'market': return <MarketView />;
      case 'bank': return <BankView />;
      case 'squad': return <SquadView />;
      case 'auctions': return <AuctionsView />;
      case 'pricing': return <PricingView />;
      case 'admin': return <AdminView />;
      case 'settings': return <SettingsView />;
      case 'friends': return <FriendsView />;
      default: return <div className="p-6 text-white text-2xl font-bold uppercase tracking-widest">{activeTab} coming soon</div>;
    }
  };


  const mobileNavTabs = tabs.filter(t => ['dashboard', 'market', 'squad', 'store', 'play'].includes(t.id));

  return (
    <div className="flex flex-col h-screen w-full bg-[#050505] text-[#e0e0e0] font-sans overflow-hidden select-none">
      <Toaster theme="dark" position={isMobile ? "top-center" : "bottom-right"} />
      
      {/* Mobile Header */}
      {isMobile && (
        <header className="h-16 flex border-b border-white/10 items-center justify-between px-4 bg-[#0a0a0a] shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 hover:bg-white/5 rounded-lg text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">FOOTEX<span className="text-[#48A111]">.</span></h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-white/40 leading-none mr-0.5">@{profile?.username || profile?.email?.split('@')[0]}</span>
                <div className="flex items-center gap-2">
                    <motion.span
                      key={profile?.coins || 0}
                      initial={{ scale: 1.2, color: "#ffffff" }}
                      animate={{ scale: 1, color: "#48A111" }}
                      className="text-xs font-mono font-bold"
                    >
                      ${(profile?.coins || 0).toLocaleString()}
                    </motion.span>
                    <motion.span
                      key={profile?.gems || 0}
                      initial={{ scale: 1.2, color: "#ffffff" }}
                      animate={{ scale: 1, color: "#ef4444" }}
                      className="text-xs font-mono font-bold flex items-center gap-0.5"
                    >
                      {profile?.gems || 0}<Gem className="w-3 h-3 text-red-500" />
                    </motion.span>
                </div>
             </div>
             <button onClick={logout} className="p-1.5 text-red-500 rounded-lg">
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        </header>
      )}

      {/* Desktop Navigation Bar */}
      {!isMobile && (
        <nav className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0a0a0a] shrink-0 z-20">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-8 h-8 bg-[#48A111] rounded-sm rotate-45 flex items-center justify-center">
                <span className="-rotate-45 font-black text-black text-xs">TFC</span>
              </div>
              <h1 className="text-xl font-black tracking-tighter uppercase italic">Footex<span className="text-[#48A111]">.</span></h1>
            </div>
            <div className="flex gap-6 text-xs font-bold uppercase tracking-widest opacity-60">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${activeTab === tab.id ? 'text-[#48A111] opacity-100' : 'hover:opacity-100 transition-opacity'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full flex items-center gap-3">
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-white/40 leading-none">@{profile?.username || profile?.email?.split('@')[0]}</span>
                <div className="flex items-center gap-2">
                    <motion.span
                      key={profile?.coins || 0}
                      initial={{ scale: 1.2, color: "#ffffff" }}
                      animate={{ scale: 1, color: "#48A111" }}
                      className="text-sm font-mono font-bold"
                    >
                      ${(profile?.coins || 0).toLocaleString()}
                    </motion.span>
                    <motion.span
                      key={profile?.gems || 0}
                      initial={{ scale: 1.2, color: "#ffffff" }}
                      animate={{ scale: 1, color: "#ef4444" }}
                      className="text-sm font-mono font-bold flex items-center gap-0.5"
                    >
                      {profile?.gems || 0}<Gem className="w-3.5 h-3.5 text-red-500" />
                    </motion.span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#48A111] to-[#1a1a1a] border border-white/20 flex items-center justify-center text-[10px]">
                 {(profile?.username || profile?.email || 'U')[0].toUpperCase()}
              </div>
              <button onClick={logout} className="ml-2 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobile && sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed left-0 top-0 h-full w-64 bg-[#0a0a0a] border-r border-white/10 z-50 overflow-y-auto flex flex-col py-6"
              >
                <div className="px-6 flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                  <h2 className="text-xl font-black italic uppercase">MENU</h2>
                  <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                     <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="flex flex-col gap-2 px-4">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-[#48A111]/20 text-[#48A111]' : 'hover:bg-white/5 text-white/70'}`}
                    >
                      {tab.icon}
                      <span className="font-bold uppercase tracking-widest text-sm">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar Navigation */}
        {!isMobile && (
          <aside className="w-16 border-r border-white/10 flex flex-col items-center py-8 gap-10 bg-[#0a0a0a] shrink-0 z-10">
            <div className="flex flex-col gap-8 opacity-40">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  title={tab.label}
                  className={`transition-colors flex justify-center w-full ${activeTab === tab.id ? 'text-[#48A111] opacity-100' : 'hover:opacity-100'}`}
                >
                  {tab.icon}
                </button>
              ))}
            </div>
            <div className="mt-auto">
              <span className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-mono tracking-[0.3em] opacity-20 uppercase">v2.0.48-STABLE</span>
            </div>
          </aside>
        )}

        {/* Page Content Area */}
        <main className={`flex-1 relative z-0 overflow-auto ${isMobile ? 'pb-[72px]' : ''}`}>
            <AnimatePresence mode="wait">
                <motion.div
                   key={activeTab}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.2 }}
                   className="h-full"
                >
                    {renderView()}
                </motion.div>
            </AnimatePresence>
        </main>
      </div>

      {/* Scrolling Market Ticker */}
      <footer className={`h-10 bg-black border-t border-white/10 flex items-center shrink-0 ${isMobile ? 'hidden' : ''}`}>
        <div className="flex whitespace-nowrap scroll-smooth overflow-hidden items-center gap-12 px-6">
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest">
            <span className="opacity-40 uppercase">FTX/USD:</span><span className="text-[#48A111] font-mono">2.41</span><span className="text-[#48A111]">▲</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest">
            <span className="opacity-40 uppercase">MBAPPE/EPIC:</span><span className="text-[#48A111] font-mono">1,420.00</span><span className="text-[#48A111]">▲</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest">
            <span className="opacity-40 uppercase">MESSI/LEGEND:</span><span className="text-red-500 font-mono">9,840.00</span><span className="text-red-500">▼</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 z-30 pb-safe">
          <div className="flex items-center justify-around h-16 px-2">
            {mobileNavTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-lg ${activeTab === tab.id ? 'text-[#48A111]' : 'text-gray-500 hover:text-white/80'}`}
              >
                {tab.icon}
                <span className="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}