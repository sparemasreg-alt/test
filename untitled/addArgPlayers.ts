import fs from "fs";
import { playersData } from "./src/data/playersData";

const rawData = `Lionel Messi	Inter Miami	38	845	88	88	93	96	106
Lautaro Martinez	Inter Milan	28	215	89	89	92	95	98
Julian Alvarez	Atletico Madrid	26	105	85	85	88	91	94
Alexis Mac Allister	Liverpool	27	45	86	86	89	92	95
Enzo Fernandez	Chelsea	25	22	84	84	87	90	93
Rodrigo De Paul	Atletico Madrid	32	40	84	84	87	90	93
Emiliano Martinez	Aston Villa	33	0	87	87	90	93	96
Cristian Romero	Tottenham	28	15	86	86	89	92	95
Lisandro Martinez	Man United	28	8	84	84	87	90	93
Paulo Dybala	AS Roma	32	185	85	85	88	91	94
Angel Di Maria	Benfica	38	195	82	82	85	88	91
Nahuel Molina	Atletico Madrid	28	12	81	81	84	87	90
Nicolas Otamendi	Benfica	38	28	80	80	83	86	89
Nicolas Tagliafico	Lyon	33	18	79	79	82	85	88
Marcos Acuna	River Plate	34	25	80	80	83	86	89
Leandro Paredes	AS Roma	31	24	79	79	82	85	88
Exequiel Palacios	Bayer Leverkusen	27	28	83	83	86	89	92
Angel Correa	Atletico Madrid	31	90	82	82	85	88	91
Giovani Lo Celso	Real Betis	30	48	81	81	84	87	90
Alejandro Garnacho	Man United	21	42	84	84	87	90	93
Ezequiel Fernandez	Al-Qadsiah	23	8	79	79	82	85	88
Lucas Ocampos	Monterrey	31	95	79	79	82	85	88
Mauro Icardi	Galatasaray	33	260	81	81	84	87	90
Nico Gonzalez	Juventus	28	55	80	80	83	86	89
Valentin Carboni	Marseille	21	12	77	77	80	83	86
Matias Soule	AS Roma	23	20	79	79	82	85	88
Claudio Echeverri	River Plate	20	10	76	76	79	82	85
Franco Armani	River Plate	39	0	77	77	80	83	86
Geronimo Rulli	Ajax	34	0	79	79	82	85	88
Juan Musso	Atletico Madrid	32	0	79	79	82	85	88
Walter Benitez	PSV	33	0	81	81	84	87	90
Facundo Medina	Lens	26	10	80	80	83	86	89
Lucas Martinez Quarta	Fiorentina	30	18	79	79	82	85	88
Nehuen Perez	Porto	25	4	78	78	81	84	87
Leonardo Balerdi	Marseille	27	6	80	80	83	86	89
Gonzalo Montiel	Sevilla	29	8	77	77	80	83	86
Lucas Robertone	Almeria	29	18	76	76	79	82	85
Guido Rodriguez	West Ham	32	15	80	80	83	86	89
Alan Varela	Porto	24	6	82	82	85	88	91
Santiago Hezze	Olympiacos	24	8	77	77	80	83	86
Maximo Perrone	Como	23	3	75	75	78	81	84
Enzo Barrenechea	Valencia	25	4	76	76	79	82	85
Valentin Barco	Sevilla	21	3	76	76	79	82	85
Thiago Almada	Botafogo	25	45	79	79	82	85	88
Enea Esequiel Bastianini	Boca Juniors	27	32	76	76	79	82	85
Facundo Buonanotte	Leicester	21	15	78	78	81	84	87
Luka Romero	Alaves	21	8	73	73	76	79	82
Gianluca Prestianni	Benfica	20	6	74	74	77	80	83
Mateo Retegui	Atalanta	27	55	81	81	84	87	90
Lucas Beltran	Fiorentina	25	35	77	77	80	83	86
Taty Castellanos	Lazio	27	65	79	79	82	85	88
Giovanni Simeone	Napoli	30	88	77	77	80	83	86
Joaquin Correa	Inter Milan	31	60	76	76	79	82	85
Emiliano Buendia	Aston Villa	29	40	78	78	81	84	87
Manuel Lanzini	River Plate	33	45	75	75	78	81	84
Roberto Pereyra	AEK Athens	35	55	75	75	78	81	84
Eduardo Salvio	Lanús	35	80	74	74	77	80	83
Franco Cervi	Celta Vigo	31	25	75	75	78	81	84
Erik Lamela	AEK Athens	34	50	76	76	79	82	85
Lucas Alario	Internacional	33	115	75	75	78	81	84
Facundo Ferreyra	Tigre	35	98	72	72	75	78	81
German Pezzella	River Plate	34	15	78	78	81	84	87
Ramiro Funes Mori	River Plate	35	14	72	72	75	78	81
Milton Casco	River Plate	38	10	72	72	75	78	81
Luis Advincua	Boca Juniors	36	15	74	74	77	80	83
Marcos Rojo	Boca Juniors	36	22	75	75	78	81	84
Frank Fabra	Boca Juniors	35	18	73	73	76	79	82
Gary Medel	Boca Juniors	38	25	73	73	76	79	82
Sergio Romero	Boca Juniors	39	0	76	76	79	82	85
Edinson Cavani	Boca Juniors	39	445	78	78	81	84	87
Miguel Borja	River Plate	33	185	77	77	80	83	86
Ignacio Fernandez	River Plate	36	55	76	76	79	82	85
Rodrigo Aliendro	River Plate	35	20	75	75	78	81	84
Matias Kranevitter	River Plate	33	5	74	74	77	80	83
Adam Bareiro	River Plate	29	75	75	75	78	81	84
Jeronimo Doman	Estudiantes	24	12	73	73	76	79	82
Santiago Ascacibar	Estudiantes	29	15	76	76	79	82	85
Enzo Perez	Estudiantes	40	25	74	74	77	80	83
Federico Fernandez	Estudiantes	37	18	72	72	75	78	81
Jose Sosa	Estudiantes	40	65	73	73	76	79	82
Pablo Piatti	Estudiantes	37	70	72	72	75	78	81
Guido Carrillo	Estudiantes	34	95	74	74	77	80	83
Luciano Vietto	Racing Club	32	75	74	74	77	80	83
Juan Quintero	Racing Club	33	65	76	76	79	82	85
Roger Martinez	Racing Club	31	80	75	75	78	81	84
Adrian Martinez	Racing Club	33	92	76	76	79	82	85
Bruno Zuculini	Racing Club	33	18	73	73	76	79	82
Agustin Almendra	Racing Club	26	12	74	74	77	80	83
Gaston Martirena	Racing Club	26	8	73	73	76	79	82
Gabriel Arias	Racing Club	38	0	76	76	79	82	85
Federico Gattoni	River Plate	27	8	74	74	77	80	83
Kevin Zenon	Boca Juniors	24	15	76	76	79	82	85
Cristian Medina	Boca Juniors	24	12	77	77	80	83	86
Ignacio Miramon	Boca Juniors	22	2	72	72	75	78	81
Brian Aguirre	Boca Juniors	23	10	73	73	76	79	82
Exequiel Zeballos	Boca Juniors	24	14	74	74	77	80	83
Tomas Belmonte	Boca Juniors	27	15	74	74	77	80	83
Lautaro Blanco	Boca Juniors	27	4	75	75	78	81	84
Aaron Anselmino	Boca Juniors	21	2	74	74	77	80	83`;

const newPlayers: any[] = [];
const lines = rawData.trim().split("\n");
for (const line of lines) {
  const parts = line.split("\t");
  if (parts.length < 9) continue;
  const [name, club, age, careerGoals, rating, baseStr, rareStr, specialStr, ultimateStr] = parts;
  if (!name) continue;
  newPlayers.push({
    name,
    club,
    age: parseInt(age),
    careerGoals: parseInt(careerGoals),
    baseRating: parseInt(rating),
    levels: {
      base: parseInt(baseStr),
      rare: parseInt(rareStr),
      special: parseInt(specialStr),
      ultimate: parseInt(ultimateStr)
    }
  });
}

const newNames = new Set(newPlayers.map(p => p.name));
const filtered = playersData.filter((p: any) => !newNames.has(p.name));
filtered.unshift(...newPlayers);

fs.writeFileSync("src/data/playersData.ts", "export const playersData = " + JSON.stringify(filtered, null, 2) + ";");
console.log("Success");
