const fs = require('fs');

const input = fs.readFileSync('players_to_add.txt', 'utf8').trim().split('\n');
const lines = input.slice(1); // skip header

const newPlayers = lines.map(line => {
  const parts = line.split('\t');
  if (parts.length < 9) return null;
  const name = parts[0].trim();
  const nat = parts[1].trim();
  const pos = parts[2].trim();
  const ovr = parseInt(parts[3].trim());
  const l1 = parseInt(parts[4].trim());
  const l2 = parseInt(parts[5].trim());
  const l3 = parseInt(parts[6].trim());
  const l4 = parseInt(parts[7].trim());
  const club = parts[8].trim();

  return {
    name: name,
    club: club,
    age: Math.floor(Math.random() * (40 - 20) + 20),
    careerGoals: Math.floor(Math.random() * 500),
    baseRating: l1,
    levels: {
      base: l1,
      rare: l2,
      special: l3,
      ultimate: l4
    }
  };
}).filter(Boolean);

let existingCode = fs.readFileSync('src/data/playersData.ts', 'utf8');

// Find the end of the array. It's usually "];".
// We can parse the whole thing, or just inject.
// Actually, it's easier to just append.
// wait, existingCode is `export const playersData = [...]`
// Let's use string manipulation.
const lastBracketIndex = existingCode.lastIndexOf(']');
if (lastBracketIndex !== -1) {
    const start = existingCode.slice(0, lastBracketIndex).trim();
    // if it ends with a comma, don't add, otherwise add
    const needsComma = !start.endsWith(',');
    const replacement = (needsComma ? ',' : '') + JSON.stringify(newPlayers, null, 2).slice(1, -1) + '\n];\n';
    
    fs.writeFileSync('src/data/playersData.ts', start + replacement);
    console.log('Appended', newPlayers.length, 'players');
} else {
    console.log('Could not find the end of the array');
}
