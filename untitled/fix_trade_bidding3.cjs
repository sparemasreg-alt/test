const fs = require('fs');

let file = fs.readFileSync('src/views/AuctionsView.tsx', 'utf8');

file = file.replace(
    /isOwner \? \(\n\s*\/\* Creator Menu controls \*\/\n\s*<div className="flex flex-col gap-2 text-center">/,
    `isOwner ? (
                            /* Creator Menu controls */
                            <div className="flex flex-col gap-2 text-center">`
);

const replacedStr = `<div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-3">
                    {hasExpired || new Date(auction.expiresAt).getTime() <= Date.now() ? (
                        /* Settle Floor when auction expired */
                        <div className="flex flex-col gap-2">
                            <div className="text-center font-bold text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 py-2 rounded-xl mb-1 flex items-center justify-center gap-1.5 font-mono uppercase tracking-wider">
                                <Timer className="w-4 h-4" /> Wait Settlement
                            </div>
                            {(isOwner || isHighestBidder) && (
                                <button
                                    onClick={handleSettleAuction}
                                    disabled={isSubmitting}
                                    className="w-full bg-purple-600 text-white hover:bg-purple-500 font-bold uppercase py-3 rounded-xl transition-all font-sans italic tracking-wide h-12 flex items-center justify-center"
                                >
                                    {isSubmitting ? 'RESOLVING TRANSACTION...' : highestBid ? 'DECLARE SETTLEMENT & REAP' : 'RETURN EXPIRY CARD'}
                                </button>
                            )}
                        </div>
                    ) : (
                        /* Live Room bidding controls */
                        isOwner ? (
                            /* Creator Menu controls */
                            <div className="flex flex-col gap-2 text-center">
                                {highestBid ? (
                                    <div className="bg-purple-600/10 border border-purple-500/20 text-purple-400 text-xs py-3 rounded-xl uppercase font-mono tracking-wider font-semibold">
                                        Active offers present. Lock in timer countdown.
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleCancelListing}
                                        disabled={isSubmitting}
                                        className="w-full bg-red-600/15 text-red-500 hover:bg-red-600/25 border border-red-500/30 font-bold uppercase py-3 rounded-xl transition-all font-mono text-xs"
                                    >
                                        Cancel Active Listing
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* Competitors Menu place quick bids */
                            <>
                                {auction.type === 'trade' && (
                                    <form onSubmit={handlePlaceBid} className="flex flex-col gap-2">
                                        <div className="text-xs text-white/50 mb-1">Select player(s) to offer:</div>
                                        <div className="max-h-24 overflow-y-auto flex flex-col gap-1 custom-scrollbar">
                                            {userPortfolio.filter(p => !p.onAuction && !p.onTrade).map(p => {
                                                const c = storePlayers.find(sp => sp.id === p.id);
                                                if (!c) return null;
                                                return (
                                                    <label key={p.docId} className="flex items-center gap-2 cursor-pointer text-xs font-mono text-gray-300 hover:text-white p-1 rounded hover:bg-white/5">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedTradePlayers.includes(p.docId)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) setSelectedTradePlayers([...selectedTradePlayers, p.docId]);
                                                                else setSelectedTradePlayers(selectedTradePlayers.filter(id => id !== p.docId));
                                                            }}
                                                        />
                                                        <span>{c.name} (LVL {p.level})</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || selectedTradePlayers.length === 0}
                                            className="bg-blue-600 text-white hover:bg-blue-500 font-black italic tracking-wide text-sm px-6 py-2 rounded-xl uppercase transition-colors"
                                        >
                                            PROPOSE TRADE
                                        </button>
                                    </form>
                                )}
                                {auction.type !== 'trade' && (
                                    <form onSubmit={handlePlaceBid} className="flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                required
                                                min={currentPrice + 1}
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(parseInt(e.target.value) || 0)}
                                                className="bg-black/80 border border-white/10 px-3 py-2 text-sm text-[#48A111] font-bold font-mono rounded-xl flex-1 outline-none focus:border-[#48A111]/60"
                                            />
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="bg-[#48A111] text-black hover:bg-[#3d8a0f] font-black italic tracking-wide text-sm px-6 rounded-xl uppercase transition-colors"
                                            >
                                                PLACE BID
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-1.5 mt-1">
                                            {[100, 500, 1000].map(inc => (
                                                <button
                                                    key={inc}
                                                    type="button"
                                                    onClick={() => setBidAmount(currentPrice + inc)}
                                                    className="bg-white/5 border border-white/5 hover:bg-white/10 text-[#8e9299] hover:text-white font-mono text-[10px] font-bold py-1.5 rounded-lg transition-colors"
                                                >
                                                    +\${inc}
                                                </button>
                                            ))}
                                        </div>
                                    </form>
                                )}
                            </>
                        )
                    )}
                </div>`;

const searchRegex = /<div className="mt-6 pt-4 border-t border-white\/5 flex flex-col gap-3">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\};/m;

file = file.replace(searchRegex, replacedStr + "\n            </div>\n        </div>\n    );\n};");

fs.writeFileSync('src/views/AuctionsView.tsx', file);
