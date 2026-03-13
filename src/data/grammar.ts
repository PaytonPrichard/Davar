export interface VerbRoot {
  root: string;
  rootLetters: string;
  meaning: string;
}

export interface Conjugation {
  person: string;
  hebrew: string;
  hebrewNikud: string;
  transliteration: string;
}

export interface VerbPattern {
  name: string;
  hebrewName: string;
  description: string;
  example: VerbRoot;
  pastTense: Conjugation[];
  presentTense: Conjugation[];
  futureTense?: Conjugation[];
}

/* ── Adjective data ──────────────────────────────────── */

export interface HebrewAdjective {
  id: string;
  base: string; // dictionary form (m.s.)
  forms: {
    ms: { hebrew: string; hebrewNikud: string; transliteration: string };
    fs: { hebrew: string; hebrewNikud: string; transliteration: string };
    mp: { hebrew: string; hebrewNikud: string; transliteration: string };
    fp: { hebrew: string; hebrewNikud: string; transliteration: string };
  };
  translation: string;
  category: "size" | "quality" | "emotion" | "appearance" | "other";
}

/* ── Conjugation exercise sentences ──────────────────── */

export interface ConjugationExercise {
  sentenceTemplate: string; // English with {verb} placeholder
  hebrewTemplate: string;   // Hebrew with _____ placeholder
  verb: string;             // infinitive Hebrew
  verbMeaning: string;
  targetPerson: string;     // e.g. "I", "He", "She", etc.
  targetTense: "past" | "present" | "future";
  correctAnswer: string;    // conjugated Hebrew form
  correctNikud: string;
  correctTranslit: string;
  distractors: string[];    // wrong options
}

export interface GrammarLesson {
  id: string;
  title: string;
  titleHebrew: string;
  description: string;
  topics: string[];
}

export const VERB_PATTERNS: VerbPattern[] = [
  {
    name: "Pa'al",
    hebrewName: "פָּעַל",
    description:
      "The basic active verb pattern. Most common binyan, used for simple actions.",
    example: { root: "כ.ת.ב", rootLetters: "כתב", meaning: "to write" },
    pastTense: [
      { person: "I", hebrew: "כתבתי", hebrewNikud: "כָּתַבְתִּי", transliteration: "katavti" },
      { person: "You (m.s.)", hebrew: "כתבת", hebrewNikud: "כָּתַבְתָּ", transliteration: "katavta" },
      { person: "You (f.s.)", hebrew: "כתבת", hebrewNikud: "כָּתַבְתְּ", transliteration: "katavt" },
      { person: "He", hebrew: "כתב", hebrewNikud: "כָּתַב", transliteration: "katav" },
      { person: "She", hebrew: "כתבה", hebrewNikud: "כָּתְבָה", transliteration: "katva" },
      { person: "We", hebrew: "כתבנו", hebrewNikud: "כָּתַבְנוּ", transliteration: "katavnu" },
      { person: "You (m.pl.)", hebrew: "כתבתם", hebrewNikud: "כְּתַבְתֶּם", transliteration: "ktavtem" },
      { person: "You (f.pl.)", hebrew: "כתבתן", hebrewNikud: "כְּתַבְתֶּן", transliteration: "ktavten" },
      { person: "They (m.)", hebrew: "כתבו", hebrewNikud: "כָּתְבוּ", transliteration: "katvu" },
      { person: "They (f.)", hebrew: "כתבו", hebrewNikud: "כָּתְבוּ", transliteration: "katvu" },
    ],
    presentTense: [
      { person: "m.s.", hebrew: "כותב", hebrewNikud: "כּוֹתֵב", transliteration: "kotev" },
      { person: "f.s.", hebrew: "כותבת", hebrewNikud: "כּוֹתֶבֶת", transliteration: "kotevet" },
      { person: "m.pl.", hebrew: "כותבים", hebrewNikud: "כּוֹתְבִים", transliteration: "kotvim" },
      { person: "f.pl.", hebrew: "כותבות", hebrewNikud: "כּוֹתְבוֹת", transliteration: "kotvot" },
    ],
    futureTense: [
      { person: "I", hebrew: "אכתוב", hebrewNikud: "אֶכְתּוֹב", transliteration: "ekhtov" },
      { person: "You (m.s.)", hebrew: "תכתוב", hebrewNikud: "תִּכְתּוֹב", transliteration: "tikhtov" },
      { person: "You (f.s.)", hebrew: "תכתבי", hebrewNikud: "תִּכְתְּבִי", transliteration: "tikhtebi" },
      { person: "He", hebrew: "יכתוב", hebrewNikud: "יִכְתּוֹב", transliteration: "yikhtov" },
      { person: "She", hebrew: "תכתוב", hebrewNikud: "תִּכְתּוֹב", transliteration: "tikhtov" },
      { person: "We", hebrew: "נכתוב", hebrewNikud: "נִכְתּוֹב", transliteration: "nikhtov" },
      { person: "You (m.pl.)", hebrew: "תכתבו", hebrewNikud: "תִּכְתְּבוּ", transliteration: "tikhtevu" },
      { person: "You (f.pl.)", hebrew: "תכתבנה", hebrewNikud: "תִּכְתּוֹבְנָה", transliteration: "tikhtovna" },
      { person: "They (m.)", hebrew: "יכתבו", hebrewNikud: "יִכְתְּבוּ", transliteration: "yikhtevu" },
      { person: "They (f.)", hebrew: "תכתבנה", hebrewNikud: "תִּכְתּוֹבְנָה", transliteration: "tikhtovna" },
    ],
  },
  {
    name: "Pi'el",
    hebrewName: "פִּעֵל",
    description:
      "The intensive active pattern. Often intensifies the meaning or makes intransitive verbs transitive.",
    example: { root: "ד.ב.ר", rootLetters: "דבר", meaning: "to speak" },
    pastTense: [
      { person: "I", hebrew: "דיברתי", hebrewNikud: "דִּבַּרְתִּי", transliteration: "dibarti" },
      { person: "You (m.s.)", hebrew: "דיברת", hebrewNikud: "דִּבַּרְתָּ", transliteration: "dibarta" },
      { person: "You (f.s.)", hebrew: "דיברת", hebrewNikud: "דִּבַּרְתְּ", transliteration: "dibart" },
      { person: "He", hebrew: "דיבר", hebrewNikud: "דִּבֵּר", transliteration: "diber" },
      { person: "She", hebrew: "דיברה", hebrewNikud: "דִּבְּרָה", transliteration: "dibra" },
      { person: "We", hebrew: "דיברנו", hebrewNikud: "דִּבַּרְנוּ", transliteration: "dibarnu" },
      { person: "You (m.pl.)", hebrew: "דיברתם", hebrewNikud: "דִּבַּרְתֶּם", transliteration: "dibartem" },
      { person: "You (f.pl.)", hebrew: "דיברתן", hebrewNikud: "דִּבַּרְתֶּן", transliteration: "dibarten" },
      { person: "They (m.)", hebrew: "דיברו", hebrewNikud: "דִּבְּרוּ", transliteration: "dibru" },
      { person: "They (f.)", hebrew: "דיברו", hebrewNikud: "דִּבְּרוּ", transliteration: "dibru" },
    ],
    presentTense: [
      { person: "m.s.", hebrew: "מדבר", hebrewNikud: "מְדַבֵּר", transliteration: "medaber" },
      { person: "f.s.", hebrew: "מדברת", hebrewNikud: "מְדַבֶּרֶת", transliteration: "medaberet" },
      { person: "m.pl.", hebrew: "מדברים", hebrewNikud: "מְדַבְּרִים", transliteration: "medabrim" },
      { person: "f.pl.", hebrew: "מדברות", hebrewNikud: "מְדַבְּרוֹת", transliteration: "medabrot" },
    ],
    futureTense: [
      { person: "I", hebrew: "אדבר", hebrewNikud: "אֲדַבֵּר", transliteration: "adaber" },
      { person: "You (m.s.)", hebrew: "תדבר", hebrewNikud: "תְּדַבֵּר", transliteration: "tedaber" },
      { person: "You (f.s.)", hebrew: "תדברי", hebrewNikud: "תְּדַבְּרִי", transliteration: "tedabri" },
      { person: "He", hebrew: "ידבר", hebrewNikud: "יְדַבֵּר", transliteration: "yedaber" },
      { person: "She", hebrew: "תדבר", hebrewNikud: "תְּדַבֵּר", transliteration: "tedaber" },
      { person: "We", hebrew: "נדבר", hebrewNikud: "נְדַבֵּר", transliteration: "nedaber" },
      { person: "You (m.pl.)", hebrew: "תדברו", hebrewNikud: "תְּדַבְּרוּ", transliteration: "tedabru" },
      { person: "You (f.pl.)", hebrew: "תדברנה", hebrewNikud: "תְּדַבֵּרְנָה", transliteration: "tedaberna" },
      { person: "They (m.)", hebrew: "ידברו", hebrewNikud: "יְדַבְּרוּ", transliteration: "yedabru" },
      { person: "They (f.)", hebrew: "תדברנה", hebrewNikud: "תְּדַבֵּרְנָה", transliteration: "tedaberna" },
    ],
  },
  {
    name: "Hif'il",
    hebrewName: "הִפְעִיל",
    description:
      "The causative active pattern. Makes someone else do the action, or expresses causing a state.",
    example: { root: "ש.מ.ע", rootLetters: "שמע", meaning: "to cause to hear / to play (music)" },
    pastTense: [
      { person: "I", hebrew: "השמעתי", hebrewNikud: "הִשְׁמַעְתִּי", transliteration: "hishmati" },
      { person: "You (m.s.)", hebrew: "השמעת", hebrewNikud: "הִשְׁמַעְתָּ", transliteration: "hishmata" },
      { person: "You (f.s.)", hebrew: "השמעת", hebrewNikud: "הִשְׁמַעְתְּ", transliteration: "hishmat" },
      { person: "He", hebrew: "השמיע", hebrewNikud: "הִשְׁמִיעַ", transliteration: "hishmia" },
      { person: "She", hebrew: "השמיעה", hebrewNikud: "הִשְׁמִיעָה", transliteration: "hishmia" },
      { person: "We", hebrew: "השמענו", hebrewNikud: "הִשְׁמַעְנוּ", transliteration: "hishmanu" },
      { person: "You (m.pl.)", hebrew: "השמעתם", hebrewNikud: "הִשְׁמַעְתֶּם", transliteration: "hishmatem" },
      { person: "You (f.pl.)", hebrew: "השמעתן", hebrewNikud: "הִשְׁמַעְתֶּן", transliteration: "hishmaten" },
      { person: "They (m.)", hebrew: "השמיעו", hebrewNikud: "הִשְׁמִיעוּ", transliteration: "hishmiu" },
      { person: "They (f.)", hebrew: "השמיעו", hebrewNikud: "הִשְׁמִיעוּ", transliteration: "hishmiu" },
    ],
    presentTense: [
      { person: "m.s.", hebrew: "משמיע", hebrewNikud: "מַשְׁמִיעַ", transliteration: "mashmia" },
      { person: "f.s.", hebrew: "משמיעה", hebrewNikud: "מַשְׁמִיעָה", transliteration: "mashmia" },
      { person: "m.pl.", hebrew: "משמיעים", hebrewNikud: "מַשְׁמִיעִים", transliteration: "mashmi'im" },
      { person: "f.pl.", hebrew: "משמיעות", hebrewNikud: "מַשְׁמִיעוֹת", transliteration: "mashmi'ot" },
    ],
    futureTense: [
      { person: "I", hebrew: "אשמיע", hebrewNikud: "אַשְׁמִיעַ", transliteration: "ashmi'a" },
      { person: "You (m.s.)", hebrew: "תשמיע", hebrewNikud: "תַּשְׁמִיעַ", transliteration: "tashmi'a" },
      { person: "You (f.s.)", hebrew: "תשמיעי", hebrewNikud: "תַּשְׁמִיעִי", transliteration: "tashmi'i" },
      { person: "He", hebrew: "ישמיע", hebrewNikud: "יַשְׁמִיעַ", transliteration: "yashmi'a" },
      { person: "She", hebrew: "תשמיע", hebrewNikud: "תַּשְׁמִיעַ", transliteration: "tashmi'a" },
      { person: "We", hebrew: "נשמיע", hebrewNikud: "נַשְׁמִיעַ", transliteration: "nashmi'a" },
      { person: "You (m.pl.)", hebrew: "תשמיעו", hebrewNikud: "תַּשְׁמִיעוּ", transliteration: "tashmi'u" },
      { person: "You (f.pl.)", hebrew: "תשמענה", hebrewNikud: "תַּשְׁמַעְנָה", transliteration: "tashmana" },
      { person: "They (m.)", hebrew: "ישמיעו", hebrewNikud: "יַשְׁמִיעוּ", transliteration: "yashmi'u" },
      { person: "They (f.)", hebrew: "תשמענה", hebrewNikud: "תַּשְׁמַעְנָה", transliteration: "tashmana" },
    ],
  },
  {
    name: "Nif'al",
    hebrewName: "נִפְעַל",
    description:
      "The passive/reflexive pattern. Expresses the passive of Pa'al or reflexive actions.",
    example: { root: "כ.ת.ב", rootLetters: "כתב", meaning: "to be written" },
    pastTense: [
      { person: "I", hebrew: "נכתבתי", hebrewNikud: "נִכְתַּבְתִּי", transliteration: "nikhtavti" },
      { person: "You (m.s.)", hebrew: "נכתבת", hebrewNikud: "נִכְתַּבְתָּ", transliteration: "nikhtavta" },
      { person: "You (f.s.)", hebrew: "נכתבת", hebrewNikud: "נִכְתַּבְתְּ", transliteration: "nikhtavt" },
      { person: "He", hebrew: "נכתב", hebrewNikud: "נִכְתַּב", transliteration: "nikhtav" },
      { person: "She", hebrew: "נכתבה", hebrewNikud: "נִכְתְּבָה", transliteration: "nikhteva" },
      { person: "We", hebrew: "נכתבנו", hebrewNikud: "נִכְתַּבְנוּ", transliteration: "nikhtavnu" },
      { person: "You (m.pl.)", hebrew: "נכתבתם", hebrewNikud: "נִכְתַּבְתֶּם", transliteration: "nikhtavtem" },
      { person: "You (f.pl.)", hebrew: "נכתבתן", hebrewNikud: "נִכְתַּבְתֶּן", transliteration: "nikhtavten" },
      { person: "They (m.)", hebrew: "נכתבו", hebrewNikud: "נִכְתְּבוּ", transliteration: "nikhtevu" },
      { person: "They (f.)", hebrew: "נכתבו", hebrewNikud: "נִכְתְּבוּ", transliteration: "nikhtevu" },
    ],
    presentTense: [
      { person: "m.s.", hebrew: "נכתב", hebrewNikud: "נִכְתָּב", transliteration: "nikhtav" },
      { person: "f.s.", hebrew: "נכתבת", hebrewNikud: "נִכְתֶּבֶת", transliteration: "nikhtevet" },
      { person: "m.pl.", hebrew: "נכתבים", hebrewNikud: "נִכְתָּבִים", transliteration: "nikhtavim" },
      { person: "f.pl.", hebrew: "נכתבות", hebrewNikud: "נִכְתָּבוֹת", transliteration: "nikhtavot" },
    ],
    futureTense: [
      { person: "I", hebrew: "אכתב", hebrewNikud: "אֶכָּתֵב", transliteration: "ekatev" },
      { person: "You (m.s.)", hebrew: "תיכתב", hebrewNikud: "תִּכָּתֵב", transliteration: "tikatev" },
      { person: "You (f.s.)", hebrew: "תיכתבי", hebrewNikud: "תִּכָּתְבִי", transliteration: "tikatevi" },
      { person: "He", hebrew: "ייכתב", hebrewNikud: "יִכָּתֵב", transliteration: "yikatev" },
      { person: "She", hebrew: "תיכתב", hebrewNikud: "תִּכָּתֵב", transliteration: "tikatev" },
      { person: "We", hebrew: "ניכתב", hebrewNikud: "נִכָּתֵב", transliteration: "nikatev" },
      { person: "You (m.pl.)", hebrew: "תיכתבו", hebrewNikud: "תִּכָּתְבוּ", transliteration: "tikatevu" },
      { person: "You (f.pl.)", hebrew: "תיכתבנה", hebrewNikud: "תִּכָּתַבְנָה", transliteration: "tikatavna" },
      { person: "They (m.)", hebrew: "ייכתבו", hebrewNikud: "יִכָּתְבוּ", transliteration: "yikatevu" },
      { person: "They (f.)", hebrew: "תיכתבנה", hebrewNikud: "תִּכָּתַבְנָה", transliteration: "tikatavna" },
    ],
  },
  {
    name: "Hitpa'el",
    hebrewName: "הִתְפַּעֵל",
    description:
      "The reflexive pattern. Used for reflexive actions (doing something to oneself) and reciprocal actions.",
    example: { root: "ל.ב.ש", rootLetters: "לבש", meaning: "to get dressed" },
    pastTense: [
      { person: "I", hebrew: "התלבשתי", hebrewNikud: "הִתְלַבַּשְׁתִּי", transliteration: "hitlabashti" },
      { person: "You (m.s.)", hebrew: "התלבשת", hebrewNikud: "הִתְלַבַּשְׁתָּ", transliteration: "hitlabashta" },
      { person: "You (f.s.)", hebrew: "התלבשת", hebrewNikud: "הִתְלַבַּשְׁתְּ", transliteration: "hitlabasht" },
      { person: "He", hebrew: "התלבש", hebrewNikud: "הִתְלַבֵּשׁ", transliteration: "hitlabesh" },
      { person: "She", hebrew: "התלבשה", hebrewNikud: "הִתְלַבְּשָׁה", transliteration: "hitlabsha" },
      { person: "We", hebrew: "התלבשנו", hebrewNikud: "הִתְלַבַּשְׁנוּ", transliteration: "hitlabashnu" },
      { person: "You (m.pl.)", hebrew: "התלבשתם", hebrewNikud: "הִתְלַבַּשְׁתֶּם", transliteration: "hitlabashtem" },
      { person: "You (f.pl.)", hebrew: "התלבשתן", hebrewNikud: "הִתְלַבַּשְׁתֶּן", transliteration: "hitlabashten" },
      { person: "They (m.)", hebrew: "התלבשו", hebrewNikud: "הִתְלַבְּשׁוּ", transliteration: "hitlabshu" },
      { person: "They (f.)", hebrew: "התלבשו", hebrewNikud: "הִתְלַבְּשׁוּ", transliteration: "hitlabshu" },
    ],
    presentTense: [
      { person: "m.s.", hebrew: "מתלבש", hebrewNikud: "מִתְלַבֵּשׁ", transliteration: "mitlabesh" },
      { person: "f.s.", hebrew: "מתלבשת", hebrewNikud: "מִתְלַבֶּשֶׁת", transliteration: "mitlabeshet" },
      { person: "m.pl.", hebrew: "מתלבשים", hebrewNikud: "מִתְלַבְּשִׁים", transliteration: "mitlabshim" },
      { person: "f.pl.", hebrew: "מתלבשות", hebrewNikud: "מִתְלַבְּשׁוֹת", transliteration: "mitlabshot" },
    ],
    futureTense: [
      { person: "I", hebrew: "אתלבש", hebrewNikud: "אֶתְלַבֵּשׁ", transliteration: "etlabesh" },
      { person: "You (m.s.)", hebrew: "תתלבש", hebrewNikud: "תִּתְלַבֵּשׁ", transliteration: "titlabesh" },
      { person: "You (f.s.)", hebrew: "תתלבשי", hebrewNikud: "תִּתְלַבְּשִׁי", transliteration: "titlabshi" },
      { person: "He", hebrew: "יתלבש", hebrewNikud: "יִתְלַבֵּשׁ", transliteration: "yitlabesh" },
      { person: "She", hebrew: "תתלבש", hebrewNikud: "תִּתְלַבֵּשׁ", transliteration: "titlabesh" },
      { person: "We", hebrew: "נתלבש", hebrewNikud: "נִתְלַבֵּשׁ", transliteration: "nitlabesh" },
      { person: "You (m.pl.)", hebrew: "תתלבשו", hebrewNikud: "תִּתְלַבְּשׁוּ", transliteration: "titlabshu" },
      { person: "You (f.pl.)", hebrew: "תתלבשנה", hebrewNikud: "תִּתְלַבַּשְׁנָה", transliteration: "titlabashna" },
      { person: "They (m.)", hebrew: "יתלבשו", hebrewNikud: "יִתְלַבְּשׁוּ", transliteration: "yitlabshu" },
      { person: "They (f.)", hebrew: "תתלבשנה", hebrewNikud: "תִּתְלַבַּשְׁנָה", transliteration: "titlabashna" },
    ],
  },
];

/* ── Hebrew Adjectives ───────────────────────────────── */

export const HEBREW_ADJECTIVES: HebrewAdjective[] = [
  {
    id: "adj:gadol",
    base: "גדול",
    forms: {
      ms: { hebrew: "גדול", hebrewNikud: "גָּדוֹל", transliteration: "gadol" },
      fs: { hebrew: "גדולה", hebrewNikud: "גְּדוֹלָה", transliteration: "gdola" },
      mp: { hebrew: "גדולים", hebrewNikud: "גְּדוֹלִים", transliteration: "gdolim" },
      fp: { hebrew: "גדולות", hebrewNikud: "גְּדוֹלוֹת", transliteration: "gdolot" },
    },
    translation: "big / large",
    category: "size",
  },
  {
    id: "adj:katan",
    base: "קטן",
    forms: {
      ms: { hebrew: "קטן", hebrewNikud: "קָטָן", transliteration: "katan" },
      fs: { hebrew: "קטנה", hebrewNikud: "קְטַנָּה", transliteration: "ktana" },
      mp: { hebrew: "קטנים", hebrewNikud: "קְטַנִּים", transliteration: "ktanim" },
      fp: { hebrew: "קטנות", hebrewNikud: "קְטַנּוֹת", transliteration: "ktanot" },
    },
    translation: "small / little",
    category: "size",
  },
  {
    id: "adj:tov",
    base: "טוב",
    forms: {
      ms: { hebrew: "טוב", hebrewNikud: "טוֹב", transliteration: "tov" },
      fs: { hebrew: "טובה", hebrewNikud: "טוֹבָה", transliteration: "tova" },
      mp: { hebrew: "טובים", hebrewNikud: "טוֹבִים", transliteration: "tovim" },
      fp: { hebrew: "טובות", hebrewNikud: "טוֹבוֹת", transliteration: "tovot" },
    },
    translation: "good",
    category: "quality",
  },
  {
    id: "adj:ra",
    base: "רע",
    forms: {
      ms: { hebrew: "רע", hebrewNikud: "רַע", transliteration: "ra" },
      fs: { hebrew: "רעה", hebrewNikud: "רָעָה", transliteration: "ra'a" },
      mp: { hebrew: "רעים", hebrewNikud: "רָעִים", transliteration: "ra'im" },
      fp: { hebrew: "רעות", hebrewNikud: "רָעוֹת", transliteration: "ra'ot" },
    },
    translation: "bad",
    category: "quality",
  },
  {
    id: "adj:yafe",
    base: "יפה",
    forms: {
      ms: { hebrew: "יפה", hebrewNikud: "יָפֶה", transliteration: "yafe" },
      fs: { hebrew: "יפה", hebrewNikud: "יָפָה", transliteration: "yafa" },
      mp: { hebrew: "יפים", hebrewNikud: "יָפִים", transliteration: "yafim" },
      fp: { hebrew: "יפות", hebrewNikud: "יָפוֹת", transliteration: "yafot" },
    },
    translation: "beautiful / pretty",
    category: "appearance",
  },
  {
    id: "adj:chadash",
    base: "חדש",
    forms: {
      ms: { hebrew: "חדש", hebrewNikud: "חָדָשׁ", transliteration: "chadash" },
      fs: { hebrew: "חדשה", hebrewNikud: "חֲדָשָׁה", transliteration: "chadasha" },
      mp: { hebrew: "חדשים", hebrewNikud: "חֲדָשִׁים", transliteration: "chadashim" },
      fp: { hebrew: "חדשות", hebrewNikud: "חֲדָשׁוֹת", transliteration: "chadashot" },
    },
    translation: "new",
    category: "quality",
  },
  {
    id: "adj:yashan",
    base: "ישן",
    forms: {
      ms: { hebrew: "ישן", hebrewNikud: "יָשָׁן", transliteration: "yashan" },
      fs: { hebrew: "ישנה", hebrewNikud: "יְשָׁנָה", transliteration: "yeshana" },
      mp: { hebrew: "ישנים", hebrewNikud: "יְשָׁנִים", transliteration: "yeshanim" },
      fp: { hebrew: "ישנות", hebrewNikud: "יְשָׁנוֹת", transliteration: "yeshanot" },
    },
    translation: "old (things)",
    category: "quality",
  },
  {
    id: "adj:chazak",
    base: "חזק",
    forms: {
      ms: { hebrew: "חזק", hebrewNikud: "חָזָק", transliteration: "chazak" },
      fs: { hebrew: "חזקה", hebrewNikud: "חֲזָקָה", transliteration: "chazaka" },
      mp: { hebrew: "חזקים", hebrewNikud: "חֲזָקִים", transliteration: "chazakim" },
      fp: { hebrew: "חזקות", hebrewNikud: "חֲזָקוֹת", transliteration: "chazakot" },
    },
    translation: "strong",
    category: "quality",
  },
  {
    id: "adj:chalash",
    base: "חלש",
    forms: {
      ms: { hebrew: "חלש", hebrewNikud: "חָלָשׁ", transliteration: "chalash" },
      fs: { hebrew: "חלשה", hebrewNikud: "חֲלָשָׁה", transliteration: "chalasha" },
      mp: { hebrew: "חלשים", hebrewNikud: "חֲלָשִׁים", transliteration: "chalashim" },
      fp: { hebrew: "חלשות", hebrewNikud: "חֲלָשׁוֹת", transliteration: "chalashot" },
    },
    translation: "weak",
    category: "quality",
  },
  {
    id: "adj:same'ach",
    base: "שמח",
    forms: {
      ms: { hebrew: "שמח", hebrewNikud: "שָׂמֵחַ", transliteration: "same'ach" },
      fs: { hebrew: "שמחה", hebrewNikud: "שְׂמֵחָה", transliteration: "smecha" },
      mp: { hebrew: "שמחים", hebrewNikud: "שְׂמֵחִים", transliteration: "smechim" },
      fp: { hebrew: "שמחות", hebrewNikud: "שְׂמֵחוֹת", transliteration: "smechot" },
    },
    translation: "happy",
    category: "emotion",
  },
  {
    id: "adj:atzuv",
    base: "עצוב",
    forms: {
      ms: { hebrew: "עצוב", hebrewNikud: "עָצוּב", transliteration: "atzuv" },
      fs: { hebrew: "עצובה", hebrewNikud: "עֲצוּבָה", transliteration: "atzuva" },
      mp: { hebrew: "עצובים", hebrewNikud: "עֲצוּבִים", transliteration: "atzuvim" },
      fp: { hebrew: "עצובות", hebrewNikud: "עֲצוּבוֹת", transliteration: "atzuvot" },
    },
    translation: "sad",
    category: "emotion",
  },
  {
    id: "adj:mahir",
    base: "מהיר",
    forms: {
      ms: { hebrew: "מהיר", hebrewNikud: "מָהִיר", transliteration: "mahir" },
      fs: { hebrew: "מהירה", hebrewNikud: "מְהִירָה", transliteration: "mehira" },
      mp: { hebrew: "מהירים", hebrewNikud: "מְהִירִים", transliteration: "mehirim" },
      fp: { hebrew: "מהירות", hebrewNikud: "מְהִירוֹת", transliteration: "mehirot" },
    },
    translation: "fast / quick",
    category: "other",
  },
  {
    id: "adj:iti",
    base: "איטי",
    forms: {
      ms: { hebrew: "איטי", hebrewNikud: "אִיטִי", transliteration: "iti" },
      fs: { hebrew: "איטית", hebrewNikud: "אִיטִית", transliteration: "itit" },
      mp: { hebrew: "איטיים", hebrewNikud: "אִיטִיִּים", transliteration: "iti'im" },
      fp: { hebrew: "איטיות", hebrewNikud: "אִיטִיּוֹת", transliteration: "iti'ot" },
    },
    translation: "slow",
    category: "other",
  },
  {
    id: "adj:cham",
    base: "חם",
    forms: {
      ms: { hebrew: "חם", hebrewNikud: "חַם", transliteration: "cham" },
      fs: { hebrew: "חמה", hebrewNikud: "חַמָּה", transliteration: "chama" },
      mp: { hebrew: "חמים", hebrewNikud: "חַמִּים", transliteration: "chamim" },
      fp: { hebrew: "חמות", hebrewNikud: "חַמּוֹת", transliteration: "chamot" },
    },
    translation: "hot / warm",
    category: "other",
  },
  {
    id: "adj:kar",
    base: "קר",
    forms: {
      ms: { hebrew: "קר", hebrewNikud: "קַר", transliteration: "kar" },
      fs: { hebrew: "קרה", hebrewNikud: "קָרָה", transliteration: "kara" },
      mp: { hebrew: "קרים", hebrewNikud: "קָרִים", transliteration: "karim" },
      fp: { hebrew: "קרות", hebrewNikud: "קָרוֹת", transliteration: "karot" },
    },
    translation: "cold",
    category: "other",
  },
  {
    id: "adj:gavoha",
    base: "גבוה",
    forms: {
      ms: { hebrew: "גבוה", hebrewNikud: "גָּבוֹהַּ", transliteration: "gavoha" },
      fs: { hebrew: "גבוהה", hebrewNikud: "גְּבוֹהָה", transliteration: "gvoha" },
      mp: { hebrew: "גבוהים", hebrewNikud: "גְּבוֹהִים", transliteration: "gvohim" },
      fp: { hebrew: "גבוהות", hebrewNikud: "גְּבוֹהוֹת", transliteration: "gvohot" },
    },
    translation: "tall / high",
    category: "size",
  },
  {
    id: "adj:namuch",
    base: "נמוך",
    forms: {
      ms: { hebrew: "נמוך", hebrewNikud: "נָמוּךְ", transliteration: "namuch" },
      fs: { hebrew: "נמוכה", hebrewNikud: "נְמוּכָה", transliteration: "nemucha" },
      mp: { hebrew: "נמוכים", hebrewNikud: "נְמוּכִים", transliteration: "nemuchim" },
      fp: { hebrew: "נמוכות", hebrewNikud: "נְמוּכוֹת", transliteration: "nemuchot" },
    },
    translation: "short / low",
    category: "size",
  },
  {
    id: "adj:kasheh",
    base: "קשה",
    forms: {
      ms: { hebrew: "קשה", hebrewNikud: "קָשֶׁה", transliteration: "kasheh" },
      fs: { hebrew: "קשה", hebrewNikud: "קָשָׁה", transliteration: "kasha" },
      mp: { hebrew: "קשים", hebrewNikud: "קָשִׁים", transliteration: "kashim" },
      fp: { hebrew: "קשות", hebrewNikud: "קָשׁוֹת", transliteration: "kashot" },
    },
    translation: "hard / difficult",
    category: "quality",
  },
  {
    id: "adj:kal",
    base: "קל",
    forms: {
      ms: { hebrew: "קל", hebrewNikud: "קַל", transliteration: "kal" },
      fs: { hebrew: "קלה", hebrewNikud: "קַלָּה", transliteration: "kala" },
      mp: { hebrew: "קלים", hebrewNikud: "קַלִּים", transliteration: "kalim" },
      fp: { hebrew: "קלות", hebrewNikud: "קַלּוֹת", transliteration: "kalot" },
    },
    translation: "easy / light",
    category: "quality",
  },
  {
    id: "adj:chashuv",
    base: "חשוב",
    forms: {
      ms: { hebrew: "חשוב", hebrewNikud: "חָשׁוּב", transliteration: "chashuv" },
      fs: { hebrew: "חשובה", hebrewNikud: "חֲשׁוּבָה", transliteration: "chashuva" },
      mp: { hebrew: "חשובים", hebrewNikud: "חֲשׁוּבִים", transliteration: "chashuvim" },
      fp: { hebrew: "חשובות", hebrewNikud: "חֲשׁוּבוֹת", transliteration: "chashuvot" },
    },
    translation: "important",
    category: "quality",
  },
];

/* ── Conjugation Exercises ───────────────────────────── */

export const CONJUGATION_EXERCISES: ConjugationExercise[] = [
  {
    sentenceTemplate: "{verb} a letter to my friend yesterday.",
    hebrewTemplate: "_____ מכתב לחבר שלי אתמול.",
    verb: "לכתוב",
    verbMeaning: "to write",
    targetPerson: "I",
    targetTense: "past",
    correctAnswer: "כתבתי",
    correctNikud: "כָּתַבְתִּי",
    correctTranslit: "katavti",
    distractors: ["כתבת", "כתב", "כותב"],
  },
  {
    sentenceTemplate: "She {verb} with her mother on the phone.",
    hebrewTemplate: "היא _____ עם אמא שלה בטלפון.",
    verb: "לדבר",
    verbMeaning: "to speak",
    targetPerson: "She",
    targetTense: "past",
    correctAnswer: "דיברה",
    correctNikud: "דִּבְּרָה",
    correctTranslit: "dibra",
    distractors: ["דיבר", "מדברת", "דיברתי"],
  },
  {
    sentenceTemplate: "We {verb} Hebrew every day now.",
    hebrewTemplate: "אנחנו _____ עברית כל יום עכשיו.",
    verb: "ללמוד",
    verbMeaning: "to learn",
    targetPerson: "We",
    targetTense: "present",
    correctAnswer: "לומדים",
    correctNikud: "לוֹמְדִים",
    correctTranslit: "lomdim",
    distractors: ["לומד", "לומדות", "למדנו"],
  },
  {
    sentenceTemplate: "He {verb} a book right now.",
    hebrewTemplate: "הוא _____ ספר עכשיו.",
    verb: "לכתוב",
    verbMeaning: "to write",
    targetPerson: "He",
    targetTense: "present",
    correctAnswer: "כותב",
    correctNikud: "כּוֹתֵב",
    correctTranslit: "kotev",
    distractors: ["כותבת", "כתב", "כותבים"],
  },
  {
    sentenceTemplate: "Tomorrow I {verb} to my grandmother.",
    hebrewTemplate: "מחר אני _____ לסבתא שלי.",
    verb: "לכתוב",
    verbMeaning: "to write",
    targetPerson: "I",
    targetTense: "future",
    correctAnswer: "אכתוב",
    correctNikud: "אֶכְתּוֹב",
    correctTranslit: "ekhtov",
    distractors: ["כתבתי", "כותב", "תכתוב"],
  },
  {
    sentenceTemplate: "The girls {verb} in the park every morning.",
    hebrewTemplate: "הבנות _____ בפארק כל בוקר.",
    verb: "לרוץ",
    verbMeaning: "to run",
    targetPerson: "f.pl.",
    targetTense: "present",
    correctAnswer: "רצות",
    correctNikud: "רָצוֹת",
    correctTranslit: "ratzot",
    distractors: ["רץ", "רצים", "רצה"],
  },
  {
    sentenceTemplate: "You (m.) {verb} very well!",
    hebrewTemplate: "אתה _____ מאוד טוב!",
    verb: "לדבר",
    verbMeaning: "to speak",
    targetPerson: "You (m.s.)",
    targetTense: "present",
    correctAnswer: "מדבר",
    correctNikud: "מְדַבֵּר",
    correctTranslit: "medaber",
    distractors: ["מדברת", "מדברים", "דיברת"],
  },
  {
    sentenceTemplate: "They {verb} to Israel next year.",
    hebrewTemplate: "הם _____ לישראל בשנה הבאה.",
    verb: "לנסוע",
    verbMeaning: "to travel",
    targetPerson: "They (m.)",
    targetTense: "future",
    correctAnswer: "יסעו",
    correctNikud: "יִסְעוּ",
    correctTranslit: "yis'u",
    distractors: ["נסעו", "נוסעים", "אסע"],
  },
  {
    sentenceTemplate: "The letter {verb} in Hebrew.",
    hebrewTemplate: "המכתב _____ בעברית.",
    verb: "להיכתב",
    verbMeaning: "to be written (Nif'al)",
    targetPerson: "He",
    targetTense: "past",
    correctAnswer: "נכתב",
    correctNikud: "נִכְתַּב",
    correctTranslit: "nikhtav",
    distractors: ["כתב", "נכתבה", "כותב"],
  },
  {
    sentenceTemplate: "She {verb} quickly for the meeting.",
    hebrewTemplate: "היא _____ מהר לפגישה.",
    verb: "להתלבש",
    verbMeaning: "to get dressed (Hitpa'el)",
    targetPerson: "She",
    targetTense: "past",
    correctAnswer: "התלבשה",
    correctNikud: "הִתְלַבְּשָׁה",
    correctTranslit: "hitlabsha",
    distractors: ["התלבש", "מתלבשת", "התלבשתי"],
  },
  {
    sentenceTemplate: "I {verb} for the exam tomorrow.",
    hebrewTemplate: "אני _____ למבחן מחר.",
    verb: "להתכונן",
    verbMeaning: "to prepare oneself (Hitpa'el)",
    targetPerson: "I",
    targetTense: "future",
    correctAnswer: "אתכונן",
    correctNikud: "אֶתְכּוֹנֵן",
    correctTranslit: "etkhonen",
    distractors: ["התכוננתי", "מתכונן", "תתכונן"],
  },
  {
    sentenceTemplate: "The children {verb} in the classroom.",
    hebrewTemplate: "הילדים _____ בכיתה.",
    verb: "לדבר",
    verbMeaning: "to speak",
    targetPerson: "m.pl.",
    targetTense: "present",
    correctAnswer: "מדברים",
    correctNikud: "מְדַבְּרִים",
    correctTranslit: "medabrim",
    distractors: ["מדבר", "דיברו", "מדברות"],
  },
];

export const GRAMMAR_LESSONS: GrammarLesson[] = [
  {
    id: "pronouns",
    title: "Personal Pronouns",
    titleHebrew: "כינויי גוף",
    description: "Learn the Hebrew personal pronouns",
    topics: [
      "I — אֲנִי (ani)",
      "You m.s. — אַתָּה (ata)",
      "You f.s. — אַתְּ (at)",
      "He — הוּא (hu)",
      "She — הִיא (hi)",
      "We — אֲנַחְנוּ (anakhnu)",
      "You m.pl. — אַתֶּם (atem)",
      "You f.pl. — אַתֶּן (aten)",
      "They m. — הֵם (hem)",
      "They f. — הֵן (hen)",
    ],
  },
  {
    id: "definite-article",
    title: "The Definite Article",
    titleHebrew: "ה׳ הידיעה",
    description: "Learn how to say 'the' in Hebrew",
    topics: [
      "Prefix ה + dagesh on next letter",
      "הַסֵּפֶר (hasefer) — the book",
      "Before gutturals (א, ה, ח, ע, ר): no dagesh, vowel changes",
      "הָאִישׁ (ha'ish) — the man",
    ],
  },
  {
    id: "construct-state",
    title: "Construct State (Smichut)",
    titleHebrew: "סמיכות",
    description: "Connecting nouns together to show possession or relation",
    topics: [
      "First noun (nismakh) changes form",
      "בֵּית סֵפֶר (beit sefer) — school (house of book)",
      "No definite article on first noun",
      "דֶּלֶת הַבַּיִת (delet habayit) — the door of the house",
    ],
  },
  {
    id: "prepositions",
    title: "Common Prepositions",
    titleHebrew: "מילות יחס",
    description: "Prefix and standalone prepositions in Hebrew",
    topics: [
      "בְּ (be-) — in, at",
      "לְ (le-) — to, for",
      "מִ (mi-) — from",
      "עַל (al) — on, about",
      "אֶל (el) — to, toward",
      "עִם (im) — with",
    ],
  },
  {
    id: "gender-nouns",
    title: "Noun Gender",
    titleHebrew: "מין השם",
    description: "How to identify masculine and feminine nouns",
    topics: [
      "Most nouns ending in ־ָה or ־ַת are feminine",
      "סֵפֶר (sefer, book) — masculine",
      "סִפְרִיָּה (sifriya, library) — feminine",
      "Exceptions: לַיְלָה (layla, night) is masculine despite ־ָה ending",
      "Paired body parts are feminine: יָד (yad, hand), עַיִן (ayin, eye)",
    ],
  },
  {
    id: "plurals",
    title: "Plural Forms",
    titleHebrew: "צורת רבים",
    description: "Regular and irregular plural patterns",
    topics: [
      "Masculine plural: add ־ִים (im) — סֵפֶר → סְפָרִים",
      "Feminine plural: replace ־ָה with ־וֹת — מִשְׁפָּחָה → מִשְׁפָּחוֹת (mishpachot)",
      "Some feminine nouns take ־ִים instead: שָׁנָה → שָׁנִים (shanim, years) — irregular!",
      "Some masculine nouns take ־וֹת: שֻׁלְחָן → שֻׁלְחָנוֹת",
      "Some feminine nouns take ־ִים: מִלָּה → מִלִּים",
      "Dual form for pairs: ־ַיִם — יוֹם → יוֹמַיִם (two days)",
    ],
  },
  {
    id: "adjectives",
    title: "Adjective Agreement",
    titleHebrew: "שמות תואר",
    description: "Adjectives must agree in gender, number, and definiteness",
    topics: [
      "Adjective follows the noun: סֵפֶר טוֹב (sefer tov, good book)",
      "Feminine: add ־ָה — טוֹבָה (tova, good f.)",
      "Plural m.: ־ִים — טוֹבִים (tovim)",
      "Plural f.: ־וֹת — טוֹבוֹת (tovot)",
      "Definite: both get ה — הַסֵּפֶר הַטּוֹב (hasefer hatov, the good book)",
    ],
  },
  {
    id: "possessives",
    title: "Possessive Suffixes",
    titleHebrew: "כינויי קניין",
    description: "Attach pronoun suffixes to nouns to show possession",
    topics: [
      "סִפְרִי (sifri) — my book",
      "סִפְרְךָ (sifrcha) — your (m.s.) book",
      "סִפְרֵךְ (sifrech) — your (f.s.) book",
      "סִפְרוֹ (sifro) — his book",
      "סִפְרָהּ (sifra) — her book",
      "סִפְרֵנוּ (sifrenu) — our book",
    ],
  },
  {
    id: "binyanim-overview",
    title: "The 7 Binyanim (Verb Patterns)",
    titleHebrew: "שבעת הבניינים",
    description: "Overview of the seven Hebrew verb constructions",
    topics: [
      "פָּעַל (Pa'al) — basic active: כָּתַב (katav, wrote)",
      "נִפְעַל (Nif'al) — passive/reflexive: נִכְתַּב (nikhtav, was written)",
      "פִּעֵל (Pi'el) — intensive: דִּבֵּר (diber, spoke)",
      "פֻּעַל (Pu'al) — intensive passive: דֻּבַּר (dubar, was spoken)",
      "הִפְעִיל (Hif'il) — causative: הִכְתִּיב (hikhtiv, dictated)",
      "הֻפְעַל (Huf'al) — causative passive: הֻכְתַּב (hukhtav, was dictated)",
      "הִתְפַּעֵל (Hitpa'el) — reflexive: הִתְכַּתֵּב (hitkhatev, corresponded)",
    ],
  },
  {
    id: "question-words",
    title: "Question Words",
    titleHebrew: "מילות שאלה",
    description: "Essential interrogative words for forming questions",
    topics: [
      "מַה (ma) — what?",
      "מִי (mi) — who?",
      "אֵיפֹה (eifo) — where?",
      "מָתַי (matai) — when?",
      "לָמָה (lama) — why?",
      "אֵיךְ (eich) — how?",
      "כַּמָה (kama) — how much / how many?",
      "הַאִם (ha'im) — yes/no question marker",
    ],
  },
  {
    id: "numbers-intro",
    title: "Numbers 1-10",
    titleHebrew: "מספרים",
    description: "Cardinal numbers and their masculine/feminine forms",
    topics: [
      "1: אֶחָד (echad m.) / אַחַת (achat f.)",
      "2: שְׁנַיִם (shnayim m.) / שְׁתַּיִם (shtayim f.)",
      "3: שְׁלוֹשָׁה (shlosha m.) / שָׁלוֹשׁ (shalosh f.)",
      "4: אַרְבָּעָה (arba'a m.) / אַרְבַּע (arba f.)",
      "5: חֲמִישָׁה (chamisha m.) / חָמֵשׁ (chamesh f.)",
      "Numbers 1-10: masculine form used with feminine nouns (counter-intuitive!)",
    ],
  },
  {
    id: "present-tense",
    title: "Present Tense (Binyan Pa'al)",
    titleHebrew: "הווה בבניין פעל",
    description: "How to conjugate regular Pa'al verbs in present tense",
    topics: [
      "Present tense has 4 forms: m.s., f.s., m.pl., f.pl.",
      "כּוֹתֵב (kotev) — writes (m.s.)",
      "כּוֹתֶבֶת (kotevet) — writes (f.s.)",
      "כּוֹתְבִים (kotvim) — write (m.pl.)",
      "כּוֹתְבוֹת (kotvot) — write (f.pl.)",
      "Pattern: 1st root letter + וֹ + 2nd root + ֵ + 3rd root",
    ],
  },
];
