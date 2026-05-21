import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, DollarSign, Zap, HelpCircle, Coins, ShieldAlert } from 'lucide-react';
import { useMarketStore, PlayerCard } from '../store';

import { toast } from 'sonner';

interface CreateAuctionModalProps {
  player: (PlayerCard & { docId: string, level: number }) | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAuctionModal: React.FC<CreateAuctionModalProps> = ({ player, isOpen, onClose }) => {
  const createAuction = useMarketStore(state => state.createAuction);
  
  const [startPrice, setStartPrice] = useState<number>(0);
  const [includeBuyNow, setIncludeBuyNow] = useState(false);
  const [buyNowPrice, setBuyNowPrice] = useState<number>(0);
  const [duration, setDuration] = useState<number>(3); // Default 3 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default prices when player opens
  React.useEffect(() => {
    if (player) {
      const estimatedValue = Math.round(player.market.currentPrice * (1 + (player.level - 1) * 0.15));
      setStartPrice(Math.round(estimatedValue * 0.6)); // 60% starting price as recommended discount
      setBuyNowPrice(Math.round(estimatedValue * 1.5));
    }
  }, [player]);

  if (!player) return null;

  const estimatedValue = Math.round(player.market.currentPrice * (1 + (player.level - 1) * 0.15));

  const durations = [
    { label: '1 Min', value: 1 },
    { label: '3 Min', value: 3 },
    { label: '5 Min', value: 5 },
    { label: '10 Min', value: 10 },
    { label: '30 Min', value: 30 },
    { label: '1 Hour', value: 60 },
    { label: '24 Hour', value: 1440 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (startPrice <= 0) {
      toast.error("Starting price must be greater than 0");
      return;
    }
    if (includeBuyNow && buyNowPrice <= startPrice) {
      toast.error("Buy Now price must be higher than the starting bid price!");
      return;
    }

    setIsSubmitting(true);
    const success = await createAuction(player.docId, startPrice, includeBuyNow ? buyNowPrice : null, duration);
    setIsSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto custom-scrollbar rounded-[28px] bg-[#0c0d12] border border-white/10 shadow-2xl z-10 p-6 flex flex-col gap-6"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                  Send to Auction<span className="text-purple-500">.</span>
                </h3>
                <p className="text-xs text-[#8e9299] font-mono mt-0.5 uppercase tracking-wider">
                  List {player.name} (LVL {player.level})
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-white/5 hover:bg-white/10 p-2 rounded-full border border-white/10 text-white transition-all cursor-pointer"
                id="close-create-auction"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Quick Card Context Indicator */}
              <div className="flex items-center gap-4 bg-white/5 border border-white/5 p-3 rounded-xl">
                <div className="w-12 h-12 rounded-lg bg-black/50 border border-white/15 overflow-hidden flex items-center justify-center">
                  <span className="text-lg font-black text-[#48A111]">{player.stats.overall}</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{player.name}</div>
                  <div className="text-[10px] text-[#8e9299] uppercase font-mono">
                    Estimated market value: <span className="text-amber-400 font-bold">${estimatedValue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 1. Starting bid */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center justify-between">
                  <span>Starting Bid Price ($)</span>
                  <span className="text-[#8e9299] lowercase font-normal font-mono">min starting value</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">
                    $
                  </div>
                  <input
                    type="number"
                    required
                    min="1"
                    value={startPrice}
                    onChange={(e) => setStartPrice(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-black/60 border border-white/15 py-3 pl-8 pr-4 rounded-xl text-white font-mono font-bold focus:border-[#48A111] focus:ring-1 focus:ring-[#48A111] outline-none transition-all placeholder:text-gray-600"
                    placeholder="e.g. 500"
                    id="auction-start-price"
                  />
                </div>
                {/* Shortcuts */}
                <div className="flex gap-2.5 mt-1">
                  <button
                    type="button"
                    onClick={() => setStartPrice(Math.round(estimatedValue * 0.5))}
                    className="bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 text-[10px] uppercase font-mono tracking-wider font-bold px-2 py-1 rounded transition-all text-[#8e9299]"
                  >
                    50% Value
                  </button>
                  <button
                    type="button"
                    onClick={() => setStartPrice(Math.round(estimatedValue * 0.8))}
                    className="bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 text-[10px] uppercase font-mono tracking-wider font-bold px-2 py-1 rounded transition-all text-[#8e9299]"
                  >
                    80% Value (Recommended)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStartPrice(Math.round(estimatedValue))}
                    className="bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 text-[10px] uppercase font-mono tracking-wider font-bold px-2 py-1 rounded transition-all text-[#8e9299]"
                  >
                    100% Value
                  </button>
                </div>
              </div>

              {/* 2. Buy Now price (optional) */}
              <div className="bg-white/5 rounded-2xl p-4.5 border border-white/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-wider text-white">Enable Buy Now Option</span>
                    <span className="text-[10px] text-[#8e9299]">Instantly sells card if buyer pays this price</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIncludeBuyNow(!includeBuyNow)}
                    className={`w-11 h-6 rounded-full p-1 transition-all ${includeBuyNow ? 'bg-[#48A111]' : 'bg-white/10'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black transition-transform ${includeBuyNow ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                {includeBuyNow && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex flex-col gap-2 mt-2"
                  >
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-bold">
                        $
                      </div>
                      <input
                        type="number"
                        required={includeBuyNow}
                        min={startPrice + 1}
                        value={buyNowPrice}
                        onChange={(e) => setBuyNowPrice(Math.max(startPrice + 1, parseInt(e.target.value) || 0))}
                        className="w-full bg-black/80 border border-white/15 py-3 pl-8 pr-4 rounded-xl text-[#48A111] font-mono font-bold focus:border-[#48A111] focus:ring-1 focus:ring-[#48A111] outline-none transition-all placeholder:text-gray-600"
                        placeholder="e.g. 1500"
                        id="auction-buynow-price"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 3. Duration */}
              <div className="flex flex-col gap-2.5">
                <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>Auction Duration</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {durations.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDuration(d.value)}
                      className={`py-2 px-1 text-xs font-mono font-bold uppercase rounded-lg border transition-all text-center ${
                        duration === d.value
                          ? 'bg-purple-600/20 text-purple-400 border-purple-500/70'
                          : 'bg-white/5 text-[#8e9299] border-white/5 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Safe system locking notice */}
              <div className="flex gap-2.5 bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-xl text-[10px] text-yellow-500/80 leading-relaxed items-start">
                <ShieldAlert className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                <p>
                  <strong>Relational Lock Enabled:</strong> This card will be locked with our escrow protocol. You cannot sell or upgrade this player until the auction is settled or safely cancelled.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#48A111] text-[#0a0a0a] py-4 rounded-xl font-black italic text-lg uppercase tracking-tight hover:bg-[#3d8a0f] transition-all flex items-center justify-center gap-2 duration-300 disabled:opacity-45"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">STARTING AUCTION ENGINE...</span>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    APPROVE AND LIST PLAYER
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
