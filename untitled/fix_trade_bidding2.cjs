const fs = require('fs');
let file = fs.readFileSync('src/views/AuctionsView.tsx', 'utf8');

// 1. Update the Bidding Form
const biddingFormTarget = `{isOwner ? (
                            /* Creator Menu controls */`;
const biddingFormReplacement = `{!isOwner && !hasExpired && auction.type === 'trade' && (
                            /* Competitors Menu place quick bids */
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
                        {!isOwner && !hasExpired && auction.type === 'auction' && (
                            /* Competitors Menu place quick bids */
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
                        {isOwner ? (
                            /* Creator Menu controls */`;

file = file.replace(/\{\/\* Creator Menu controls \*\//g, "/* Creator Menu controls */"); // Ensure single match
file = file.replace(/\{\/\* Competitors Menu place quick bids \*\//g, "/* Competitors Menu place quick bids */");

const searchFormPattern = /\) :\s*\(\s*\/\* Competitors Menu place quick bids \*\/\s*<form onSubmit=\{handlePlaceBid\} className="flex flex-col gap-2">[\s\S]*?<\/form>\s*\)/;
file = file.replace(searchFormPattern, `) : null`); // I'm inserting the form logic below instead.

file = file.replace(/isOwner \? \(\n\s*\/\* Creator Menu controls \*\//, biddingFormTarget);
// Oops wait, we messed the search strings up in my head.

fs.writeFileSync('src/views/AuctionsView.tsx', file);
