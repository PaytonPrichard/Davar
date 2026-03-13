import type { Passage } from "@/types";

export const PASSAGES: Passage[] = [
  // ===== BEGINNER =====
  {
    id: "my-family",
    title: "My Family",
    titleHebrew: "המשפחה שלי",
    level: "beginner",
    vocabIds: [
      "builtin:ima", "builtin:aba", "builtin:ach", "builtin:achot",
      "builtin:saba", "builtin:savta", "builtin:mishpacha", "builtin:katan",
      "builtin:ani-ohev", "builtin:yesh-li",
    ],
    lines: [
      {
        hebrew: "שמי דוד.",
        transliteration: "Shmi David.",
        translation: "My name is David.",
      },
      {
        hebrew: "יש לי משפחה גדולה.",
        transliteration: "Yesh li mishpacha gdola.",
        translation: "I have a big family.",
      },
      {
        hebrew: "האחות שלי קטנה.",
        transliteration: "Ha'achot sheli ktana.",
        translation: "My sister is small.",
      },
      {
        hebrew: "האח שלי לומד באוניברסיטה.",
        transliteration: "Ha'ach sheli lomed ba'universita.",
        translation: "My brother studies at the university.",
      },
      {
        hebrew: "סבתא וסבא גרים בירושלים.",
        transliteration: "Savta ve'saba garim b'Yerushalayim.",
        translation: "Grandma and grandpa live in Jerusalem.",
      },
      {
        hebrew: "אני אוהב את המשפחה שלי.",
        transliteration: "Ani ohev et ha'mishpacha sheli.",
        translation: "I love my family.",
      },
    ],
  },
  {
    id: "at-the-market",
    title: "At the Market",
    titleHebrew: "בשוק",
    level: "beginner",
    vocabIds: [
      "builtin:tapuach", "builtin:agvaniya", "builtin:lechem", "builtin:chalav",
      "builtin:bevakasha", "builtin:toda-raba", "builtin:lehitraot",
      "builtin:kamah-zeh-oleh", "builtin:ani-rotzeh", "builtin:bananah",
      "builtin:shuk", "builtin:liknot",
    ],
    lines: [
      {
        hebrew: "אני הולך לשוק.",
        transliteration: "Ani holech la'shuk.",
        translation: "I am going to the market.",
      },
      {
        hebrew: "אני רוצה לקנות תפוחים.",
        transliteration: "Ani rotze liknot tapuchim.",
        translation: "I want to buy apples.",
      },
      {
        hebrew: "כמה עולים העגבניות?",
        transliteration: "Kama olim ha'agvaniyot?",
        translation: "How much do the tomatoes cost?",
      },
      {
        hebrew: "תן לי חצי קילו בננות, בבקשה.",
        transliteration: "Ten li chatzi kilo bananot, bevakasha.",
        translation: "Give me half a kilo of bananas, please.",
      },
      {
        hebrew: "אני צריך גם לחם וחלב.",
        transliteration: "Ani tzarich gam lechem ve'chalav.",
        translation: "I also need bread and milk.",
      },
      {
        hebrew: "תודה רבה. להתראות!",
        transliteration: "Toda raba. Lehitraot!",
        translation: "Thank you very much. Goodbye!",
      },
    ],
  },

  {
    id: "daily-routine",
    title: "My Daily Routine",
    titleHebrew: "השגרה היומית שלי",
    level: "beginner",
    vocabIds: [
      "builtin:boker-tov", "builtin:layla-tov", "builtin:le'echol",
      "builtin:la'avod", "builtin:lishon", "builtin:kafeh",
      "builtin:lechem", "builtin:mitah", "builtin:mitbach",
      "builtin:arucha", "builtin:otobus",
    ],
    lines: [
      {
        hebrew: "אני קם בשבע בבוקר.",
        transliteration: "Ani kam be'sheva ba'boker.",
        translation: "I wake up at seven in the morning.",
      },
      {
        hebrew: "אני שותה קפה ואוכל לחם בארוחת בוקר.",
        transliteration: "Ani shoteh kafeh ve'ochel lechem ba'aruchat boker.",
        translation: "I drink coffee and eat bread for breakfast.",
      },
      {
        hebrew: "אני הולך לעבודה באוטובוס.",
        transliteration: "Ani holech la'avodah ba'otobus.",
        translation: "I go to work by bus.",
      },
      {
        hebrew: "אני חוזר הביתה בשעה חמש.",
        transliteration: "Ani chozer ha'bayta be'sha'a chamesh.",
        translation: "I come home at five o'clock.",
      },
      {
        hebrew: "בערב אני אוכל ארוחת ערב עם המשפחה.",
        transliteration: "Ba'erev ani ochel aruchat erev im ha'mishpacha.",
        translation: "In the evening I eat dinner with the family.",
      },
      {
        hebrew: "אני הולך לישון בשעה עשר.",
        transliteration: "Ani holech lishon be'sha'a eser.",
        translation: "I go to sleep at ten o'clock.",
      },
    ],
  },
  {
    id: "at-the-cafe",
    title: "At the Cafe",
    titleHebrew: "בבית קפה",
    level: "beginner",
    vocabIds: [
      "builtin:kafeh", "builtin:te", "builtin:ugah", "builtin:chalav",
      "builtin:bevakasha", "builtin:todah", "builtin:kamah-zeh-oleh",
      "builtin:shulchan", "builtin:kiseh",
      "builtin:tafrit", "builtin:beyachad",
    ],
    lines: [
      {
        hebrew: "אני נכנס לבית קפה ויושב ליד השולחן.",
        transliteration: "Ani nichnas le'beit kafeh ve'yoshev leyad ha'shulchan.",
        translation: "I enter a cafe and sit by the table.",
      },
      {
        hebrew: "בבקשה, אפשר לראות את התפריט?",
        transliteration: "Bevakasha, efshar lirot et ha'tafrit?",
        translation: "Please, may I see the menu?",
      },
      {
        hebrew: "אני רוצה קפה עם חלב ועוגת שוקולד.",
        transliteration: "Ani rotze kafeh im chalav ve'ugat shokolad.",
        translation: "I want coffee with milk and chocolate cake.",
      },
      {
        hebrew: "העוגה טעימה מאוד!",
        transliteration: "Ha'uga te'ima me'od!",
        translation: "The cake is very tasty!",
      },
      {
        hebrew: "כמה זה עולה הכל ביחד?",
        transliteration: "Kama zeh oleh hakol be'yachad?",
        translation: "How much does it all cost together?",
      },
      {
        hebrew: "תודה רבה, היה נעים. להתראות!",
        transliteration: "Toda raba, haya na'im. Lehitraot!",
        translation: "Thank you very much, it was nice. Goodbye!",
      },
    ],
  },
  {
    id: "meeting-a-friend",
    title: "Meeting a Friend",
    titleHebrew: "פגישה עם חבר",
    level: "beginner",
    vocabIds: [
      "builtin:shalom", "builtin:chaver", "builtin:ma-nishma",
      "builtin:beseder", "builtin:lehitraot", "builtin:sameach",
      "builtin:yalla", "builtin:tov",
      "builtin:harbeh", "builtin:zman", "builtin:rayon", "builtin:kef", "builtin:metzuyan",
    ],
    lines: [
      {
        hebrew: "שלום יוסי! מה נשמע?",
        transliteration: "Shalom Yosi! Ma nishma?",
        translation: "Hi Yosi! How are you?",
      },
      {
        hebrew: "בסדר גמור, תודה! לא ראיתי אותך הרבה זמן.",
        transliteration: "Beseder gamur, toda! Lo ra'iti otcha harbeh zman.",
        translation: "Totally fine, thanks! I haven't seen you in a long time.",
      },
      {
        hebrew: "נכון, מה חדש אצלך?",
        transliteration: "Nachon, ma chadash etzlecha?",
        translation: "Right, what's new with you?",
      },
      {
        hebrew: "בוא נלך לטייל בפארק!",
        transliteration: "Bo nelech letayel ba'park!",
        translation: "Let's go for a walk in the park!",
      },
      {
        hebrew: "רעיון מצוין, יאללה!",
        transliteration: "Ra'ayon metzuyan, yalla!",
        translation: "Excellent idea, let's go!",
      },
      {
        hebrew: "היה כיף. נתראה בקרוב, להתראות!",
        transliteration: "Haya kef. Nitraeh be'karov, lehitraot!",
        translation: "It was fun. See you soon, goodbye!",
      },
    ],
  },

  // ===== INTERMEDIATE =====
  {
    id: "a-day-in-tel-aviv",
    title: "A Day in Tel Aviv",
    titleHebrew: "יום בתל אביב",
    level: "intermediate",
    vocabIds: [
      "builtin:yam", "builtin:shemesh", "builtin:mistaada", "builtin:chanut",
      "builtin:rechov", "builtin:chof", "builtin:ayef", "builtin:cham",
      "builtin:salat", "builtin:tov",
      "builtin:rakevet", "builtin:chumus", "builtin:pita", "builtin:matana",
    ],
    lines: [
      {
        hebrew: "בבוקר נסעתי לתל אביב ברכבת.",
        transliteration: "Ba'boker nasa'ti le'Tel Aviv ba'rakevet.",
        translation: "In the morning I traveled to Tel Aviv by train.",
      },
      {
        hebrew: "הלכתי לחוף הים ושחיתי במים.",
        transliteration: "Halachti le'chof ha'yam ve'sachiti ba'mayim.",
        translation: "I went to the beach and swam in the water.",
      },
      {
        hebrew: "השמש הייתה חזקה מאוד אז שמתי משקפי שמש.",
        transliteration: "Ha'shemesh hayta chazaka me'od az samti mishkefei shemesh.",
        translation: "The sun was very strong so I put on sunglasses.",
      },
      {
        hebrew: "בצהריים אכלתי במסעדה ליד הים.",
        transliteration: "Ba'tzohorayim achalti be'mis'ada leyad ha'yam.",
        translation: "At noon I ate at a restaurant by the sea.",
      },
      {
        hebrew: "הזמנתי חומוס, סלט ופיתה טרייה.",
        transliteration: "Hizmanti chumus, salat u'pita triya.",
        translation: "I ordered hummus, salad, and fresh pita.",
      },
      {
        hebrew: "אחר כך טיילתי ברחוב דיזנגוף.",
        transliteration: "Achar kach tiyalti bi'rchov Dizengoff.",
        translation: "Afterwards I walked along Dizengoff Street.",
      },
      {
        hebrew: "קניתי מתנה קטנה בחנות מקומית.",
        transliteration: "Kaniti matana ktana be'chanut mekomit.",
        translation: "I bought a small gift at a local shop.",
      },
      {
        hebrew: "חזרתי הביתה בערב, עייף אבל מרוצה.",
        transliteration: "Chazarti ha'bayta ba'erev, ayef aval merutze.",
        translation: "I returned home in the evening, tired but happy.",
      },
    ],
  },
  {
    id: "at-the-hotel",
    title: "At the Hotel",
    titleHebrew: "במלון",
    level: "intermediate",
    vocabIds: [
      "builtin:shalom", "builtin:malon", "builtin:todah", "builtin:layla",
      "builtin:yam", "builtin:sheva", "builtin:eser", "builtin:shalosh",
      "builtin:yesh-li", "builtin:tov",
      "builtin:cheder", "builtin:hazmana", "builtin:nof", "builtin:nehedar", "builtin:arucha",
    ],
    lines: [
      {
        hebrew: "שלום, יש לי הזמנה על שם כהן.",
        transliteration: "Shalom, yesh li hazmana al shem Cohen.",
        translation: "Hello, I have a reservation under the name Cohen.",
      },
      {
        hebrew: "ההזמנה היא לשלושה לילות.",
        transliteration: "Ha'hazmana hi li'shlosha leilot.",
        translation: "The reservation is for three nights.",
      },
      {
        hebrew: "האם יש חדר עם נוף לים?",
        transliteration: "Ha'im yesh cheder im nof la'yam?",
        translation: "Is there a room with a sea view?",
      },
      {
        hebrew: "באיזו שעה ארוחת הבוקר?",
        transliteration: "Be'eizo sha'a aruchat ha'boker?",
        translation: "What time is breakfast?",
      },
      {
        hebrew: "ארוחת הבוקר מוגשת בין שבע לעשר.",
        transliteration: "Aruchat ha'boker mugeshet bein sheva le'eser.",
        translation: "Breakfast is served between seven and ten.",
      },
      {
        hebrew: "האם יש בריכת שחייה במלון?",
        transliteration: "Ha'im yesh brechat schiya ba'malon?",
        translation: "Is there a swimming pool at the hotel?",
      },
      {
        hebrew: "הסיסמה לאינטרנט היא שם המלון.",
        transliteration: "Ha'sisma la'internet hi shem ha'malon.",
        translation: "The Wi-Fi password is the hotel name.",
      },
      {
        hebrew: "תודה, החדר נהדר. נהנה מאוד מהשהייה.",
        transliteration: "Toda, ha'cheder nehedar. Nehene me'od me'ha'shehiya.",
        translation: "Thanks, the room is wonderful. Enjoying the stay very much.",
      },
    ],
  },

  {
    id: "at-the-doctor",
    title: "At the Doctor",
    titleHebrew: "אצל הרופא",
    level: "intermediate",
    vocabIds: [
      "builtin:rosh", "builtin:beten", "builtin:beit-cholim",
      "builtin:cham", "builtin:chalash", "builtin:mayim",
      "builtin:yom", "builtin:shalosh",
      "builtin:keev", "builtin:trufa", "builtin:harbeh",
    ],
    lines: [
      {
        hebrew: "שלום דוקטור, אני לא מרגיש טוב.",
        transliteration: "Shalom doktor, ani lo margish tov.",
        translation: "Hello doctor, I don't feel well.",
      },
      {
        hebrew: "כואב לי הראש ויש לי חום גבוה.",
        transliteration: "Ko'ev li ha'rosh ve'yesh li chom gavoha.",
        translation: "I have a headache and a high fever.",
      },
      {
        hebrew: "מתי התחילו הכאבים?",
        transliteration: "Matai hitchilu ha'ke'evim?",
        translation: "When did the pains start?",
      },
      {
        hebrew: "לפני שלושה ימים, וגם הבטן כואבת.",
        transliteration: "Lifnei shlosha yamim, ve'gam ha'beten ko'evet.",
        translation: "Three days ago, and my stomach hurts too.",
      },
      {
        hebrew: "בוא נבדוק אותך. תפתח את הפה בבקשה.",
        transliteration: "Bo nivdok otcha. Tiftach et ha'peh bevakasha.",
        translation: "Let me examine you. Open your mouth please.",
      },
      {
        hebrew: "אני כותב לך מרשם לתרופות.",
        transliteration: "Ani kotev lecha mirshahm le'trufot.",
        translation: "I'm writing you a prescription for medicine.",
      },
      {
        hebrew: "תשתה הרבה מים ותנוח בבית.",
        transliteration: "Tishteh harbeh mayim ve'tanuach ba'bayit.",
        translation: "Drink lots of water and rest at home.",
      },
      {
        hebrew: "תחזור אלי בעוד שבוע לבדיקה.",
        transliteration: "Tachazor elai be'od shavua li'vdika.",
        translation: "Come back to me in a week for a checkup.",
      },
    ],
  },
  {
    id: "taking-the-bus",
    title: "Taking the Bus",
    titleHebrew: "נסיעה באוטובוס",
    level: "intermediate",
    vocabIds: [
      "builtin:tachana", "builtin:rechov", "builtin:ir",
      "builtin:ramzor", "builtin:daka", "builtin:eser",
      "builtin:todah", "builtin:slicha",
      "builtin:otobus", "builtin:kartis", "builtin:nahag",
    ],
    lines: [
      {
        hebrew: "אני מחכה בתחנת האוטובוס ברחוב הרצל.",
        transliteration: "Ani mechakeh be'tachanat ha'otobus bi'rchov Herzl.",
        translation: "I am waiting at the bus stop on Herzl Street.",
      },
      {
        hebrew: "סליחה, האוטובוס הזה נוסע למרכז העיר?",
        transliteration: "Slicha, ha'otobus ha'ze nose'a le'merkaz ha'ir?",
        translation: "Excuse me, does this bus go to the city center?",
      },
      {
        hebrew: "כן, תעלה. כרטיס אחד בבקשה.",
        transliteration: "Ken, ta'aleh. Kartis echad bevakasha.",
        translation: "Yes, get on. One ticket please.",
      },
      {
        hebrew: "אני יושב ליד החלון ומסתכל בחוץ.",
        transliteration: "Ani yoshev leyad ha'chalon u'mistakel ba'chutz.",
        translation: "I sit by the window and look outside.",
      },
      {
        hebrew: "האוטובוס עובר ליד הפארק הגדול ובניין העירייה.",
        transliteration: "Ha'otobus over leyad ha'park ha'gadol u'vinyan ha'iriya.",
        translation: "The bus passes by the big park and the city hall building.",
      },
      {
        hebrew: "עוד שתי תחנות ואני יורד.",
        transliteration: "Od shtei tachanot ve'ani yored.",
        translation: "Two more stops and I get off.",
      },
      {
        hebrew: "תודה נהג! יום טוב.",
        transliteration: "Toda nahag! Yom tov.",
        translation: "Thanks driver! Have a good day.",
      },
    ],
  },
  {
    id: "shabbat-dinner",
    title: "Shabbat Dinner",
    titleHebrew: "ארוחת שבת",
    level: "intermediate",
    vocabIds: [
      "builtin:shabbat", "builtin:mishpacha", "builtin:lechem",
      "builtin:yayin", "builtin:shulchan", "builtin:sameach",
      "builtin:lashir", "builtin:savta",
      "builtin:ner", "builtin:chalah", "builtin:marak", "builtin:bracha", "builtin:beyachad",
    ],
    lines: [
      {
        hebrew: "ביום שישי כל המשפחה מתאספת לארוחת שבת.",
        transliteration: "Be'yom shishi kol ha'mishpacha mit'asefet le'aruchat Shabbat.",
        translation: "On Friday the whole family gathers for Shabbat dinner.",
      },
      {
        hebrew: "אמא מדליקה את נרות השבת ומברכת.",
        transliteration: "Ima madlika et nerot ha'Shabbat u'mevarechet.",
        translation: "Mom lights the Shabbat candles and recites the blessing.",
      },
      {
        hebrew: "אבא עושה קידוש על היין.",
        transliteration: "Aba oseh kidush al ha'yayin.",
        translation: "Dad makes kiddush over the wine.",
      },
      {
        hebrew: "כולם נוטלים ידיים ואוכלים חלה טרייה.",
        transliteration: "Kulam notlim yadayim ve'ochlim chalah triya.",
        translation: "Everyone washes hands and eats fresh challah.",
      },
      {
        hebrew: "סבתא הכינה מרק, דג ואורז טעים.",
        transliteration: "Savta hechina marak, dag ve'orez ta'im.",
        translation: "Grandma prepared soup, fish, and tasty rice.",
      },
      {
        hebrew: "אחרי האוכל אנחנו שרים שירי שבת ביחד.",
        transliteration: "Acharei ha'ochel anachnu sharim shirei Shabbat be'yachad.",
        translation: "After the food we sing Shabbat songs together.",
      },
      {
        hebrew: "הילדים אומרים ברכת המזון.",
        transliteration: "Ha'yeladim omrim birkat ha'mazon.",
        translation: "The children recite the grace after meals.",
      },
      {
        hebrew: "שבת שלום לכולם!",
        transliteration: "Shabbat shalom le'kulam!",
        translation: "Shabbat shalom to everyone!",
      },
    ],
  },

  // ===== ADVANCED =====
  {
    id: "the-weather-in-israel",
    title: "The Weather in Israel",
    titleHebrew: "מזג האוויר בישראל",
    level: "advanced",
    vocabIds: [
      "builtin:geshem", "builtin:sheleg", "builtin:ruach", "builtin:shemesh",
      "builtin:cham", "builtin:kar", "builtin:har", "builtin:yam",
      "builtin:gadol", "builtin:shamayim",
      "builtin:kayitz", "builtin:choref", "builtin:aviv", "builtin:stav",
      "builtin:avir", "builtin:ezor", "builtin:medina",
    ],
    lines: [
      {
        hebrew: "מזג האוויר בישראל משתנה מאזור לאזור.",
        transliteration: "Mezeg ha'avir be'Yisrael mishtane me'ezor le'ezor.",
        translation: "The weather in Israel varies from region to region.",
      },
      {
        hebrew: "בקיץ, הטמפרטורה עולה מעל שלושים מעלות ברוב הארץ.",
        transliteration: "Ba'kayitz, ha'temperatura ola me'al shloshim ma'alot be'rov ha'aretz.",
        translation: "In summer, the temperature rises above thirty degrees in most of the country.",
      },
      {
        hebrew: "בחורף יורד גשם בצפון ובמרכז, ולפעמים יורד שלג בירושלים.",
        transliteration: "Ba'choref yored geshem ba'tzafon u'va'merkaz, ve'lif'amim yored sheleg b'Yerushalayim.",
        translation: "In winter it rains in the north and center, and sometimes it snows in Jerusalem.",
      },
      {
        hebrew: "האביב והסתיו הם העונות הנעימות ביותר לטיולים.",
        transliteration: "Ha'aviv ve'ha'stav hem ha'onot ha'ne'imot be'yoter le'tiyulim.",
        translation: "Spring and autumn are the most pleasant seasons for trips.",
      },
      {
        hebrew: "באילת, במדבר הנגב, כמעט לא יורד גשם כל השנה.",
        transliteration: "Be'Eilat, ba'midbar ha'Negev, kim'at lo yored geshem kol ha'shana.",
        translation: "In Eilat, in the Negev desert, it almost never rains all year.",
      },
      {
        hebrew: "הלחות הגבוהה באזור החוף מקשה על הימים החמים.",
        transliteration: "Ha'lachut ha'gvoha be'ezor ha'chof maksha al ha'yamim ha'chamim.",
        translation: "The high humidity in the coastal area makes the hot days harder.",
      },
      {
        hebrew: "רוח חמסין מגיעה לפעמים מהמדבר ומעלה את הטמפרטורה בחדות.",
        transliteration: "Ru'ach chamsin magi'a lif'amim me'ha'midbar u'ma'ala et ha'temperatura be'chadut.",
        translation: "A hamsin wind sometimes comes from the desert and sharply raises the temperature.",
      },
      {
        hebrew: "ישראלים רבים מעדיפים לנסוע לצפון כדי לברוח מהחום בקיץ.",
        transliteration: "Yisre'elim rabim ma'adifim lin'so'a la'tzafon kedei livro'ach me'ha'chom ba'kayitz.",
        translation: "Many Israelis prefer to travel north to escape the summer heat.",
      },
      {
        hebrew: "למרות גודלה הקטן של המדינה, יש בה מגוון אקלימי מפתיע.",
        transliteration: "Lamrot godla ha'katan shel ha'medina, yesh ba migvan aklimi mafti'a.",
        translation: "Despite the country's small size, it has a surprising variety of climates.",
      },
    ],
  },
  {
    id: "job-interview",
    title: "Job Interview",
    titleHebrew: "ראיון עבודה",
    level: "advanced",
    vocabIds: [
      "builtin:shalom", "builtin:avodah", "builtin:misrad", "builtin:toda-raba",
      "builtin:shanah", "builtin:chamesh", "builtin:esrim", "builtin:eser",
      "builtin:bhatzlacha", "builtin:chazak",
      "builtin:nisayon", "builtin:tzevet", "builtin:tafkid", "builtin:anashim",
    ],
    lines: [
      {
        hebrew: "שלום, שמי רונית ואני מגישה מועמדות לתפקיד מנהלת שיווק.",
        transliteration: "Shalom, shmi Ronit ve'ani magisha mu'amadut la'tafkid menahelet shivuk.",
        translation: "Hello, my name is Ronit and I am applying for the marketing manager position.",
      },
      {
        hebrew: "יש לי ניסיון של חמש שנים בתחום השיווק הדיגיטלי.",
        transliteration: "Yesh li nisayon shel chamesh shanim ba'tchum ha'shivuk ha'digitali.",
        translation: "I have five years of experience in the field of digital marketing.",
      },
      {
        hebrew: "בתפקיד הקודם שלי ניהלתי צוות של עשרה אנשים.",
        transliteration: "Ba'tafkid ha'kodem sheli nihalti tzevet shel asara anashim.",
        translation: "In my previous role I managed a team of ten people.",
      },
      {
        hebrew: "הצלחתי להגדיל את המכירות בעשרים אחוז תוך שנה.",
        transliteration: "Hitzlachti lehagdil et ha'mechirot be'esrim achuz toch shana.",
        translation: "I managed to increase sales by twenty percent within a year.",
      },
      {
        hebrew: "אני שולטת באנגלית ברמה גבוהה ויש לי תואר במנהל עסקים.",
        transliteration: "Ani sholetet be'anglit be'rama gvoha ve'yesh li to'ar be'minhal asakim.",
        translation: "I am fluent in English at a high level and have a degree in business administration.",
      },
      {
        hebrew: "מה הם האתגרים העיקריים של התפקיד הזה?",
        transliteration: "Ma hem ha'etgarim ha'ikariyim shel ha'tafkid ha'ze?",
        translation: "What are the main challenges of this position?",
      },
      {
        hebrew: "אני מחפשת סביבת עבודה שמעודדת יצירתיות וחדשנות.",
        transliteration: "Ani mechapeset svivat avoda she'me'odedet yetzirati'ut ve'chadshanu't.",
        translation: "I am looking for a work environment that encourages creativity and innovation.",
      },
      {
        hebrew: "מתי תוכלו לעדכן אותי לגבי ההחלטה?",
        transliteration: "Matai tuchlu le'adken oti legabei ha'hachlata?",
        translation: "When will you be able to update me regarding the decision?",
      },
      {
        hebrew: "תודה רבה על ההזדמנות, אני מקווה לשמוע מכם בקרוב.",
        transliteration: "Toda raba al ha'hizdamnut, ani mekava lishmo'a mikem be'karov.",
        translation: "Thank you very much for the opportunity, I hope to hear from you soon.",
      },
    ],
  },
  {
    id: "renting-apartment",
    title: "Renting an Apartment",
    titleHebrew: "השכרת דירה",
    level: "advanced",
    vocabIds: [
      "builtin:dira", "builtin:delet", "builtin:chalon", "builtin:mitbach",
      "builtin:shachen", "builtin:mafteach", "builtin:chodesh",
      "builtin:gadol", "builtin:chadash",
      "builtin:cheder", "builtin:mirpeset", "builtin:choze", "builtin:shekel", "builtin:harbeh",
    ],
    lines: [
      {
        hebrew: "אני מחפש דירה להשכרה באזור המרכז.",
        transliteration: "Ani mechapes dira le'haskara be'ezor ha'merkaz.",
        translation: "I am looking for an apartment to rent in the central area.",
      },
      {
        hebrew: "מצאתי מודעה לדירת שלושה חדרים עם מרפסת.",
        transliteration: "Matzati moda'a le'dirat shlosha chadarim im mirpeset.",
        translation: "I found a listing for a three-room apartment with a balcony.",
      },
      {
        hebrew: "באתי לראות את הדירה. החלונות גדולים ויש הרבה אור.",
        transliteration: "Bati lirot et ha'dira. Ha'chalonot gdolim ve'yesh harbeh or.",
        translation: "I came to see the apartment. The windows are big and there is lots of light.",
      },
      {
        hebrew: "המטבח חדש והסלון מרווח.",
        transliteration: "Ha'mitbach chadash ve'ha'salon marvach.",
        translation: "The kitchen is new and the living room is spacious.",
      },
      {
        hebrew: "כמה עולה שכר הדירה לחודש?",
        transliteration: "Kama oleh schar ha'dira la'chodesh?",
        translation: "How much is the rent per month?",
      },
      {
        hebrew: "ארבעת אלפים שקלים, כולל ועד בית.",
        transliteration: "Arba'at alafim shkalim, kolel va'ad bayit.",
        translation: "Four thousand shekels, including building maintenance fee.",
      },
      {
        hebrew: "האם אפשר לחתום על חוזה לשנה?",
        transliteration: "Ha'im efshar lachtom al choze le'shana?",
        translation: "Is it possible to sign a lease for a year?",
      },
      {
        hebrew: "השכנים שקטים ונחמדים, תרגיש בבית.",
        transliteration: "Ha'shchenim shketim ve'nechmadim, targish ba'bayit.",
        translation: "The neighbors are quiet and nice, you'll feel at home.",
      },
      {
        hebrew: "מצוין, אני רוצה לקחת את הדירה. מתי אפשר להיכנס?",
        transliteration: "Metzuyan, ani rotze lakachat et ha'dira. Matai efshar lehikanes?",
        translation: "Excellent, I want to take the apartment. When can I move in?",
      },
    ],
  },
  {
    id: "at-the-university",
    title: "At the University",
    titleHebrew: "באוניברסיטה",
    level: "advanced",
    vocabIds: [
      "builtin:universita", "builtin:sefer", "builtin:sifriya",
      "builtin:mivkhan", "builtin:shiur", "builtin:talmid",
      "builtin:moreh", "builtin:lilmod",
      "builtin:hartzaa", "builtin:meanyen", "builtin:makom", "builtin:harbeh",
    ],
    lines: [
      {
        hebrew: "היום היה היום הראשון שלי באוניברסיטה.",
        transliteration: "Ha'yom haya ha'yom ha'rishon sheli ba'universita.",
        translation: "Today was my first day at the university.",
      },
      {
        hebrew: "הקמפוס גדול ויש הרבה בניינים ומגרשים.",
        transliteration: "Ha'kampus gadol ve'yesh harbeh binyanim u'migrashim.",
        translation: "The campus is big and there are many buildings and fields.",
      },
      {
        hebrew: "ההרצאה הראשונה הייתה בהיסטוריה של המזרח התיכון.",
        transliteration: "Ha'hartzaa ha'rishona hayta be'historia shel ha'Mizrach ha'Tichon.",
        translation: "The first lecture was on the history of the Middle East.",
      },
      {
        hebrew: "המרצה מעניין מאוד ומדבר בצורה ברורה.",
        transliteration: "Ha'martzeh me'anyen me'od u'medaber be'tzura brura.",
        translation: "The lecturer is very interesting and speaks clearly.",
      },
      {
        hebrew: "אחרי ההרצאה הלכתי לספרייה ללמוד.",
        transliteration: "Acharei ha'hartzaa halachti la'sifriya lilmod.",
        translation: "After the lecture I went to the library to study.",
      },
      {
        hebrew: "יש הרבה ספרים ומקום שקט לקריאה.",
        transliteration: "Yesh harbeh sfarim u'makom sheket li'kri'a.",
        translation: "There are many books and a quiet place for reading.",
      },
      {
        hebrew: "המבחן הראשון יהיה בעוד חודשיים.",
        transliteration: "Ha'mivkhan ha'rishon yihyeh be'od chodshayim.",
        translation: "The first exam will be in two months.",
      },
      {
        hebrew: "אני צריך ללמוד הרבה, אבל אני מתרגש מהלימודים.",
        transliteration: "Ani tzarich lilmod harbeh, aval ani mitragesh me'ha'limudim.",
        translation: "I need to study a lot, but I'm excited about my studies.",
      },
    ],
  },
  {
    id: "israeli-holidays",
    title: "Israeli Holidays",
    titleHebrew: "חגים בישראל",
    level: "advanced",
    vocabIds: [
      "builtin:shanah", "builtin:shanah-tovah", "builtin:mishpacha",
      "builtin:sameach", "builtin:lechem", "builtin:shabbat",
      "builtin:shamayim", "builtin:perach", "builtin:yom",
      "builtin:chag", "builtin:dvash", "builtin:ner", "builtin:medina",
    ],
    lines: [
      {
        hebrew: "בישראל חוגגים חגים רבים במהלך השנה.",
        transliteration: "Be'Yisrael chogegim chagim rabim be'mehalech ha'shana.",
        translation: "In Israel many holidays are celebrated throughout the year.",
      },
      {
        hebrew: "בראש השנה אוכלים תפוח בדבש ומאחלים שנה טובה.",
        transliteration: "Be'Rosh Ha'Shana ochlim tapuach bi'dvash u'me'achalim shana tova.",
        translation: "On Rosh Hashana we eat apple dipped in honey and wish a good year.",
      },
      {
        hebrew: "ביום כיפור צמים עשרים וחמש שעות ומתפללים בבית הכנסת.",
        transliteration: "Be'Yom Kipur tzamim esrim ve'chamesh sha'ot u'mitpalelim be'beit ha'knesset.",
        translation: "On Yom Kippur we fast for twenty-five hours and pray in the synagogue.",
      },
      {
        hebrew: "בסוכות בונים סוכה ואוכלים בה שבעה ימים.",
        transliteration: "Be'Sukkot bonim suka ve'ochlim ba shiv'a yamim.",
        translation: "On Sukkot we build a sukkah and eat in it for seven days.",
      },
      {
        hebrew: "בחנוכה מדליקים נרות שמונה לילות ואוכלים סופגניות.",
        transliteration: "Be'Chanuka madlikim nerot shmona leilot ve'ochlim sufganiyot.",
        translation: "On Hanukkah we light candles for eight nights and eat doughnuts.",
      },
      {
        hebrew: "בפורים מתחפשים, שולחים משלוח מנות ושומעים את המגילה.",
        transliteration: "Be'Purim mitchapesim, sholchim mishloach manot ve'shomim et ha'megila.",
        translation: "On Purim we dress in costumes, send food gifts, and listen to the Megillah.",
      },
      {
        hebrew: "בפסח עושים סדר ואוכלים מצות במקום לחם.",
        transliteration: "Be'Pesach osim seder ve'ochlim matzot bi'mkom lechem.",
        translation: "On Passover we hold a seder and eat matzah instead of bread.",
      },
      {
        hebrew: "ביום העצמאות חוגגים את הקמת מדינת ישראל עם מנגל ותצוגות אוויריות.",
        transliteration: "Be'Yom Ha'Atzmaut chogegim et hakamat medinat Yisrael im mangal ve'tatzugot aviriyot.",
        translation: "On Independence Day we celebrate the founding of the State of Israel with barbecues and air shows.",
      },
      {
        hebrew: "בשבועות אוכלים מאכלי חלב וחוגגים את מתן התורה.",
        transliteration: "Be'Shavuot ochlim ma'achalei chalav ve'chogegim et matan ha'Torah.",
        translation: "On Shavuot we eat dairy foods and celebrate the giving of the Torah.",
      },
    ],
  },
  {
    id: "trip-to-shuk",
    title: "A Trip to the Shuk",
    titleHebrew: "טיול לשוק",
    level: "advanced",
    vocabIds: [
      "builtin:tapuach", "builtin:agvaniya", "builtin:limon",
      "builtin:shokolad", "builtin:kafeh", "builtin:kamah-zeh-oleh",
      "builtin:bevakasha", "builtin:toda-raba", "builtin:chazak",
      "builtin:shuk", "builtin:perot", "builtin:yrakot", "builtin:mechir",
    ],
    lines: [
      {
        hebrew: "שוק מחנה יהודה בירושלים הוא אחד השווקים המפורסמים בישראל.",
        transliteration: "Shuk Machane Yehuda bi'Yerushalayim hu echad ha'shvakim ha'mefursamim be'Yisrael.",
        translation: "The Machane Yehuda market in Jerusalem is one of the most famous markets in Israel.",
      },
      {
        hebrew: "המוכרים צועקים ומציעים פירות וירקות טריים.",
        transliteration: "Ha'mochrim tzo'akim u'matzi'im perot vi'rkot tri'im.",
        translation: "The vendors shout and offer fresh fruits and vegetables.",
      },
      {
        hebrew: "אני טועם גבינות מיוחדות וזיתים שחורים וירוקים.",
        transliteration: "Ani to'em gvinot meyuchadot ve'zeitim shchorim vi'rukim.",
        translation: "I taste special cheeses and black and green olives.",
      },
      {
        hebrew: "הבשמים של התבלינים ממלאים את האוויר.",
        transliteration: "Ha'bsamim shel ha'tavlinim memal'im et ha'avir.",
        translation: "The aromas of the spices fill the air.",
      },
      {
        hebrew: "כמה עולה קילו עגבניות? חמישה שקלים בלבד!",
        transliteration: "Kama oleh kilo agvaniyot? Chamisha shkalim bilvad!",
        translation: "How much is a kilo of tomatoes? Only five shekels!",
      },
      {
        hebrew: "אני מתמקח על המחיר ומקבל הנחה קטנה.",
        transliteration: "Ani mitmaке'ach al ha'mechir u'mekabel hanacha ktana.",
        translation: "I haggle over the price and get a small discount.",
      },
      {
        hebrew: "קניתי חלוה, תמרים ושקית תבלינים צבעונית.",
        transliteration: "Kaniti chalva, tmarim ve'sakit tavlinim tzivonit.",
        translation: "I bought halva, dates, and a colorful bag of spices.",
      },
      {
        hebrew: "בסוף הסיור שתיתי קפה שחור חזק בדוכן קטן.",
        transliteration: "Be'sof ha'siyur shatiti kafeh shachor chazak be'duchan katan.",
        translation: "At the end of the tour I drank strong black coffee at a small stall.",
      },
      {
        hebrew: "השוק מלא חיים, צבעים וטעמים — חוויה ישראלית אמיתית.",
        transliteration: "Ha'shuk male chayim, tzva'im u'te'amim — chavaya Yisre'elit amitit.",
        translation: "The market is full of life, colors, and flavors — a true Israeli experience.",
      },
    ],
  },
];
