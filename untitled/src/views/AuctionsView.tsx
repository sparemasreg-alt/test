import React, { useEffect, useState } from 'react';
import { useMarketStore } from '../store';
import { PlayerCard3D } from '../components/PlayerCard3D';
import { findPlayerById } from '../utils/playerMatcher';


import { toast } from 'sonner';

const mapAuction = (a: any) => ({
    id: a.id,
    type: a.type || 'auction',
    playerId: a.player_id,
    playerName: a.player_name,
    level: a.level,
    ownerId: a.owner_id,
    ownerEmail: a.owner_email,
    startPrice: a.start_price,
    buyNowPrice: a.buy_now_price,
    highestBid: a.highest_bid,
    highestBidderId: a.highest_bidder_id,
    highestBidderEmail: a.highest_bidder_email,
    winnerId: a.winner_id,
    winnerEmail: a.winner_email,
    status: a.status || 'active',
    expiresAt: a.expires_at,
    createdAt: a.created_at,
});

import { 
    RefreshCw,
    Award,
    Gavel,
    Timer,
    CheckCircle2,
    Clock,
    Flame,
    TrendingUp,
    Check
} from 'lucide-react';

const getDb = () => (globalThis as any).db;
const collection = (...args: any[]) => (globalThis as any).collection(...args);
const query = (...args: any[]) => (globalThis as any).query(...args);
const getDocs = (...args: any[]) => (globalThis as any).getDocs(...args);
const onSnapshot = (...args: any[]) => (globalThis as any).onSnapshot(...args);
const doc = (...args: any[]) => (globalThis as any).doc(...args);
const setDoc = (...args: any[]) => (globalThis as any).setDoc(...args);
const getDoc = (...args: any[]) => (globalThis as any).getDoc(...args);
const updateDoc = (...args: any[]) => (globalThis as any).updateDoc(...args);
const deleteDoc = (...args: any[]) => (globalThis as any).deleteDoc(...args);
const where = (...args: any[]) => (globalThis as any).where(...args);
const increment = (...args: any[]) => (globalThis as any).increment(...args);

export const AuctionsView = () => {
    const { players } = useMarketStore();
    const [auctions, setAuctions] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'live' | 'completed'>('live');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        /* Using onSnapshot directly, fetchAuctions no longer needed here */

        // Subscribe to changes
        const unsub = onSnapshot(query(collection(getDb(), 'auctions')), (snap: any) => {
            const data: any[] = [];
            snap.docs.forEach((d: any) => data.push(mapAuction({id: d.id, ...d.data()})));
            const sorted = data.sort((a: any, b: any) => {
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return timeB - timeA;
            });
            setAuctions(sorted);
            setLoading(false);
        });

        return () => {
            if (unsub) unsub();
        };
    }, []);

    // Categorize
    const liveAuctions = auctions.filter(a => a.status === 'active');
    const completedAuctions = auctions.filter(a => a.status === 'completed' || a.status === 'cancelled');

    return (
        <div className="flex flex-col h-full bg-[#050505]">
            {/* Header section with live stats */}
            <div className="p-6 border-b border-white/10 shrink-0 bg-[#09090d] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic flex items-center gap-2">
                        Deals Chamber<span className="text-purple-500">.</span>
                        <Gavel className="w-8 h-8 text-purple-500 animate-pulse mt-1" />
                    </h1>
                    <p className="text-[#8e9299] font-mono tracking-widest text-xs uppercase mt-1">
                        Zero-Trust Escrow Peer Trading Engine
                    </p>
                </div>

                {/* Tab Switcher & Live Count Badge */}
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 rounded-2xl">
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
                            activeTab === 'live'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                            : 'text-[#8e9299] hover:text-white'
                        }`}
                        id="tab-live-auctions"
                    >
                        Live Room
                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono ${
                            activeTab === 'live' ? 'bg-black/30' : 'bg-white/5'
                        }`}>
                            {liveAuctions.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 ${
                            activeTab === 'completed'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                            : 'text-[#8e9299] hover:text-white'
                        }`}
                        id="tab-completed-deals"
                    >
                        Deal History
                        <span className={`px-2 py-0.5 text-[10px] rounded-full font-mono ${
                            activeTab === 'completed' ? 'bg-black/30' : 'bg-white/5'
                        }`}>
                            {completedAuctions.length}
                        </span>
                    </button>
                </div>
            </div>

            {/* Grid area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar scroll-smooth">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-[#8e9299] gap-2">
                        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
                        <span className="font-mono text-xs uppercase tracking-widest">polling active auctions...</span>
                    </div>
                ) : (
                    activeTab === 'live' ? (
                        liveAuctions.length === 0 ? (
                            <div className="text-center text-white/40 mt-16 max-w-md mx-auto bg-white/5 border border-white/5 p-8 rounded-3xl flex flex-col items-center gap-3">
                                <Timer className="w-12 h-12 text-[#8e9299]/50" />
                                <div className="font-bold text-white text-lg">No Ongoing Auctions</div>
                                <p className="text-xs text-[#8e9299]">There are currently no items for sale in the live chamber. Head over to your Squad tab to list a player now!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
                                {liveAuctions.map(auction => {
                                    const player = findPlayerById(players, auction.playerId);
                                    if (!player) return null;
                                    const playerWithLevel = { ...player, level: auction.level || 1 };

                                    return (
                                        <AuctionCard 
                                            key={auction.id} 
                                            auction={auction} 
                                            player={playerWithLevel} 
                                        />
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        completedAuctions.length === 0 ? (
                            <div className="text-center text-white/40 mt-16 max-w-md mx-auto bg-white/5 border border-white/5 p-8 rounded-3xl flex flex-col items-center gap-3">
                                <CheckCircle2 className="w-12 h-12 text-[#8e9299]/50" />
                                <div className="font-bold text-white text-lg">No Completed Deals Yet</div>
                                <p className="text-xs text-[#8e9299]">Deal records will log here asynchronously as they resolve in the room.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {completedAuctions.map(auction => {
                                    const player = findPlayerById(players, auction.playerId);
                                    if (!player) return null;
                                    return (
                                        <ClosedAuctionCard 
                                            key={auction.id}
                                            auction={auction}
                                            player={player}
                                        />
                                    );
                                })}
                            </div>
                        )
                    )
                )}
            </div>
        </div>
    );
};

/* 1. Countdown ticking helper component */
const CountdownTimer = ({ expiresAt, onExpire }: { expiresAt: string, onExpire: () => void }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculate = () => {
            const diff = new Date(expiresAt).getTime() - Date.now();
            if (diff <= 0) {
                setTimeLeft('Expired');
                setIsExpired(true);
                onExpire();
                return;
            }
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            const hours = Math.floor(mins / 60);
            
            if (isExpired) return;

            if (hours > 0) {
                setTimeLeft(`${hours}h ${mins % 60}m`);
            } else if (mins > 0) {
                setTimeLeft(`${mins}m ${secs}s`);
            } else {
                setTimeLeft(`${secs}s`);
            }
        };

        calculate();
        const interval = setInterval(calculate, 1000);
        return () => clearInterval(interval);
    }, [expiresAt, isExpired]);

    return (
        <span className={`font-mono text-sm font-black flex items-center gap-1.5 px-3 py-1 rounded-full ${
            isExpired ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
        }`}>
            <Clock className="w-3.5 h-3.5" />
            {timeLeft}
        </span>
    );
};

/* 2. Active Auction Card controller containing real-time escrow logic */
const AuctionCard = ({ auction, player }: { auction: any, player: any }) => {
    const [bids, setBids] = useState<any[]>([]);
    const [bidAmount, setBidAmount] = useState<number>(0);
    const [selectedTradePlayers, setSelectedTradePlayers] = useState<string[]>([]);
    const userPortfolio = useMarketStore(state => state.user.portfolio);
    const storePlayers = useMarketStore(state => state.players);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasExpired, setHasExpired] = useState(false);

    useEffect(() => {
        /* Realtime takes care of fetchBids */

        const unsub = onSnapshot(query(collection(getDb(), 'bids'), where('auction_id', '==', auction.id)), (snap: any) => { setBids(snap.docs.map((d: any) => ({id: d.id, ...d.data()})).sort((a: any,b: any) => b.amount - a.amount)); });

        return () => {
            if (unsub) unsub();
        };
    }, [auction.id]);

    const highestBid = bids[0];
    const currentPrice = highestBid ? highestBid.amount : auction.startPrice;
    
    useEffect(() => {
        setBidAmount(currentPrice + (highestBid ? 100 : 50));
    }, [currentPrice, highestBid]);

    const isOwner = (globalThis as any).auth?.currentUser?.uid === auction.ownerId;
    const isHighestBidder = (globalThis as any).auth?.currentUser?.uid === highestBid?.bidder_id;

    const handlePlaceBid = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentUser = (globalThis as any).auth?.currentUser;
        if (!currentUser) return toast.error("Must be logged in");
        if (isOwner) return toast.error("You cannot bid on your own auction");
        if (auction.type === 'auction' && bidAmount <= currentPrice) return toast.error("Bid must be higher than current price");
         if (auction.type === 'trade' && selectedTradePlayers.length === 0) return toast.error("Select at least one player to offer");

        setIsSubmitting(true);
        try {
            // Check if user has enough coins locally (mock DB)
            const userDoc = await getDoc(doc(getDb(), 'users', currentUser.uid));
            if (userDoc.exists() && userDoc.data().coins < bidAmount) {
                throw new Error("Insufficient coins for this bid");
            }

            const newBidRef = doc(collection(getDb(), 'bids'));
            await setDoc(newBidRef, {
                auction_id: auction.id,
                bidder_id: currentUser.uid,
                bidder_email: currentUser.email || 'Unknown',
                amount: auction.type === 'trade' ? 0 : bidAmount,
                offered_players: auction.type === 'trade' ? selectedTradePlayers : null,
                created_at: new Date().toISOString()
            });

            if (auction.type === 'auction') {
                await updateDoc(doc(getDb(), 'auctions', auction.id), {
                    highest_bid: bidAmount,
                    highest_bidder_id: currentUser.uid,
                    highest_bidder_email: currentUser.email || 'Unknown'
                });
            }

            // Refund previous highest bidder
            if (highestBid) {
                 await updateDoc(doc(getDb(), 'users', highestBid.bidder_id), {
                     coins: increment(highestBid.amount)
                 });
            }
            // Deduct mock coins from new bidder
            await updateDoc(doc(getDb(), 'users', currentUser.uid), {
                 coins: increment(-bidAmount)
            });

        } catch (e: any) {
            toast.error("Error placing bid: " + e.message);
        }
        setIsSubmitting(false);
    };

    const handleAcceptSpecificBid = async (selectedBid: any) => {
        setIsSubmitting(true);
        try {
            // If they accept a lower bid, we need to shuffle coins
            
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

            if (highestBid && selectedBid.id !== highestBid.id) {
                const bidderDoc = await getDoc(doc(getDb(), 'users', selectedBid.bidder_id));
                const bidderCoins = bidderDoc.data()?.coins || 0;
                if (bidderCoins < selectedBid.amount) {
                    toast.error("This bidder no longer has enough coins.");
                    setIsSubmitting(false);
                    return;
                }
                
                await updateDoc(doc(getDb(), 'users', highestBid.bidder_id), {
                    coins: increment(highestBid.amount)
                });
                
                await updateDoc(doc(getDb(), 'users', selectedBid.bidder_id), {
                    coins: increment(-selectedBid.amount)
                });
            }

            // Transfer player card
            const sellerSquadSnap = await getDocs(collection(getDb(), 'users', auction.ownerId, 'squad'));
            const sellerCard = sellerSquadSnap.docs.find((d: any) => d.data().auctionId === auction.id);
            
            if (sellerCard) {
                await deleteDoc(doc(getDb(), 'users', auction.ownerId, 'squad', sellerCard.id));
                await setDoc(doc(getDb(), 'users', selectedBid.bidder_id, 'squad', sellerCard.id), {
                    ...sellerCard.data(),
                    onAuction: false,
                    auctionId: null,
                    acquiredAt: new Date().toISOString()
                });
            } else {
                console.warn("Seller doesn't have the player anymore?");
            }

            // Complete auction
            await updateDoc(doc(getDb(), 'auctions', auction.id), {
                status: 'completed',
                winner_id: selectedBid.bidder_id,
                winner_email: selectedBid.bidder_email
            });

            // Add coins to owner locally (mock)
            await updateDoc(doc(getDb(), 'users', auction.ownerId), {
                coins: increment(selectedBid.amount)
            });

            // Write transaction record
            await setDoc(doc(collection(getDb(), 'transactions')), {
                 type: 'auction_win',
                 senderId: selectedBid.bidder_id,
                 senderEmail: selectedBid.bidder_email,
                 recipientId: auction.ownerId,
                 recipientEmail: auction.ownerEmail,
                 playerId: player.id,
                 playerName: player.name,
                 amount: selectedBid.amount,
                 participantIds: [selectedBid.bidder_id, auction.ownerId],
                 date: new Date().toISOString()
            });

            toast.success("Accepted bid and transferred player!");
        } catch (e: any) {
            toast.error("Error accepting bid: " + e.message);
        }
        setIsSubmitting(false);
    };

    const handleSettleAuction = async () => {
        setIsSubmitting(true);
        if (highestBid) {
            await handleAcceptSpecificBid(highestBid);
            return;
        }
        // If there's no bids, just cancel
        try {
            await updateDoc(doc(getDb(), 'auctions', auction.id), {
                status: 'cancelled'
            });
            
            const sellerSquadSnap = await getDocs(collection(getDb(), 'users', auction.ownerId, 'squad'));
            const sellerCard = sellerSquadSnap.docs.find((d: any) => d.data().auctionId === auction.id);
            if (sellerCard) {
                await updateDoc(doc(getDb(), 'users', auction.ownerId, 'squad', sellerCard.id), {
                    onAuction: false,
                    onTrade: false,
                    auctionId: null
                });
            }
        } catch (e: any) {
            toast.error("Error settling auction: " + e.message);
        }
        setIsSubmitting(false);
    };

    const handleBuyNow = async () => {
        const currentUser = (globalThis as any).auth?.currentUser;
        if (!currentUser) return toast.error("Must be logged in");
        setIsSubmitting(true);
        try {
            // Transfer player card
            const sellerSquadSnap = await getDocs(collection(getDb(), 'users', auction.ownerId, 'squad'));
            const sellerCard = sellerSquadSnap.docs.find((d: any) => d.data().auctionId === auction.id);
            
            if (sellerCard) {
                await deleteDoc(doc(getDb(), 'users', auction.ownerId, 'squad', sellerCard.id));
                await setDoc(doc(getDb(), 'users', currentUser.uid, 'squad', sellerCard.id), {
                    ...sellerCard.data(),
                    onAuction: false,
                    auctionId: null,
                    acquiredAt: new Date().toISOString()
                });
            }

            await updateDoc(doc(getDb(), 'auctions', auction.id), {
                status: 'completed',
                winner_id: currentUser.uid,
                winner_email: currentUser.email || 'Unknown',
                highest_bid: auction.buyNowPrice,
                highest_bidder_id: currentUser.uid,
                highest_bidder_email: currentUser.email || 'Unknown'
            });

            // Mock DB coin subtractions
            await updateDoc(doc(getDb(), 'users', currentUser.uid), {
                coins: increment(-auction.buyNowPrice)
            });
            // Give seller coins
            await updateDoc(doc(getDb(), 'users', auction.ownerId), {
                coins: increment(auction.buyNowPrice)
            });
            
            // Write transaction record
            await setDoc(doc(collection(getDb(), 'transactions')), {
                 type: 'auction_buy_now',
                 senderId: currentUser.uid,
                 senderEmail: currentUser.email,
                 recipientId: auction.ownerId,
                 recipientEmail: auction.ownerEmail,
                 playerId: player.id,
                 playerName: player.name,
                 amount: auction.buyNowPrice,
                 participantIds: [currentUser.uid, auction.ownerId],
                 date: new Date().toISOString()
            });

        } catch (e: any) {
            toast.error("Error doing buy now: " + e.message);
        }
        setIsSubmitting(false);
    };

    const handleCancelListing = async () => {
        setIsSubmitting(true);
        try {
            await updateDoc(doc(getDb(), 'auctions', auction.id), {
                status: 'cancelled'
            });
            
            // Reset player's onAuction/onTrade flag
            const sellerSquadSnap = await getDocs(collection(getDb(), 'users', auction.ownerId, 'squad'));
            const sellerCard = sellerSquadSnap.docs.find((d: any) => d.data().auctionId === auction.id);
            if (sellerCard) {
                await updateDoc(doc(getDb(), 'users', auction.ownerId, 'squad', sellerCard.id), {
                    onAuction: false,
                    onTrade: false,
                    auctionId: null
                });
            }
            toast.success("Listing cancelled.");
        } catch (e: any) {
            toast.error("Error cancelling listing: " + e.message);
        }
        setIsSubmitting(false);
    };

    return (
        <div className={`rounded-[32px] p-6 flex flex-col items-center bg-[#0d0d12] border-2 transition-all relative group overflow-hidden ${
            isOwner 
            ? 'border-purple-600/20 bg-purple-950/5' 
            : isHighestBidder 
            ? 'border-[#48A111]/30 hover:border-[#48A111]/60' 
            : 'border-white/5 hover:border-white/10'
        }`}>
            {/* Countdown Tick */}
            <div className="absolute top-5 left-5 z-20">
                <CountdownTimer 
                    expiresAt={auction.expiresAt} 
                    onExpire={() => setHasExpired(true)} 
                />
            </div>

            {/* Level & Badge Indicator */}
            <div className="absolute top-5 right-5 z-20 flex flex-col items-end gap-1.5 font-mono text-[9px] font-bold">
                <span className="bg-[#48A111] text-black px-2 py-0.5 rounded-md text-[10px] font-black uppercase shadow-[0_0_10px_#48A111]">
                    LVL {player.level}
                </span>
                <span className="bg-white/10 text-white backdrop-blur-md border border-white/20 px-2 py-0.5 rounded-md text-[10px] uppercase">
                    {bids.length} {bids.length === 1 ? 'BID' : 'BIDS'}
                </span>
                {isOwner && (
                    <span className="bg-purple-800 text-white px-2 py-0.5 rounded-full uppercase scale-90">
                        Owner
                    </span>
                )}
            </div>

            {/* Visualizer 3D Container */}
            <div className="w-full h-[280px] shrink-0 relative mt-8">
                <PlayerCard3D player={player} level={player.level} height="h-[280px]" />
            </div>

            {/* Panel of controls and calculations */}
            <div className="w-full flex flex-col mt-4 flex-1">
                {/* Information Header Block */}
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight italic text-white leading-none mb-1">
                    {auction.playerName}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[10px] tracking-wider text-[#8e9299] font-mono uppercase">
                    <Award className="w-3.5 h-3.5 text-violet-400" />
                    <span>{player.league} · {player.position}</span>
                  </div>
                </div>

                {/* Grid for prices and valuation */}
                <div className="grid grid-cols-2 gap-4 mt-5 bg-black/40 p-3 rounded-2xl border border-white/5 font-mono">
                    {auction.type === 'trade' ? (
                        <>
                            <div>
                                <span className="text-[10px] text-blue-400 uppercase tracking-wider block">Deal Type</span>
                                <span className="text-xs font-black text-white uppercase bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded inline-block mt-0.5">EXCHANGE</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-[#8e9299] uppercase tracking-wider block">Proposals</span>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <span className="text-sm font-black text-blue-400">
                                        {bids.length} Offers
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div>
                                <span className="text-[10px] text-[#8e9299] uppercase tracking-wider block">Starting Bid</span>
                                <span className="text-sm font-bold text-white">${(auction.startPrice || 0).toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-[#8e9299] uppercase tracking-wider block">Current Bid</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-base font-black text-[#48A111]">
                                        ${(currentPrice || 0).toLocaleString()}
                                    </span>
                                    {highestBid && <Flame className="w-4 h-4 text-orange-500 animate-pulse" />}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Subtext about bidders */}
                <div className="mt-2.5 text-[10px] text-[#8e9299] font-mono truncate">
                    {highestBid ? (
                        <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-[#48A111]" />
                            Leader: <strong className="text-white">{isHighestBidder ? 'You' : highestBid.bidder_email}</strong>
                        </span>
                    ) : (
                        <span>No bids placed yet. Become the first challenger!</span>
                    )}
                </div>

                {/* Recent Bid History */}
                <div className="mt-4 bg-black/25 rounded-2xl border border-white/5 p-3 flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5 font-mono">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold flex items-center gap-1">
                            <Gavel className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                            Bid History
                        </span>
                        <span className="text-[9px] text-[#48A111] font-bold uppercase bg-[#48A111]/10 px-1.5 py-0.5 rounded">
                            {bids.length} {bids.length === 1 ? 'bid' : 'bids'}
                        </span>
                    </div>
                    {bids.length === 0 ? (
                        <div className="text-[10px] text-gray-500 font-mono italic py-2 text-center">
                            No bids made yet. List is dry.
                        </div>
                    ) : (
                        <div className="max-h-[100px] overflow-y-auto pr-1 flex flex-col gap-1.5 custom-scrollbar">
                            {bids.map((b, idx) => {
                                const isUserBid = (globalThis as any).auth.currentUser?.uid === b.bidder_id;
                                const bidTime = b.created_at 
                                    ? new Date(b.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                                    : '---';
                                return (
                                    <div 
                                        key={b.id || idx} 
                                        className={`flex items-center justify-between text-[11px] font-mono py-1 px-2 rounded-lg transition-colors ${
                                            idx === 0 
                                            ? 'bg-purple-950/20 border border-purple-500/20 text-purple-200 font-semibold' 
                                            : 'text-gray-400 hover:bg-white/5'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 min-w-0 max-w-[55%]">
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${idx === 0 ? 'bg-purple-500 animate-ping' : 'bg-gray-600'}`}></span>
                                            <span className="truncate" title={b.bidder_email}>
                                                {isUserBid ? 'You' : b.bidder_email || 'Anonymous'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-gray-500 text-[9px]">{bidTime}</span>
                                            {auction.type === 'trade' ? (
                                                <span className={`font-bold text-blue-400`}>
                                                    {b.offered_players?.length || 0} Player(s)
                                                </span>
                                            ) : (
                                                <span className={`font-bold ${idx === 0 ? 'text-[#48A111]' : 'text-gray-300'}`}>
                                                    ${b.amount.toLocaleString()}
                                                </span>
                                            )}
                                            {isOwner && (
                                                <button
                                                    onClick={() => handleAcceptSpecificBid(b)}
                                                    disabled={isSubmitting}
                                                    type="button"
                                                    className="ml-1 text-[9px] bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/30 font-bold px-1.5 py-0.5 rounded transition-all disabled:opacity-50"
                                                >
                                                    {auction.type === 'trade' ? 'ACCEPT' : 'SELL'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* If there is Buy Now option */}
                {auction.buyNowPrice && (
                    <div className="mt-4 flex items-center justify-between border-t border-dashed border-white/10 pt-3">
                        <span className="text-xs text-gray-400 font-medium">Buy Now Price:</span>
                        <button
                            onClick={handleBuyNow}
                            disabled={isSubmitting || isOwner || hasExpired}
                            className="bg-[#48A111]/10 hover:bg-[#48A111] text-[#48A111] hover:text-black font-semibold uppercase text-xs px-3 py-1 rounded-xl transition-all border border-[#48A111]/30"
                        >
                            Instant Buy Now (${auction.buyNowPrice.toLocaleString()})
                        </button>
                    </div>
                )}

                {/* Dynamic operations floor */}
                <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-3">
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
                                                    +${inc}
                                                </button>
                                            ))}
                                        </div>
                                    </form>
                                )}
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

/* 3. Closed and Settled Auction historical cards */
const ClosedAuctionCard = ({ auction, player }: { auction: any, player: any }) => {
    const isCancelled = auction.status === 'cancelled';
    const isWinner = (globalThis as any).auth?.currentUser?.uid === auction.winnerId;

    return (
        <div className={`bg-[#08080c] border rounded-2xl p-4 flex gap-4 transition-all relative ${
            isCancelled 
            ? 'border-white/5 opacity-50' 
            : isWinner 
            ? 'border-[#48A111]/30 bg-[#48A111]/5 shadow-[0_0_20px_rgba(72,161,17,0.02)]' 
            : 'border-white/5'
        }`}>
            {/* Overlay Indicator Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1 text-[8px] font-mono tracking-wider font-bold uppercase">
                {isCancelled ? (
                    <span className="text-gray-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">Cancelled</span>
                ) : (
                    <span className="text-[#48A111] bg-[#48A111]/10 border border-[#48A111]/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> SOLD
                    </span>
                )}
            </div>

            {/* Thumbnail */}
            <div className="w-16 h-20 shrink-0 bg-black/40 border border-white/5 rounded-xl flex items-center justify-center font-black text-2xl text-purple-600 relative overflow-hidden">
                <span className="opacity-90">{player.stats.overall}</span>
                <div className="absolute bottom-1 text-[8px] font-mono text-gray-500 uppercase">LVL {auction.level}</div>
            </div>

            <div className="flex-1 flex flex-col justify-center min-w-0 font-mono">
                <span className="text-xs text-white uppercase font-black tracking-wide truncate">{auction.playerName}</span>
                <span className="text-[9px] text-gray-500 uppercase mt-0.5 mb-2">{player.position} · {player.club}</span>
                
                {isCancelled ? (
                    <div className="text-[10px] text-gray-400">Card returned to seller squad</div>
                ) : (
                    <div className="flex flex-col gap-0.5 text-[10px]/snug min-w-0">
                        <div className="flex items-center gap-1">
                            <span className="text-[#8e9299]">{auction.type === 'trade' ? 'Settled as:' : 'Value:'}</span>
                            <span className="text-[#48A111] font-black">
                                {auction.type === 'trade' ? 'EXCHANGED' : `$${(auction.highestBid || auction.startPrice || 0).toLocaleString()}`}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 overflow-hidden">
                            <span className="text-[#8e9299] shrink-0">Buyer:</span>
                            <span className="text-white truncate max-w-[124px]">{isWinner ? 'You (Registered)' : auction.winnerEmail}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
