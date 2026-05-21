const fs = require('fs');

const realSuperstars = [
  { name: "Lionel Messi", club: "Inter Miami", position: "RW", nation: "Argentina", baseRating: 90 },
  { name: "Cristiano Ronaldo", club: "Al-Nassr", position: "ST", nation: "Portugal", baseRating: 86 },
  { name: "Kylian Mbappé", club: "Real Madrid", position: "ST", nation: "France", baseRating: 91 },
  { name: "Erling Haaland", club: "Manchester City", position: "ST", nation: "Norway", baseRating: 91 },
  { name: "Kevin De Bruyne", club: "Manchester City", position: "CM", nation: "Belgium", baseRating: 91 },
  { name: "Vinícius Júnior", club: "Real Madrid", position: "LW", nation: "Brazil", baseRating: 91 },
  { name: "Jude Bellingham", club: "Real Madrid", position: "CM", nation: "England", baseRating: 90 },
  { name: "Rodri", club: "Manchester City", position: "CDM", nation: "Spain", baseRating: 91 },
  { name: "Harry Kane", club: "Bayern Munich", position: "ST", nation: "England", baseRating: 90 },
  { name: "Mohamed Salah", club: "Liverpool", position: "RW", nation: "Egypt", baseRating: 89 },
  { name: "Alisson", club: "Liverpool", position: "GK", nation: "Brazil", baseRating: 89 },
  { name: "Thibaut Courtois", club: "Real Madrid", position: "GK", nation: "Belgium", baseRating: 90 },
  { name: "Virgil van Dijk", club: "Liverpool", position: "CB", nation: "Netherlands", baseRating: 89 },
  { name: "Rúben Dias", club: "Manchester City", position: "CB", nation: "Portugal", baseRating: 89 },
  { name: "Marc-André ter Stegen", club: "Barcelona", position: "GK", nation: "Germany", baseRating: 89 },
  { name: "Antoine Griezmann", club: "Atletico Madrid", position: "ST", nation: "France", baseRating: 88 },
  { name: "Robert Lewandowski", club: "Barcelona", position: "ST", nation: "Poland", baseRating: 90 },
  { name: "Luka Modrić", club: "Real Madrid", position: "CM", nation: "Croatia", baseRating: 87 },
  { name: "Toni Kroos", club: "Real Madrid", position: "CM", nation: "Germany", baseRating: 86 },
  { name: "Neymar Jr", club: "Al-Hilal", position: "LW", nation: "Brazil", baseRating: 89 },
  { name: "Son Heung-min", club: "Tottenham Hotspur", position: "LW", nation: "South Korea", baseRating: 87 },
  { name: "Bukayo Saka", club: "Arsenal", position: "RW", nation: "England", baseRating: 86 },
  { name: "Martin Ødegaard", club: "Arsenal", position: "CM", nation: "Norway", baseRating: 87 },
  { name: "Declan Rice", club: "Arsenal", position: "CDM", nation: "England", baseRating: 85 },
  { name: "Phil Foden", club: "Manchester City", position: "RW", nation: "England", baseRating: 85 },
  { name: "Bernardo Silva", club: "Manchester City", position: "CM", nation: "Portugal", baseRating: 88 },
  { name: "Ederson", club: "Manchester City", position: "GK", nation: "Brazil", baseRating: 88 },
  { name: "Jamal Musiala", club: "Bayern Munich", position: "CAM", nation: "Germany", baseRating: 86 },
  { name: "Pedri", club: "Barcelona", position: "CM", nation: "Spain", baseRating: 86 },
  { name: "Gavi", club: "Barcelona", position: "CM", nation: "Spain", baseRating: 83 },
  { name: "Lamine Yamal", club: "Barcelona", position: "RW", nation: "Spain", baseRating: 81 },
  { name: "Aurélien Tchouaméni", club: "Real Madrid", position: "CDM", nation: "France", baseRating: 84 },
  { name: "Eduardo Camavinga", club: "Real Madrid", position: "CDM", nation: "France", baseRating: 82 },
  { name: "Federico Valverde", club: "Real Madrid", position: "CM", nation: "Uruguay", baseRating: 88 },
  { name: "Emiliano Martínez", club: "Aston Villa", position: "GK", nation: "Argentina", baseRating: 85 },
  { name: "Lautaro Martínez", club: "Inter Milan", position: "ST", nation: "Argentina", baseRating: 87 },
  { name: "Julián Álvarez", club: "Manchester City", position: "ST", nation: "Argentina", baseRating: 80 },
  { name: "Alexis Mac Allister", club: "Liverpool", position: "CM", nation: "Argentina", baseRating: 82 },
  { name: "Enzo Fernández", club: "Chelsea", position: "CM", nation: "Argentina", baseRating: 83 },
  { name: "Rodrigo De Paul", club: "Atletico Madrid", position: "CM", nation: "Argentina", baseRating: 84 },
  { name: "Cristian Romero", club: "Tottenham Hotspur", position: "CB", nation: "Argentina", baseRating: 82 },
  { name: "Lisandro Martínez", club: "Manchester United", position: "CB", nation: "Argentina", baseRating: 82 },
  { name: "Paulo Dybala", club: "AS Roma", position: "CF", nation: "Argentina", baseRating: 86 },
  { name: "Ángel Di María", club: "Benfica", position: "RW", nation: "Argentina", baseRating: 83 },
  { name: "Florian Wirtz", club: "Bayer Leverkusen", position: "CAM", nation: "Germany", baseRating: 85 },
  { name: "Victor Osimhen", club: "Napoli", position: "ST", nation: "Nigeria", baseRating: 88 },
  { name: "Rafael Leão", club: "AC Milan", position: "LW", nation: "Portugal", baseRating: 86 },
  { name: "Khvicha Kvaratskhelia", club: "Napoli", position: "LW", nation: "Georgia", baseRating: 86 },
  { name: "Trent Alexander-Arnold", club: "Liverpool", position: "RB", nation: "England", baseRating: 86 },
  { name: "Achraf Hakimi", club: "PSG", position: "RB", nation: "Morocco", baseRating: 84 },
  { name: "Alphonso Davies", club: "Bayern Munich", position: "LB", nation: "Canada", baseRating: 84 },
  { name: "Theo Hernández", club: "AC Milan", position: "LB", nation: "France", baseRating: 85 },
  { name: "Ronald Araújo", club: "Barcelona", position: "CB", nation: "Uruguay", baseRating: 86 },
  { name: "Éder Militão", club: "Real Madrid", position: "CB", nation: "Brazil", baseRating: 86 },
  { name: "Marquinhos", club: "PSG", position: "CB", nation: "Brazil", baseRating: 87 },
  { name: "Jan Oblak", club: "Atletico Madrid", position: "GK", nation: "Slovenia", baseRating: 88 },
  { name: "Gianluigi Donnarumma", club: "PSG", position: "GK", nation: "Italy", baseRating: 87 }
];

const newPlayers = realSuperstars.map(p => ({
  name: p.name,
  club: p.club,
  age: 26,
  careerGoals: 100,
  baseRating: p.baseRating,
  position: p.position,
  nation: p.nation,
  levels: {
    base: p.baseRating - 10,
    rare: p.baseRating - 5,
    special: p.baseRating,
    ultimate: p.baseRating + 5
  }
}));

const existingCode = fs.readFileSync('src/data/playersData.ts', 'utf8');
const arrayStr = existingCode.replace('export const playersData = ', '').slice(0, -2);
let arr = [];
try {
  arr = eval(arrayStr);
} catch(e) {
  console.log("Parse failed", e);
}

// Keep only icons (they are at the end, added by my previous script)
// The icons were the ones starting after the 318 bad names. 
const badNames = new Set(require('../bad_names.json'));
const legacyIcons = arr.filter(p => !badNames.has(p.name));

const finalArr = [...newPlayers, ...legacyIcons];

const newContent = 'export const playersData = ' + JSON.stringify(finalArr, null, 2) + ';\n';
fs.writeFileSync('src/data/playersData.ts', newContent);
console.log('Successfully updated playersData.ts. Cleaned up bad names. Total count:', finalArr.length);
