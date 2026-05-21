import fs from 'fs';

const rawData = `Mohamed Salah	Liverpool	33	362	90	90	93	96	99
Cristiano Ronaldo	Al-Nassr	41	918	86	86	89	92	95
Erling Haaland	Man City	25	315	91	91	94	97	100
Kylian Mbappe	Real Madrid	27	355	92	92	95	98	101
Vinícius Júnior	Real Madrid	25	130	91	91	94	97	100
Ahmed Sayed Zizo	Zamalek	30	122	79	79	82	85	88
Emam Ashour	Al-Ahly	28	48	78	78	81	84	87
Salem Al-Dawsari	Al-Hilal	34	118	80	80	83	86	89
Aleksandar Mitrovic	Al-Hilal	31	295	84	84	87	90	93
Kevin De Bruyne	Al-Qadsiah	34	165	87	87	90	93	96
Jude Bellingham	Real Madrid	22	85	90	90	93	96	99
Wessam Abou Ali	Al-Ahly	27	75	77	77	80	83	86
Fabinho	Al-Ittihad	32	45	83	83	86	89	92
Robert Lewandowski	Barcelona	37	660	87	87	90	93	96
Harry Kane	Bayern Munich	32	430	90	90	93	96	99
Mostafa Mohamed	Nantes	28	105	79	79	82	85	88
Omar Marmoush	Eintracht Frankfurt	27	65	81	81	84	87	90
Riyad Mahrez	Al-Ahli	35	210	83	83	86	89	92
Neymar Jr	Al-Hilal	34	440	85	85	88	91	94
Jamal Musiala	Bayern Munich	23	60	88	88	91	94	97
Lamine Yamal	Barcelona	18	35	86	86	89	92	95
Karim Benzema	Al-Ittihad	38	480	84	84	87	90	93
Abderrazak Hamdallah	Al-Shabab	35	320	80	80	83	86	89
Mohamed El Shenawy	Al-Ahly	37	0	78	78	81	84	87
Mohamed Abdelmonem	Nice	27	15	79	79	82	85	88
Marcus Rashford	Man United	28	145	83	83	86	89	92
Bukayo Saka	Arsenal	24	90	88	88	91	94	97
Phil Foden	Man City	25	105	89	89	92	95	98
Rodri	Man City	29	40	91	91	94	97	100
Alisson Becker	Liverpool	33	0	89	89	92	95	98
Ederson	Al-Ittihad	32	0	88	88	91	94	97
N'Golo Kante	Al-Ittihad	35	30	84	84	87	90	93
Sadio Mane	Al-Nassr	34	225	83	83	86	89	92
Aymeric Laporte	Al-Nassr	31	25	84	84	87	90	93
Ruben Neves	Al-Hilal	29	55	84	84	87	90	93
Malcom	Al-Hilal	29	110	82	82	85	88	91
Otavio	Al-Nassr	31	65	81	81	84	87	90
Ferjani Sassi	Al-Gharafa	34	55	76	76	79	82	85
Achraf Hakimi	PSG	27	45	85	85	88	91	94
Ali Maaloul	Al-Ahly	36	65	75	75	78	81	84
Mohamed Hany	Al-Ahly	30	8	74	74	77	80	83
Mahmoud Shikabala	Zamalek	40	85	72	72	75	78	81
Nasser Maher	Zamalek	29	30	75	75	78	81	84
Ramadan Sobhi	Pyramids	29	55	76	76	79	82	85
Ibrahim Adel	Pyramids	25	40	75	75	78	81	84
Franck Kessie	Al-Ahli	29	60	82	82	85	88	91
Ivan Toney	Al-Ahli	30	175	81	81	84	87	90
Gabri Veiga	Al-Ahli	24	30	79	79	82	85	88
Aaron Boupendza	Zamalek	29	85	75	75	78	81	84
Anthony Gordon	Newcastle	25	45	83	83	86	89	92
Cole Palmer	Chelsea	24	82	88	88	91	94	97
Lautaro Martinez	Inter Milan	28	215	89	89	92	95	98
Rafael Leao	AC Milan	26	95	87	87	90	93	96
Declan Rice	Arsenal	27	25	87	87	90	93	96
William Saliba	Arsenal	25	10	88	88	91	94	97
Florian Wirtz	Real Madrid	23	65	89	89	92	95	98
Gavi	Barcelona	21	15	85	85	88	91	94
Pedri	Barcelona	23	28	86	86	89	92	95
Mike Maignan	AC Milan	30	0	87	87	90	93	96
Theo Hernandez	Bayern Munich	28	35	87	87	90	93	96
Yassine Bounou	Al-Hilal	35	1	85	85	88	91	94
Kalidou Koulibaly	Al-Hilal	34	22	83	83	86	89	92
Sergej Milinkovic-Savic	Al-Hilal	31	105	85	85	88	91	94
Joao Cancelo	Al-Hilal	31	25	84	84	87	90	93
Roberto Firmino	Al-Ahli	34	195	81	81	84	87	90
Edouard Mendy	Al-Ahli	34	0	80	80	83	86	89
Marcelo Brozovic	Al-Nassr	33	45	82	82	85	88	91
Sultan Al-Ghannam	Al-Nassr	31	15	78	78	81	84	87
Mohamed Magdy Afsha	Al-Ahly	30	55	74	74	77	80	83
Mahmoud Kahraba	Al-Ahly	32	110	73	73	76	79	82
Marwan Attia	Al-Ahly	27	5	75	75	78	81	84
Akram Tawfik	Al-Ahly	28	6	74	74	77	80	83
Achraf Dari	Al-Ahly	27	12	75	75	78	81	84
Yahia Attiyat Allah	Al-Ahly	31	15	74	74	77	80	83
Seifeddine Jaziri	Zamalek	33	95	73	73	76	79	82
Hamza Mathlouthi	Zamalek	33	10	74	74	77	80	83
Nabil Emad Dunga	Zamalek	30	8	73	73	76	79	82
Mostafa Shalaby	Zamalek	31	35	72	72	75	78	81
Omar Gaber	Zamalek	34	18	71	71	74	77	80
Trezeguet	Al-Rayyan	31	85	78	78	81	84	87
Mohamed Elneny	Al-Jazira	33	15	74	74	77	80	83
Ahmed Hegazi	Neom	35	25	75	75	78	81	84
Tarek Hamed	Damac	37	8	73	73	76	79	82
Fiston Mayele	Pyramids	31	140	76	76	79	82	85
Blati Toure	Pyramids	31	12	75	75	78	81	84
Bruno Fernandes	Man United	31	185	87	87	90	93	96
Bernardo Silva	Man City	31	105	88	88	91	94	97
Ruben Dias	Man City	29	15	89	89	92	95	98
Virgil van Dijk	Liverpool	34	60	88	88	91	94	97
Trent Alexander-Arnold	Real Madrid	27	25	87	87	90	93	96
Alexis Mac Allister	Liverpool	27	45	86	86	89	92	95
Darwin Nunez	Liverpool	26	135	83	83	86	89	92
Luis Diaz	Liverpool	29	90	85	85	88	91	94
Federico Valverde	Real Madrid	27	40	89	89	92	95	98
Aurelien Tchouameni	Real Madrid	26	12	86	86	89	92	95
Eduardo Camavinga	Real Madrid	23	8	85	85	88	91	94
Robert Sanchez	Chelsea	28	0	81	81	84	87	90
Enzo Fernandez	Chelsea	25	22	84	84	87	90	93
Moussa Diaby	Al-Ittihad	26	75	83	83	86	89	92
Steven Bergwijn	Al-Ittihad	28	80	80	80	83	86	89
Kim Min-jae	Bayern Munich	29	12	86	86	89	92	95
Joshua Kimmich	Bayern Munich	31	55	87	87	90	93	96
Leroy Sane	Bayern Munich	30	115	85	85	88	91	94
Manuel Neuer	Bayern Munich	40	0	84	84	87	90	93
Gianluigi Donnarumma	PSG	27	0	88	88	91	94	97
Warren Zaire-Emery	PSG	20	18	84	84	87	90	93
Ousmane Dembele	PSG	29	85	86	86	89	92	95
Bradley Barcola	PSG	23	35	83	83	86	89	92
Alessandro Bastoni	Inter Milan	27	8	87	87	90	93	96
Nicolo Barella	Inter Milan	29	35	87	87	90	93	96
Marcus Thuram	Inter Milan	28	95	84	84	87	90	93
Hakan Calhanoglu	Inter Milan	32	130	85	85	88	91	94
Khvicha Kvaratskhelia	Napoli	25	65	86	86	89	92	95
Victor Osimhen	PSG	27	165	87	87	90	93	96
Christian Pulisic	AC Milan	27	80	84	84	87	90	93
Alvaro Morata	AC Milan	33	225	82	82	85	88	91
Son Heung-min	Tottenham	33	245	86	86	89	92	95
James Maddison	Tottenham	29	95	85	85	88	91	94
Ollie Watkins	Aston Villa	30	160	84	84	87	90	93
Alexander Isak	Newcastle	26	135	85	85	88	91	94
Hussein El Shahat	Al-Ahly	33	88	74	74	77	80	83
Yasser Ibrahim	Al-Ahly	33	15	73	73	76	79	82
Mostafa Shobeir	Al-Ahly	26	0	74	74	77	80	83
Ramy Rabia	Al-Ahly	32	20	72	72	75	78	81
Reda Slim	Al-Ahly	26	35	74	74	77	80	83
Ahmed Hamdi	Zamalek	28	22	73	73	76	79	82
Mahmoud Hamdy El Wensh	Zamalek	31	12	75	75	78	81	84
Hossam Abdelmaguid	Zamalek	25	10	74	74	77	80	83
Ahmed Fatouh	Zamalek	28	8	74	74	77	80	83
Seif Farouk Gaafar	Zamalek	26	7	70	70	73	76	79
Mostafa Fathi	Pyramids	32	90	75	75	78	81	84
Mohanad Lasheen	Pyramids	30	12	73	73	76	79	82
Walid El Karti	Pyramids	31	55	75	75	78	81	84
Mohamed Chibi	Pyramids	33	10	74	74	77	80	83
Fakhreddine Ben Youssef	Al-Masry	34	110	72	72	75	78	81
Houssem Aouar	Al-Ittihad	27	50	79	79	82	85	88
Danilo Pereira	Al-Ittihad	34	15	79	79	82	85	88
Predrag Rajkovic	Al-Ittihad	30	0	79	79	82	85	88
Yannick Carrasco	Al-Shabab	32	115	81	81	84	87	90
Giacomo Bonaventura	Al-Shabab	36	85	78	78	81	84	87
Seko Fofana	Al-Ettifaq	31	50	80	80	83	86	89
Moussa Dembele	Al-Ettifaq	29	165	78	78	81	84	87
Georginio Wijnaldum	Al-Ettifaq	35	125	79	79	82	85	88
Karl Toko Ekambi	Al-Ettifaq	33	160	77	77	80	83	86
Odion Ighalo	Al-Wehda	36	260	76	76	79	82	85
Bruno Guimaraes	Newcastle	28	30	86	86	89	92	95
Gabriel Martinelli	Arsenal	24	60	85	85	88	91	94
Kai Havertz	Arsenal	26	90	85	85	88	91	94
Antoine Griezmann	Atletico Madrid	35	285	86	86	89	92	95
Julian Alvarez	Atletico Madrid	26	105	85	85	88	91	94
Endrick	Real Madrid	19	45	82	82	85	88	91
Arda Guler	Real Madrid	21	25	81	81	84	87	90
Alejandro Garnacho	Man United	21	42	84	84	87	90	93
Kobbie Mainoo	Man United	21	12	82	82	85	88	91
Leny Yoro	Man United	20	5	81	81	84	87	90
Savinho	Man City	22	30	83	83	86	89	92
Jeremy Doku	Man City	24	38	84	84	87	90	93
Josko Gvardiol	Man City	24	12	87	87	90	93	96
Nico Williams	Barcelona	23	55	86	86	89	92	95
Pau Cubarsi	Barcelona	19	2	81	81	84	87	90
Pierre-Emerick Aubameyang	Al-Qadsiah	36	365	80	80	83	86	89
Nacho Fernandez	Al-Qadsiah	36	18	80	80	83	86	89
Koen Casteels	Al-Qadsiah	33	0	81	81	84	87	90
Ezequiel Fernandez	Al-Qadsiah	23	8	79	79	82	85	88
Mohamed Simakan	Al-Nassr	26	10	81	81	84	87	90
Bento	Al-Nassr	26	0	82	82	85	88	91
Wesley Gassova	Al-Nassr	21	20	76	76	79	82	85
Angelo Gabriel	Al-Nassr	21	15	77	77	80	83	86
Craig Goodwin	Al-Wehda	34	85	77	77	80	83	86
Mourad Batna	Al-Fateh	35	95	76	76	79	82	85
Mohamed Shehata	Zamalek	24	10	73	73	76	79	82
Omar Kamal	Al-Ahly	32	28	73	73	76	79	82
Ahmed Nabil Koka	Al-Ahly	25	6	72	72	75	78	81
Karim Fouad	Al-Ahly	26	15	72	72	75	78	81
Marwan Hamdy	Pyramids	29	75	73	73	76	79	82
Mahmoud Saber	Pyramids	24	18	72	72	75	78	81
Mohamed Hamdy	Pyramids	31	12	73	73	76	79	82
Baher El Mohamady	Al-Masry	29	15	72	72	75	78	81
Salah Mohsen	Al-Masry	27	45	71	71	74	77	80
Ahmed El Shenawy	Pyramids	35	0	73	73	76	79	82
Xavi Simons	Bayern Munich	23	55	86	86	89	92	95
Lois Openda	RB Leipzig	26	135	84	84	87	90	93
Victor Boniface	Bayer Leverkusen	25	90	84	84	87	90	93
Alejandro Grimaldo	Bayer Leverkusen	30	50	86	86	89	92	95
Jeremie Frimpong	Bayer Leverkusen	25	35	85	85	88	91	94
Granit Xhaka	Bayer Leverkusen	33	55	84	84	87	90	93
Serhou Guirassy	Borussia Dortmund	30	120	83	83	86	89	92
Nico Schlotterbeck	Borussia Dortmund	26	15	84	84	87	90	93
Jamie Gittens	Borussia Dortmund	21	18	80	80	83	86	89
Gregor Kobel	Borussia Dortmund	28	0	87	87	90	93	96
Dusan Vlahovic	Juventus	26	145	85	85	88	91	94
Kenan Yildiz	Juventus	21	20	81	81	84	87	90
Teun Koopmeiners	Juventus	28	75	84	84	87	90	93
Gleison Bremer	Juventus	29	20	86	86	89	92	95
Douglas Luiz	Juventus	28	35	83	83	86	89	92
Romelu Lukaku	Napoli	33	315	82	82	85	88	91
Scott McTominay	Napoli	29	48	80	80	83	86	89
Billy Gilmour	Napoli	24	5	78	78	81	84	87
Paulo Dybala	AS Roma	32	185	85	85	88	91	94
Artem Dovbyk	AS Roma	28	115	83	83	86	89	92`;

const lines = rawData.trim().split('\n');
const players = lines.map(line => {
  const parts = line.split('\t');
  if (parts.length < 9) return null;
  return {
    name: parts[0],
    club: parts[1],
    age: parseInt(parts[2]),
    careerGoals: parseInt(parts[3]),
    baseRating: parseInt(parts[4]),
    levels: {
      base: parseInt(parts[5]),
      rare: parseInt(parts[6]),
      special: parseInt(parts[7]),
      ultimate: parseInt(parts[8])
    }
  };
}).filter(Boolean);

const output = `export const playersData = ${JSON.stringify(players, null, 2)};\n`;
fs.writeFileSync('src/data/playersData.ts', output);
