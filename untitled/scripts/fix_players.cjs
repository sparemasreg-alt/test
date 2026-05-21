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
    position: pos,
    nation: nat,
    levels: {
      base: l1,
      rare: l2,
      special: l3,
      ultimate: l4
    }
  };
}).filter(Boolean);

let existingCode = fs.readFileSync('src/data/playersData.ts', 'utf8');

// I need to strip out the previously appended players.
// Before appending, existingCode had some length. 
// Or I can just write a regex that extracts the JSON and replaces the ones that lack position but are in the newPlayers list.
// Easiest is to replace the whole file if I can regenerate the old ones, BUT I don't want to lose the old ones.
// The old ones are just... Let me find the playersData list.
// The appended ones have no 'position' and 'nation' property.

// A simpler way: we'll parse the array by using eval?
// It's just a JS file with `export const playersData = [...]`
const arrayStr = existingCode.replace('export const playersData = ', '');
let arr = [];
try {
  // It's evaluating in Node JS
  arr = eval(arrayStr);
} catch(e) {
  console.log("Parse failed", e);
}

// Remove the ones we appended previously! The ones we appended previously didn't have `position` and `nation`, and they exactly match the names of `newPlayers`.
const newPlayerNames = new Set(newPlayers.map(p => p.name));
arr = arr.filter(p => !newPlayerNames.has(p.name));

// Now append the updated ones
arr = arr.concat(newPlayers);

const newContent = 'export const playersData = ' + JSON.stringify(arr, null, 2) + ';\n';
fs.writeFileSync('src/data/playersData.ts', newContent);
console.log('Successfully updated playersData.ts. Total count:', arr.length);
