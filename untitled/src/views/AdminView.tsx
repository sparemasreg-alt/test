import React, { useEffect, useState } from "react";
import { UserProfile } from "../hooks/useAuth";
import { useMarketStore } from "../store";
import { UserManagementView } from "./UserManagementView";
import {
  TrendingUp,
  Coins,
  Users,
  Settings,
  History,
  Award,
  Sparkles,
  PackageOpen,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldAlert,
  Crown,
} from "lucide-react";
import { toast } from "sonner";
import { FALLBACK_PACKAGES } from "./PricingView";

const getDocs = (...args: any[]) => (globalThis as any).getDocs(...args);
const collection = (...args: any[]) => (globalThis as any).collection(...args);
const db = (globalThis as any).db;
const onSnapshot = (...args: any[]) => (globalThis as any).onSnapshot(...args);
const doc = (...args: any[]) => (globalThis as any).doc(...args);
const setDoc = (...args: any[]) => (globalThis as any).setDoc(...args);
const updateDoc = (...args: any[]) => (globalThis as any).updateDoc(...args);
const addDoc = (...args: any[]) => (globalThis as any).addDoc(...args);
const getDoc = (...args: any[]) => (globalThis as any).getDoc(...args);

export const AdminView = () => {
  const [users, setUsers] = useState<(UserProfile & { id: string })[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pricingPackages, setPricingPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);
  const [activeTab, setActiveTab] = useState<"analytics" | "management" | "users">(
    "analytics",
  );

  // Console input states
  const [amount, setAmount] = useState(1000);
  const [targetUserId, setTargetUserId] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedPattern, setSelectedPattern] = useState("");
  const [newPlayerPrice, setNewPlayerPrice] = useState(0);
  const [managerPriceMultiplier, setManagerPriceMultiplier] = useState(100);
  const [applyToAll, setApplyToAll] = useState(false);
  const [clubs, setClubs] = useState<{ name: string; ovr: number }[]>([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [clubOvrChange, setClubOvrChange] = useState(0);
  const [walletName, setWalletName] = useState("");
  const [walletNumber, setWalletNumber] = useState("");
  const [instapayAddress, setInstapayAddress] = useState("");

  // New Player Form States
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerClub, setNewPlayerClub] = useState("");
  const [newPlayerOvr, setNewPlayerOvr] = useState(80);
  const [deletePlayerId, setDeletePlayerId] = useState("");

  // Transaction History filter state in admin
  const [txFilter, setTxFilter] = useState<
    "all" | "coins" | "player_trades" | "packs_upgrades"
  >("all");

  const players = useMarketStore((state) => state.players);
  const fetchPlayers = useMarketStore((state) => state.fetchPlayers);

  const fetchUsers = async () => {
    try {
      console.log("FIXME: Implement Supabase fetchUsers");
      setUsers([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async () => {
    try {
      const res = await fetch("/api/clubs");
      const data = await res.json();
      setClubs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateClubOvr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub || clubOvrChange === 0) return;
    try {
      const res = await fetch(
        `/api/clubs/${encodeURIComponent(selectedClub)}/ovr`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: clubOvrChange }),
        },
      );
      if (res.ok) {
        toast.success(`Updated ${selectedClub} OVR by ${clubOvrChange}`);
        setClubOvrChange(0);
        fetchClubs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName || !newPlayerClub)
      return toast.error("Name and Club required");
    let rarity = "Common";
    const uLvl = newPlayerOvr + 9;
    if (uLvl >= 100) rarity = "Icon";
    else if (uLvl >= 95) rarity = "Legend";
    else if (uLvl >= 90) rarity = "Epic";
    else if (uLvl >= 85) rarity = "Rare";

    const np = {
      id: `player-${Date.now()}`,
      name: newPlayerName,
      club: newPlayerClub,
      age: 22,
      careerGoals: 10,
      stats: {
        overall: newPlayerOvr,
        pace: newPlayerOvr,
        shooting: newPlayerOvr,
        passing: newPlayerOvr,
        dribbling: newPlayerOvr,
        defending: newPlayerOvr,
        physical: newPlayerOvr,
      },
      card: { rarity },
      levels: {
        base: newPlayerOvr,
        rare: newPlayerOvr + 3,
        special: newPlayerOvr + 6,
        ultimate: uLvl,
      },
      market: {
        currentPrice: Math.floor(newPlayerOvr * newPlayerOvr * 1.5),
        priceHistory: Array.from({ length: 10 }).map(() =>
          Math.floor(newPlayerOvr * newPlayerOvr * 1.5),
        ),
        change24h: 0,
        isListed: true,
      },
      position: "ST",
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(newPlayerName)}&background=random`,
    };
    try {
      await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(np),
      });
      toast.success("Player Created!");
      setNewPlayerName("");
      setNewPlayerClub("");
      setNewPlayerOvr(80);
      fetchPlayers();
    } catch (err: any) {
      toast.error("Error creating player: " + err.message);
    }
  };

  const handleDeletePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePlayerId) return toast.error("Select a player to delete");

    const playerToDelete = players.find((p) => p.id === deletePlayerId);
    const playerName = playerToDelete ? playerToDelete.name : "this player";
    if (
      !window.confirm(
        `Are you sure you want to permanently delete ${playerName}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await fetch(`/api/players/${deletePlayerId}`, {
        method: "DELETE",
      });
      toast.success("Player Deleted!");
      setDeletePlayerId("");
      fetchPlayers();
    } catch (err: any) {
      toast.error("Error deleting player: " + err.message);
    }
  };

  const fetchPacks = async () => {
    try {
      const snap = await getDocs(collection(db, 'packs'));
      const list = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
      setPacks(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Real-time users fetch
    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snap: any) => {
        const list = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        setUsers(list);
        setLoading(false);
      },
      (err: any) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      },
    );

    // Real-time packs fetch
    const unsubPacks = onSnapshot(
      collection(db, "packs"),
      (snap: any) => {
        const list = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        setPacks(list);
      },
      (err: any) => {
        console.error("Error fetching packs:", err);
      }
    );

    // Real-time managers fetch
    const unsubManagers = onSnapshot(
      collection(db, "managers"),
      (snap: any) => {
        const list = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
        setManagers(list);
      },
      (err: any) => {
        console.error("Error fetching managers:", err);
      }
    );

    fetchClubs();

    // Subscribe to ALL transaction events in real-time
    const unsub = onSnapshot(
      collection(db, "transactions"),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
        setTransactions(list);
        setLoadingTx(false);
      },
      (err) => {
        console.error("Error subscribing to admin transactions ledger:", err);
        setLoadingTx(false);
      },
    );

    // Subscribe to premium subscription packages
    const unsubPricing = onSnapshot(
      collection(db, "pricing_packages"),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a: any, b: any) => a.price - b.price);
        setPricingPackages(list);
      },
      (err) => {
        console.error("Error loading packages in dashboard admin panel:", err);
      },
    );
    
    // Fetch payment info
    const unsubPayment = onSnapshot(doc(db, 'settings', 'payment_info'), (snap: any) => {
        const data = typeof snap.data === 'function' ? snap.data() : snap;
        if (data) {
            setWalletName(data.walletName || "");
            setWalletNumber(data.walletNumber || "");
            setInstapayAddress(data.instapayAddress || "");
        }
    });

    return () => {
      unsubUsers();
      unsubPacks();
      unsubManagers();
      unsub();
      unsubPricing();
      unsubPayment();
    };
  }, []);

  const handleUpdatePaymentInfo = async () => {
    try {
      await setDoc(doc(db, "settings", "payment_info"), {
        walletName,
        walletNumber,
        instapayAddress
      });
      toast.success("Payment information updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update payment information.");
    }
  };

  const handleCreatePack = async () => {
    try {
      await addDoc(collection(db, "packs"), {
        name: "New Pack",
        price: 1000,
        playerIds: [],
        color: "#48A111",
      });
      fetchPacks();
      toast.success("New Pack Created! You can now configure it.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create pack.");
    }
  };

  const handleUpdatePack = async (
    packId: string,
    name: string,
    price: number,
    playerIds: string[],
    color: string,
  ) => {
    try {
      await updateDoc(doc(db, "packs", packId), {
        name,
        price,
        playerIds,
        color: color || null,
      });
      toast.success("Pack updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update pack.");
    }
  };

  const handleUpdateAllManagerPrices = async () => {
    try {
      for (const m of managers) {
        const newPrice = Math.floor(m.price * (managerPriceMultiplier / 100));
        await updateDoc(doc(db, "managers", m.id), { price: newPrice });
      }
      toast.success(`All ${managers.length} manager prices updated!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update manager prices.");
    }
  };

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) return;
    try {
      await updateDoc(doc(db, "users", targetUserId), {
        coins: increment(amount),
      });
      toast.success(`Sent ${amount} coins successfully!`);
      fetchUsers();
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const handlePriceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) return;

    const player = players.find((p) => p.id === selectedPlayerId);
    if (!player) return;

    const oldPrice = player.market.currentPrice;
    const diff = newPlayerPrice - oldPrice;

    try {
      await fetch(`/api/players/${selectedPlayerId}/price`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: newPlayerPrice }),
      });

      await fetchPlayers();

      if (diff > 0) {
        let usersUpdated = 0;
        for (const u of users) {
          const sqSnap = await getDocs(collection(db, "users", u.id, "squad"));
          const ownsPlayer = sqSnap.docs.some(
            (d) => d.data().playerId === selectedPlayerId,
          );
          if (ownsPlayer) {
            const userRef = doc(db, "users", u.id);
            await updateDoc(userRef, { coins: increment(diff) });
            usersUpdated++;
          }
        }
        toast.success(
          `Price updated! Added ${diff} coins to ${usersUpdated} users.`,
        );
        fetchUsers();
      } else {
        toast.info(
          "Price updated locally. No profit distributed because price decreased or stayed same.",
        );
      }
    } catch (err: any) {
      toast.error("Error: " + err.message);
    }
  };

  // Compute stats on what are the most bought & sold players
  interface PlayerTradeStats {
    id: string;
    name: string;
    buyCount: number;
    sellCount: number;
    totalCount: number;
  }

  const getPlayerStats = (): PlayerTradeStats[] => {
    const statsMap: { [id: string]: PlayerTradeStats } = {};

    transactions.forEach((tx) => {
      if (!tx.playerId) return;

      const ids = String(tx.playerId).split(",");
      const names = tx.playerName ? String(tx.playerName).split(",") : [];

      ids.forEach((id: string, idx: number) => {
        const cleanId = id.trim();
        if (!cleanId) return;
        const cleanName = (names[idx] || cleanId).trim();

        if (!statsMap[cleanId]) {
          statsMap[cleanId] = {
            id: cleanId,
            name: cleanName,
            buyCount: 0,
            sellCount: 0,
            totalCount: 0,
          };
        }

        const stats = statsMap[cleanId];

        if (
          tx.type === "player_buy" ||
          tx.type === "pack_buy" ||
          tx.type === "auction_buy_now" ||
          tx.type === "auction_win"
        ) {
          stats.buyCount += 1;
        } else if (tx.type === "player_sell") {
          stats.sellCount += 1;
        } else if (tx.type === "player_transfer") {
          stats.buyCount += 1;
          stats.sellCount += 1;
        }
        stats.totalCount = stats.buyCount + stats.sellCount;
      });
    });

    return Object.values(statsMap).sort((a, b) => b.totalCount - a.totalCount);
  };

  const pStats = getPlayerStats();
  const maxTradeVolume = pStats.length > 0 ? pStats[0].totalCount : 1;

  // Compute cumulative stats for metric highlights
  const totalCoinsSent = transactions
    .filter((tx) => tx.type === "coin_transfer")
    .reduce((sum, tx) => sum + (tx.amount || 0), 0);

  const totalPlayerTrades = transactions.filter((tx) =>
    [
      "player_buy",
      "player_sell",
      "player_transfer",
      "auction_win",
      "auction_buy_now",
    ].includes(tx.type),
  ).length;

  const totalPacksBought = transactions.filter(
    (tx) => tx.type === "pack_buy",
  ).length;

  // Filter ledger list
  const filteredTxs = transactions.filter((tx) => {
    if (txFilter === "all") return true;
    if (txFilter === "coins") return tx.type === "coin_transfer";
    if (txFilter === "player_trades")
      return [
        "player_buy",
        "player_sell",
        "player_transfer",
        "auction_win",
        "auction_buy_now",
      ].includes(tx.type);
    if (txFilter === "packs_upgrades")
      return tx.type === "pack_buy" || tx.type === "player_upgrade";
    return true;
  });

  if (loading)
    return (
      <div className="p-8 text-[#48A111] animate-pulse font-mono font-bold">
        LOADING SYSTEM DATA...
      </div>
    );

  return (
    <div className="p-4 sm:p-8 h-full flex flex-col gap-4 sm:gap-6 overflow-auto max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-red-500 animate-pulse" />
            Admin Command Office
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-1">
            REAL-TIME TRADE METRICS, SYSTEM INVENTORIES, AND SOVEREIGN MONETARY
            CONTROLS
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-black/50 p-1 rounded-2xl border border-white/5 self-start shrink-0">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "analytics"
                ? "bg-[#48A111] text-black shadow-lg shadow-[#48A111]/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Analytics & Ledger
          </button>
          <button
            onClick={() => setActiveTab("management")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "management"
                ? "bg-[#48A111] text-black shadow-lg shadow-[#48A111]/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Settings className="w-4 h-4" />
            Ledger & Consoles
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === "users"
                ? "bg-[#48A111] text-black shadow-lg shadow-[#48A111]/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" />
            Users Management
          </button>
        </div>
      </div>

      {activeTab === "users" && <UserManagementView users={users} players={players} />}

      {activeTab === "analytics" && (
        <div className="flex flex-col gap-4 sm:gap-8">
          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase font-mono">
                Coins Transferred
              </span>
              <p className="text-2xl font-black font-mono text-emerald-400 mt-1">
                ${totalCoinsSent.toLocaleString()}
              </p>
              <div className="flex items-center gap-1 text-[9px] text-gray-500 font-mono mt-2">
                <Coins className="w-3 h-3 text-emerald-500" /> System-wide P2P
                transfers
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase font-mono">
                Total Card Trades
              </span>
              <p className="text-2xl font-black font-mono text-purple-400 mt-1">
                {totalPlayerTrades}
              </p>
              <div className="flex items-center gap-1 text-[9px] text-gray-500 font-mono mt-2">
                <Users className="w-3 h-3 text-purple-500" /> Sells, Buys, and
                Gifts
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase font-mono">
                Packs Opened
              </span>
              <p className="text-2xl font-black font-mono text-blue-400 mt-1">
                {totalPacksBought}
              </p>
              <div className="flex items-center gap-1 text-[9px] text-gray-500 font-mono mt-2">
                <PackageOpen className="w-3 h-3 text-blue-500" /> Pack unpacking
                logs
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#48A111]"></div>
              <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase font-mono">
                Most Active Card
              </span>
              <p className="text-lg font-black font-mono text-[#48A111] truncate mt-2">
                {pStats.length > 0 ? pStats[0].name.toUpperCase() : "NONE"}
              </p>
              <div className="flex items-center gap-1 text-[9px] text-gray-500 font-mono mt-1.5">
                <Award className="w-3 h-3 text-[#48A111]" />{" "}
                {pStats.length > 0
                  ? `${pStats[0].totalCount} total trades`
                  : "No logs"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Box: Most Bought & Sold Players Leaderboard */}
            <div className="col-span-1 lg:col-span-5 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>

              <div className="flex items-center gap-2 mb-6">
                <Award className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="text-lg font-bold uppercase tracking-wider font-mono">
                  Most Traded Cards
                </h3>
              </div>

              {pStats.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/5 bg-black/10 rounded-2xl">
                  <p className="text-xs font-mono text-gray-400 font-bold">
                    No trades registered yet
                  </p>
                  <p className="text-[10px] text-gray-500 mt-1">
                    Leaderboard populates once users trade players
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 font-mono">
                  {pStats.slice(0, 8).map((p, idx) => {
                    const progressPercent = Math.min(
                      100,
                      Math.round((p.totalCount / maxTradeVolume) * 100),
                    );
                    return (
                      <div
                        key={p.id}
                        className="bg-black/20 p-3 rounded-xl border border-white/5"
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-bold text-gray-200">
                            #{idx + 1} {p.name}
                          </span>
                          <span className="font-bold text-purple-400 text-[10px]">
                            {p.totalCount}{" "}
                            {p.totalCount === 1 ? "trade" : "trades"}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-1.5 flex">
                          <div
                            style={{ width: `${progressPercent}%` }}
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          ></div>
                        </div>

                        {/* Breaks */}
                        <div className="flex justify-between text-[9px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <ArrowUpRight className="w-2.5 h-2.5 text-emerald-500" />{" "}
                            Buys: {p.buyCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <ArrowDownLeft className="w-2.5 h-2.5 text-red-400" />{" "}
                            Sells: {p.sellCount}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Box: Full Ledger of Financial and Trading Events */}
            <div className="col-span-1 lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#48A111] to-transparent"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#48A111]" />
                  <h3 className="text-lg font-bold uppercase tracking-wider font-mono">
                    Global Ledger
                  </h3>
                </div>

                {/* Ledger filters */}
                <div className="flex flex-wrap gap-1 bg-black/60 p-1 rounded-xl border border-white/5 self-start">
                  {(
                    ["all", "coins", "player_trades", "packs_upgrades"] as const
                  ).map((tab) => {
                    const labels = {
                      all: "All",
                      coins: "Coins",
                      player_trades: "Cards",
                      packs_upgrades: "Packs/Upgrade",
                    };
                    return (
                      <button
                        key={tab}
                        onClick={() => setTxFilter(tab)}
                        className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                          txFilter === tab
                            ? "bg-[#48A111] text-black"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {labels[tab]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {loadingTx ? (
                <div className="py-12 flex flex-col items-center gap-2 text-gray-500 font-mono text-xs">
                  <span className="animate-spin text-[#48A111]">⚡</span>
                  READING SYSTEM AUDIT LOGS...
                </div>
              ) : filteredTxs.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-white/5 bg-black/15 rounded-2xl">
                  <p className="text-xs font-mono text-gray-400 font-bold">
                    No logs matched this filter
                  </p>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[500px] pr-1 flex flex-col gap-2 custom-scrollbar font-mono">
                  {filteredTxs.map((tx) => {
                    let badgeColor = "bg-white/10 text-white";
                    let label = tx.type;
                    let desc = "";
                    let amountStr = "";

                    switch (tx.type) {
                      case "coin_transfer":
                        label = "COIN SEND";
                        badgeColor =
                          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25";
                        desc = `${tx.senderEmail} -> sent coins to -> ${tx.recipientEmail}`;
                        amountStr = `$${(tx.amount || 0).toLocaleString()}`;
                        break;
                      case "player_transfer":
                        label = "SQUAD GIFT";
                        badgeColor =
                          "bg-purple-500/10 text-purple-400 border border-purple-500/25";
                        desc = `${tx.senderEmail} -> gifted ${tx.playerName} (Lvl ${tx.playerLevel}) to -> ${tx.recipientEmail}`;
                        amountStr = "FREE";
                        break;
                      case "player_buy":
                        label = "MARKET BUY";
                        badgeColor =
                          "bg-red-500/10 text-red-400 border border-red-500/25";
                        desc = `${tx.recipientEmail} bought player ${tx.playerName}`;
                        amountStr = `-$${(tx.amount || 0).toLocaleString()}`;
                        break;
                      case "player_sell":
                        label = "MARKET SELL";
                        badgeColor =
                          "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25";
                        desc = `${tx.recipientEmail} sold player ${tx.playerName}`;
                        amountStr = `+$${(tx.amount || 0).toLocaleString()}`;
                        break;
                      case "pack_buy":
                        label = "PACK BUY";
                        badgeColor =
                          "bg-blue-500/10 text-blue-400 border border-blue-500/25";
                        desc = `${tx.senderEmail} bought pack: ${tx.recipientEmail} ${tx.playerName ? `(Unlocked: ${tx.playerName})` : ""}`;
                        amountStr = `-$${(tx.amount || 0).toLocaleString()}`;
                        break;
                      case "player_upgrade":
                        label = "UPGRADE";
                        badgeColor =
                          "bg-amber-500/10 text-amber-400 border border-amber-500/25";
                        desc = `${tx.senderEmail} upgraded card: ${tx.playerName}`;
                        amountStr = `-$${(tx.amount || 0).toLocaleString()}`;
                        break;
                      case "auction_win":
                        label = "AUCTION SETTLE";
                        badgeColor =
                          "bg-purple-500/10 text-purple-400 border border-purple-500/25";
                        desc = `${tx.recipientEmail} won ${tx.playerName} from ${tx.senderEmail}`;
                        amountStr = `$${(tx.amount || 0).toLocaleString()}`;
                        break;
                      case "auction_buy_now":
                        label = "AUCTION BUYOUT";
                        badgeColor =
                          "bg-pink-600/10 text-pink-400 border border-pink-500/25";
                        desc = `${tx.recipientEmail} bought ${tx.playerName} on buyout from ${tx.senderEmail}`;
                        amountStr = `$${(tx.amount || 0).toLocaleString()}`;
                        break;
                      default:
                        label = tx.type?.toUpperCase() || "TX LOG";
                        desc = `${tx.senderEmail || "System"} -> ${tx.recipientEmail || "System"} event`;
                        amountStr = tx.amount
                          ? `$${tx.amount.toLocaleString()}`
                          : "";
                    }

                    const formattedTime = tx.date
                      ? new Date(tx.date).toLocaleDateString([], {
                          month: "short",
                          day: "2-digit",
                        }) +
                        " " +
                        new Date(tx.date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "--/--";

                    return (
                      <div
                        key={tx.id}
                        className="bg-black/30 border border-white/5 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[8px] font-bold px-1.5 py-0.5 rounded leading-none ${badgeColor}`}
                            >
                              {label}
                            </span>
                            <span className="text-[9px] text-gray-500">
                              {formattedTime}
                            </span>
                          </div>
                          <p className="text-gray-300 font-bold truncate pr-3 select-text mt-1">
                            {desc}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 font-black self-start sm:self-center ${
                            amountStr.startsWith("+")
                              ? "text-emerald-400"
                              : amountStr.startsWith("-")
                                ? "text-red-400"
                                : "text-purple-400"
                          }`}
                        >
                          {amountStr}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "management" && (
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Create Player
              </h3>
              <form
                onSubmit={handleCreatePlayer}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Player Name
                  </label>
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="E.g. Lionel Messi"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Club
                  </label>
                  <input
                    type="text"
                    value={newPlayerClub}
                    onChange={(e) => setNewPlayerClub(e.target.value)}
                    placeholder="E.g. Inter Miami"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Base OVR
                  </label>
                  <input
                    type="number"
                    value={newPlayerOvr}
                    onChange={(e) => setNewPlayerOvr(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#48A111] text-black font-black uppercase tracking-widest py-3 rounded-lg hover:bg-[#58c115]"
                >
                  Create Player Card
                </button>
              </form>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Delete Player
              </h3>
              <form
                onSubmit={handleDeletePlayer}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Select Player
                  </label>
                  <select
                    value={deletePlayerId}
                    onChange={(e) => setDeletePlayerId(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-red-500 transition-colors font-mono"
                  >
                    <option value="">-- Choose Player --</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (OVR: {p.stats?.overall})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-red-600 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-red-700"
                >
                  Delete Player
                </button>
              </form>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Adjust Global Manager Prices
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Percentage Multiplier (%)
                  </label>
                  <input
                    type="number"
                    value={managerPriceMultiplier}
                    onChange={(e) => setManagerPriceMultiplier(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  />
                </div>
                <button
                  onClick={handleUpdateAllManagerPrices}
                  className="bg-purple-600 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-purple-700"
                >
                  Apply Multiplier to All Managers
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Send Coins
              </h3>
              <form onSubmit={handleSendMoney} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Select Target User
                  </label>
                  <select
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  >
                    <option value="">-- Choose User --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email} ({u.coins} coins)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#48A111] text-black font-black uppercase tracking-widest py-3 rounded-lg hover:bg-[#58c115]"
                >
                  Send Coins
                </button>
              </form>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center lg:col-span-2">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Manage Payment Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Wallet Name
                  </label>
                  <input
                    type="text"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Wallet Number
                  </label>
                  <input
                    type="text"
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    InstaPay Address
                  </label>
                  <input
                    type="text"
                    value={instapayAddress}
                    onChange={(e) => setInstapayAddress(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  />
                </div>
              </div>
              <button
                onClick={handleUpdatePaymentInfo}
                className="bg-[#48A111] text-black font-black uppercase tracking-widest py-3 rounded-lg hover:bg-[#58c115] mt-4"
              >
                Update Payment Info
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Edit Player Price
              </h3>
              <form
                onSubmit={handlePriceUpdate}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Select Player
                  </label>
                  <select
                    value={selectedPlayerId}
                    onChange={(e) => {
                      setSelectedPlayerId(e.target.value);
                      const p = players.find((x) => x.id === e.target.value);
                      if (p) setNewPlayerPrice(p.market.currentPrice);
                    }}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  >
                    <option value="">-- Choose Player --</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Current: ${p.market.currentPrice})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    New Price
                  </label>
                  <input
                    type="number"
                    value={newPlayerPrice}
                    onChange={(e) => setNewPlayerPrice(Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#48A111] text-black font-black uppercase tracking-widest py-3 rounded-lg hover:bg-[#58c115]"
                >
                  Update & Distribute Profit
                </button>
              </form>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Adjust Club OVR
              </h3>
              <form
                onSubmit={handleUpdateClubOvr}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Select Club
                  </label>
                  <select
                    value={selectedClub}
                    onChange={(e) => setSelectedClub(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  >
                    <option value="">-- Choose Club --</option>
                    {clubs.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name} (Current: {c.ovr})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    OVR Change (e.g. +2 or -2)
                  </label>
                  <input
                    type="number"
                    value={clubOvrChange}
                    onChange={(e) => setClubOvrChange(Number(e.target.value))}
                    placeholder="+/- Amount"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#48A111] text-black font-black uppercase tracking-widest py-3 rounded-lg hover:bg-[#58c115]"
                >
                  Apply Club OVR Change
                </button>
              </form>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Bulk Price Adjustment (%)
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const percent = Number(formData.get("percentage"));
                  try {
                    await fetch("/api/players/bulk-price-update", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ percentage: percent }),
                    });
                    await fetchPlayers();
                    toast.success(`Applied ${percent}% change to all players!`);
                  } catch (err: any) {
                    toast.error("Error: " + err.message);
                  }
                }}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Percentage Change (+ or -)
                  </label>
                  <input
                    name="percentage"
                    type="number"
                    step="1"
                    defaultValue={0}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-purple-600 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-purple-700"
                >
                  Apply to All Players
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await fetch("/api/players/reset-prices", {
                        method: "POST",
                      });
                      await fetchPlayers();
                      toast.success("Prices reset to base values!");
                    } catch (err: any) {
                      toast.error("Error: " + err.message);
                    }
                  }}
                  className="bg-red-600 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-red-700"
                >
                  Reset Prices
                </button>
              </form>
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  Generate Tier Promo Code
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const code = formData.get("code") as string;
                    const tier = formData.get("tier") as string;
                    if (!code || !tier)
                      return toast.error("Enter code and select tier!");

                    const unlockedPlayers: string[] = [];
                    players.forEach(p => {
                       if (formData.get(`player_${p.id}`)) {
                          unlockedPlayers.push(p.id);
                       }
                    });

                    try {
                      await setDoc(doc(db, "promo_codes", code.toUpperCase()), {
                        tier,
                        unlockedPlayers,
                        createdAt: new Date().toISOString()
                      });
                      toast.success(`Promo Code Generated: ${code.toUpperCase()}`);
                      (e.target as HTMLFormElement).reset();
                    } catch (err: any) {
                      toast.error("Error saving code: " + err.message);
                    }
                  }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                      Promo Code String
                    </label>
                    <input
                      name="code"
                      type="text"
                      placeholder="e.g. SUMMER25"
                      required
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                      Target Subscription Tier
                    </label>
                    <select
                      name="tier"
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                    >
                      <option value="starter-pkg">Starter (5% Off)</option>
                      <option value="pro-pkg">Pro (15% Off)</option>
                      <option value="elite-pkg">Elite (25% Off)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                      Select Unlocked Players for this Code
                    </label>
                    <div className="max-h-40 overflow-y-auto bg-black/50 border border-white/10 rounded-lg p-3 flex flex-col gap-2">
                       {players.map((p) => (
                          <label key={p.id} className="flex items-center gap-3 cursor-pointer text-sm">
                             <input type="checkbox" name={`player_${p.id}`} className="accent-[#48A111] w-4 h-4" />
                             {p.name} ({p.card?.rarity || 'Gold'})
                          </label>
                       ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-[#48A111] text-[#0a0a0a] font-black uppercase tracking-widest py-3 rounded-lg hover:bg-[#3d8a0f] text-sm mt-2"
                  >
                    Generate & Save Code
                  </button>
                </form>
              </div>

              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  Daily Rewards Control
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    try {
                      await setDoc(doc(db, "admin_settings", "daily_rewards"), {
                        basic: Number(formData.get("basic")),
                        starter: Number(formData.get("starter")),
                        pro: Number(formData.get("pro")),
                        elite: Number(formData.get("elite")),
                      });
                      toast.success("Daily rewards updated globally!");
                    } catch (err: any) {
                      toast.error(err.message);
                    }
                  }}
                  className="flex flex-col gap-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase opacity-40 mb-2">
                        Basic User
                      </label>
                      <input
                        type="number"
                        name="basic"
                        defaultValue={1000}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase opacity-40 mb-2">
                        Starter Tier
                      </label>
                      <input
                        type="number"
                        name="starter"
                        defaultValue={1500}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase opacity-40 mb-2">
                        Pro Tier
                      </label>
                      <input
                        type="number"
                        name="pro"
                        defaultValue={2500}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase opacity-40 mb-2">
                        Elite Tier
                      </label>
                      <input
                        type="number"
                        name="elite"
                        defaultValue={5000}
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Save Rewards
                  </button>
                </form>
              </div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Subscription Lock Configuration
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedPlayerId) return toast.error("Select a player!");
                  const formData = new FormData(e.currentTarget);
                  const isLocked = formData.get("subscriberOnly") === "on";
                  const discount = Number(formData.get("discount"));
                  // Gather selected tiers
                  const allowedTiers: string[] = [];
                  if (formData.get("tier_starter"))
                    allowedTiers.push("starter-pkg");
                  if (formData.get("tier_pro")) allowedTiers.push("pro-pkg");
                  if (formData.get("tier_elite"))
                    allowedTiers.push("elite-pkg");

                  try {
                    await fetch(
                      `/api/players/${selectedPlayerId}/subscriber-settings`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          subscriberOnly: isLocked,
                          subscriberDiscount: discount,
                          allowedTiers,
                        }),
                      },
                    );
                    await fetchPlayers();
                    toast.success(`Updated subscriber settings for player!`);
                  } catch (err: any) {
                    toast.error("Error: " + err.message);
                  }
                }}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Select Player
                  </label>
                  <select
                    value={selectedPlayerId}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  >
                    <option value="">-- Choose Player --</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="subscriberOnly"
                    id="subscriberOnly"
                    className="w-5 h-5 accent-[#48A111]"
                  />
                  <label
                    htmlFor="subscriberOnly"
                    className="text-sm font-bold uppercase tracking-wider"
                  >
                    Lock for Subscribers Only
                  </label>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex flex-col gap-3">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40 font-mono">
                    Allowed Tiers
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="tier_starter"
                        defaultChecked
                        className="accent-[#48A111] w-4 h-4"
                      />
                      <span className="text-xs font-bold tracking-wider uppercase">
                        Starter
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="tier_pro"
                        defaultChecked
                        className="accent-[#48A111] w-4 h-4"
                      />
                      <span className="text-xs font-bold tracking-wider uppercase">
                        Pro
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="tier_elite"
                        defaultChecked
                        className="accent-[#48A111] w-4 h-4"
                      />
                      <span className="text-xs font-bold tracking-wider uppercase">
                        Elite
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Discount Percentage (% off)
                  </label>
                  <input
                    name="discount"
                    type="number"
                    min="0"
                    max="99"
                    defaultValue={5}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-purple-600 text-white font-black uppercase tracking-widest py-3 rounded-lg hover:bg-purple-700"
                >
                  Save Settings
                </button>
              </form>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center lg:col-span-2">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Assign Live Market Pattern (Stock Simulation)
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedPlayerId) return toast.error("Select a player!");
                  const formData = new FormData(e.currentTarget);
                  const patternId = formData.get("patternId") as string;
                  const minTick = parseFloat(
                    (formData.get("minTick") as string) || "0",
                  );
                  const maxTick = parseFloat(
                    (formData.get("maxTick") as string) || "0",
                  );

                  try {
                    const res = await fetch(
                      `/api/players/${selectedPlayerId}/pattern`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          patternId: patternId || null,
                          minTick,
                          maxTick,
                        }),
                      },
                    );
                    if (res.ok) {
                      toast.success(
                        selectedPlayerId === "ALL"
                          ? "Market Pattern applied to ALL players!"
                          : "Market Pattern applied! Price will now simulate live.",
                      );
                      fetchPlayers(); // Force refresh from store if possible
                    }
                  } catch (err: any) {
                    toast.error("Error: " + err.message);
                  }
                }}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Select Player
                  </label>
                  <select
                    value={selectedPlayerId}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  >
                    <option value="">-- Choose Player --</option>
                    <option value="ALL">Apply to ALL PLAYERS 🌍</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (OVR: {p.stats.overall})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Select Market Pattern
                  </label>
                  <select
                    name="patternId"
                    value={selectedPattern}
                    onChange={(e) => setSelectedPattern(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  >
                    <option value="">None (Static Price)</option>
                    <option value="1">
                      VOLATILE 🎢💥 (-15% to +15% per tick)
                    </option>
                    <option value="2">
                      STEADY BULL 📈🐂 (-2% to +5% per tick)
                    </option>
                    <option value="3">
                      SLOW BLEED 🩸🐻 (-5% to +2% per tick)
                    </option>
                    <option value="4">
                      FLATLINER 😐 (-1% to +1% per tick)
                    </option>
                    <option value="5">
                      THE MOONSHOT 🌕🚀 (0% to +20% per tick)
                    </option>
                    <option value="6">
                      MARKET CRASH 📉🔥 (-20% to 0% per tick)
                    </option>
                    <option value="7">
                      BALANCED (Up & Down) ⚖️ (-5% to +5% per tick)
                    </option>
                    <option value="8">
                      WILD SWINGS 🌪️ (-30% to +30% per tick)
                    </option>
                    <option value="custom">
                      CUSTOM ⚙️ (Set your own percent)
                    </option>
                  </select>
                </div>

                {selectedPattern === "custom" && (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                        Min % per tick
                      </label>
                      <input
                        name="minTick"
                        type="number"
                        step="0.1"
                        defaultValue="-5"
                        placeholder="-5"
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                        Max % per tick
                      </label>
                      <input
                        name="maxTick"
                        type="number"
                        step="0.1"
                        defaultValue="5"
                        placeholder="5"
                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                      />
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  className="bg-[#48A111] text-black font-black uppercase tracking-widest py-3 rounded-lg hover:bg-[#58c115]"
                >
                  Apply Market Pattern
                </button>
              </form>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center lg:col-span-2">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Market Tick Interval (Frequency)
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const tickSeconds = parseFloat(
                    formData.get("tickSeconds") as string,
                  );
                  if (!tickSeconds || tickSeconds < 1)
                    return toast.error("Invalid interval (min 1 sec)");

                  try {
                    const res = await fetch("/api/market-config", {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ tickSeconds }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      toast.success(
                        `Market will now update every ${data.tickSeconds} seconds!`,
                      );
                    }
                  } catch (err: any) {
                    toast.error("Error: " + err.message);
                  }
                }}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Seconds per tick
                  </label>
                  <input
                    name="tickSeconds"
                    type="number"
                    step="1"
                    min="1"
                    defaultValue="10"
                    placeholder="10"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#48A111] text-black font-black uppercase tracking-widest py-3 rounded-lg hover:bg-[#58c115]"
                >
                  Apply Tick Interval
                </button>
              </form>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-center lg:col-span-2">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                Configure Penalty Minigame (Mystery Player)
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedPlayerId) return toast.error("Select a player!");
                  const formData = new FormData(e.currentTarget);
                  const difficulty = formData.get("difficulty") as string;
                  const clues = formData.get("clues") as string;
                  const isActive = formData.get("isActive") === "on";

                  try {
                    const res = await fetch("/api/penalty", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        id: selectedPlayerId,
                        playerId: selectedPlayerId,
                        difficulty: parseInt(difficulty),
                        clues: clues,
                        active: isActive,
                      }),
                    });
                    if (res.ok)
                      toast.success("Penalty Box updated for this player!");
                  } catch (err: any) {
                    toast.error("Error: " + err.message);
                  }
                }}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Select Player
                  </label>
                  <select
                    value={selectedPlayerId}
                    onChange={(e) => setSelectedPlayerId(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  >
                    <option value="">-- Choose Player --</option>
                    {players.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (OVR: {p.stats.overall})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Difficulty Level (1-3)
                  </label>
                  <select
                    name="difficulty"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                  >
                    <option value="1">Level 1 (Easy)</option>
                    <option value="2">Level 2 (Medium)</option>
                    <option value="3">Level 3 (Hard)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest opacity-40 mb-2 font-mono">
                    Custom Clues (Text)
                  </label>
                  <input
                    name="clues"
                    type="text"
                    placeholder="e.g., Plays in La Liga, has 90+ Pace"
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 outline-none focus:border-[#48A111] transition-colors font-mono"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked
                    id="isActiveCheck"
                    className="rounded bg-black border-white/10 text-[#48A111]"
                  />
                  <label
                    htmlFor="isActiveCheck"
                    className="text-xs uppercase font-mono text-gray-400 font-bold"
                  >
                    Active in game?
                  </label>
                </div>
                <button
                  type="submit"
                  className="bg-[#48A111] text-black font-black uppercase tracking-widest py-3 rounded-lg hover:bg-[#58c115]"
                >
                  Save to Penalty Box
                </button>
              </form>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col lg:col-span-2">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold font-mono">
                   Manage Pack Configurations
                 </h3>
                 <button onClick={handleCreatePack} className="bg-[#48A111] hover:bg-[#3d8a0f] text-black px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors">Create New Pack</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {packs.map((pack) => (
                  <div
                    key={pack.id}
                    className="flex flex-col gap-2 bg-black/30 p-4 rounded-xl border border-white/5"
                  >
                    <span className="text-sm font-bold font-mono text-[#48A111] uppercase">
                      {pack.name}
                    </span>
                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-[9px] font-mono text-gray-500 uppercase font-black">
                        Pack Title
                      </label>
                      <input
                        type="text"
                        placeholder="Name"
                        value={pack.name}
                        onChange={(e) => {
                          const updated = packs.map((p) =>
                            p.id === pack.id
                              ? { ...p, name: e.target.value }
                              : p,
                          );
                          setPacks(updated);
                        }}
                        className="bg-black/50 border border-white/10 p-2 text-sm rounded-lg font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-mono text-gray-500 uppercase font-black">
                        Pack Price (Coins)
                      </label>
                      <input
                        type="number"
                        placeholder="Price"
                        value={pack.price}
                        onChange={(e) => {
                          const updated = packs.map((p) =>
                            p.id === pack.id
                              ? { ...p, price: Number(e.target.value) }
                              : p,
                          );
                          setPacks(updated);
                        }}
                        className="bg-black/50 border border-white/10 p-2 text-sm rounded-lg font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-mono text-gray-500 uppercase font-black">
                        Tailwind Tailwind Style
                      </label>
                      <input
                        type="text"
                        placeholder="Color"
                        value={pack.color || ""}
                        onChange={(e) => {
                          const updated = packs.map((p) =>
                            p.id === pack.id
                              ? { ...p, color: e.target.value }
                              : p,
                          );
                          setPacks(updated);
                        }}
                        className="bg-black/50 border border-white/10 p-2 text-sm rounded-lg font-mono"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto bg-black/50 p-3 rounded-lg mt-2 border border-white/5 select-none font-mono">
                      <p className="text-[9px] text-gray-400 font-bold uppercase mb-2">
                        Select Unlocked Players:
                      </p>
                      {players.map((player) => (
                        <label
                          key={player.id}
                          className="flex items-center gap-2 py-1 cursor-pointer hover:bg-white/5 rounded px-1 text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={
                              pack.playerIds?.includes(player.id) || false
                            }
                            onChange={(e) => {
                              const updatedPack = { ...pack };
                              if (e.target.checked) {
                                updatedPack.playerIds = [
                                  ...(updatedPack.playerIds || []),
                                  player.id,
                                ];
                              } else {
                                updatedPack.playerIds = (
                                  updatedPack.playerIds || []
                                ).filter((id) => id !== player.id);
                              }
                              const updatedPacks = packs.map((p) =>
                                p.id === pack.id ? updatedPack : p,
                              );
                              setPacks(updatedPacks);
                            }}
                            className="rounded bg-black border-white/10 text-[#48A111] focus:ring-0"
                          />
                          <span>{player.name}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        handleUpdatePack(
                          pack.id,
                          pack.name,
                          pack.price,
                          pack.playerIds,
                          pack.color,
                        )
                      }
                      className="bg-[#48A111] text-black font-black uppercase text-xs tracking-widest p-3 mt-3 rounded-xl transition-all"
                    >
                      Commit Configurations
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Manage Subscription Packages Section */}
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col lg:col-span-2 mt-6">
              <h3 className="text-xl font-bold mb-6 font-mono flex items-center gap-2 text-amber-400">
                <Crown className="w-5 h-5 text-amber-400" />
                Manage 3 Subscription Packages (Pricing Control)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(pricingPackages.length > 0
                  ? pricingPackages
                  : FALLBACK_PACKAGES
                ).map((pkg) => {
                  return (
                    <div
                      key={pkg.id}
                      className="flex flex-col gap-4 bg-black/30 p-5 rounded-xl border border-white/5 font-mono"
                    >
                      <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                        {pkg.id} TIER
                      </span>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-gray-500 uppercase font-black">
                          Package Title
                        </label>
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={(e) => {
                            const updated = (
                              pricingPackages.length > 0
                                ? pricingPackages
                                : FALLBACK_PACKAGES
                            ).map((p) =>
                              p.id === pkg.id
                                ? { ...p, name: e.target.value }
                                : p,
                            );
                            setPricingPackages(updated);
                          }}
                          className="bg-black/50 border border-white/10 p-2.5 text-sm rounded-lg text-white outline-none focus:border-[#48A111]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-gray-500 uppercase font-black">
                          Package Price (USD / Month)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={pkg.price}
                          onChange={(e) => {
                            const updated = (
                              pricingPackages.length > 0
                                ? pricingPackages
                                : FALLBACK_PACKAGES
                            ).map((p) =>
                              p.id === pkg.id
                                ? { ...p, price: Number(e.target.value) }
                                : p,
                            );
                            setPricingPackages(updated);
                          }}
                          className="bg-black/50 border border-white/10 p-2.5 text-sm rounded-lg text-white outline-none focus:border-[#48A111]"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-gray-500 uppercase font-black">
                          Description
                        </label>
                        <textarea
                          rows={3}
                          value={pkg.description}
                          onChange={(e) => {
                            const updated = (
                              pricingPackages.length > 0
                                ? pricingPackages
                                : FALLBACK_PACKAGES
                            ).map((p) =>
                              p.id === pkg.id
                                ? { ...p, description: e.target.value }
                                : p,
                            );
                            setPricingPackages(updated);
                          }}
                          className="bg-black/50 border border-white/10 p-2.5 text-sm rounded-lg text-white outline-none focus:border-[#48A111] resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] text-gray-500 uppercase font-black">
                          Features Checklist (comma-separated)
                        </label>
                        <textarea
                          rows={2}
                          value={pkg.features ? pkg.features.join(", ") : ""}
                          onChange={(e) => {
                            const featuresArr = e.target.value
                              .split(",")
                              .map((f) => f.trim())
                              .filter(Boolean);
                            const updated = (
                              pricingPackages.length > 0
                                ? pricingPackages
                                : FALLBACK_PACKAGES
                            ).map((p) =>
                              p.id === pkg.id
                                ? { ...p, features: featuresArr }
                                : p,
                            );
                            setPricingPackages(updated);
                          }}
                          className="bg-black/50 border border-white/10 p-2 text-xs rounded-lg text-white resize-none"
                          placeholder="Benefit 1, Benefit 2, Benefit 3"
                        />
                      </div>

                      <button
                        onClick={async () => {
                          try {
                            const docRef = (globalThis as any).doc(
                              (globalThis as any).db,
                              "pricing_packages",
                              pkg.id,
                            );
                            await (globalThis as any).setDoc(docRef, {
                              name: pkg.name,
                              price: pkg.price,
                              description: pkg.description,
                              features: pkg.features || [],
                            });
                            toast.success(
                              `Updated ${pkg.name} successfully in Firestore!`,
                            );
                          } catch (err: any) {
                            console.error(err);
                            toast.error(
                              "Database update rejected: " + err.message,
                            );
                          }
                        }}
                        className="bg-cyan-500 text-black font-black uppercase text-xs tracking-widest p-3 mt-2 rounded-xl transition-all hover:bg-cyan-400"
                      >
                        Commit TIER Changes
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl overflow-auto mt-4">
            <h3 className="text-xl font-bold mb-6 font-mono">
              User Database Profiles
            </h3>
            <table className="w-full text-left font-mono text-sm">
              <thead>
                <tr className="opacity-40 text-xs uppercase tracking-widest border-b border-white/10">
                  <th className="pb-4">User ID</th>
                  <th className="pb-4">Email</th>
                  <th className="pb-4">Role</th>
                  <th className="pb-4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 font-mono text-xs opacity-50 select-all">
                      {u.id}
                    </td>
                    <td className="py-4 font-bold">{u.email}</td>
                    <td className="py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                          u.role === "admin"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-white/10 text-white"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 text-right font-mono text-[#48A111] font-bold">
                      ${u.coins.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
