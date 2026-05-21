import mongoose from "mongoose";
import dotenv from "dotenv";
import { footballApiService } from "./services/footballApiService";
import { Player } from "./models";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined.");
    process.exit(1);
}

const TOP_TEAMS = [33, 34, 40, 42, 47, 50, 49, 529, 541, 157, 523]; // Real Madrid, Man Utd, Liverpool etc (example IDs)

export const seedPlayers = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB. Starting player seed...");

        let totalAdded = 0;

        for (const teamId of TOP_TEAMS) {
            console.log(`Fetching players for team ${teamId}...`);
            const playersResponse = await footballApiService.getPlayersByTeam(teamId, new Date().getFullYear() - 1);
            
            for (const item of playersResponse) {
                const player = item.player;
                const stats = item.statistics[0];
                
                const existing = await Player.findOne({ apiFootballId: player.id });
                if (!existing) {
                    await Player.create({
                        apiFootballId: player.id,
                        name: player.name,
                        club: stats.team.name,
                        league: stats.league.name,
                        position: stats.games.position,
                        rating: parseFloat(stats.games.rating) || 70,
                        nationality: player.nationality,
                        age: player.age,
                        teamLogo: stats.team.logo,
                        playerImage: player.photo,
                        marketPrice: Math.floor((parseFloat(stats.games.rating) || 6.0) * 100 * Math.random()) + 500
                    });
                    totalAdded++;
                }
            }
            // Delay to avoid hitting API limits
            await new Promise((res) => setTimeout(res, 2000));
        }

        console.log(`Seed completed. Added ${totalAdded} new players.`);
        process.exit(0);
    } catch (err) {
        console.error("Seed error:", err);
        process.exit(1);
    }
};

seedPlayers();
