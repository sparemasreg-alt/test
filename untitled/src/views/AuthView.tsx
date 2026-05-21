import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CLUBS } from '../data/clubs';

export const AuthView = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!isLogin && !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (isLogin && email.trim().length === 0) {
      setError('Please enter your username or email.');
      return;
    }
    if (!isLogin && username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (!isLogin && !selectedClub) {
      setError('Please select a starting club.');
      return;
    }
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email);
      } else {
        await register(email, username, selectedClub);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Group clubs by league
  const groupedClubs = CLUBS.reduce((acc, club) => {
    if (!acc[club.league]) acc[club.league] = [];
    acc[club.league].push(club.name);
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#48A111] to-transparent"></div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-center mb-2">
          {isLogin ? 'Sign In' : 'Sign Up'}
        </h2>
        <p className="text-[10px] text-white/50 text-center mb-8 uppercase tracking-widest">
          {isLogin ? 'Welcome back, gladiator' : 'Enter the arena for the first time'}
        </p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="gladiator"
                maxLength={20}
                className="w-full bg-black/50 border border-white/20 rounded-lg p-4 text-white focus:outline-none focus:border-[#48A111] transition-colors"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-white/40 ml-1">
              {isLogin ? 'Email or Username' : 'Email Address'}
            </label>
            <input 
              type={isLogin ? "text" : "email"}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={isLogin ? "gladiator or gladiator@arena.app" : "gladiator@arena.app"}
              className="w-full bg-black/50 border border-white/20 rounded-lg p-4 text-white focus:outline-none focus:border-[#48A111] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Access Token / Password</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black/50 border border-white/20 rounded-lg p-4 text-white focus:outline-none focus:border-[#48A111] transition-colors"
            />
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Starting Club</label>
              <select 
                value={selectedClub}
                onChange={e => setSelectedClub(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-lg p-4 text-white focus:outline-none focus:border-[#48A111] transition-colors appearance-none"
              >
                <option value="" disabled>Select your club...</option>
                {Object.entries(groupedClubs).map(([league, clubs]) => (
                  <optgroup key={league} label={league} className="bg-black text-white">
                    {clubs.map(club => (
                      <option key={club} value={club}>{club}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          <button 
            onClick={handleAuth} 
            disabled={loading}
            className="w-full bg-[#48A111] hover:bg-[#58c115] text-black font-black uppercase tracking-widest py-4 rounded-lg transition-all active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register Account')}
          </button>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-white/50 hover:text-[#48A111] transition-colors uppercase font-bold tracking-tighter"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>

          <div className="w-full h-px bg-white/10"></div>

          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] text-center leading-relaxed">
            Progression and ledger data is synchronized across the arena network.
          </p>
        </div>
      </div>
    </div>
  );
};
