import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { playersData } from "./src/data/playersData";

// In-memory Database
const playerImages: Record<string, string> = {
  "Crystiano Ronaldo": "https://img.pngimg.com/uploads/ronaldo/ronaldo_PNG18.png", // High-fidelity, iconic raw transparent Ronaldo celebration png
  "Mohamed Satah": "https://www.pngmart.com/files/24/Mohamed-Salah-PNG-Transparent-Image.png",
  "Erling Haoland": "https://www.pngmart.com/files/24/Erling-Haaland-PNG-Free-Download.png",
  "Kylian Mbapbe": "https://www.pngmart.com/files/15/Kylian-Mbappe-PNG-Clipart.png",
  "Lionil Messi": "https://www.pngmart.com/files/22/Lionel-Messi-PNG-Isolated-Pic.png"
};

const playerNations: Record<string, string> = {
  "Crystiano Ronaldo": "Portugal",
  "Mohamed Satah": "Egypt",
  "Erling Haoland": "Norway",
  "Kylian Mbapbe": "France",
  "Vinícius Junnor": "Brazil",
  "Lionil Messi": "Argentina",
  "Jude Bellinghom": "England",
  "Kevin De Breyne": "Belgium",
  "Harry Hane": "England",
  "Robert Levandowski": "Poland",
  "Ahmed Sared Zizo": "Egypt",
  "Eman Ashour": "Egypt",
  "Salum Al-Dawsari": "Saudi Arabia",
  "Laminr Yamal": "Spain"
};

const playerLeagues: Record<string, string> = {
  "Crystiano Ronaldo": "Saudi Professional League",
  "Mohamed Satah": "Premier League",
  "Erling Haoland": "Premier League",
  "Kylian Mbapbe": "La Liga",
  "Vinícius Junnor": "La Liga",
  "Lionil Messi": "MLS",
  "Jude Bellinghom": "La Liga",
  "Kevin De Breyne": "Saudi Professional League",
  "Harry Hane": "Bundesliga",
  "Robert Levandowski": "La Liga",
  "Laminr Yamal": "La Liga",
  "Ahmed Sared Zizo": "Egyptian Premier League",
  "Eman Ashour": "Egyptian Premier League",
  "Salum Al-Dawsari": "Saudi Professional League"
};

const iconNames = new Set(["Pelé","Diego Maradona","Johan Cruyff","Franz Beckenbauer","Alfredo Di Stéfano","Ferenc Puskás","Lev Yashin","Gerd Müller","Eusébio","George Best","Garrincha","Bobby Charlton","Franco Baresi","Zico","Ruud Gullit","Marco van Basten","Lothar Matthäus","Giuseppe Meazza","Bobby Moore","Carlos Alberto","Sócrates","Dino Zoff","Gaetano Scirea","Luis Suárez Miramontes","Paco Gento","Josef Bican","Juan Alberto Schiaffino","José Manuel Moreno","Elias Figueroa","Sándor Kocsis","Just Fontaine","Stanley Matthews","Nilton Santos","Didi","Gordon Banks","Denis Law","Raymond Kopa","Paolo Rossi","Nándor Hidegkuti","Duncan Edwards","John Charles","Jimmy Greaves","Giacinto Facchetti","Sandro Mazzola","Gigi Riva","Omar Sívori","Telmo Zarra","Dixie Dean","Tom Finney","Matthias Sindelar","Zizinho","Ademir Marques","Obdulio Varela","Adolfo Pedernera","Ángel Labruna","Amadeo Carrizo","Fritz Walter","Uwe Seeler","Sepp Maier","Paul Breitner","Johan Neeskens","Nils Liedholm","Gunnar Nordahl","Leonidas","Arthur Friedenreich","Gilmar","Vavá","József Bozsik","Ladislao Kubala","Alcides Ghiggia","José Nasazzi","Héctor Scarone","Guillermo Stábile","René Houseman","Vladimir Beara","Rob Rensenbrink","Faas Wilkes","Gunnar Gren","Teófilo Cubillas","Alberto Spencer","Gianluca Vialli","Billy Wright","Gyula Grosics","Andreas Brehme","Helmut Rahn","Kazimierz Deyna","Valeriy Voronin","Mario Zagallo","Siniša Mihajlović","Bellini","Danny Blanchflower","Ernst Happel","Antonio Rattín","Leopoldo Luque","Ladislao Mazurkiewicz","Karl-Heinz Schnellinger","Coen Moulijn","Kurt Hamrin","José Luis Brown","Andrés Escobar"]);

let players = playersData.map((p, idx) => {
  const overall = p.baseRating;
  let rarity = "Bronze";
  if (iconNames.has(p.name)) rarity = "Icon";
  else if (overall >= 90) rarity = "Master";
  else if (overall >= 80) rarity = "Elite";
  else if (overall >= 70) rarity = "Gold";
  else if (overall >= 60) rarity = "Silver";
  
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
    nation: p.nation || playerNations[p.name] || "Any",
    stats: {
      pace: pac,
      shooting: sho,
      passing: pas,
      dribbling: dri,
      defending: Math.max(def, 30),
      physical: phy,
      overall: overall
    },
    card: { rarity: rarity },
    levels: p.levels,
    marketPattern: '1' as string | undefined, // Added to fix TS
    customPattern: undefined as { minTick: number; maxTick: number } | undefined,
    subscriberOnly: false as boolean,
    subscriberDiscount: 0 as number,
    market: {
      basePrice: Math.floor(overall * overall * 1.5),
      currentPrice: Math.floor(overall * overall * 1.5 + Math.random() * 1000),
      priceHistory: Array.from({length: 10}, () => Math.floor(overall * overall * 1.5)),
      isListed: true,
      change24h: +(Math.random() * 5 - 2.5).toFixed(1)
    }
  };
});

let user = {
  balance: 25430,
  portfolio: [players[0].id, players[1].id, players[2].id]
};

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import { setSocketIoInstance, startMarketEngine } from "./server/services/marketEngine";
import dotenv from "dotenv";

dotenv.config();

let clubsData: Record<string, { name: string, ovr: number }> = {};
// Initialize from existing players
players.forEach(p => {
  if (p.club && !clubsData[p.club]) {
    clubsData[p.club] = { name: p.club, ovr: 80 }; // Default OVR is 80
  }
});

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: { origin: "*" }
  });
  
  setSocketIoInstance(io);

  const PORT = 3000;

  app.use(express.json());
  
  // Try connecting to MongoDB if URI exists
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Connected to MongoDB via Mongoose.");
      // Start market engine to fetch from API-football and populate DB
      startMarketEngine();
    } catch (e) {
      console.error("MongoDB connection failed:", e);
    }
  } else {
    console.warn("MONGODB_URI not found. Running in memory mode.");
  }

  // Socket setup
  io.on("connection", (socket) => {
    console.log("New client connected via socket.io:", socket.id);
    socket.emit("notification", { message: "Connected to Footex Live Servers!" });
  });

  // Clubs API
  app.get("/api/clubs", (req, res) => {
    res.json(Object.values(clubsData));
  });

  app.post("/api/clubs/:name/ovr", (req, res) => {
    const club = clubsData[req.params.name];
    if (!club) return res.status(404).json({ error: "Club not found" });
    const { amount } = req.body;
    club.ovr += amount;
    res.json({ success: true, club });
  });

  // Return all players

  app.get("/api/players", (req, res) => {
    const adjustedPlayers = players.map(p => {
      const bR = (p as any).baseRating || p.stats?.overall || 80;
      const fallbackRarity = iconNames.has(p.name) ? "Icon" : (bR >= 90 ? "Master" : bR >= 82 ? "Elite" : bR >= 75 ? "Gold" : bR >= 65 ? "Silver" : "Bronze");
      const pWithCard = p.card ? p : { ...p, card: { rarity: fallbackRarity } };
      const club = pWithCard.club ? clubsData[pWithCard.club] : null;
      if (club) {
        const diff = club.ovr - 80; // 80 is the base club OVR
        if (diff !== 0) {
          return {
            ...pWithCard,
            stats: {
              ...pWithCard.stats,
              overall: (pWithCard.stats.overall || 80) + diff,
              pace: Math.min(99, (pWithCard.stats.pace || 50) + diff),
              shooting: Math.min(99, (pWithCard.stats.shooting || 50) + diff),
              passing: Math.min(99, (pWithCard.stats.passing || 50) + diff),
              dribbling: Math.min(99, (pWithCard.stats.dribbling || 50) + diff),
              defending: Math.max(1, Math.min(99, (pWithCard.stats.defending || 30) + diff)),
              physical: Math.min(99, (pWithCard.stats.physical || 50) + diff)
            }
          }
        }
      }
      return pWithCard;
    });
    res.json(adjustedPlayers);
  });

  app.delete("/api/players/:id", (req, res) => {
    players = players.filter(p => p.id !== req.params.id);
    res.json({ success: true });
  });

  app.put("/api/players/:id/price", (req, res) => {
    const player = players.find(p => p.id === req.params.id);
    if (!player) return res.status(404).json({ error: "Not found" });
    player.market.currentPrice = req.body.price;
    player.market.basePrice = req.body.price; // Update base price so pattern adjusts from here
    res.json({ success: true, player });
  });

  const MARKET_PATTERNS: Record<string, { name: string, minTick: number, maxTick: number, label: string }> = {
    "1": { name: "VOLATILE 🎢💥", minTick: -15, maxTick: 15, label: "-15% to +15% per tick" },
    "2": { name: "STEADY BULL 📈🐂", minTick: -2, maxTick: 5, label: "-2% to +5% per tick" },
    "3": { name: "SLOW BLEED 🩸🐻", minTick: -5, maxTick: 2, label: "-5% to +2% per tick" },
    "4": { name: "FLATLINER 😐", minTick: -1, maxTick: 1, label: "-1% to +1% per tick" },
    "5": { name: "THE MOONSHOT 🌕🚀", minTick: 0, maxTick: 20, label: "0% to +20% per tick" },
    "6": { name: "MARKET CRASH 📉🔥", minTick: -20, maxTick: 0, label: "-20% to 0% per tick" },
    "7": { name: "BALANCED (Up & Down) ⚖️", minTick: -5, maxTick: 5, label: "-5% to +5% per tick" },
    "8": { name: "WILD SWINGS 🌪️", minTick: -30, maxTick: 30, label: "-30% to +30% per tick" }
  };

  app.get("/api/patterns", (req, res) => {
      res.json(MARKET_PATTERNS);
  });

  app.put("/api/players/:id/pattern", (req, res) => {
    if (req.params.id === "ALL") {
       players.forEach(p => {
          p.marketPattern = req.body.patternId;
          if (req.body.patternId === 'custom') {
              p.customPattern = { minTick: req.body.minTick, maxTick: req.body.maxTick };
          }
          if (req.body.patternId) {
             p.market.basePrice = p.market.currentPrice;
          }
       });
       return res.json({ success: true });
    }

    const player = players.find(p => p.id === req.params.id);
    if (!player) return res.status(404).json({ error: "Not found" });
    player.marketPattern = req.body.patternId;
    if (req.body.patternId === 'custom') {
        player.customPattern = { minTick: req.body.minTick, maxTick: req.body.maxTick };
    }
    if (req.body.patternId) {
       player.market.basePrice = player.market.currentPrice;
    }
    res.json({ success: true, player });
  });

  app.put("/api/players/:id/subscriber-settings", (req, res) => {
    const player = players.find(p => p.id === req.params.id);
    if (!player) return res.status(404).json({ error: "Not found" });
    
    if (req.body.subscriberOnly !== undefined) {
      player.subscriberOnly = req.body.subscriberOnly;
    }
    if (req.body.subscriberDiscount !== undefined) {
      player.subscriberDiscount = req.body.subscriberDiscount;
    }
    if (req.body.allowedTiers !== undefined) {
      (player as any).allowedTiers = req.body.allowedTiers;
    }
    
    res.json({ success: true, player });
  });

  let marketTickMs = 10000;
  let marketIntervalId: NodeJS.Timeout | null = null;

  app.get("/api/market-config", (req, res) => {
      res.json({ tickSeconds: marketTickMs / 1000 });
  });

  app.put("/api/market-config", (req, res) => {
      if (req.body.tickSeconds) {
          marketTickMs = Math.max(1, req.body.tickSeconds) * 1000;
          startMarketInterval();
      }
      res.json({ success: true, tickSeconds: marketTickMs / 1000 });
  });

  function startMarketInterval() {
    if (marketIntervalId) clearInterval(marketIntervalId);
    marketIntervalId = setInterval(() => {
      players.forEach(p => {
        let pattern = null;
      if (p.marketPattern === 'custom' && p.customPattern) {
          pattern = p.customPattern;
      } else if (p.marketPattern && MARKET_PATTERNS[p.marketPattern]) {
          pattern = MARKET_PATTERNS[p.marketPattern];
      }

      if (pattern) {
          const oldPrice = p.market.currentPrice;
          
          // Random float between minTick and maxTick
          const randomPercent = pattern.minTick + Math.random() * (pattern.maxTick - pattern.minTick);
          
          // Apply percentage change
          const newPrice = Math.max(1, Math.floor(oldPrice * (1 + randomPercent / 100)));
          
          p.market.currentPrice = newPrice;
          p.market.priceHistory.push(newPrice);
          if (p.market.priceHistory.length > 20) p.market.priceHistory.shift();
          
          if (oldPrice > 0) {
              p.market.change24h = +(((newPrice - oldPrice) / oldPrice) * 100).toFixed(1);
          }
      }
    });
  }, marketTickMs);
  }
  startMarketInterval();

  app.post("/api/players/bulk-price-update", (req, res) => {
    const { percentage } = req.body; // e.g., 5 for +5%, -10 for -10%
    players = players.map(p => ({
      ...p,
      market: {
        ...p.market,
        currentPrice: Math.floor(p.market.currentPrice * (1 + percentage / 100))
      }
    }));
    res.json({ success: true, players });
  });

  app.post("/api/players/reset-prices", (req, res) => {
    // Reset prices to base value based on rating (similar to initialization logic)
    players = players.map(p => ({
      ...p,
      market: {
        ...p.market,
        currentPrice: Math.floor(p.stats.overall * p.stats.overall * 1.5 + Math.random() * 1000)
      }
    }));
    res.json({ success: true, players });
  });

  const penaltyBox: Record<string, any> = {};

  app.get("/api/penalty", (req, res) => {
      res.json(Object.values(penaltyBox));
  });

  app.post("/api/penalty", (req, res) => {
      const p = req.body;
      penaltyBox[p.playerId] = p;
      res.json({ success: true });
  });

  app.post("/api/players", (req, res) => {
    const newPlayer = req.body;
    players.push(newPlayer);
    if (newPlayer.club && !clubsData[newPlayer.club]) {
      clubsData[newPlayer.club] = { name: newPlayer.club, ovr: 80 };
    }
    res.json({ success: true, player: newPlayer });
  });

  // Return user state
  app.get("/api/user", (req, res) => {
    res.json(user);
  });

  // Buy a player
  app.post("/api/market/buy", (req, res) => {
    const { playerId } = req.body;
    const player = players.find(p => p.id === playerId);
    
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }
    if (user.balance < player.market.currentPrice) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    if (user.portfolio.includes(playerId)) {
      return res.status(400).json({ error: "Player already in portfolio" });
    }

    user.balance -= player.market.currentPrice;
    user.portfolio.push(playerId);
    
    // Simulate market price increase upon demand
    player.market.currentPrice += Math.floor(player.market.currentPrice * 0.05);

    res.json({ user, player });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
