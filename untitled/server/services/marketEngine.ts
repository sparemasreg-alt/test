import cron from "node-cron";
import { footballApiService } from "./footballApiService";
import { Player, MarketHistory, Match } from "../models";
import { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer;

export const setSocketIoInstance = (socketIo: SocketIOServer) => {
    io = socketIo;
};

// Update player prices every few minutes
export const startMarketEngine = () => {
    console.log("Market Engine Started.");

    // Run every 5 minutes
    cron.schedule("*/5 * * * *", async () => {
        console.log("Running Market Engine Updates...");
        
        try {
            const liveMatches = await footballApiService.getLiveMatches();
            
            // Loop through live matches and fetch player performances
            for (const match of liveMatches) {
                const fixtureId = match.fixture.id;
                
                // Save/Update match status in DB
                await Match.findOneAndUpdate(
                    { fixtureId },
                    {
                        status: match.fixture.status.short,
                        homeTeam: match.teams.home.name,
                        awayTeam: match.teams.away.name,
                        homeScore: match.goals.home,
                        awayScore: match.goals.away,
                        matchTime: match.fixture.status.elapsed
                    },
                    { upsert: true, new: true }
                );

                const teamPerformances = await footballApiService.getPlayerRatings(fixtureId);
                
                for (const team of teamPerformances) {
                    for (const playerItem of team.players) {
                        const playerRating = parseFloat(playerItem.statistics[0]?.games?.rating || "6.0");
                        const goals = playerItem.statistics[0]?.goals?.total || 0;
                        const redCards = playerItem.statistics[0]?.cards?.red || 0;
                        
                        const dbPlayer = await Player.findOne({ apiFootballId: playerItem.player.id });
                        if (dbPlayer) {
                            let oldPrice = dbPlayer.marketPrice || 1000;
                            let newPrice = oldPrice;

                            // Market logic
                            if (playerRating >= 8.0) newPrice += Math.floor(oldPrice * 0.05); // 5% increase
                            if (goals > 0) newPrice += 200 * goals; // Fixed spike for goals
                            if (redCards > 0) newPrice -= Math.floor(oldPrice * 0.10); // 10% crash for red card
                            
                            // Ensure it doesn't drop below 100
                            newPrice = Math.max(100, newPrice);

                            if (newPrice !== oldPrice) {
                                dbPlayer.marketPrice = newPrice;
                                await dbPlayer.save();

                                await MarketHistory.create({
                                    playerId: dbPlayer._id,
                                    price: newPrice,
                                    timestamp: new Date()
                                });

                                // Broadcast market update and/or live goals via WebSocket
                                if (io) {
                                    io.emit("marketUpdate", {
                                        playerId: dbPlayer._id,
                                        newPrice: newPrice,
                                        change: newPrice - oldPrice
                                    });
                                    if (goals > 0) {
                                        io.emit("liveGoal", {
                                            message: `⚽ ${dbPlayer.name} scored! +${newPrice - oldPrice} market spike!`,
                                            playerId: dbPlayer._id,
                                            playerName: dbPlayer.name
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Market Engine Error:", error);
        }
    });
};
