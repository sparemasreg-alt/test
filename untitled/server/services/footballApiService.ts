import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.API_FOOTBALL_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "x-apisports-key": API_KEY,
  },
});

export const footballApiService = {
  getLiveMatches: async () => {
    try {
      const response = await api.get("/fixtures?live=all");
      return response.data.response;
    } catch (error) {
      console.error("Error fetching live matches:", error);
      return [];
    }
  },
  getPlayerRatings: async (fixtureId: number) => {
    try {
      const response = await api.get(`/fixtures/players?fixture=${fixtureId}`);
      return response.data.response;
    } catch (error) {
      console.error(`Error fetching player ratings for fixture ${fixtureId}:`, error);
      return [];
    }
  },
  getPlayersByTeam: async (teamId: number, season: number) => {
      try {
          const response = await api.get(`/players?team=${teamId}&season=${season}`);
          return response.data.response;
      } catch (error) {
          console.error(`Error fetching players for team ${teamId}:`, error);
          return [];
      }
  }
};
