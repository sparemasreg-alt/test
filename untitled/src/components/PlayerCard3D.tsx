import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'motion/react';
import { PlayerCard, Rarity, useMarketStore } from '../store';
import { Sparkles, Star, Trophy, ArrowUpRight } from 'lucide-react';
import { getFlagImageUrl, getClubImageUrl } from '../utils/images';
import { toast } from 'sonner';

interface PlayerCard3DProps {
  player: PlayerCard;
  level?: number;
  overall?: number;
  height?: string;
}

export const PlayerCard3D: React.FC<PlayerCard3DProps> = ({ player, level, overall, height = 'h-[340px]' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const buyPlayer = useMarketStore(s => s.buyPlayer);

  // Motion values for tilt & glare
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useTransform(y, [0, 1], [15, -15]);
  const rotateY = useTransform(x, [0, 1], [-15, 15]);

  // Translate glare light reflect based on mouse tracking
  const glareLeft = useTransform(x, [0, 1], ['-20%', '120%']);
  const glareTop = useTransform(y, [0, 1], ['-20%', '120%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width);
    y.set(mouseY / rect.height);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    x.set(0.5);
    y.set(0.5);
  };

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }
    await buyPlayer(player.id, 'base', promoCode);
  };

  const isCR7 = false; // player.name === "Crristianz Roonaldz";
  const rarity = player.card?.rarity || "Bronze";
  const finalOvr = overall || player.stats.overall || 50;

  // Aesthetic Themes for Card Skins
  let cardTheme = {
    bg: "bg-gradient-to-br from-[#121c2c] to-[#040810]",
    border: "border-[#4a586e]/30 shadow-[#000000]/50",
    badgeBg: "bg-white/10 text-slate-300 border-white/10",
    labelTxt: "text-slate-400",
    accentGlow: "rgba(74, 88, 110, 0.15)",
    cornerColor: "border-[#4a586e]"
  };

  if (isCR7) {
    // Exact Sudamericana/Al-Nassr Dark Blue & Gold theme 
    cardTheme = {
      bg: "bg-gradient-to-br from-[#0c1635] via-[#050b1a] to-[#01030e]",
      border: "border-2 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.25)]",
      badgeBg: "bg-[#d4af37]/15 text-[#d4af37] border-[#d4af37]/30",
      labelTxt: "text-[#d4af37]/80",
      accentGlow: "rgba(212, 175, 55, 0.25)",
      cornerColor: "border-[#d4af37]"
    };
  } else {
    switch (rarity) {
      case 'Silver': // Silver brushed alloy
        cardTheme = {
          bg: "bg-gradient-to-br from-[#a0aab2] via-[#2e3740] to-[#12161b]",
          border: "border-2 border-[#ccd7e0] shadow-[0_0_15px_rgba(204,215,224,0.15)]",
          badgeBg: "bg-white/15 text-slate-200 border-white/20",
          labelTxt: "text-slate-400",
          accentGlow: "rgba(204, 215, 224, 0.15)",
          cornerColor: "border-slate-300"
        };
        break;
      case 'Gold': // Radiating Gold
        cardTheme = {
          bg: "bg-gradient-to-br from-[#f2cc43] via-[#4a3a0e] to-[#151004]",
          border: "border-2 border-[#ffdf00] shadow-[0_0_20px_rgba(255,223,0,0.2)]",
          badgeBg: "bg-[#ffdf00]/15 text-[#ffdf00] border-[#ffdf00]/20",
          labelTxt: "text-yellow-500/80",
          accentGlow: "rgba(255, 223, 0, 0.2)",
          cornerColor: "border-[#ffdf00]"
        };
        break;
      case 'Elite': // Elite Red
        cardTheme = {
          bg: "bg-gradient-to-br from-[#ff3333] via-[#4a0000] to-[#0f0000]",
          border: "border-2 border-[#ff3333] shadow-[0_0_25px_rgba(255,51,51,0.3)]",
          badgeBg: "bg-[#ff3333]/25 text-[#ffcccc] border-[#ff3333]/30",
          labelTxt: "text-red-400",
          accentGlow: "rgba(255, 51, 51, 0.3)",
          cornerColor: "border-[#ff3333]"
        };
        break;
      case 'Master': // Cosmic Purple
        cardTheme = {
          bg: "bg-gradient-to-br from-[#7b2cbf] via-[#3c096c] to-[#10002b]",
          border: "border-2 border-[#9d4edd] shadow-[0_0_25px_rgba(157,78,221,0.3)]",
          badgeBg: "bg-[#9d4edd]/25 text-[#e0aaff] border-[#9d4edd]/30",
          labelTxt: "text-purple-400",
          accentGlow: "rgba(157, 78, 221, 0.3)",
          cornerColor: "border-[#9d4edd]"
        };
        break;
      case 'Icon': // Bright Vintage Gold/White
        cardTheme = {
          bg: "bg-gradient-to-br from-[#fadc75] via-[#a38734] to-[#1a1708]",
          border: "border-2 border-[#ffec99] shadow-[0_0_30px_rgba(250,221,117,0.35)]",
          badgeBg: "bg-[#ffec99]/20 text-[#fff7cc] border-[#ffec99]/30",
          labelTxt: "text-[#fadd75]",
          accentGlow: "rgba(250, 221, 117, 0.35)",
          cornerColor: "border-[#ffec99]"
        };
        break;
      default: // Bronze / Common
        cardTheme = {
          bg: "bg-gradient-to-br from-[#856143] via-[#211710] to-[#0d0906]",
          border: "border border-[#856143]/40 shadow-lg shadow-black/80",
          badgeBg: "bg-black/40 text-[#c29876] border-[#856143]/20",
          labelTxt: "text-[#c29876]/70",
          accentGlow: "rgba(133, 97, 67, 0.1)",
          cornerColor: "border-[#856143]/40"
        };
    }
  }

  // Use effectiveRarity for UI logic (badge text, etc.)

  return (
    <div
      className={`relative w-full ${height} max-w-[245px] mx-auto select-none`}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: hovered ? rotateX : 0,
          rotateY: hovered ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        className={`relative w-full h-full rounded-[20px] transition-shadow duration-300 overflow-hidden flex flex-col justify-between ${cardTheme.bg} ${cardTheme.border} p-3.5`}
      >
        {/* Dynamic Glare Overlay */}
        <motion.div
          style={{
            background: 'radial-gradient(circle at var(--mouseX, 50%) var(--mouseY, 50%), rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 65%)',
            left: glareLeft,
            top: glareTop,
            opacity: hovered ? 1 : 0,
            pointerEvents: 'none'
          }}
          className="absolute w-[200%] h-[200%] rounded-full -translate-x-1/2 -translate-y-1/2 z-30 transition-opacity duration-300"
        />

        {/* Diagonal Sheen Shine Line */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-20 pointer-events-none"
        />

        {/* Ambient Glow Aura */}
        <div 
          className="absolute inset-4 rounded-full blur-[40px] opacity-15 pointer-events-none transition-all"
          style={{ backgroundColor: cardTheme.accentGlow }}
        />

        {/* INTRICATE PREMIUM FUT BORDERS (Championship Style) */}
        <span className={`absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 ${cardTheme.cornerColor} rounded-tl-[8px]`} />
        <span className={`absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 ${cardTheme.cornerColor} rounded-tr-[8px]`} />
        <span className={`absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 ${cardTheme.cornerColor} rounded-bl-[8px]`} />
        <span className={`absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 ${cardTheme.cornerColor} rounded-br-[8px]`} />

        {/* CARD CONTENT HEADER */}
        <div className="flex justify-between items-start z-10">
          
          {/* LEFT COLUMN: Overall & Position, Brand */}
          <div className="flex flex-col items-center">
            {/* dynamic rating value, updates cleanly inside of React */}
            <span className={`text-[2rem] leading-none font-black italic tracking-tighter uppercase font-mono ${isCR7 ? 'text-[#eac448]' : 'text-white'}`}>
              {finalOvr}
            </span>
            <span className={`text-xs font-black uppercase font-mono tracking-widest leading-none mt-1 -mb-1 ${isCR7 ? 'text-[#d4af37]' : 'text-gray-300'}`}>
              {player.position}
            </span>
            
            {/* Custom Brand Logo Marker */}
            <div className="mt-2 text-white">
              {isCR7 ? (
                // Crown / Star premium indicator for CR7 Sudamericana Special card
                <span className="text-[#d4af37] text-[11px] font-black italic tracking-tighter block leading-none antialiased">
                  FC PRO
                </span>
              ) : rarity === 'Icon' ? (
                <Trophy className="w-3.5 h-3.5 text-cyan-400" />
              ) : rarity === 'Master' ? (
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              ) : rarity === 'Elite' ? (
                <Star className="w-3.5 h-3.5 text-red-500" />
              ) : null}
            </div>

            {/* Nation Flag Emoji */}
            <div className="mt-1.5 w-6 h-4 overflow-hidden rounded-[2px] shadow-sm filter drop-shadow" title={player.nation}>
              <img src={getFlagImageUrl(player.nation)} alt={player.nation} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
          </div>

          {/* RIGHT COLUMN: Rarity Badge / Top Accents */}
          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-[8.5px] font-mono font-black tracking-widest px-2 py-0.5 rounded-full border shadow-sm uppercase ${cardTheme.badgeBg}`}>
              {rarity}
            </span>
            {level !== undefined && (
              <span className={`text-[8.5px] font-mono font-black tracking-widest px-2 py-0.5 rounded-full border shadow-sm uppercase ${cardTheme.badgeBg}`}>
                LVL {level}
              </span>
            )}
          </div>
        </div>

        {/* PLAYER HERO PICTURE AREA */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden rounded-[20px]">
          {/* We have removed player portrait images as requested. The glowing background gradients and glowing lights now shine through unobstructed for a clean premium custom aesthetic. */}
        </div>

        {/* Promo Code Input */}
        {player.subscriberOnly && (
          <div className="w-full flex gap-1.5 px-3 z-30">
            <input
              type="text"
              placeholder="UNLOCK CODE"
              value={promoCode}
              onChange={e => setPromoCode(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-[10px] font-mono text-center outline-none focus:border-[#48A111] text-white"
            />
            <button
              onClick={handleApplyPromo}
              className="bg-[#48A111] text-black font-black uppercase text-[9px] px-2 rounded-lg"
            >
              APPLY
            </button>
          </div>
        )}

        {/* CARD FOOTER INFO PANEL */}
        <div className="w-full flex flex-col items-center bg-black/60 backdrop-blur-md rounded-xl p-2.5 border border-white/5 z-20 mt-auto shadow-xl">
          {/* Main Name Caption */}
          <div className="flex items-center justify-center gap-2">
            <h4 className="text-white text-[13px] font-black uppercase tracking-wider text-center max-w-[130px] truncate font-sans">
              {player.name}
            </h4>
            <span className={`text-[8.5px] font-mono font-black tracking-widest px-2 py-0.5 rounded-full border shadow-sm uppercase ${cardTheme.badgeBg}`}>
              {finalOvr}
            </span>
          </div>

          {/* Club Info Bar */}
          <div className="flex items-center justify-center gap-1.5 mt-0.5 mb-1.5 max-w-full h-4">
            {isCR7 ? (
              // Stylized Al-Nassr golden shield/crescent badge
              <div className="w-3.5 h-3.5 bg-[#d4af37] rounded-full border border-yellow-300 flex items-center justify-center text-[7px] text-black font-black font-mono scale-95" title="Al-Nassr">
                🌙
              </div>
            ) : (
              <div className="w-5 h-5 filter drop-shadow opacity-95 flex items-center justify-center p-0.5" title={player.club}>
                 <img src={getClubImageUrl(player.club)} alt={player.club} className="w-full h-full object-contain" onError={(e) => { if (!e.currentTarget.src.includes('ui-avatars')) { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.club)}&background=random&color=fff&rounded=true&font-size=0.4`; } else { e.currentTarget.style.display = 'none'; } }} />
              </div>
            )}
          </div>

          <div className="w-full border-t border-white/[0.08] my-1"></div>

          {/* FUT STATS GRID */}
          <div className="w-full grid grid-cols-6 gap-0.5 text-center mt-0.5">
            {[
              { label: 'PAC', val: player.stats.pace },
              { label: 'SHO', val: player.stats.shooting },
              { label: 'PAS', val: player.stats.passing },
              { label: 'DRI', val: player.stats.dribbling },
              { label: 'DEF', val: player.stats.defending },
              { label: 'PHY', val: player.stats.physical }
            ].map((st, i) => {
              const statVal = level && level > 1 ? Math.min(99, st.val + (level - 1)) : st.val;
              return (
                <div key={st.label} className="flex flex-col items-center">
                  <span className={`text-[10px] font-black font-mono leading-none ${isCR7 ? 'text-[#eac448]' : 'text-gray-200'}`}>
                    {statVal}
                  </span>
                  <span className="text-[7.5px] font-mono text-gray-400 tracking-tighter mt-0.5 uppercase">
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Special Conmebol Sudamericana footer label specifically for Ronaldo */}
        {isCR7 && (
          <div className="absolute bottom-1 right-2 w-max text-right text-[7px] font-black tracking-widest text-[#d4af37] font-mono opacity-80 z-20 leading-none">
            - CONMEBOL -
            <br />
            <span className="text-white text-[6px]">SUDAMERICANA</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
