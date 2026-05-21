import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0 },
  role: { type: String, default: "user" },
  portfolio: [{ type: mongoose.Schema.Types.ObjectId, ref: "PlayerCard" }]
}, { timestamps: true });

const playerSchema = new mongoose.Schema({
  apiFootballId: { type: Number, unique: true },
  name: { type: String, required: true },
  club: { type: String },
  league: { type: String },
  position: { type: String },
  rating: { type: Number },
  nationality: { type: String },
  age: { type: Number },
  teamLogo: { type: String },
  playerImage: { type: String },
  marketPrice: { type: Number, default: 1000 },
  hypeScore: { type: Number, default: 0 },
  demandScore: { type: Number, default: 0 },
}, { timestamps: true });

const playerCardSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player", required: true },
  level: { type: Number, default: 1 },
  acquiredAt: { type: Date, default: Date.now },
  onAuction: { type: Boolean, default: false }
}, { timestamps: true });

const matchSchema = new mongoose.Schema({
  fixtureId: { type: Number, unique: true },
  status: String,
  homeTeam: String,
  awayTeam: String,
  homeScore: Number,
  awayScore: Number,
  matchTime: Number,
}, { timestamps: true });

const marketHistorySchema = new mongoose.Schema({
  playerId: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  price: Number,
  timestamp: { type: Date, default: Date.now }
});

const auctionSchema = new mongoose.Schema({
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: "PlayerCard" },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  startPrice: Number,
  currentBid: Number,
  highestBidder: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  buyNowPrice: Number,
  endTime: Date,
  active: { type: Boolean, default: true }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
export const Player = mongoose.model("Player", playerSchema);
export const PlayerCard = mongoose.model("PlayerCard", playerCardSchema);
export const Match = mongoose.model("Match", matchSchema);
export const MarketHistory = mongoose.model("MarketHistory", marketHistorySchema);
export const Auction = mongoose.model("Auction", auctionSchema);
