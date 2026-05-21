import React, { useState, useEffect } from "react";
import { UserProfile } from "../hooks/useAuth";
import { Users, Briefcase, Award } from "lucide-react";
import { PlayerCard } from "../store";

const getDocs = (...args: any[]) => (globalThis as any).getDocs(...args);
const collection = (...args: any[]) => (globalThis as any).collection(...args);
const db = (globalThis as any).db;

export const UserManagementView = ({ users, players }: { users: (UserProfile & { id: string })[], players: PlayerCard[] }) => {
  const [selectedUser, setSelectedUser] = useState<(UserProfile & { id: string }) | null>(null);
  const [userSquad, setUserSquad] = useState<any[]>([]);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [loadingSquad, setLoadingSquad] = useState(false);
  const [loadingTxs, setLoadingTxs] = useState(false);

  useEffect(() => {
    if (selectedUser) {
        fetchUserSquad(selectedUser.id);
        fetchUserTransactions(selectedUser.email || "");
    }
  }, [selectedUser]);

  const [gemsToSend, setGemsToSend] = useState("");
  const updateDoc = (globalThis as any).updateDoc;
  const doc = (globalThis as any).doc;
  const increment = (globalThis as any).increment;

  const handleSendGems = async () => {
      if (!selectedUser || !gemsToSend) return;
      try {
          await updateDoc(doc(db, "users", selectedUser.id), {
              gems: increment(parseInt(gemsToSend))
          });
          setGemsToSend("");
          alert("Gems sent successfully!");
      } catch (err) {
          console.error("Error sending gems:", err);
          alert("Failed to send gems.");
      }
  };

  const handleToggleBan = async () => {
    if (!selectedUser) return;
    try {
        const isBanned = !!selectedUser.banned;
        await updateDoc(doc(db, "users", selectedUser.id), {
            banned: !isBanned
        });
        setSelectedUser({...selectedUser, banned: !isBanned});
        alert(`User ${isBanned ? 'unbanned' : 'banned'} successfully!`);
    } catch (err) {
        console.error("Error toggling ban:", err);
        alert("Failed to toggle ban status.");
    }
  };

  const fetchUserSquad = async (userId: string) => {
    setLoadingSquad(true);
    try {
      const snap = await getDocs(collection(db, "users", userId, "squad"));
      const squad = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      setUserSquad(squad);
    } catch (err) {
      console.error("Error fetching squad:", err);
    } finally {
      setLoadingSquad(false);
    }
  };

  const fetchUserTransactions = async (email: string) => {
    setLoadingTxs(true);
    try {
        const snap = await getDocs(collection(db, "transactions"));
        const txs = snap.docs.map(d => ({id: d.id, ...d.data()}))
                   .filter(tx => tx.senderEmail === email || tx.recipientEmail === email);
        txs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setUserTransactions(txs);
    } catch (err) {
        console.error("Error fetching transactions:", err);
    } finally {
        setLoadingTxs(false);
    }
  };

  const getPlayerDetails = (playerId: string) => {
      return players.find(p => p.id === playerId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold mb-6 font-mono uppercase tracking-wider text-emerald-400">All Users ({users.length})</h3>
        <div className="space-y-2 max-h-[600px] overflow-auto custom-scrollbar">
            {users.map(user => (
                <button 
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${selectedUser?.id === user.id ? 'bg-[#48A111]/20 border-[#48A111]' : 'bg-black/20 border-white/5 hover:bg-black/40'}`}
                >
                    <div className="flex flex-col items-start gap-1">
                        <span className="font-bold">{user.username || user.email?.split('@')[0]}</span>
                        <span className="text-xs text-gray-400 font-mono">{user.email}</span>
                    </div>
                    <span className="font-mono text-emerald-400">${(user.coins || 0).toLocaleString()}</span>
                </button>
            ))}
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
        <h3 className="text-xl font-bold mb-6 font-mono uppercase tracking-wider text-purple-400">Squad Details</h3>
        {selectedUser ? (
            loadingSquad ? (
                <div className="text-gray-500 font-mono animate-pulse">Loading {selectedUser.username}'s squad...</div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-black/30 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                        <div>
                            <p className="font-bold">{selectedUser.username || selectedUser.email?.split('@')[0]}</p>
                            <p className="text-xs text-gray-400">Coins: {(selectedUser.coins || 0).toLocaleString()} | Gems: {(selectedUser.gems || 0).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 mt-4">
                        <h4 className="font-bold text-red-400 mb-2">Administrative Controls</h4>
                        <button
                          onClick={handleToggleBan}
                          className={`w-full py-2 rounded-lg text-sm font-bold transition-all ${selectedUser.banned ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
                        >
                          {selectedUser.banned ? 'Unban User' : 'Ban User'}
                        </button>
                    </div>

                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 mt-4">
                        <h4 className="font-bold text-purple-400 mb-2">Send Gems to User</h4>
                        <div className="flex gap-2">
                            <input
                              type="number"
                              value={gemsToSend}
                              onChange={(e) => setGemsToSend(e.target.value)}
                              className="bg-black border border-white/10 rounded-lg p-2 text-sm text-white w-full"
                              placeholder="Amount of gems"
                            />
                            <button
                              onClick={handleSendGems}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
                            >
                              Send
                            </button>
                        </div>
                    </div>
                    
                    <h4 className="font-bold text-emerald-400 mt-6 mb-2">Squad Details</h4>
                    <div className="grid gap-2 max-h-[300px] overflow-auto custom-scrollbar">
                        {userSquad.length === 0 ? <p className="text-gray-500 font-mono">No players in squad.</p> : userSquad.map((card, idx) => {
                            const player = getPlayerDetails(card.playerId);
                            return (
                                <div key={`${card.id}-${idx}`} className="flex gap-4 p-3 bg-black/20 rounded-lg border border-white/5">
                                    <img src={player?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(player?.name || 'Unknown')}`} alt={player?.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <p className="font-bold text-sm">{player?.name || card.playerName || 'Unknown Player'}</p>
                                        <p className="text-xs text-gray-400 font-mono">Level: {card.level || 1} | OVR: {card.overall || player?.stats.overall}</p>
                                        <p className="text-[10px] text-gray-500 font-mono">{player?.club} • {player?.position}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    <h4 className="font-bold text-emerald-400 mt-6 mb-2">Transaction History</h4>
                    <div className="grid gap-2 max-h-[300px] overflow-auto custom-scrollbar">
                        {loadingTxs ? <p className="text-gray-500">Loading history...</p> : userTransactions.length === 0 ? <p className="text-gray-600 font-mono text-xs">No transactions found.</p> : userTransactions.map((tx, idx) => (
                            <div key={`${tx.id}-${idx}`} className="bg-black/40 p-3 rounded-lg border border-white/5 text-xs flex justify-between">
                                <div>
                                    <p className="font-bold text-gray-300">{tx.type.toUpperCase()}</p>
                                    <p className="text-[10px] text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                                    {tx.playerName && <p className="text-[10px] text-emerald-300">Item: {tx.playerName}</p>}
                                </div>
                                <p className={`font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {tx.amount ? (tx.amount > 0 ? '+' : '') + tx.amount.toLocaleString() : 'N/A'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )
        ) : (
            <p className="text-gray-500 font-mono text-center mt-20">Select a user to view their squad details.</p>
        )}
      </div>
    </div>
  );
};
