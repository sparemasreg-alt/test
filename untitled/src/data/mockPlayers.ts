import { PlayerCard, useMarketStore } from '../store';

const firstNames = ['Lionel', 'Cristiano', 'Kylian', 'Erling', 'Kevin', 'Vinicius', 'Jude', 'Harry', 'Mohamed', 'Sergio'];
const lastNames = ['Messi', 'Ronaldo', 'Mbappe', 'Haaland', 'De Bruyne', 'Junior', 'Bellingham', 'Kane', 'Salah', 'Ramos'];
const positions = ['ST', 'LW', 'RW', 'CAM', 'CM', 'CDM', 'CB', 'LB', 'RB', 'GK'];
const rarities: PlayerCard['card']['rarity'][] = ['Bronze', 'Silver', 'Gold', 'Elite', 'Master', 'Icon'];
const leagues = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1'];

export const generateMockPlayers = (count: number): PlayerCard[] => {
  const players: PlayerCard[] = [];
  for (let i = 0; i < count; i++) {
    const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    
    // Base stats depend on rarity roughly
    const baseOffset = rarities.indexOf(rarity) * 5;
    
    const pace = 65 + baseOffset + Math.floor(Math.random() * 15);
    const shooting = 60 + baseOffset + Math.floor(Math.random() * 15);
    const passing = 60 + baseOffset + Math.floor(Math.random() * 15);
    const dribbling = 65 + baseOffset + Math.floor(Math.random() * 15);
    const defending = 40 + baseOffset + Math.floor(Math.random() * 30);
    const physical = 55 + baseOffset + Math.floor(Math.random() * 20);
    
    const overall = Math.floor((pace + shooting + passing + dribbling + defending + physical) / 6);
    
    const basePrice = (rarities.indexOf(rarity) + 1) * 1000 + Math.floor(Math.random() * 500);
    const history = Array.from({ length: 14 }).map((_, idx) => basePrice + (Math.random() - 0.5) * 500);
    
    players.push({
      id: String(i + 1),
      name: `${fName} ${lName}`,
      image: `https://i.pravatar.cc/300?u=${i + 1}`,
      position: positions[Math.floor(Math.random() * positions.length)],
      league: leagues[Math.floor(Math.random() * leagues.length)],
      club: 'Footex',
      nation: 'Global',
      stats: {
        pace,
        shooting,
        passing,
        dribbling,
        defending,
        physical,
        overall
      },
      card: {
        rarity
      },
      levels: {
        base: overall,
        rare: overall + 3,
        special: overall + 6,
        ultimate: overall + 9
      },
      market: {
        currentPrice: basePrice,
        priceHistory: history,
        isListed: Math.random() > 0.3,
        change24h: Number(((Math.random() - 0.5) * 15).toFixed(2))
      }
    });
  }
  return players;
};

// Initialize store with dummy data safely
export const initStore = () => {
    if(useMarketStore.getState().players.length === 0) {
        useMarketStore.setState({ players: generateMockPlayers(500) });
    }
}
