import { playersData } from "./src/data/playersData";
import fs from "fs";

const newPlayers = [
  {"name":"Kylian Mbappe","club":"Real Madrid","age":27,"careerGoals":355,"baseRating":92,"levels":{"base":92,"rare":95,"special":98,"ultimate":101}},
{"name":"Vinícius Júnior","club":"Real Madrid","age":25,"careerGoals":130,"baseRating":91,"levels":{"base":91,"rare":94,"special":97,"ultimate":100}},
{"name":"Jude Bellingham","club":"Real Madrid","age":22,"careerGoals":85,"baseRating":90,"levels":{"base":90,"rare":93,"special":96,"ultimate":99}},
{"name":"Robert Lewandowski","club":"Barcelona","age":37,"careerGoals":660,"baseRating":87,"levels":{"base":87,"rare":90,"special":93,"ultimate":96}},
{"name":"Lamine Yamal","club":"Barcelona","age":18,"careerGoals":35,"baseRating":86,"levels":{"base":86,"rare":89,"special":92,"ultimate":95}},
{"name":"Florian Wirtz","club":"Real Madrid","age":23,"careerGoals":65,"baseRating":89,"levels":{"base":89,"rare":92,"special":95,"ultimate":98}},
{"name":"Gavi","club":"Barcelona","age":21,"careerGoals":15,"baseRating":85,"levels":{"base":85,"rare":88,"special":91,"ultimate":94}},
{"name":"Pedri","club":"Barcelona","age":23,"careerGoals":28,"baseRating":86,"levels":{"base":86,"rare":89,"special":92,"ultimate":95}},
{"name":"Federico Valverde","club":"Real Madrid","age":27,"careerGoals":40,"baseRating":89,"levels":{"base":89,"rare":92,"special":95,"ultimate":98}},
{"name":"Aurelien Tchouameni","club":"Real Madrid","age":26,"careerGoals":12,"baseRating":86,"levels":{"base":86,"rare":89,"special":92,"ultimate":95}},
{"name":"Eduardo Camavinga","club":"Real Madrid","age":23,"careerGoals":8,"baseRating":85,"levels":{"base":85,"rare":88,"special":91,"ultimate":94}},
{"name":"Nico Williams","club":"Barcelona","age":23,"careerGoals":55,"baseRating":86,"levels":{"base":86,"rare":89,"special":92,"ultimate":95}},
{"name":"Pau Cubarsi","club":"Barcelona","age":19,"careerGoals":2,"baseRating":81,"levels":{"base":81,"rare":84,"special":87,"ultimate":90}},
{"name":"Antoine Griezmann","club":"Atletico Madrid","age":35,"careerGoals":285,"baseRating":86,"levels":{"base":86,"rare":89,"special":92,"ultimate":95}},
{"name":"Julian Alvarez","club":"Atletico Madrid","age":26,"careerGoals":105,"baseRating":85,"levels":{"base":85,"rare":88,"special":91,"ultimate":94}},
{"name":"Endrick","club":"Real Madrid","age":19,"careerGoals":45,"baseRating":82,"levels":{"base":82,"rare":85,"special":88,"ultimate":91}},
{"name":"Arda Guler","club":"Real Madrid","age":21,"careerGoals":25,"baseRating":81,"levels":{"base":81,"rare":84,"special":87,"ultimate":90}},
{"name":"Dani Carvajal","club":"Real Madrid","age":34,"careerGoals":12,"baseRating":85,"levels":{"base":85,"rare":88,"special":91,"ultimate":94}},
{"name":"Eder Militao","club":"Real Madrid","age":28,"careerGoals":15,"baseRating":85,"levels":{"base":85,"rare":88,"special":91,"ultimate":94}},
{"name":"Thibaut Courtois","club":"Real Madrid","age":34,"careerGoals":0,"baseRating":90,"levels":{"base":90,"rare":93,"special":96,"ultimate":99}},
{"name":"Marc-Andre ter Stegen","club":"Barcelona","age":34,"careerGoals":0,"baseRating":88,"levels":{"base":88,"rare":91,"special":94,"ultimate":97}},
{"name":"Frenkie de Jong","club":"Barcelona","age":29,"careerGoals":25,"baseRating":86,"levels":{"base":86,"rare":89,"special":92,"ultimate":95}},
{"name":"Ronald Araujo","club":"Barcelona","age":27,"careerGoals":10,"baseRating":86,"levels":{"base":86,"rare":89,"special":92,"ultimate":95}},
{"name":"Raphinha","club":"Barcelona","age":29,"careerGoals":65,"baseRating":84,"levels":{"base":84,"rare":87,"special":90,"ultimate":93}},
{"name":"Jules Kounde","club":"Barcelona","age":27,"careerGoals":12,"baseRating":85,"levels":{"base":85,"rare":88,"special":91,"ultimate":94}},
{"name":"Alejandro Balde","club":"Barcelona","age":22,"careerGoals":6,"baseRating":81,"levels":{"base":81,"rare":84,"special":87,"ultimate":90}},
{"name":"Jan Oblak","club":"Atletico Madrid","age":33,"careerGoals":0,"baseRating":87,"levels":{"base":87,"rare":90,"special":93,"ultimate":96}},
{"name":"Rodrigo De Paul","club":"Atletico Madrid","age":32,"careerGoals":40,"baseRating":84,"levels":{"base":84,"rare":87,"special":90,"ultimate":93}},
{"name":"Marcos Llorente","club":"Atletico Madrid","age":31,"careerGoals":35,"baseRating":83,"levels":{"base":83,"rare":86,"special":89,"ultimate":92}},
{"name":"Alexander Sorloth","club":"Atletico Madrid","age":30,"careerGoals":130,"baseRating":82,"levels":{"base":82,"rare":85,"special":88,"ultimate":91}},
{"name":"Conor Gallagher","club":"Atletico Madrid","age":26,"careerGoals":28,"baseRating":82,"levels":{"base":82,"rare":85,"special":88,"ultimate":91}},
{"name":"Robin Le Normand","club":"Atletico Madrid","age":29,"careerGoals":8,"baseRating":82,"levels":{"base":82,"rare":85,"special":88,"ultimate":91}},
{"name":"Martin Zubimendi","club":"Real Sociedad","age":27,"careerGoals":15,"baseRating":84,"levels":{"base":84,"rare":87,"special":90,"ultimate":93}},
{"name":"Takefusa Kubo","club":"Real Sociedad","age":24,"careerGoals":38,"baseRating":82,"levels":{"base":82,"rare":85,"special":88,"ultimate":91}},
{"name":"Mikel Oyarzabal","club":"Real Sociedad","age":29,"careerGoals":95,"baseRating":83,"levels":{"base":83,"rare":86,"special":89,"ultimate":92}},
{"name":"Alex Grimaldo","club":"Bayer Leverkusen","age":30,"careerGoals":50,"baseRating":86,"levels":{"base":86,"rare":89,"special":92,"ultimate":95}},
{"name":"Aymeric Laporte","club":"Al-Nassr","age":31,"careerGoals":25,"baseRating":84,"levels":{"base":84,"rare":87,"special":90,"ultimate":93}},
{"name":"Alex Baena","club":"Villarreal","age":24,"careerGoals":20,"baseRating":81,"levels":{"base":81,"rare":84,"special":87,"ultimate":90}},
{"name":"Gerard Moreno","club":"Villarreal","age":34,"careerGoals":145,"baseRating":82,"levels":{"base":82,"rare":85,"special":88,"ultimate":91}},
{"name":"Inaki Williams","club":"Athletic Bilbao","age":31,"careerGoals":95,"baseRating":82,"levels":{"base":82,"rare":85,"special":88,"ultimate":91}},
{"name":"Oihan Sancet","club":"Athletic Bilbao","age":26,"careerGoals":30,"baseRating":81,"levels":{"base":81,"rare":84,"special":87,"ultimate":90}},
{"name":"Dani Olmo","club":"Barcelona","age":28,"careerGoals":50,"baseRating":86,"levels":{"base":86,"rare":89,"special":92,"ultimate":95}},
{"name":"Ferran Torres","club":"Barcelona","age":26,"careerGoals":55,"baseRating":80,"levels":{"base":80,"rare":83,"special":86,"ultimate":89}},
{"name":"Andreas Christensen","club":"Barcelona","age":30,"careerGoals":10,"baseRating":82,"levels":{"base":82,"rare":85,"special":88,"ultimate":91}},
{"name":"Ferland Mendy","club":"Real Madrid","age":30,"careerGoals":8,"baseRating":82,"levels":{"base":82,"rare":85,"special":88,"ultimate":91}},
{"name":"Antonio Rudiger","club":"Real Madrid","age":33,"careerGoals":20,"baseRating":87,"levels":{"base":87,"rare":90,"special":93,"ultimate":96}},
{"name":"David Alaba","club":"Real Madrid","age":33,"careerGoals":35,"baseRating":84,"levels":{"base":84,"rare":87,"special":90,"ultimate":93}},
{"name":"Luka Modric","club":"Real Madrid","age":40,"careerGoals":95,"baseRating":85,"levels":{"base":85,"rare":88,"special":91,"ultimate":94}},
{"name":"Brahim Diaz","club":"Real Madrid","age":26,"careerGoals":35,"baseRating":82,"levels":{"base":82,"rare":85,"special":88,"ultimate":91}},
{"name":"Fran Garcia","club":"Real Madrid","age":26,"careerGoals":5,"baseRating":78,"levels":{"base":78,"rare":81,"special":84,"ultimate":87}}
];

const newNames = new Set(newPlayers.map(p => p.name));
const filtered = playersData.filter((p: any) => !newNames.has(p.name));
filtered.unshift(...newPlayers);

fs.writeFileSync("src/data/playersData.ts", "export const playersData = " + JSON.stringify(filtered, null, 2) + ";");
console.log("Success");
