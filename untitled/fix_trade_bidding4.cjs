const fs = require('fs');

let file = fs.readFileSync('src/views/AuctionsView.tsx', 'utf8');

// 1. handleAcceptSpecificBid - Trade logic swap
file = file.replace(
    /const handleAcceptSpecificBid = async \(selectedBid: any\) => \{[\s\S]*?setIsSubmitting\(true\);\n\s*try \{/,
    `const handleAcceptSpecificBid = async (selectedBid: any) => {
        setIsSubmitting(true);
        try {`
); // Nothing functionally changed here, just verifying location.

const specificBidTradeReplacement = `
            if (auction.type === 'trade') {
                const sellerSquadSnap = await getDocs(collection(getDb(), 'users', auction.ownerId, 'squad'));
                const sellerCard = sellerSquadSnap.docs.find((d: any) => d.data().auctionId === auction.id);
                
                if (sellerCard) {
                    await deleteDoc(doc(getDb(), 'users', auction.ownerId, 'squad', sellerCard.id));
                    await setDoc(doc(getDb(), 'users', selectedBid.bidder_id, 'squad', sellerCard.id), {
                        ...sellerCard.data(),
                        onAuction: false,
                        onTrade: false,
                        auctionId: null,
                        acquiredAt: new Date().toISOString()
                    });
                }
                
                if (selectedBid.offered_players) {
                    const buyerSquadSnap = await getDocs(collection(getDb(), 'users', selectedBid.bidder_id, 'squad'));
                    for (const pid of selectedBid.offered_players) {
                        const buyerCard = buyerSquadSnap.docs.find((d: any) => d.id === pid);
                        if (buyerCard) {
                            await deleteDoc(doc(getDb(), 'users', selectedBid.bidder_id, 'squad', buyerCard.id));
                            await setDoc(doc(getDb(), 'users', auction.ownerId, 'squad', buyerCard.id), {
                                ...buyerCard.data(),
                                acquiredAt: new Date().toISOString()
                            });
                        }
                    }
                }
                
                await updateDoc(doc(getDb(), 'auctions', auction.id), {
                    status: 'completed',
                    winner_id: selectedBid.bidder_id,
                    winner_email: selectedBid.bidder_email
                });
                
                setIsSubmitting(false);
                return;
            }
`;

file = file.replace(
    /if \(highestBid && selectedBid\.id !== highestBid\.id\) \{/,
    specificBidTradeReplacement + "\n            if (highestBid && selectedBid.id !== highestBid.id) {"
);

// We should also replace the bid rendering code.
const bidRenderingSearch = /<span className=\{\`font-bold \$\{idx === 0 \? 'text-\[\#48A111\]' : 'text-gray-300'\}\`\}>\n\s*\$\{b\.amount\.toLocaleString\(\)\}\n\s*<\/span>/;
const bidRenderingReplacement = `{auction.type === 'trade' ? (
                                                <span className={\`font-bold text-blue-400\`}>
                                                    {b.offered_players?.length || 0} Player(s)
                                                </span>
                                            ) : (
                                                <span className={\`font-bold \${idx === 0 ? 'text-[#48A111]' : 'text-gray-300'}\`}>
                                                    \${b.amount.toLocaleString()}
                                                </span>
                                            )}`;

file = file.replace(bidRenderingSearch, bidRenderingReplacement);

const bidSellButtonSearch = />\n\s*SELL\n\s*<\/button>/;
const bidSellButtonReplacement = `>\n                                                    {auction.type === 'trade' ? 'ACCEPT' : 'SELL'}\n                                                </button>`;
file = file.replace(bidSellButtonSearch, bidSellButtonReplacement);

fs.writeFileSync('src/views/AuctionsView.tsx', file);
