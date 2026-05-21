const fs = require('fs');
let file = fs.readFileSync('src/views/AuctionsView.tsx', 'utf8');

// Inside AuctionCard
// Add selectedTradePlayers state
file = file.replace(
    /const \[bidAmount, setBidAmount\] = useState<number>\(0\);/,
    "const [bidAmount, setBidAmount] = useState<number>(0);\n    const [selectedTradePlayers, setSelectedTradePlayers] = useState<string[]>([]);\n    const userPortfolio = useMarketStore(state => state.user.portfolio);\n    const storePlayers = useMarketStore(state => state.players);"
);

// We need to modify handlePlaceBid to support trade type
file = file.replace(
    /if \(bidAmount <= currentPrice\) return toast.error\("Bid must be higher than current price"\);/g,
    `if (auction.type === 'auction' && bidAmount <= currentPrice) return toast.error("Bid must be higher than current price");
         if (auction.type === 'trade' && selectedTradePlayers.length === 0) return toast.error("Select at least one player to offer");`
);

// Modify the setDoc for newBidRef to include offered_players
file = file.replace(
    /amount: bidAmount,\n\s*created_at: new Date\(\)\.toISOString\(\)/,
    `amount: auction.type === 'trade' ? 0 : bidAmount,
                offered_players: auction.type === 'trade' ? selectedTradePlayers : null,
                created_at: new Date().toISOString()`
);

// Underneath, there's updateDoc(doc('auctions', auction.id)) - we only do this for auctions
file = file.replace(
    /await updateDoc\(doc\(getDb\(\), 'auctions', auction\.id\), \{\n\s*highest_bid: bidAmount,\n\s*highest_bidder_id: currentUser\.uid,\n\s*highest_bidder_email: currentUser\.email \|\| 'Unknown'\n\s*\}\);/,
    `if (auction.type === 'auction') {
                await updateDoc(doc(getDb(), 'auctions', auction.id), {
                    highest_bid: bidAmount,
                    highest_bidder_id: currentUser.uid,
                    highest_bidder_email: currentUser.email || 'Unknown'
                });
            }`
);

fs.writeFileSync('src/views/AuctionsView.tsx', file);
console.log('AuctionView script applied early replacements');
