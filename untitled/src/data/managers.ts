export interface ManagerData {
  id: string;
  name: string;
  nationality: string;
  club: string;
  tactics: string;
  achievements: string;
  overall: number;
  rarity: 'Bronze' | 'Silver' | 'Gold' | 'Elite' | 'Master' | 'Icon';
  price: number;
}

export const managersData: ManagerData[] = [
  { id: 'm1', name: 'Sir Alex Ferguson', nationality: 'Scotland', club: 'Manchester United', tactics: '4-4-2 (العقلية الذهنية الشاملة)', achievements: '13 الدوري الإنجليزي، 2 دوري الأبطال', overall: 97, rarity: 'Icon', price: 500000 },
  { id: 'm2', name: 'Pep Guardiola', nationality: 'Spain', club: 'Manchester City', tactics: '4-3-3 (تيكي تاكا / الاستحواذ)', achievements: '3 دوري الأبطال، 12 دوريات كبرى', overall: 96, rarity: 'Elite', price: 450000 },
  { id: 'm3', name: 'Carlo Ancelotti', nationality: 'Italy', club: 'Real Madrid', tactics: '4-3-1-2 (المرونة والواقعية)', achievements: '5 دوري الأبطال (الأكثر تاريخياً)', overall: 96, rarity: 'Elite', price: 450000 },
  { id: 'm4', name: 'Rinus Michels', nationality: 'Netherlands', club: 'Ajax / Barcelona', tactics: 'الكرة الشاملة (Total Football)', achievements: '1 دوري الأبطال، مخترع التكتيك الحديث', overall: 95, rarity: 'Icon', price: 400000 },
  { id: 'm5', name: 'Arrigo Sacchi', nationality: 'Italy', club: 'AC Milan', tactics: '4-4-2 (الضغط العالي وتدريب المنطقة)', achievements: '2 دوري الأبطال، ثورة دفاعية', overall: 95, rarity: 'Icon', price: 400000 },
  { id: 'm6', name: 'Johan Cruyff', nationality: 'Netherlands', club: 'Barcelona', tactics: '3-4-3 (الاستحواذ والمساحات)', achievements: '1 دوري الأبطال، وضع فلسفة برشلونة', overall: 95, rarity: 'Icon', price: 400000 },
  { id: 'm7', name: 'José Mourinho', nationality: 'Portugal', club: 'Real Madrid / Inter', tactics: '4-2-3-1 (الدفاع المنظم والارتداد)', achievements: '2 دوري الأبطال، ثلاثية الإنتر التاريخية', overall: 94, rarity: 'Master', price: 300000 },
  { id: 'm8', name: 'Jürgen Klopp', nationality: 'Germany', club: 'Liverpool', tactics: '4-3-3 (الضغط العكسي - Gegenpressing)', achievements: '1 دوري الأبطال، الدوري الإنجليزي', overall: 94, rarity: 'Elite', price: 320000 },
  { id: 'm9', name: 'Zinedine Zidane', nationality: 'France', club: 'Real Madrid', tactics: '4-3-3 (توازن الوسط وحرية الأطراف)', achievements: '3 دوري الأبطال متتالية', overall: 93, rarity: 'Master', price: 250000 },
  { id: 'm10', name: 'Arsène Wenger', nationality: 'France', club: 'Arsenal', tactics: '4-4-2 / 4-2-3-1 (الهجوم السلس)', achievements: 'الدوري الذهبي بلا خسارة، 3 دوري إنجليزي', overall: 93, rarity: 'Master', price: 250000 },
  { id: 'm11', name: 'Bob Paisley', nationality: 'England', club: 'Liverpool', tactics: '4-4-2 (الاستمرارية والانضباط)', achievements: '3 دوري الأبطال، 6 دوري إنجليزي', overall: 93, rarity: 'Icon', price: 280000 },
  { id: 'm12', name: 'Brian Clough', nationality: 'England', club: 'Nottingham Forest', tactics: '4-4-2 (التحفيز والخطوط المتقاربة)', achievements: '2 دوري الأبطال (مع نادٍ صغير)', overall: 92, rarity: 'Master', price: 200000 },
  { id: 'm13', name: 'Marcello Lippi', nationality: 'Italy', club: 'Juventus', tactics: '4-3-1-2 (الصرامة والقتالية)', achievements: '1 دوري الأبطال، 5 دوري إيطالي', overall: 92, rarity: 'Master', price: 200000 },
  { id: 'm14', name: 'Giovanni Trapattoni', nationality: 'Italy', club: 'Juventus / Bayern', tactics: 'الكاتيناشيو الإيطالي (الدفاع الصرف)', achievements: '1 دوري الأبطال، كؤوس أوروبية متعددة', overall: 92, rarity: 'Master', price: 200000 },
  { id: 'm15', name: 'Helenio Herrera', nationality: 'Argentina', club: 'Inter Milan', tactics: '5-3-2 (عرّاب الكاتيناشيو والدفاع)', achievements: '2 دوري الأبطال، 3 دوري إيطالي', overall: 91, rarity: 'Master', price: 180000 },
  { id: 'm16', name: 'Ottmar Hitzfeld', nationality: 'Germany', club: 'Bayern / Dortmund', tactics: '4-4-2 (توازن الوسط الهجومي)', achievements: '2 دوري الأبطال، 9 دوري ألماني', overall: 91, rarity: 'Master', price: 180000 },
  { id: 'm17', name: 'Jupp Heynckes', nationality: 'Germany', club: 'Bayern Munich', tactics: '4-2-3-1 (التحول الهجومي السريع)', achievements: '2 دوري الأبطال، ثلاثية بايرن 2013', overall: 91, rarity: 'Master', price: 180000 },
  { id: 'm18', name: 'Matt Busby', nationality: 'Scotland', club: 'Manchester United', tactics: '4-2-4 (هجوم الأجنحة والشباب)', achievements: '1 دوري الأبطال، إعادة بناء اليونايتد', overall: 91, rarity: 'Icon', price: 200000 },
  { id: 'm19', name: 'Louis van Gaal', nationality: 'Netherlands', club: 'Ajax / Bayern', tactics: '3-4-3 / 4-3-3 (الانضباط التمريري)', achievements: '1 دوري الأبطال، بطل دوريات متعددة', overall: 90, rarity: 'Master', price: 150000 },
  { id: 'm20', name: 'Vicente del Bosque', nationality: 'Spain', club: 'Real Madrid', tactics: '4-2-3-1 (التناغم والهدوء الفني)', achievements: '2 دوري الأبطال، بطولات الليغا', overall: 90, rarity: 'Master', price: 150000 },
  { id: 'm21', name: 'Valeriy Lobanovskyi', nationality: 'Ukraine', club: 'Dynamo Kyiv', tactics: 'اللعب الجماعي المنظم (الهندسة الرياضية)', achievements: 'كؤوس كؤوس أوروبية، ثورة علمية كروية', overall: 90, rarity: 'Master', price: 150000 },
  { id: 'm22', name: 'Ernst Happel', nationality: 'Austria', club: 'Feyenoord / Hamburg', tactics: '4-3-3 (الضغط المتقدم والشمولية)', achievements: '2 دوري الأبطال مع فريقين مختلفين', overall: 90, rarity: 'Master', price: 150000 },
  { id: 'm23', name: 'Fabio Capello', nationality: 'Italy', club: 'Real Madrid / Milan', tactics: '4-4-2 (الدفاع الحديدي والالتزام)', achievements: '1 دوري الأبطال، 5 دوري إيطالي', overall: 90, rarity: 'Master', price: 150000 },
  { id: 'm24', name: 'Diego Simeone', nationality: 'Argentina', club: 'Atletico Madrid', tactics: '4-4-2 (العمق الدفاعي والروح العالية)', achievements: '2 الدوري الإسباني، نهائي الأبطال مرتين', overall: 89, rarity: 'Gold', price: 80000 },
  { id: 'm25', name: 'Hansi Flick', nationality: 'Germany', club: 'Barcelona / Bayern', tactics: '4-2-3-1 (الضغط الخانق فائق السرعة)', achievements: 'سداسية بايرن تاريخية، دوري الأبطال', overall: 89, rarity: 'Gold', price: 80000 },
  { id: 'm26', name: 'Antonio Conte', nationality: 'Italy', club: 'Juventus / Chelsea', tactics: '3-5-2 (القوة البدنية والأطراف المتقدمة)', achievements: '4 دوري إيطالي، 1 دوري إنجليزي', overall: 88, rarity: 'Gold', price: 60000 },
  { id: 'm27', name: 'Xabi Alonso', nationality: 'Spain', club: 'Bayer Leverkusen', tactics: '3-4-2-1 (التمرير الذكي ولا هزيمة)', achievements: 'بوندسليغا تاريخية بدون هزيمة 2024', overall: 88, rarity: 'Elite', price: 120000 },
  { id: 'm28', name: 'Mikel Arteta', nationality: 'Spain', club: 'Arsenal', tactics: '4-3-3 (التحكم في المساحات والاستحواذ)', achievements: 'العودة للمنافسة القوية على البريميرليغ', overall: 87, rarity: 'Gold', price: 50000 },
  { id: 'm29', name: 'Simone Inzaghi', nationality: 'Italy', club: 'Inter Milan', tactics: '3-5-2 (العرضيات الهجومية وبناء الخلف)', achievements: 'الدوري الإيطالي، نهائي أبطال أوروبا', overall: 87, rarity: 'Gold', price: 50000 },
  { id: 'm30', name: 'Thomas Tuchel', nationality: 'Germany', club: 'Chelsea / Bayern', tactics: '3-4-2-1 (التكتيك المرن والأمان الدفاعي)', achievements: '1 دوري الأبطال مع تشيلسي', overall: 87, rarity: 'Gold', price: 50000 },
  { id: 'm31', name: 'Luis Enrique', nationality: 'Spain', club: 'PSG / Barcelona', tactics: '4-3-3 (الاستحواذ المباشر والسرعة)', achievements: 'ثلاثية تاريخية لبرشلونة 2015', overall: 87, rarity: 'Gold', price: 50000 },
  { id: 'm32', name: 'Unai Emery', nationality: 'Spain', club: 'Aston Villa', tactics: '4-4-2 (المصائد التسللية والهجمات المضادة)', achievements: '4 الدوري الأوروبي (أكثر من حققها)', overall: 87, rarity: 'Gold', price: 50000 },
  { id: 'm33', name: 'Julian Nagelsmann', nationality: 'Germany', club: 'Bayern / Germany', tactics: '3-1-4-2 (المرونة العالية والشباب)', achievements: 'بطولة البوندسليغا والتميز الفني الشاب', overall: 86, rarity: 'Gold', price: 40000 },
  { id: 'm34', name: 'Gian Piero Gasperini', nationality: 'Italy', club: 'Atalanta', tactics: '3-4-3 (الرقابة الفردية الصارمة رجل لرجل)', achievements: 'الدوري الأوروبي 2024 مع أتالانتا', overall: 86, rarity: 'Gold', price: 40000 },
  { id: 'm35', name: 'Massimiliano Allegri', nationality: 'Italy', club: 'Juventus', tactics: '4-3-3 / 3-5-2 (التوازن والواقعية)', achievements: '5 دوري إيطالي، نهائي الأبطال مرتين', overall: 86, rarity: 'Gold', price: 40000 },
  { id: 'm36', name: 'Roberto Mancini', nationality: 'Italy', club: 'Man City / Inter', tactics: '4-3-3 (الأمان في الوسط والهجوم المنظم)', achievements: 'كسر هيمنة اليونايتد، الدوري الإنجليزي', overall: 86, rarity: 'Gold', price: 40000 },
  { id: 'm37', name: 'Claudio Ranieri', nationality: 'Italy', club: 'Leicester City', tactics: '4-4-2 (التجانس والمعجزة الكروية)', achievements: 'معجزة تحقيق البريميرليغ مع ليستر', overall: 85, rarity: 'Gold', price: 30000 },
  { id: 'm38', name: 'Rafael Benítez', nationality: 'Spain', club: 'Liverpool / Valencia', tactics: '4-2-3-1 (التنظيم التكتيكي والتحولات)', achievements: 'دوري الأبطال (معجزة إسطنبول)، الدوري الإسباني', overall: 85, rarity: 'Gold', price: 30000 },
  { id: 'm39', name: 'Marcelo Gallardo', nationality: 'Argentina', club: 'River Plate', tactics: '4-1-3-2 (الاندفاع العالي والتحفيز)', achievements: '2 كوبا ليبرتادوريس، هوليوود أمريكا الجنوبية', overall: 85, rarity: 'Gold', price: 30000 },
  { id: 'm40', name: 'Ruben Amorim', nationality: 'Portugal', club: 'Sporting CP / Man Utd', tactics: '3-4-3 (الكتلة الدفاعية والتنظيم اللامع)', achievements: 'كسر احتكار الدوري البرتغالي مرتين', overall: 85, rarity: 'Gold', price: 30000 },
  { id: 'm41', name: 'Jorge Jesus', nationality: 'Portugal', club: 'Al-Hilal', tactics: '4-2-3-1 (التوازن والتحرك المستمر)', achievements: 'سلسلة اللاهزيمة القياسية عالمياً، الدوري البرتغالي', overall: 85, rarity: 'Gold', price: 30000 },
  { id: 'm42', name: 'Abel Ferreira', nationality: 'Portugal', club: 'Palmeiras', tactics: '4-2-3-1 (التكتيك الدفاعي وحسم المرتدات)', achievements: '2 كوبا ليبرتادوريس متتالية', overall: 84, rarity: 'Gold', price: 20000 },
  { id: 'm43', name: 'Thiago Motta', nationality: 'Italy', club: 'Juventus / Bologna', tactics: '2-7-2 / 4-1-4-1 (اللامركزية المرنة)', achievements: 'تأهيل بولونيا التاريخي للأبطال', overall: 84, rarity: 'Gold', price: 20000 },
  { id: 'm44', name: 'Guus Hiddink', nationality: 'Netherlands', club: 'Chelsea / PSV', tactics: '4-3-3 (الفاعلية الهجومية وحرية الوسط)', achievements: 'دوري الأبطال، بطولات متعددة', overall: 84, rarity: 'Gold', price: 20000 },
  { id: 'm45', name: 'Mircea Lucescu', nationality: 'Romania', club: 'Shakhtar Donetsk', tactics: '4-2-3-1 (اكتشاف المواهب والكرة السريعة)', achievements: '8 دوري أوكراني، الدوري الأوروبي', overall: 83, rarity: 'Silver', price: 10000 },
  { id: 'm46', name: 'Manuel Pellegrini', nationality: 'Chile', club: 'Real Betis / Man City', tactics: '4-2-3-1 (الوسط المبدع والارتداد الهجومي)', achievements: 'الدوري الإنجليزي الممتاز، بناء فرق مبدعة', overall: 83, rarity: 'Silver', price: 10000 },
  { id: 'm47', name: 'Erik ten Hag', nationality: 'Netherlands', club: 'Ajax', tactics: '4-3-3 (الكرة الممتعة الشاملة الحديثة)', achievements: 'نصف نهائي دوري الأبطال التاريخي مع أياكس', overall: 83, rarity: 'Silver', price: 10000 },
  { id: 'm48', name: 'Stefano Pioli', nationality: 'Italy', club: 'AC Milan', tactics: '4-2-3-1 (السرعة على الأطراف)', achievements: 'إعادة ميلان للتتويج بالدوري الإيطالي', overall: 82, rarity: 'Silver', price: 8000 },
  { id: 'm49', name: 'Ange Postecoglou', nationality: 'Australia', club: 'Tottenham', tactics: '4-3-3 (الهجوم المطلق بلا تراجع)', achievements: 'ثورة أسلوب هجومي سريع وشجاع', overall: 82, rarity: 'Silver', price: 8000 },
  { id: 'm50', name: 'Sebastian Hoeneß', nationality: 'Germany', club: 'Stuttgart', tactics: '4-2-2-2 (التمرير القصير والتحول)', achievements: 'وصافة بوندسليغا إعجازية مع شتوتغارت', overall: 81, rarity: 'Bronze', price: 5000 }
];
