import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMarketStore } from '../store';
import { Send, Users, History, Coins, ArrowRightLeft, Gift, Sparkles, UserCheck } from 'lucide-react';

const getAuth = () => (globalThis as any).auth;
const getDb = () => (globalThis as any).db;
const query = (...args: any[]) => (globalThis as any).query(...args);
const collection = (...args: any[]) => (globalThis as any).collection(...args);
const where = (...args: any[]) => (globalThis as any).where(...args);
const onSnapshot = (...args: any[]) => (globalThis as any).onSnapshot(...args);
const getDocs = (...args: any[]) => (globalThis as any).getDocs(...args);
const getDoc = (...args: any[]) => (globalThis as any).getDoc(...args);
const updateDoc = (...args: any[]) => (globalThis as any).updateDoc(...args);
const doc = (...args: any[]) => (globalThis as any).doc(...args);
const setDoc = (...args: any[]) => (globalThis as any).setDoc(...args);
const deleteDoc = (...args: any[]) => (globalThis as any).deleteDoc(...args);
const increment = (...args: any[]) => (globalThis as any).increment(...args);

export const BankView = () => {
  const { profile } = useAuth();
  
  // Market store selections
  const portfolio = useMarketStore(state => state.user.portfolio);
  const players = useMarketStore(state => state.players);
  const fetchUserSquad = useMarketStore(state => state.fetchUserSquad);
  const sellPlayer = useMarketStore(state => state.sellPlayer);

  // States for Sending Coins
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [coinLoading, setCoinLoading] = useState(false);
  const [coinMsg, setCoinMsg] = useState('');
  const [coinSuccess, setCoinSuccess] = useState(false);

  // States for Transferring Player
  const [playerRecipientEmail, setPlayerRecipientEmail] = useState('');
  const [selectedTransferPlayerId, setSelectedTransferPlayerId] = useState('');
  const [selectedSellPlayerId, setSelectedSellPlayerId] = useState('');
  const [playerLoading, setPlayerLoading] = useState(false);
  const [playerMsg, setPlayerMsg] = useState('');
  const [playerSuccess, setPlayerSuccess] = useState(false);

  // States for Transaction Logs
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [txFilter, setTxFilter] = useState<'all' | 'coins' | 'players' | 'packs_upgrades'>('all');

  // Load owned players ready to trade
  const ownedPlayers = portfolio
    .map(item => {
      const p = players.find(x => x.id === item.id);
      return p ? { ...p, docId: item.docId, level: item.level, onAuction: item.onAuction } : null;
    })
    .filter((p): p is any => p !== null);

  // Load user transaction history in real-time
  useEffect(() => {
    if (!getAuth()?.currentUser) return;

    const q = query(
      collection(getDb(), 'transactions'),
      where('participantIds', 'array-contains', getAuth()?.currentUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sort descending by date on client side
      docs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setUserTransactions(docs);
      setLoadingTx(false);
    }, (err) => {
      console.error("Error reading transaction logs: ", err);
      setLoadingTx(false);
    });

    return () => unsub();
  }, []);

  const handleSendCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    setCoinMsg('');
    setCoinSuccess(false);
    if (!profile || !getAuth()?.currentUser) return;
    
    if (recipientEmail.toLowerCase() === profile.email?.toLowerCase()) {
      setCoinMsg("You cannot send coins to yourself.");
      return;
    }

    const sendAmt = parseInt(amount);
    if (isNaN(sendAmt) || sendAmt <= 0) {
      setCoinMsg("Enter a valid amount.");
      return;
    }

    if (profile.role !== 'admin' && profile.coins < sendAmt) {
      setCoinMsg("Insufficient balance.");
      return;
    }

    setCoinLoading(true);
    try {
      // Find recipient user by email or username
      const usersSnap = await getDocs(collection(getDb(), 'users'));
      let recipientId = '';
      let recipientRealEmail = '';
      let recipientUsername = '';
      
      usersSnap.forEach((u: any) => {
        const uData = u.data();
        if (uData.email.toLowerCase() === recipientEmail.toLowerCase() || 
            (uData.username && uData.username.toLowerCase() === recipientEmail.toLowerCase())) {
          recipientId = u.id;
          recipientRealEmail = uData.email;
          recipientUsername = uData.username || uData.email;
        }
      });

      if (!recipientId) {
        throw new Error("Recipient account not found in the arena database.");
      }

      // 1. Deduct from sender if not admin
      if (profile.role !== 'admin') {
        await updateDoc(doc(getDb(), 'users', getAuth()?.currentUser.uid), {
          coins: increment(-sendAmt)
        });
      }

      // 2. Add to recipient
      await updateDoc(doc(getDb(), 'users', recipientId), {
        coins: increment(sendAmt)
      });

      // 3. Log transaction
      const txRef = doc(collection(getDb(), 'transactions'));
      await setDoc(txRef, {
        type: 'coin_transfer',
        senderId: getAuth()?.currentUser.uid,
        senderEmail: profile.email,
        recipientId: recipientId,
        recipientEmail: recipientRealEmail,
        amount: sendAmt,
        participantIds: [getAuth()?.currentUser.uid, recipientId],
        date: new Date().toISOString()
      });

      setCoinSuccess(true);
      setCoinMsg(`Transaction Successful! Sent $${sendAmt.toLocaleString()} to ${recipientRealEmail}`);
      setAmount('');
      setRecipientEmail('');
    } catch (err: any) {
      setCoinMsg(err.message || "Transaction failed");
    } finally {
      setCoinLoading(false);
    }
  };

  const handleTransferPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlayerMsg('');
    setPlayerSuccess(false);
    if (!profile || !getAuth()?.currentUser) return;

    if (!selectedTransferPlayerId) {
      setPlayerMsg("Please select a player card to transfer.");
      return;
    }

    if (playerRecipientEmail.toLowerCase() === profile.email?.toLowerCase()) {
      setPlayerMsg("You cannot transfer players to yourself.");
      return;
    }

    const playerToTransfer = ownedPlayers.find(p => p.docId === selectedTransferPlayerId);
    if (!playerToTransfer) {
      setPlayerMsg("Player card not found in your squad.");
      return;
    }

    if (playerToTransfer.onAuction) {
      setPlayerMsg("This player card is tied to an active auction listing. Cancel auction first.");
      return;
    }

    setPlayerLoading(true);
    try {
      // Find recipient user by email or username
      const usersSnap = await getDocs(collection(getDb(), 'users'));
      let recipientId = '';
      let recipientRealEmail = '';
      let recipientUsername = '';
      
      usersSnap.forEach((u: any) => {
        const uData = u.data();
        if (uData.email.toLowerCase() === playerRecipientEmail.toLowerCase() || 
            (uData.username && uData.username.toLowerCase() === playerRecipientEmail.toLowerCase())) {
          recipientId = u.id;
          recipientRealEmail = uData.email;
          recipientUsername = uData.username || uData.email;
        }
      });

      if (!recipientId) {
        throw new Error("Recipient account not found.");
      }

      // 1. Remove from sender's squad
      await deleteDoc(doc(getDb(), 'users', getAuth()?.currentUser.uid, 'squad', selectedTransferPlayerId));

      // 2. Add to recipient's squad
      await setDoc(doc(getDb(), 'users', recipientId, 'squad', selectedTransferPlayerId), {
        playerId: playerToTransfer.id,
        playerName: playerToTransfer.name,
        acquiredAt: new Date().toISOString(),
        level: playerToTransfer.level || 1,
        source: 'gift',
        senderEmail: profile.email
      });

      // 3. Log transaction
      const txRef = doc(collection(getDb(), 'transactions'));
      await setDoc(txRef, {
        type: 'player_transfer',
        senderId: getAuth()?.currentUser.uid,
        senderEmail: profile.email,
        recipientId: recipientId,
        recipientEmail: recipientRealEmail,
        playerId: playerToTransfer.id,
        playerName: playerToTransfer.name,
        playerLevel: playerToTransfer.level || 1,
        participantIds: [getAuth()?.currentUser.uid, recipientId],
        date: new Date().toISOString()
      });

      setPlayerSuccess(true);
      setPlayerMsg(`Shield Gift Successful! ${playerToTransfer.name} transferred to ${recipientRealEmail}`);
      setSelectedTransferPlayerId('');
      setPlayerRecipientEmail('');
      
      // Refresh local store
      fetchUserSquad();
    } catch (err: any) {
      setPlayerMsg(err.message || "Transfer failed");
    } finally {
      setPlayerLoading(false);
    }
  };

  const filteredTxs = userTransactions.filter(tx => {
    if (txFilter === 'all') return true;
    if (txFilter === 'coins') return tx.type === 'coin_transfer' || tx.type === 'transfer_coins';
    if (txFilter === 'players') return tx.type === 'player_transfer' || tx.type === 'transfer_player' || tx.type === 'player_buy' || tx.type === 'player_sell' || tx.type === 'auction_win' || tx.type === 'auction_buy_now';
    if (txFilter === 'packs_upgrades') return tx.type === 'pack_buy' || tx.type === 'player_upgrade';
    return true;
  });

  return (
    <div className="p-8 h-full overflow-auto max-w-7xl mx-auto flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-1.5 flex items-center gap-2">
          <ArrowRightLeft className="w-8 h-8 text-[#48A111]" />
          Bank & Transfer Hub
        </h2>
        <p className="text-xs text-gray-500 font-mono">SEND COINS AND GIFT SQUAD PLAYERS INSTANTLY AND SAFELY WITH ZERO COMMISSION COSTS</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Actions Pane */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-8">
          
          {/* Card 1: Send Coins */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold uppercase tracking-wider font-mono">Send Coins</h3>
            </div>
            
            {coinMsg && (
              <div className={`mb-4 p-3 border rounded-xl text-xs font-mono text-center ${
                coinSuccess ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-red-950/40 border-red-500/30 text-red-300'
              }`}>
                {coinMsg}
              </div>
            )}

            <form onSubmit={handleSendCoins} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 font-mono mb-2">Recipient Email or Username</label>
                <input 
                  type="text" 
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 outline-none focus:border-emerald-500 transition-colors font-mono text-sm text-gray-100"
                  required
                  placeholder="warrior123 or player@example.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 font-mono mb-2">Amount to Transfer</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 outline-none focus:border-emerald-500 transition-colors font-mono text-sm text-gray-100"
                  required
                  min="1"
                  placeholder="e.g. 5000"
                />
              </div>
              <button 
                type="submit" 
                disabled={coinLoading}
                className="mt-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black uppercase tracking-widest py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-950/20"
              >
                <Send className="w-4 h-4" />
                {coinLoading ? 'AUTHORIZING...' : 'AUTHORIZE INTRADAY SEND'}
              </button>
            </form>
          </div>

          {/* Card 2: Sell Player (Instant) */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
            <div className="flex items-center gap-2 mb-4">
              <Coins className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-bold uppercase tracking-wider font-mono">Sell Player</h3>
            </div>
            <div className="flex flex-col gap-4">
                <select 
                  value={selectedSellPlayerId} 
                  onChange={e => setSelectedSellPlayerId(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 outline-none focus:border-red-500 transition-colors font-mono text-sm text-gray-300"
                >
                  <option value="">-- Choose Player --</option>
                  {ownedPlayers.map(p => (
                    <option key={p.docId} value={p.docId}>{p.name} (Lvl {p.level}) ($ {p.market.currentPrice.toLocaleString()})</option>
                  ))}
                </select>
                <button 
                  onClick={async () => {
                    if (!selectedSellPlayerId) return;
                    try {
                      await sellPlayer(selectedSellPlayerId);
                      setSelectedSellPlayerId('');
                    } catch (err: any) {
                      setPlayerMsg("Error: " + err.message);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all"
                >
                  Sell Now
                </button>
            </div>
          </div>

          {/* Card 3: Transfer Player (FREE) */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-bold uppercase tracking-wider font-mono">Transfer Player Card</h3>
              </div>
              <span className="text-[9px] text-purple-400 font-bold uppercase bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 font-mono">
                BBLASH (FREE)
              </span>
            </div>
            
            {playerMsg && (
              <div className={`mb-4 p-3 border rounded-xl text-xs font-mono text-center ${
                playerSuccess ? 'bg-purple-950/40 border-purple-500/30 text-purple-300' : 'bg-red-950/40 border-red-500/30 text-red-300'
              }`}>
                {playerMsg}
              </div>
            )}

            <form onSubmit={handleTransferPlayer} className="flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 font-mono mb-2">Recipient Email or Username</label>
                <input 
                  type="text" 
                  value={playerRecipientEmail}
                  onChange={e => setPlayerRecipientEmail(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 outline-none focus:border-purple-500 transition-colors font-mono text-sm text-gray-100"
                  required
                  placeholder="warrior123 or recipient@example.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 font-mono mb-2">Select Player from Squad</label>
                <select 
                  value={selectedTransferPlayerId} 
                  onChange={e => setSelectedTransferPlayerId(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 outline-none focus:border-purple-500 transition-colors font-mono text-sm text-gray-300"
                  required
                >
                  <option value="">-- Choose Squad Player --</option>
                  {ownedPlayers.length === 0 ? (
                    <option disabled>No players owned in squad</option>
                  ) : (
                    ownedPlayers.map(p => (
                      <option 
                        key={p.docId} 
                        value={p.docId}
                        disabled={p.onAuction}
                      >
                        {p.name} ({p.card.rarity}) - Lvl {p.level} {p.onAuction ? '[ON AUCTION]' : ''}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <button 
                type="submit" 
                disabled={playerLoading}
                className="mt-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-black uppercase tracking-widest py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-950/20"
              >
                <Users className="w-4 h-4" />
                {playerLoading ? 'TRANSFERRING...' : 'CONFIRM TRANSFER'}
              </button>
            </form>
          </div>

          {profile?.role === 'admin' && (
            <div className="p-4 bg-[#48A111]/5 border border-[#48A111]/20 rounded-2xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#48A111] shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="text-xs text-[#48A111] uppercase tracking-widest font-black mb-1">Administrative Sovereign</h4>
                <p className="text-[10px] font-semibold text-gray-400 font-mono leading-relaxed">
                  You possess unconstrained ledger printing rights. Sending funds to users does NOT deduct from your administrator profile.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Live Transaction Ledger Pane */}
        <div className="col-span-1 lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#48A111] to-transparent"></div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#48A111]" />
              <h3 className="text-lg font-bold uppercase tracking-wider font-mono">Transaction Ledger</h3>
            </div>
            
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1 bg-black/60 p-1 rounded-xl border border-white/5 self-start">
              {(['all', 'coins', 'players', 'packs_upgrades'] as const).map(tab => {
                const labels = { all: 'All', coins: 'Coins', players: 'Cards', packs_upgrades: 'Packs/Upg' };
                return (
                  <button
                    key={tab}
                    onClick={() => setTxFilter(tab)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                      txFilter === tab ? 'bg-[#48A111] text-black shadow-sm' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>
          </div>

          {loadingTx ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 gap-2 text-gray-500 font-mono text-xs">
              <span className="animate-spin text-[#48A111]">⚡</span>
              SYNCING LEDGER ENTRIES...
            </div>
          ) : filteredTxs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/5 bg-black/10 rounded-2xl">
              <UserCheck className="w-8 h-8 text-gray-600 mb-3" />
              <p className="text-xs font-mono text-gray-400 font-bold uppercase">No records found</p>
              <p className="text-[10px] text-gray-500 max-w-xs mt-1">This ledger filter is dry. Move coins or players to write block events.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto max-h-[580px] pr-1 flex flex-col gap-2 custom-scrollbar">
              {filteredTxs.map((tx) => {
                const isSystemSender = tx.senderId === 'system';
                const isSystemRecipient = tx.recipientId === 'system';
                const isUserSender = tx.senderId === getAuth()?.currentUser?.uid;
                const isUserRecipient = tx.recipientId === getAuth()?.currentUser?.uid;

                let badgeColor = 'bg-white/10 text-white';
                let typeLabel = tx.type;
                let sign = '';
                let amountText = '';
                let description = '';

                switch (tx.type) {
                  case 'coin_transfer':
                  case 'transfer_coins':
                    typeLabel = 'Coin Send';
                    badgeColor = isUserSender ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                    sign = isUserSender ? '-' : '+';
                    amountText = `${sign}$${(tx.amount || 0).toLocaleString()}`;
                    description = isUserSender 
                      ? `Sent coins to ${tx.recipientEmail || 'Unknown'}` 
                      : `Received coins from ${tx.senderEmail || 'Unknown'}`;
                    break;
                  case 'player_transfer':
                  case 'transfer_player':
                    typeLabel = 'GIFT CARD';
                    badgeColor = 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
                    amountText = 'BBLASH';
                    description = isUserSender
                      ? `Gifted ${tx.playerName || 'Player'} to ${tx.recipientEmail || 'Unknown'}`
                      : `Received ${tx.playerName || 'Player'} from ${tx.senderEmail || 'Unknown'}`;
                    break;
                  case 'player_buy':
                    typeLabel = 'CARD BUY';
                    badgeColor = 'bg-red-500/10 text-red-400 border border-red-500/20';
                    amountText = `-$${(tx.amount || 0).toLocaleString()}`;
                    description = `Purchased ${tx.playerName || 'Player'} from System`;
                    break;
                  case 'player_sell':
                    typeLabel = 'CARD SELL';
                    badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                    amountText = `+$${(tx.amount || 0).toLocaleString()}`;
                    description = `Sold ${tx.playerName || 'Player'} back to market`;
                    break;
                  case 'pack_buy':
                    typeLabel = 'PACK OPEN';
                    badgeColor = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                    amountText = `-$${(tx.amount || 0).toLocaleString()}`;
                    description = `Opened pack: ${tx.recipientEmail || 'System'} ${tx.playerName ? `(Won: ${tx.playerName})` : ''}`;
                    break;
                  case 'player_upgrade':
                    typeLabel = 'UPGRADE';
                    badgeColor = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                    amountText = `-$${(tx.amount || 0).toLocaleString()}`;
                    description = `Upgraded ${tx.playerName || 'Player'} to level up`;
                    break;
                  case 'subscription_purchase':
                    typeLabel = 'CLUB TIER';
                    badgeColor = 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-yellow-400 border border-yellow-500/30';
                    amountText = `-$${(tx.amount || 0).toFixed(2)} USD`;
                    description = `Activated Premium Society Access: ${tx.playerName || 'Club Subscription'}`;
                    break;
                  case 'auction_win':
                    typeLabel = 'AUCTION';
                    if (isUserSender) {
                      badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                      amountText = `+$${(tx.amount || 0).toLocaleString()}`;
                      description = `Sold ${tx.playerName || 'Player'} on Auction to ${tx.recipientEmail || 'Winner'}`;
                    } else {
                      badgeColor = 'bg-red-500/10 text-red-400 border border-red-500/20';
                      amountText = `-$${(tx.amount || 0).toLocaleString()}`;
                      description = `Won Bid on ${tx.playerName || 'Player'} from ${tx.senderEmail || 'Seller'}`;
                    }
                    break;
                  case 'auction_buy_now':
                    typeLabel = 'BUY NOW';
                    if (isUserSender) {
                      badgeColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
                      amountText = `+$${(tx.amount || 0).toLocaleString()}`;
                      description = `Sold ${tx.playerName || 'Player'} (Buy Now) to ${tx.recipientEmail || 'Buyer'}`;
                    } else {
                      badgeColor = 'bg-red-500/10 text-red-400 border border-red-500/20';
                      amountText = `-$${(tx.amount || 0).toLocaleString()}`;
                      description = `Bought ${tx.playerName || 'Player'} (Buy Now) from ${tx.senderEmail || 'Seller'}`;
                    }
                    break;
                  default:
                    badgeColor = 'bg-gray-500/10 text-gray-400';
                    amountText = `$${(tx.amount || 0).toLocaleString()}`;
                    description = `Ledger record for ${tx.type}`;
                }

                const displayDate = tx.date 
                  ? new Date(tx.date).toLocaleDateString([], { month: 'short', day: '2-digit' }) + ' ' + new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '--/--';

                return (
                  <div key={tx.id} className="bg-black/35 hover:bg-black/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4 transition-colors font-mono">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-md leading-none ${badgeColor}`}>
                          {typeLabel}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {displayDate}
                        </span>
                      </div>
                      <p className="text-xs text-gray-200 font-bold truncate pr-2 mt-1">
                        {description}
                      </p>
                    </div>
                    
                    <div className="shrink-0 text-right">
                      <span className={`text-sm font-black ${
                        amountText.startsWith('+') ? 'text-[#48A111]' : amountText.startsWith('-') ? 'text-red-400' : 'text-purple-400'
                      }`}>
                        {amountText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}