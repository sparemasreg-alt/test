import { create } from 'zustand';
import { toast } from 'sonner';
import { io } from 'socket.io-client';
import { playersData as fallbackPlayersData } from './data/playersData';

const socket = io(); // Connects to the same host that serves the page

const getAuth = () => (globalThis as any).auth;
const getDb = () => (globalThis as any).db;
const doc = (...args: any[]) => (globalThis as any).doc(...args);
const getDoc = (...args: any[]) => (globalThis as any).getDoc(...args);
const getDocs = (...args: any[]) => (globalThis as any).getDocs(...args);
const collection = (...args: any[]) => (globalThis as any).collection(...args);
const updateDoc = (...args: any[]) => (globalThis as any).updateDoc(...args);
const setDoc = (...args: any[]) => (globalThis as any).setDoc(...args);
const deleteDoc = (...args: any[]) => (globalThis as any).deleteDoc(...args);


// Listen for global real-time notifications from the advanced market engine
socket.on("notification", (data: any) => {
  if (data.message) {
     toast.info(data.message, { 
       style: { background: 'rgba(0,0,0,0.8)', border: '1px solid #48A111', color: '#48A111' },
       duration: 5000
     });
  }
});

socket.on("liveGoal", (data: any) => {
  if (data.message) {
     // Show giant football goal notification
     toast.success(data.message, {
        icon: '⚽',
        style: { background: 'rgba(72,161,17,0.2)', border: '1px solid #48A111', color: '#fff', fontSize: '1.2rem', padding: '16px' },
        duration: 8000
     });
  }
});


export type Rarity = 'Bronze' | 'Silver' | 'Gold' | 'Elite' | 'Master' | 'Icon';

export interface NotificationPreferences {
  auctions: boolean;
  priceChanges: boolean;
  social: boolean;
  system: boolean;
  push: boolean;
  email: boolean;
}

export interface PlayerStat {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  overall: number;
}

export interface PlayerCard {
  id: string;
  name: string;
  image: string;
  position: string;
  league: string;
  club: string;
  nation: string;
  stats: PlayerStat;
  card: {
    rarity: Rarity;
  };
  subscriberOnly?: boolean;
  subscriberDiscount?: number;
  allowedTiers?: string[];
  chemistryStyle?: string;
  levels: {
    base: number;
    rare: number;
    special: number;
    ultimate: number;
  };
  market: {
    currentPrice: number;
    priceHistory: number[];
    isListed: boolean;
    change24h: number;
  };
}

export interface MarketState {
  players: PlayerCard[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: {
    balance: number;
    portfolio: { docId: string, id: string, level: number, overall?: number, onAuction?: boolean, onTrade?: boolean, auctionId?: string | null }[];
    managers: { managerId: string }[];
    activeManager: string | null;
    friends: { uid: string, username: string, email: string }[];
    notificationPreferences: NotificationPreferences;
  };
  searchUsers: (query: string) => Promise<any[]>;
  addFriend: (friendUid: string, friendUsername: string, friendEmail: string) => Promise<void>;
  transferCoins: (friendUid: string, amount: number) => Promise<void>;
  transferPlayer: (friendUid: string, playerDocId: string) => Promise<void>;
  updatePrice: (id: string, newPrice: number) => void;
  buyPlayer: (id: string, level: string, promoCode?: string, userPromoCode?: string, userSubTier?: string) => Promise<void>;
  buyManager: (managerId: string) => Promise<void>;
  setActiveManager: (managerId: string) => Promise<void>;
  updateProfile: (data: { club?: string; bio?: string; nationality?: string; photoURL?: string }) => Promise<void>;
  buyPack: (packId: string) => Promise<PlayerCard[]>;
  sellPlayer: (docId: string) => Promise<void>;
  reclaimPlayer: (docId: string) => Promise<void>;
  upgradePlayer: (docId: string) => Promise<void>;
  createAuction: (docId: string, startPrice: number, buyNowPrice: number | null, durationMinutes: number) => Promise<boolean>;
  createTrade: (docId: string, durationMinutes: number) => Promise<boolean>;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
  fetchPlayers: () => Promise<void>;
  startPolling: () => void;
  fetchUserSquad: () => Promise<void>;
}

export const useMarketStore = create<MarketState>((set, get) => ({
  players: [],
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
  user: {
    balance: 0,
    portfolio: [],
    managers: [],
    activeManager: null,
    friends: [],
    notificationPreferences: {
      auctions: true,
      priceChanges: true,
      social: true,
      system: true,
      push: false,
      email: true
    }
  },
  updateNotificationPreferences: (prefs) => set((state) => ({
    user: {
      ...state.user,
      notificationPreferences: { ...state.user.notificationPreferences, ...prefs }
    }
  })),
  fetchPlayers: async () => {
    try {
      const resPlayers = await fetch('/api/players');
      if (!resPlayers.ok) {
        throw new Error(`HTTP error! status: ${resPlayers.status}`);
      }
      const data = await resPlayers.json();
      set({ players: data });
    } catch (e: any) {
      console.warn("fetchPlayers warning, falling back to local module:", e);
      // Fallback if local API is unreachable (e.g. preview environments)
      const playersData = fallbackPlayersData;
      
      const playerImages: Record<string, string> = {
        "Crystiano Ronaldo": "https://img.pngimg.com/uploads/ronaldo/ronaldo_PNG18.png",
        "Mohamed Satah": "https://www.pngmart.com/files/24/Mohamed-Salah-PNG-Transparent-Image.png",
        "Erling Haoland": "https://www.pngmart.com/files/24/Erling-Haaland-PNG-Free-Download.png",
        "Kylian Mbapbe": "https://www.pngmart.com/files/15/Kylian-Mbappe-PNG-Clipart.png",
        "Lionil Messi": "https://www.pngmart.com/files/22/Lionel-Messi-PNG-Isolated-Pic.png"
      };

      const playerNations: Record<string, string> = {
        "Crystiano Ronaldo": "Portugal", "Mohamed Satah": "Egypt", "Erling Haoland": "Norway",
        "Kylian Mbapbe": "France", "Vinícius Junnor": "Brazil", "Lionil Messi": "Argentina",
        "Jude Bellinghom": "England", "Kevin De Breyne": "Belgium", "Harry Hane": "England",
        "Robert Levandowski": "Poland", "Ahmed Sared Zizo": "Egypt", "Eman Ashour": "Egypt",
        "Salum Al-Dawsari": "Saudi Arabia", "Laminr Yamal": "Spain"
      };

      const playerLeagues: Record<string, string> = {
        "Crystiano Ronaldo": "Saudi Professional League", "Mohamed Satah": "Premier League",
        "Erling Haoland": "Premier League", "Kylian Mbapbe": "La Liga", "Vinícius Junnor": "La Liga",
        "Lionil Messi": "MLS", "Jude Bellinghom": "La Liga", "Kevin De Breyne": "Saudi Professional League",
        "Harry Hane": "Bundesliga", "Robert Levandowski": "La Liga", "Laminr Yamal": "La Liga",
        "Ahmed Sared Zizo": "Egyptian Premier League", "Eman Ashour": "Egyptian Premier League",
        "Salum Al-Dawsari": "Saudi Professional League"
      };

      const iconNames = new Set(["Pelé","Diego Maradona","Johan Cruyff","Franz Beckenbauer","Alfredo Di Stéfano","Ferenc Puskás","Lev Yashin","Gerd Müller","Eusébio","George Best","Garrincha","Bobby Charlton","Franco Baresi","Zico","Ruud Gullit","Marco van Basten","Lothar Matthäus","Giuseppe Meazza","Bobby Moore","Carlos Alberto","Sócrates","Dino Zoff","Gaetano Scirea","Luis Suárez Miramontes","Paco Gento","Josef Bican","Juan Alberto Schiaffino","José Manuel Moreno","Elias Figueroa","Sándor Kocsis","Just Fontaine","Stanley Matthews","Nilton Santos","Didi","Gordon Banks","Denis Law","Raymond Kopa","Paolo Rossi","Nándor Hidegkuti","Duncan Edwards","John Charles","Jimmy Greaves","Giacinto Facchetti","Sandro Mazzola","Gigi Riva","Omar Sívori","Telmo Zarra","Dixie Dean","Tom Finney","Matthias Sindelar","Zizinho","Ademir Marques","Obdulio Varela","Adolfo Pedernera","Ángel Labruna","Amadeo Carrizo","Fritz Walter","Uwe Seeler","Sepp Maier","Paul Breitner","Johan Neeskens","Nils Liedholm","Gunnar Nordahl","Leonidas","Arthur Friedenreich","Gilmar","Vavá","József Bozsik","Ladislao Kubala","Alcides Ghiggia","José Nasazzi","Héctor Scarone","Guillermo Stábile","René Houseman","Vladimir Beara","Rob Rensenbrink","Faas Wilkes","Gunnar Gren","Teófilo Cubillas","Alberto Spencer","Gianluca Vialli","Billy Wright","Gyula Grosics","Andreas Brehme","Helmut Rahn","Kazimierz Deyna","Valeriy Voronin","Mario Zagallo","Siniša Mihajlović","Bellini","Danny Blanchflower","Ernst Happel","Antonio Rattín","Leopoldo Luque","Ladislao Mazurkiewicz","Karl-Heinz Schnellinger","Coen Moulijn","Kurt Hamrin","José Luis Brown","Andrés Escobar"]);

      const localPlayers = playersData.map((p, idx) => {
        const overall = p.baseRating;
        let rarity: Rarity = "Bronze";
        if (iconNames.has(p.name)) rarity = "Icon";
        else if (overall >= 90) rarity = "Master";
        else if (overall >= 80) rarity = "Elite";
        else if (overall >= 70) rarity = "Gold";
        else if (overall >= 60) rarity = "Silver";
        else rarity = "Bronze";
        let position = p.position || "ST";
        const pac = Math.min(overall + Math.floor(Math.random() * 5), 99);
        const sho = Math.min(overall + Math.floor(Math.random() * 7), 99);
        const pas = Math.min(overall + Math.floor(Math.random() * 5) - 3, 99);
        const dri = Math.min(overall + Math.floor(Math.random() * 6), 99);
        const def = overall > 85 ? overall - 15 : overall - 20; 
        const phy = Math.min(overall + Math.floor(Math.random() * 6) - 5, 99);

        return {
          id: `ply_${idx}`,
          name: p.name,
          image: playerImages[p.name] || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=random&color=fff&size=200`,
          position: position,
          league: playerLeagues[p.name] || "FC Pro",
          club: p.club,
          nation: (p as any).nation || playerNations[p.name] || "Any",
          stats: { pace: pac, shooting: sho, passing: pas, dribbling: dri, defending: Math.max(def, 30), physical: phy, overall },
          card: { rarity },
          levels: p.levels,
          market: {
            currentPrice: Math.floor(overall * overall * 1.5 + Math.random() * 1000),
            priceHistory: Array.from({length: 10}, () => Math.floor(overall * overall * 1.5)),
            isListed: true,
            change24h: +(Math.random() * 5 - 2.5).toFixed(1)
          }
        };
      });
      set({ players: localPlayers });
    }
  },
  startPolling: async () => {
    let currentInterval = 10000;
    
    const poll = async () => {
       try {
         const cfgRes = await fetch('/api/market-config');
         if (cfgRes.ok) {
            const data = await cfgRes.json();
            currentInterval = Math.max(1000, data.tickSeconds * 1000);
         }
       } catch (e) {
         // ignore
       }
       
       await get().fetchPlayers();
       setTimeout(poll, currentInterval);
    };
    
    poll();
  },
  fetchUserSquad: async () => {
    const currentUser = getAuth()?.currentUser;
    if (!currentUser) return;
    try {
      const snap = await getDocs(collection(getDb(), 'users', currentUser.uid, 'squad'));
      const portfolio = snap.docs.map((d: any) => ({
        docId: d.id,
        id: d.data().playerId, 
        level: d.data().level || 1,
        overall: d.data().overall,
        onAuction: d.data().onAuction || false,
        onTrade: d.data().onTrade || false,
        auctionId: d.data().auctionId || null
      }));

      const managersSnap = await getDocs(collection(getDb(), 'users', currentUser.uid, 'managers'));
      const managers = managersSnap.docs.map((d: any) => ({
        managerId: d.data().managerId
      }));

      const userDoc = await getDoc(doc(getDb(), 'users', currentUser.uid));
      const activeManager = userDoc.data()?.activeManager || null;
      
      const friendsSnap = await getDocs(collection(getDb(), 'users', currentUser.uid, 'friends'));
      const friends = friendsSnap.docs.map((d: any) => ({
        uid: d.id,
        username: d.data().username,
        email: d.data().email
      }));

      set(state => ({ user: { ...state.user, portfolio, managers, activeManager, friends } }));
    } catch (err) {
      console.error(err);
    }
  },
  setActiveManager: async (managerId: string) => {
    const currentUser = getAuth()?.currentUser;
    if (!currentUser) return;
    try {
      await updateDoc(doc(getDb(), 'users', currentUser.uid), {
        activeManager: managerId
      });
      set(state => ({ user: { ...state.user, activeManager: managerId } }));
      toast.success("Active manager updated!");
    } catch (e: any) {
      toast.error("Error setting active manager: " + e.message);
    }
  },
  updateProfile: async (data: { club?: string; bio?: string; nationality?: string; photoURL?: string }) => {
    const currentUser = getAuth()?.currentUser;
    if (!currentUser) return;
    try {
      await updateDoc(doc(getDb(), 'users', currentUser.uid), data);
      toast.success("Profile updated successfully!");
    } catch (e: any) {
      toast.error("Failed to update profile: " + e.message);
    }
  },
  buyManager: async (managerId: string) => {
    const currentUser = getAuth()?.currentUser;
    if (!currentUser) {
      toast.error("Must be logged in to buy");
      return;
    }
    const { user } = get();
    if (user.managers.some(m => m.managerId === managerId)) {
      toast.error("You already own this manager!");
      return;
    }

    try {
      // Check Firestore first
      const managerSnap = await getDoc(doc(getDb(), 'managers', managerId));
      let manager = managerSnap.exists() ? managerSnap.data() : null;

      if (!manager) {
        // Fallback
        const { managersData } = await import('./data/managers');
        manager = managersData.find(m => m.id === managerId);
      }
      
      if (!manager) return;

      const userRef = doc(getDb(), 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) return;
      
      const coins = userDoc.data().coins;
      if (coins < manager.price) {
        toast.error("Insufficient balance!");
        return;
      }

      await updateDoc(userRef, { coins: coins - manager.price });
      await setDoc(doc(getDb(), 'users', currentUser.uid, 'managers', managerId), {
        managerId: managerId,
        acquiredAt: new Date().toISOString()
      });

      toast.success("Manager purchased successfully!");
      get().fetchUserSquad();
    } catch (e: any) {
      toast.error("Error buying manager: " + e.message);
      console.error(e);
    }
  },
  searchUsers: async (queryStr: string) => {
    // Note: In real Firestore you'd use where('username', '>=', queryStr).
    // Our mock DB getDocs on 'users' will return all users, so we can filter manually.
    try {
       const userSnap = await getDocs(collection(getDb(), 'users'));
       const q = queryStr.toLowerCase();
       const filtered = userSnap.docs
         .map((d: any) => ({ uid: d.id, ...d.data() }))
         .filter((u: any) => {
           if (u.uid === getAuth()?.currentUser?.uid) return false;
           if (!q) return true;
           return u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
         });
       return filtered;
    } catch (e) {
       console.error("searchUsers err:", e);
       return [];
    }
  },
  addFriend: async (friendUid: string, friendUsername: string, friendEmail: string) => {
    const currentUser = getAuth()?.currentUser;
    if (!currentUser) return;
    try {
      await setDoc(doc(getDb(), 'users', currentUser.uid, 'friends', friendUid), {
        username: friendUsername,
        email: friendEmail,
        addedAt: new Date().toISOString()
      });
      // Try adding currentUser to friend's friends too
      await setDoc(doc(getDb(), 'users', friendUid, 'friends', currentUser.uid), {
        username: currentUser.username || currentUser.email?.split('@')[0],
        email: currentUser.email,
        addedAt: new Date().toISOString()
      });
      toast.success("Friend added successfully!");
      get().fetchUserSquad();
    } catch (e: any) {
      toast.error("Error adding friend: " + e.message);
    }
  },
  transferCoins: async (friendUid: string, amount: number) => {
    const currentUser = getAuth()?.currentUser;
    if (!currentUser) return;
    if (amount <= 0) { toast.error("Invalid amount"); return; }
    
    try {
      const myRef = doc(getDb(), 'users', currentUser.uid);
      const myDoc = await getDoc(myRef);
      const myCoins = myDoc.data()?.coins || 0;
      
      if (myCoins < amount) {
         toast.error("Insufficient coins");
         return;
      }

      await updateDoc(myRef, { coins: myCoins - amount });
      
      const friendRef = doc(getDb(), 'users', friendUid);
      // We can use increment op
      // Actually we'll read friend's coins and write it to be safe 
      // or use increment mock
      await updateDoc(friendRef, { coins: (globalThis as any).increment(amount) });
      
      // Record transaction
      const friendSnap = await getDoc(friendRef);
      const friendEmail = friendSnap.data()?.email || 'Unknown';

      const txRef = doc(collection(getDb(), 'transactions'));
      await setDoc(txRef, {
        type: 'transfer_coins',
        senderId: currentUser.uid,
        senderEmail: currentUser.email || 'Unknown',
        recipientId: friendUid,
        recipientEmail: friendEmail,
        amount: amount,
        participantIds: [currentUser.uid, friendUid],
        date: new Date().toISOString()
      });

      toast.success(`Transferred $${amount.toLocaleString()} successfully!`);
      get().fetchUserSquad(); // to refresh local balances or state if needed
    } catch (e: any) {
      toast.error("Transfer failed: " + e.message);
    }
  },
  transferPlayer: async (friendUid: string, playerDocId: string) => {
    const currentUser = getAuth()?.currentUser;
    if (!currentUser) return;
    
    try {
      const mySquadRef = doc(getDb(), 'users', currentUser.uid, 'squad', playerDocId);
      const squadDoc = await getDoc(mySquadRef);
      if (!squadDoc.exists()) {
        toast.error("Player card not found");
        return;
      }
      const data = squadDoc.data();
      
      if (data.onAuction) {
        toast.error("Cannot transfer a player currently on auction!");
        return;
      }

      // Add to friend
      await setDoc(doc(getDb(), 'users', friendUid, 'squad', playerDocId), {
         ...data,
         acquiredAt: new Date().toISOString() // refresh stamp
      });

      // Remove from me
      await deleteDoc(mySquadRef);

      // Record transaction
      const friendSnap = await getDoc(doc(getDb(), 'users', friendUid));
      const friendEmail = friendSnap.data()?.email || 'Unknown';

      const txRef = doc(collection(getDb(), 'transactions'));
      await setDoc(txRef, {
        type: 'transfer_player',
        senderId: currentUser.uid,
        senderEmail: currentUser.email || 'Unknown',
        recipientId: friendUid,
        recipientEmail: friendEmail,
        playerId: data.playerId,
        playerName: data.playerName,
        playerLevel: data.level,
        amount: 0,
        participantIds: [currentUser.uid, friendUid],
        date: new Date().toISOString()
      });

      toast.success(`Player transferred successfully!`);
      get().fetchUserSquad();
    } catch (e: any) {
      toast.error("Transfer failed: " + e.message);
    }
  },
  updatePrice: (id, newPrice) => set((state) => {
    const players = [...state.players];
    const idx = players.findIndex(p => p.id === id);
    if (idx !== -1) {
      players[idx] = { ...players[idx], market: { ...players[idx].market, currentPrice: newPrice } };
    }
    return { players };
  }),
  buyPlayer: async (id, level, promoCode, userPromoCode, userSubTier) => {
    console.log("buyPlayer called:", { id, level, promoCode, userSubTier });
    const currentUser = getAuth()?.currentUser;
    if (!currentUser) {
      toast.error("Must be logged in to buy");
      return;
    }
    const { players, user } = get();
    const player = players.find(p => p.id === id);
    if (!player) {
      console.error("Player not found:", id);
      return;
    }

    let appliedTier: string | null = userSubTier || null;
    let appliedPromoDoc: any = null;

    if (promoCode) {
        try {
            const promoRef = doc(getDb(), 'promo_codes', promoCode.toUpperCase());
            const promoSnap = await getDoc(promoRef);
            if (promoSnap.exists()) {
                appliedPromoDoc = promoSnap.data();
                appliedTier = appliedPromoDoc.tier; // Override with the promo code's tier
                toast.success(`Promo code applied: ${appliedPromoDoc.tier.replace('-pkg', '').toUpperCase()} Tier!`);
            } else {
                toast.error("Invalid or expired Promo Code!");
                return;
            }
        } catch (err: any) {
             toast.error("Error verifying promo code: " + err.message);
             return;
        }
    }
    
    if (player.subscriberOnly) {
       if (!appliedPromoDoc) {
           toast.error("This player is locked. Please enter a valid Promo Code to unlock!");
           return;
       }
       
       const isAllowedByCodeList = appliedPromoDoc.unlockedPlayers && appliedPromoDoc.unlockedPlayers.includes(player.id);
       const isAllowedByLockParams = player.allowedTiers && player.allowedTiers.includes(appliedPromoDoc.tier);
       
       if (!isAllowedByCodeList && !isAllowedByLockParams) {
           toast.error("This Promo Code does not grant access to this locked player.");
           return;
       }
    }

    const levelMultipliers: Record<string, number> = {
        base: 1.0,
        rare: 1.5,
        special: 2.0,
        ultimate: 3.5
    };
    
    const multiplier = levelMultipliers[level] || 1.0;
    let finalPrice = Math.floor(player.market.currentPrice * multiplier);
    
    if (player.subscriberOnly && player.subscriberDiscount && appliedPromoDoc) {
        finalPrice = Math.floor(finalPrice * (1 - (player.subscriberDiscount / 100)));
    }

    // Apply general discount based on the active tier (from code or from profile fallback)
    if (!player.subscriberOnly && appliedTier) {
        let generalDiscountPercent = 0;
        if (appliedTier === 'elite-pkg') generalDiscountPercent = 25;
        else if (appliedTier === 'pro-pkg') generalDiscountPercent = 15;
        else if (appliedTier === 'starter-pkg') generalDiscountPercent = 5;
        
        if (generalDiscountPercent > 0) {
           finalPrice = Math.floor(finalPrice * (1 - (generalDiscountPercent / 100)));
        }
    }

    const levelMap: Record<string, number> = { base: 1, rare: 2, special: 3, ultimate: 4 };
    const numericLevel = levelMap[level] || 1;

    if (user.portfolio.some(p => p.id === id && p.level === numericLevel)) {
      toast.error("You already own this player card variant!");
      return;
    }

    try {
      const userRef = doc(getDb(), 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        console.error("User doc not found!");
        return;
      }
      const coins = userDoc.data().coins;
      
      if (coins < finalPrice) {
        toast.error("Insufficient balance!");
        return;
      }

      // Update coins
      await updateDoc(userRef, { coins: coins - finalPrice });
      
      // Add to squad
      await setDoc(doc(getDb(), 'users', currentUser.uid, 'squad', id + '_' + numericLevel), {
        playerId: id,
        playerName: player.name,
        acquiredAt: new Date().toISOString(),
        level: numericLevel,
        overall: player.stats.overall + (numericLevel - 1) // Simple calculation to match upgradePlayer
      });

      // Record transaction
      const txRef = doc(collection(getDb(), 'transactions'));
      await setDoc(txRef, {
        type: 'player_buy',
        senderId: currentUser.uid,
        senderEmail: currentUser.email || 'Unknown',
        recipientId: 'system',
        recipientEmail: 'System Market',
        amount: finalPrice,
        playerId: id,
        playerName: player.name,
        level: numericLevel,
        participantIds: [currentUser.uid],
        date: new Date().toISOString()
      });

      toast.success("Player purchased successfully!");
      // Call fetchUserSquad to refresh
      get().fetchUserSquad();
      console.log("Player purchased successfully");

    } catch (e: any) {
      toast.error("Error buying player: " + e.message);
      console.error("buyPlayer error:", e);
    }
  },
  buyPack: async (packId) => {
    const currentUser = getAuth()?.currentUser;
    if (!currentUser) throw new Error("Not logged in");
    
    // Get pack and player info
    const packSnap = await getDoc(doc(getDb(), 'packs', packId));
    if (!packSnap.exists()) throw new Error("Pack not found");
    const packData = packSnap.data();
    
    const { players } = get();
    // Get user balance
    const userRef = doc(getDb(), 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    const coins = userDoc.data()?.coins || 0;
    
    if (coins < packData.price) throw new Error("Insufficient funds");
    
    // Update coins
    await updateDoc(userRef, { coins: coins - packData.price });
    
    // Assign players
    let packPlayerIds = packData.playerIds;
    if (!packPlayerIds || !Array.isArray(packPlayerIds) || packPlayerIds.length === 0) {
      // Pick 3 random players from loaded players database as fallback
      const shuffled = [...players].sort(() => 0.5 - Math.random());
      packPlayerIds = shuffled.slice(0, 3).map(p => p.id);
    }
    const wonPlayers = packPlayerIds.map((id:string) => players.find(p => p.id === id)).filter(Boolean);
    
    for (const player of wonPlayers) {
        await setDoc(doc(getDb(), 'users', currentUser.uid, 'squad', player!.id + '_1'), {
           playerId: player!.id,
           playerName: player!.name,
           acquiredAt: new Date().toISOString(),
           level: 1,
           overall: player!.stats?.overall || 80
        });
    }

    // Record transaction
    const txRef = doc(collection(getDb(), 'transactions'));
    await setDoc(txRef, {
      type: 'pack_buy',
      senderId: currentUser.uid,
      senderEmail: currentUser.email || 'Unknown',
      recipientId: 'system',
      recipientEmail: `Pack: ${packData.name}`,
      amount: packData.price,
      playerId: wonPlayers.map((p: any) => p?.id).filter(Boolean).join(','),
      playerName: wonPlayers.map((p: any) => p?.name).filter(Boolean).join(', '),
      participantIds: [currentUser.uid],
      date: new Date().toISOString()
    });
    
    get().fetchUserSquad();
    return wonPlayers as PlayerCard[];
  },
  sellPlayer: async (docId) => {
    const currentUser = getAuth()?.currentUser;
    if (!currentUser) {
      toast.error("Must be logged in to sell");
      return;
    }
    const { players, user } = get();
    
    const squadPlayer = user.portfolio.find(p => p.docId === docId);
    if (!squadPlayer) {
      toast.error("You don't own this player!");
      return;
    }

    const player = players.find(p => p.id === squadPlayer.id);
    if (!player) {
      toast.error("Player data not found!");
      return;
    }

    try {
      const userRef = doc(getDb(), 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) return;
      const coins = userDoc.data().coins;

      // Update coins
      await updateDoc(userRef, { coins: coins + player.market.currentPrice });
      
      // Remove from squad
      await deleteDoc(doc(getDb(), 'users', currentUser.uid, 'squad', docId));

      // Record transaction
      const txRef = doc(collection(getDb(), 'transactions'));
      await setDoc(txRef, {
        type: 'player_sell',
        senderId: 'system',
        senderEmail: 'System Market',
        recipientId: currentUser.uid,
        recipientEmail: currentUser.email || 'Unknown',
        amount: player.market.currentPrice,
        playerId: player.id,
        playerName: player.name,
        playerLevel: squadPlayer.level,
        participantIds: [currentUser.uid],
        date: new Date().toISOString()
      });

      toast.success("Player sold successfully!");
      // Call fetchUserSquad to refresh
      get().fetchUserSquad();
    } catch (e: any) {
      toast.error("Error selling player: " + e.message);
      console.error(e);
    }
  },
  reclaimPlayer: async (docId) => {
    const currentUser = getAuth()?.currentUser;
    if (!currentUser) return;
    const { user } = get();
    const squadPlayer = user.portfolio.find(p => p.docId === docId);
    if (!squadPlayer) return;
    try {
      if (squadPlayer.auctionId) {
        await updateDoc(doc(getDb(), 'auctions', squadPlayer.auctionId), { status: 'cancelled' }).catch(() => {});
      }
      await updateDoc(doc(getDb(), 'users', currentUser.uid, 'squad', docId), {
        onAuction: false,
        onTrade: false,
        auctionId: null
      });
      toast.success("Player successfully reclaimed from Deals Chamber!");
      get().fetchUserSquad();
    } catch (e: any) {
      toast.error("Error reclaiming player: " + e.message);
    }
  },
  upgradePlayer: async (docId) => {
    const currentUser = getAuth()?.currentUser;
    if (!currentUser) return;
    const { user, players } = get();
    const squadPlayer = user.portfolio.find(p => p.docId === docId);
    if (!squadPlayer) return;

    const basePlayer = players.find(p => p.id === squadPlayer.id);
    if (!basePlayer) return;

    const upgradeCost = squadPlayer.level * 500; // Formula for cost

    try {
      const userRef = doc(getDb(), 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) return;
      
      const coins = userDoc.data().coins;
      if (coins < upgradeCost) {
        toast.error("Insufficient coins to upgrade!");
        return;
      }

      await updateDoc(userRef, { coins: coins - upgradeCost });
      
      const squadRef = doc(getDb(), 'users', currentUser.uid, 'squad', docId);
      
      // Update level and overall
      const newLevel = squadPlayer.level + 1;
      const newOverall = basePlayer.stats.overall + squadPlayer.level; // Simple calculation: +1 overall per level

      await updateDoc(squadRef, {
        level: newLevel,
        overall: newOverall
      });

      // Record transaction
      const txRef = doc(collection(getDb(), 'transactions'));
      await setDoc(txRef, {
        type: 'player_upgrade',
        senderId: currentUser.uid,
        senderEmail: currentUser.email || 'Unknown',
        recipientId: 'system',
        recipientEmail: 'Club Facilities (Upgrade)',
        amount: upgradeCost,
        playerId: squadPlayer.id,
        playerName: basePlayer.name,
        participantIds: [currentUser.uid],
        date: new Date().toISOString()
      });

      toast.success(`Player upgraded to level ${newLevel}, Overall ${newOverall}!`);
      get().fetchUserSquad();
    } catch (e: any) {
      toast.error("Error upgrading player: " + e.message);
    }
  },
  createTrade: async (cardDocId, durationMinutes) => {
    const currentUser = getAuth()?.currentUser;
    if (!currentUser) return false;
    const { user, players } = get();
    const squadPlayer = user.portfolio.find(p => p.docId === cardDocId);
    if (!squadPlayer) {
      import('sonner').then(m => m.toast.error("You don't own this player!"));
      return false;
    }
    if (squadPlayer.onAuction || squadPlayer.onTrade) {
      import('sonner').then(m => m.toast.error("This player is already listed on the market!"));
      return false;
    }
    const player = players.find(p => p.id === squadPlayer.id);
    if (!player) return false;
    try {
      const expiresAt = new Date(Date.now() + durationMinutes * 60000).toISOString();
      const auctionsRef = collection(getDb(), 'auctions');
      const newAuctionRef = doc(auctionsRef);
      await setDoc(newAuctionRef, {
        type: 'trade',
        player_id: player.id,
        player_name: player.name,
        level: squadPlayer.level,
        owner_id: currentUser.uid,
        owner_email: currentUser.email || 'Unknown',
        status: 'active',
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      });
      await updateDoc(doc(getDb(), 'users', currentUser.uid, 'squad', cardDocId), {
        onTrade: true,
        auctionId: newAuctionRef.id
      });
      import('sonner').then(m => m.toast.success("Trade block started successfully!"));
      get().fetchUserSquad();
      return true;
    } catch (e: any) {
      import('sonner').then(m => m.toast.error("Error starting trade: " + e.message));
      return false;
    }
  },
  createAuction: async (cardDocId, startPrice, buyNowPrice, durationMinutes) => {
    console.log("createAuction called with", { docId: cardDocId, startPrice, buyNowPrice, durationMinutes });
    const currentUser = getAuth()?.currentUser;
    if (!currentUser) return false;
    
    const { user, players } = get();
    const squadPlayer = user.portfolio.find(p => p.docId === cardDocId);
    if (!squadPlayer) {
      toast.error("You don't own this player!");
      return false;
    }
    
    if (squadPlayer.onAuction || squadPlayer.onTrade) {
      toast.error("This player is already listed on an auction!");
      return false;
    }

    const player = players.find(p => p.id === squadPlayer.id);
    if (!player) return false;

    try {
      const expiresAt = new Date(Date.now() + durationMinutes * 60000).toISOString();
      const auctionsRef = collection(getDb(), 'auctions');
      const newAuctionRef = doc(auctionsRef);
      
      await setDoc(newAuctionRef, {
        player_id: player.id,
        player_name: player.name,
        level: squadPlayer.level,
        owner_id: currentUser.uid,
        owner_email: currentUser.email || 'Unknown',
        start_price: startPrice,
        buy_now_price: buyNowPrice || null,
        status: 'active',
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      });

      // Update local card status in Squad
      await updateDoc(doc(getDb(), 'users', currentUser.uid, 'squad', cardDocId), {
        onAuction: true,
        auctionId: newAuctionRef.id
      });

      toast.success("Auction started successfully!");
      get().fetchUserSquad();
      return true;
    } catch (e: any) {
      toast.error("Error starting auction: " + e.message);
      return false;
    }
  }
}));

// Connect socket to the Zustand store
socket.on("marketUpdate", (data: any) => {
  if (data.playerId && data.newPrice && useMarketStore.getState().user.notificationPreferences.priceChanges) {
    useMarketStore.getState().updatePrice(data.playerId, data.newPrice);
    if (data.change > 0) {
      toast.success(`📈 Market Update: Player went up to $${data.newPrice.toLocaleString()}!`, {
        duration: 3000
      });
    } else {
      toast.error(`📉 Market Crash: Player dropped to $${data.newPrice.toLocaleString()}!`, {
        duration: 3000
      });
    }
  }
});
