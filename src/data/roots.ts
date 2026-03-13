export interface HebrewRoot {
  root: string;
  rootDisplay: string;
  meaning: string;
  relatedWords: {
    hebrew: string;
    hebrewNikud: string;
    transliteration: string;
    translation: string;
    formNote: string;
  }[];
}

export const HEBREW_ROOTS: HebrewRoot[] = [
  {
    root: "שלמ",
    rootDisplay: "ש.ל.מ",
    meaning: "completeness, peace",
    relatedWords: [
      { hebrew: "שלום", hebrewNikud: "שָׁלוֹם", transliteration: "shalom", translation: "peace, hello", formNote: "noun" },
      { hebrew: "שלם", hebrewNikud: "שָׁלֵם", transliteration: "shalem", translation: "whole, complete", formNote: "adjective" },
      { hebrew: "להשלים", hebrewNikud: "לְהַשְׁלִים", transliteration: "lehashlim", translation: "to complete", formNote: "verb (Hif'il)" },
      { hebrew: "שלמות", hebrewNikud: "שְׁלֵמוּת", transliteration: "shlemut", translation: "wholeness", formNote: "noun" },
    ],
  },
  {
    root: "כתב",
    rootDisplay: "כ.ת.ב",
    meaning: "writing",
    relatedWords: [
      { hebrew: "כתב", hebrewNikud: "כָּתַב", transliteration: "katav", translation: "he wrote", formNote: "verb (Pa'al)" },
      { hebrew: "לכתוב", hebrewNikud: "לִכְתּוֹב", transliteration: "likhtov", translation: "to write", formNote: "infinitive" },
      { hebrew: "מכתב", hebrewNikud: "מִכְתָּב", transliteration: "mikhtav", translation: "letter (mail)", formNote: "noun" },
      { hebrew: "כתבה", hebrewNikud: "כַּתָּבָה", transliteration: "katava", translation: "article, report", formNote: "noun" },
    ],
  },
  {
    root: "למד",
    rootDisplay: "ל.מ.ד",
    meaning: "learning, teaching",
    relatedWords: [
      { hebrew: "למד", hebrewNikud: "לָמַד", transliteration: "lamad", translation: "he learned", formNote: "verb (Pa'al)" },
      { hebrew: "ללמוד", hebrewNikud: "לִלְמוֹד", transliteration: "lilmod", translation: "to learn", formNote: "infinitive" },
      { hebrew: "תלמיד", hebrewNikud: "תַּלְמִיד", transliteration: "talmid", translation: "student", formNote: "noun" },
      { hebrew: "מלמד", hebrewNikud: "מְלַמֵּד", transliteration: "melamed", translation: "teacher", formNote: "noun (Pi'el)" },
    ],
  },
  {
    root: "דבר",
    rootDisplay: "ד.ב.ר",
    meaning: "speaking, word",
    relatedWords: [
      { hebrew: "דבר", hebrewNikud: "דָּבָר", transliteration: "davar", translation: "thing, word", formNote: "noun" },
      { hebrew: "לדבר", hebrewNikud: "לְדַבֵּר", transliteration: "ledaber", translation: "to speak", formNote: "verb (Pi'el)" },
      { hebrew: "מדבר", hebrewNikud: "מְדַבֵּר", transliteration: "medaber", translation: "speaks (m.)", formNote: "present" },
      { hebrew: "דיבור", hebrewNikud: "דִּבּוּר", transliteration: "dibur", translation: "speech", formNote: "noun" },
    ],
  },
  {
    root: "ספר",
    rootDisplay: "ס.פ.ר",
    meaning: "counting, telling, book",
    relatedWords: [
      { hebrew: "ספר", hebrewNikud: "סֵפֶר", transliteration: "sefer", translation: "book", formNote: "noun" },
      { hebrew: "לספר", hebrewNikud: "לְסַפֵּר", transliteration: "lesaper", translation: "to tell", formNote: "verb (Pi'el)" },
      { hebrew: "מספר", hebrewNikud: "מִסְפָּר", transliteration: "mispar", translation: "number", formNote: "noun" },
      { hebrew: "ספרייה", hebrewNikud: "סִפְרִיָּה", transliteration: "sifriya", translation: "library", formNote: "noun" },
    ],
  },
  {
    root: "אכל",
    rootDisplay: "א.כ.ל",
    meaning: "eating",
    relatedWords: [
      { hebrew: "אכל", hebrewNikud: "אָכַל", transliteration: "akhal", translation: "he ate", formNote: "verb (Pa'al)" },
      { hebrew: "לאכול", hebrewNikud: "לֶאֱכוֹל", transliteration: "le'ekhol", translation: "to eat", formNote: "infinitive" },
      { hebrew: "אוכל", hebrewNikud: "אוֹכֶל", transliteration: "okhel", translation: "food", formNote: "noun" },
      { hebrew: "מאכל", hebrewNikud: "מַאֲכָל", transliteration: "ma'akhal", translation: "dish, food item", formNote: "noun" },
    ],
  },
  {
    root: "בנה",
    rootDisplay: "ב.נ.ה",
    meaning: "building",
    relatedWords: [
      { hebrew: "בנה", hebrewNikud: "בָּנָה", transliteration: "bana", translation: "he built", formNote: "verb (Pa'al)" },
      { hebrew: "לבנות", hebrewNikud: "לִבְנוֹת", transliteration: "livnot", translation: "to build", formNote: "infinitive" },
      { hebrew: "בניין", hebrewNikud: "בִּנְיָן", transliteration: "binyan", translation: "building", formNote: "noun" },
      { hebrew: "מבנה", hebrewNikud: "מִבְנֶה", transliteration: "mivne", translation: "structure", formNote: "noun" },
    ],
  },
  {
    root: "שמר",
    rootDisplay: "ש.מ.ר",
    meaning: "guarding, keeping",
    relatedWords: [
      { hebrew: "שמר", hebrewNikud: "שָׁמַר", transliteration: "shamar", translation: "he guarded", formNote: "verb (Pa'al)" },
      { hebrew: "לשמור", hebrewNikud: "לִשְׁמוֹר", transliteration: "lishmor", translation: "to guard", formNote: "infinitive" },
      { hebrew: "שומר", hebrewNikud: "שׁוֹמֵר", transliteration: "shomer", translation: "guard", formNote: "noun" },
      { hebrew: "משמרת", hebrewNikud: "מִשְׁמֶרֶת", transliteration: "mishmeret", translation: "shift, watch", formNote: "noun" },
    ],
  },
  {
    root: "ידע",
    rootDisplay: "י.ד.ע",
    meaning: "knowing",
    relatedWords: [
      { hebrew: "ידע", hebrewNikud: "יָדַע", transliteration: "yada", translation: "he knew", formNote: "verb (Pa'al)" },
      { hebrew: "לדעת", hebrewNikud: "לָדַעַת", transliteration: "lada'at", translation: "to know", formNote: "infinitive" },
      { hebrew: "ידיעה", hebrewNikud: "יְדִיעָה", transliteration: "yedi'a", translation: "knowledge, news item", formNote: "noun" },
      { hebrew: "מדע", hebrewNikud: "מַדָּע", transliteration: "mada", translation: "science", formNote: "noun" },
    ],
  },
  {
    root: "הלכ",
    rootDisplay: "ה.ל.כ",
    meaning: "walking, going",
    relatedWords: [
      { hebrew: "הלך", hebrewNikud: "הָלַךְ", transliteration: "halakh", translation: "he walked", formNote: "verb (Pa'al)" },
      { hebrew: "ללכת", hebrewNikud: "לָלֶכֶת", transliteration: "lalekhet", translation: "to walk", formNote: "infinitive" },
      { hebrew: "הליכה", hebrewNikud: "הֲלִיכָה", transliteration: "halikha", translation: "walking", formNote: "noun" },
      { hebrew: "מהלך", hebrewNikud: "מַהֲלָךְ", transliteration: "mahalakh", translation: "move, course", formNote: "noun" },
    ],
  },
  {
    root: "עבד",
    rootDisplay: "ע.ב.ד",
    meaning: "working, serving",
    relatedWords: [
      { hebrew: "עבד", hebrewNikud: "עָבַד", transliteration: "avad", translation: "he worked", formNote: "verb (Pa'al)" },
      { hebrew: "לעבוד", hebrewNikud: "לַעֲבוֹד", transliteration: "la'avod", translation: "to work", formNote: "infinitive" },
      { hebrew: "עבודה", hebrewNikud: "עֲבוֹדָה", transliteration: "avoda", translation: "work, job", formNote: "noun" },
      { hebrew: "עובד", hebrewNikud: "עוֹבֵד", transliteration: "oved", translation: "worker", formNote: "noun" },
    ],
  },
  {
    root: "קרא",
    rootDisplay: "ק.ר.א",
    meaning: "reading, calling",
    relatedWords: [
      { hebrew: "קרא", hebrewNikud: "קָרָא", transliteration: "kara", translation: "he read / called", formNote: "verb (Pa'al)" },
      { hebrew: "לקרוא", hebrewNikud: "לִקְרוֹא", transliteration: "likro", translation: "to read", formNote: "infinitive" },
      { hebrew: "קריאה", hebrewNikud: "קְרִיאָה", transliteration: "kri'a", translation: "reading", formNote: "noun" },
      { hebrew: "מקרא", hebrewNikud: "מִקְרָא", transliteration: "mikra", translation: "scripture", formNote: "noun" },
    ],
  },
  {
    root: "בוא",
    rootDisplay: "ב.ו.א",
    meaning: "coming, entering",
    relatedWords: [
      { hebrew: "בא", hebrewNikud: "בָּא", transliteration: "ba", translation: "he came", formNote: "verb (Pa'al)" },
      { hebrew: "לבוא", hebrewNikud: "לָבוֹא", transliteration: "lavo", translation: "to come", formNote: "infinitive" },
      { hebrew: "מבוא", hebrewNikud: "מָבוֹא", transliteration: "mavo", translation: "entrance, intro", formNote: "noun" },
    ],
  },
  {
    root: "יצא",
    rootDisplay: "י.צ.א",
    meaning: "going out, exiting",
    relatedWords: [
      { hebrew: "יצא", hebrewNikud: "יָצָא", transliteration: "yatsa", translation: "he went out", formNote: "verb (Pa'al)" },
      { hebrew: "לצאת", hebrewNikud: "לָצֵאת", transliteration: "latset", translation: "to go out", formNote: "infinitive" },
      { hebrew: "יציאה", hebrewNikud: "יְצִיאָה", transliteration: "yetsi'a", translation: "exit", formNote: "noun" },
      { hebrew: "מוצא", hebrewNikud: "מוֹצָא", transliteration: "motsa", translation: "origin, source", formNote: "noun" },
    ],
  },
  {
    root: "שמע",
    rootDisplay: "ש.מ.ע",
    meaning: "hearing, listening",
    relatedWords: [
      { hebrew: "שמע", hebrewNikud: "שָׁמַע", transliteration: "shama", translation: "he heard", formNote: "verb (Pa'al)" },
      { hebrew: "לשמוע", hebrewNikud: "לִשְׁמוֹעַ", transliteration: "lishmoa", translation: "to hear", formNote: "infinitive" },
      { hebrew: "שמיעה", hebrewNikud: "שְׁמִיעָה", transliteration: "shmi'a", translation: "hearing", formNote: "noun" },
      { hebrew: "משמעות", hebrewNikud: "מַשְׁמָעוּת", transliteration: "mashma'ut", translation: "meaning", formNote: "noun" },
    ],
  },
  {
    root: "ראה",
    rootDisplay: "ר.א.ה",
    meaning: "seeing",
    relatedWords: [
      { hebrew: "ראה", hebrewNikud: "רָאָה", transliteration: "ra'a", translation: "he saw", formNote: "verb (Pa'al)" },
      { hebrew: "לראות", hebrewNikud: "לִרְאוֹת", transliteration: "lir'ot", translation: "to see", formNote: "infinitive" },
      { hebrew: "מראה", hebrewNikud: "מַרְאֶה", transliteration: "mar'e", translation: "appearance, mirror", formNote: "noun" },
    ],
  },
  {
    root: "חיה",
    rootDisplay: "ח.י.ה",
    meaning: "living, life",
    relatedWords: [
      { hebrew: "חי", hebrewNikud: "חַי", transliteration: "khai", translation: "alive", formNote: "adjective" },
      { hebrew: "לחיות", hebrewNikud: "לִחְיוֹת", transliteration: "likhyot", translation: "to live", formNote: "infinitive" },
      { hebrew: "חיים", hebrewNikud: "חַיִּים", transliteration: "khayim", translation: "life", formNote: "noun" },
      { hebrew: "חיה", hebrewNikud: "חַיָּה", transliteration: "khaya", translation: "animal", formNote: "noun" },
    ],
  },
  {
    root: "שנה",
    rootDisplay: "ש.נ.ה",
    meaning: "changing, repeating, year",
    relatedWords: [
      { hebrew: "שנה", hebrewNikud: "שָׁנָה", transliteration: "shana", translation: "year", formNote: "noun" },
      { hebrew: "לשנות", hebrewNikud: "לְשַׁנּוֹת", transliteration: "leshanot", translation: "to change", formNote: "verb (Pi'el)" },
      { hebrew: "שינוי", hebrewNikud: "שִׁנּוּי", transliteration: "shinui", translation: "change", formNote: "noun" },
      { hebrew: "משנה", hebrewNikud: "מִשְׁנָה", transliteration: "mishna", translation: "Mishnah, secondary", formNote: "noun" },
    ],
  },
  {
    root: "עשה",
    rootDisplay: "ע.ש.ה",
    meaning: "doing, making",
    relatedWords: [
      { hebrew: "עשה", hebrewNikud: "עָשָׂה", transliteration: "asa", translation: "he did", formNote: "verb (Pa'al)" },
      { hebrew: "לעשות", hebrewNikud: "לַעֲשׂוֹת", transliteration: "la'asot", translation: "to do", formNote: "infinitive" },
      { hebrew: "מעשה", hebrewNikud: "מַעֲשֶׂה", transliteration: "ma'ase", translation: "deed, story", formNote: "noun" },
      { hebrew: "תעשייה", hebrewNikud: "תַּעֲשִׂיָּה", transliteration: "ta'asiya", translation: "industry", formNote: "noun" },
    ],
  },
  {
    root: "נתנ",
    rootDisplay: "נ.ת.נ",
    meaning: "giving",
    relatedWords: [
      { hebrew: "נתן", hebrewNikud: "נָתַן", transliteration: "natan", translation: "he gave", formNote: "verb (Pa'al)" },
      { hebrew: "לתת", hebrewNikud: "לָתֵת", transliteration: "latet", translation: "to give", formNote: "infinitive" },
      { hebrew: "מתנה", hebrewNikud: "מַתָּנָה", transliteration: "matana", translation: "gift", formNote: "noun" },
      { hebrew: "נתינה", hebrewNikud: "נְתִינָה", transliteration: "netina", translation: "giving", formNote: "noun" },
    ],
  },
  {
    root: "גדל",
    rootDisplay: "ג.ד.ל",
    meaning: "growing, big",
    relatedWords: [
      { hebrew: "גדול", hebrewNikud: "גָּדוֹל", transliteration: "gadol", translation: "big, great", formNote: "adjective" },
      { hebrew: "לגדול", hebrewNikud: "לִגְדּוֹל", transliteration: "ligdol", translation: "to grow", formNote: "infinitive" },
      { hebrew: "גודל", hebrewNikud: "גּוֹדֶל", transliteration: "godel", translation: "size", formNote: "noun" },
      { hebrew: "מגדל", hebrewNikud: "מִגְדָּל", transliteration: "migdal", translation: "tower", formNote: "noun" },
    ],
  },
  {
    root: "חדש",
    rootDisplay: "ח.ד.ש",
    meaning: "new, renewing",
    relatedWords: [
      { hebrew: "חדש", hebrewNikud: "חָדָשׁ", transliteration: "chadash", translation: "new", formNote: "adjective" },
      { hebrew: "לחדש", hebrewNikud: "לְחַדֵּשׁ", transliteration: "lechadesh", translation: "to renew", formNote: "verb (Pi'el)" },
      { hebrew: "חודש", hebrewNikud: "חוֹדֶשׁ", transliteration: "chodesh", translation: "month", formNote: "noun" },
      { hebrew: "חידוש", hebrewNikud: "חִדּוּשׁ", transliteration: "chidush", translation: "innovation", formNote: "noun" },
    ],
  },
  {
    root: "זכר",
    rootDisplay: "ז.כ.ר",
    meaning: "remembering",
    relatedWords: [
      { hebrew: "זכר", hebrewNikud: "זָכַר", transliteration: "zakhar", translation: "he remembered", formNote: "verb (Pa'al)" },
      { hebrew: "לזכור", hebrewNikud: "לִזְכּוֹר", transliteration: "lizkor", translation: "to remember", formNote: "infinitive" },
      { hebrew: "זיכרון", hebrewNikud: "זִכָּרוֹן", transliteration: "zikaron", translation: "memory", formNote: "noun" },
      { hebrew: "מזכיר", hebrewNikud: "מַזְכִּיר", transliteration: "mazkir", translation: "secretary", formNote: "noun" },
    ],
  },
  {
    root: "פתח",
    rootDisplay: "פ.ת.ח",
    meaning: "opening",
    relatedWords: [
      { hebrew: "פתח", hebrewNikud: "פָּתַח", transliteration: "patach", translation: "he opened", formNote: "verb (Pa'al)" },
      { hebrew: "לפתוח", hebrewNikud: "לִפְתּוֹחַ", transliteration: "liftoach", translation: "to open", formNote: "infinitive" },
      { hebrew: "מפתח", hebrewNikud: "מַפְתֵּחַ", transliteration: "mafte'ach", translation: "key", formNote: "noun" },
      { hebrew: "פתיחה", hebrewNikud: "פְּתִיחָה", transliteration: "pticha", translation: "opening", formNote: "noun" },
    ],
  },
  {
    root: "סגר",
    rootDisplay: "ס.ג.ר",
    meaning: "closing",
    relatedWords: [
      { hebrew: "סגר", hebrewNikud: "סָגַר", transliteration: "sagar", translation: "he closed", formNote: "verb (Pa'al)" },
      { hebrew: "לסגור", hebrewNikud: "לִסְגּוֹר", transliteration: "lisgor", translation: "to close", formNote: "infinitive" },
      { hebrew: "סגור", hebrewNikud: "סָגוּר", transliteration: "sagur", translation: "closed", formNote: "adjective" },
      { hebrew: "מסגרת", hebrewNikud: "מִסְגֶּרֶת", transliteration: "misgeret", translation: "frame, framework", formNote: "noun" },
    ],
  },
  {
    root: "חשב",
    rootDisplay: "ח.ש.ב",
    meaning: "thinking, calculating",
    relatedWords: [
      { hebrew: "חשב", hebrewNikud: "חָשַׁב", transliteration: "chashav", translation: "he thought", formNote: "verb (Pa'al)" },
      { hebrew: "לחשוב", hebrewNikud: "לַחְשׁוֹב", transliteration: "lachshov", translation: "to think", formNote: "infinitive" },
      { hebrew: "חשבון", hebrewNikud: "חֶשְׁבּוֹן", transliteration: "cheshbon", translation: "bill, account", formNote: "noun" },
      { hebrew: "מחשב", hebrewNikud: "מַחְשֵׁב", transliteration: "machshev", translation: "computer", formNote: "noun" },
    ],
  },
  {
    root: "רגש",
    rootDisplay: "ר.ג.ש",
    meaning: "feeling, emotion",
    relatedWords: [
      { hebrew: "רגש", hebrewNikud: "רֶגֶשׁ", transliteration: "regesh", translation: "emotion", formNote: "noun" },
      { hebrew: "להרגיש", hebrewNikud: "לְהַרְגִּישׁ", transliteration: "lehargish", translation: "to feel", formNote: "verb (Hif'il)" },
      { hebrew: "רגשי", hebrewNikud: "רִגְשִׁי", transliteration: "rigshi", translation: "emotional", formNote: "adjective" },
      { hebrew: "מרגש", hebrewNikud: "מְרַגֵּשׁ", transliteration: "meragesh", translation: "exciting", formNote: "adjective" },
    ],
  },
  {
    root: "שאל",
    rootDisplay: "ש.א.ל",
    meaning: "asking, borrowing",
    relatedWords: [
      { hebrew: "שאל", hebrewNikud: "שָׁאַל", transliteration: "sha'al", translation: "he asked", formNote: "verb (Pa'al)" },
      { hebrew: "לשאול", hebrewNikud: "לִשְׁאוֹל", transliteration: "lish'ol", translation: "to ask", formNote: "infinitive" },
      { hebrew: "שאלה", hebrewNikud: "שְׁאֵלָה", transliteration: "she'ela", translation: "question", formNote: "noun" },
      { hebrew: "משאלה", hebrewNikud: "מִשְׁאָלָה", transliteration: "mish'ala", translation: "wish", formNote: "noun" },
    ],
  },
  {
    root: "עזר",
    rootDisplay: "ע.ז.ר",
    meaning: "helping",
    relatedWords: [
      { hebrew: "עזר", hebrewNikud: "עָזַר", transliteration: "azar", translation: "he helped", formNote: "verb (Pa'al)" },
      { hebrew: "לעזור", hebrewNikud: "לַעֲזוֹר", transliteration: "la'azor", translation: "to help", formNote: "infinitive" },
      { hebrew: "עזרה", hebrewNikud: "עֶזְרָה", transliteration: "ezra", translation: "help", formNote: "noun" },
      { hebrew: "עוזר", hebrewNikud: "עוֹזֵר", transliteration: "ozer", translation: "assistant", formNote: "noun" },
    ],
  },
  {
    root: "שלח",
    rootDisplay: "ש.ל.ח",
    meaning: "sending",
    relatedWords: [
      { hebrew: "שלח", hebrewNikud: "שָׁלַח", transliteration: "shalach", translation: "he sent", formNote: "verb (Pa'al)" },
      { hebrew: "לשלוח", hebrewNikud: "לִשְׁלוֹחַ", transliteration: "lishlo'ach", translation: "to send", formNote: "infinitive" },
      { hebrew: "שליח", hebrewNikud: "שָׁלִיחַ", transliteration: "shaliach", translation: "messenger, emissary", formNote: "noun" },
      { hebrew: "משלוח", hebrewNikud: "מִשְׁלוֹחַ", transliteration: "mishlo'ach", translation: "delivery, shipment", formNote: "noun" },
    ],
  },
  {
    root: "ברכ",
    rootDisplay: "ב.ר.כ",
    meaning: "blessing, kneeling",
    relatedWords: [
      { hebrew: "ברכה", hebrewNikud: "בְּרָכָה", transliteration: "bracha", translation: "blessing", formNote: "noun" },
      { hebrew: "לברך", hebrewNikud: "לְבָרֵךְ", transliteration: "levarekh", translation: "to bless", formNote: "verb (Pi'el)" },
      { hebrew: "ברוך", hebrewNikud: "בָּרוּךְ", transliteration: "baruch", translation: "blessed", formNote: "adjective" },
      { hebrew: "בריכה", hebrewNikud: "בְּרֵכָה", transliteration: "brekha", translation: "pool", formNote: "noun" },
    ],
  },
  {
    root: "קדש",
    rootDisplay: "ק.ד.ש",
    meaning: "holiness, sanctifying",
    relatedWords: [
      { hebrew: "קדוש", hebrewNikud: "קָדוֹשׁ", transliteration: "kadosh", translation: "holy", formNote: "adjective" },
      { hebrew: "קידוש", hebrewNikud: "קִדּוּשׁ", transliteration: "kidush", translation: "kiddush", formNote: "noun" },
      { hebrew: "מקדש", hebrewNikud: "מִקְדָּשׁ", transliteration: "mikdash", translation: "temple, sanctuary", formNote: "noun" },
      { hebrew: "קדושה", hebrewNikud: "קְדוּשָּׁה", transliteration: "kedusha", translation: "holiness", formNote: "noun" },
    ],
  },
  {
    root: "גור",
    rootDisplay: "ג.ו.ר",
    meaning: "living, residing",
    relatedWords: [
      { hebrew: "גר", hebrewNikud: "גָּר", transliteration: "gar", translation: "lives (m.s.)", formNote: "present" },
      { hebrew: "לגור", hebrewNikud: "לָגוּר", transliteration: "lagur", translation: "to live (reside)", formNote: "infinitive" },
      { hebrew: "מגורים", hebrewNikud: "מְגוּרִים", transliteration: "megurim", translation: "residence", formNote: "noun" },
      { hebrew: "שכונת מגורים", hebrewNikud: "שְׁכוּנַת מְגוּרִים", transliteration: "shchunat megurim", translation: "residential neighborhood", formNote: "phrase" },
    ],
  },
  {
    root: "טוב",
    rootDisplay: "ט.ו.ב",
    meaning: "goodness",
    relatedWords: [
      { hebrew: "טוב", hebrewNikud: "טוֹב", transliteration: "tov", translation: "good", formNote: "adjective" },
      { hebrew: "טובה", hebrewNikud: "טוֹבָה", transliteration: "tova", translation: "favor, good f.", formNote: "noun/adj" },
      { hebrew: "להיטיב", hebrewNikud: "לְהֵיטִיב", transliteration: "leheitiv", translation: "to improve", formNote: "verb (Hif'il)" },
      { hebrew: "מוטב", hebrewNikud: "מוּטָב", transliteration: "mutav", translation: "it is better", formNote: "adverb" },
    ],
  },
  {
    root: "אמר",
    rootDisplay: "א.מ.ר",
    meaning: "saying",
    relatedWords: [
      { hebrew: "אמר", hebrewNikud: "אָמַר", transliteration: "amar", translation: "he said", formNote: "verb (Pa'al)" },
      { hebrew: "לומר", hebrewNikud: "לוֹמַר", transliteration: "lomar", translation: "to say", formNote: "infinitive" },
      { hebrew: "אמירה", hebrewNikud: "אֲמִירָה", transliteration: "amira", translation: "saying, utterance", formNote: "noun" },
      { hebrew: "מאמר", hebrewNikud: "מַאֲמָר", transliteration: "ma'amar", translation: "article, essay", formNote: "noun" },
    ],
  },
];

/** Given a Hebrew word (stripped of nikud), find its root */
export function findRootForWord(hebrewClean: string): HebrewRoot | undefined {
  return HEBREW_ROOTS.find((root) =>
    root.relatedWords.some((w) => {
      const clean = w.hebrew.replace(/[\u0591-\u05C7]/g, "");
      return clean === hebrewClean;
    })
  );
}
