const fs = require('fs');
let store = fs.readFileSync('src/store.ts', 'utf8');

// 1. Add createTrade signature
store = store.replace(
  /createAuction: \(docId: string, startPrice: number, buyNowPrice: number \| null, durationMinutes: number\) => Promise<boolean>;/,
  "createAuction: (docId: string, startPrice: number, buyNowPrice: number | null, durationMinutes: number) => Promise<boolean>;\n  createTrade: (docId: string, durationMinutes: number) => Promise<boolean>;"
);

// 2. Add createTrade implementation
store = store.replace(
  /createAuction: async \(cardDocId, startPrice, buyNowPrice, durationMinutes\) => \{/,
  `createTrade: async (cardDocId, durationMinutes) => {
    const currentUser = (globalThis as any).auth?.currentUser;
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
      const db = (globalThis as any).db;
      const collection = (globalThis as any).collection;
      const doc = (globalThis as any).doc;
      const setDoc = (globalThis as any).setDoc;
      const updateDoc = (globalThis as any).updateDoc;

      const auctionsRef = collection(db, 'auctions');
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
      await updateDoc(doc(db, 'users', currentUser.uid, 'squad', cardDocId), {
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
  createAuction: async (cardDocId, startPrice, buyNowPrice, durationMinutes) => {`
);

// 3. Update SquadCard type
store = store.replace(
  /onAuction\?: boolean;\n  auctionId\?: string;/,
  "onAuction?: boolean;\n  auctionId?: string;\n  onTrade?: boolean;"
);

store = store.replace(
  /if \(squadPlayer\.onAuction\) \{/,
  "if (squadPlayer.onAuction || squadPlayer.onTrade) {"
);

fs.writeFileSync('src/store.ts', store);
console.log('done modifying store');
