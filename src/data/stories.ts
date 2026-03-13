export interface StorySegment {
  type: "narration" | "dialogue" | "challenge";
  text?: string;
  hebrew?: string;
  hebrewNikud?: string;
  transliteration?: string;
  speaker?: string;
  /** For challenge segments */
  challengeType?: "translate" | "fill-blank" | "comprehension";
  prompt?: string;
  correctAnswer?: string;
  options?: string[];
  wordIds?: string[]; // vocabulary words referenced
}

export interface StoryChapter {
  id: string;
  title: string;
  titleHebrew: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  segments: StorySegment[];
  vocabIntro: string[]; // word IDs to preview before chapter
  cliffhanger?: string;
}

export interface StorySeries {
  id: string;
  title: string;
  titleHebrew: string;
  description: string;
  chapters: StoryChapter[];
}

export const STORIES: StorySeries[] = [
  {
    id: "market-adventure",
    title: "The Market Adventure",
    titleHebrew: "\u05D4\u05E8\u05E4\u05EA\u05E7\u05D4 \u05D1\u05E9\u05D5\u05E7",
    description: "Follow Yael through a bustling Israeli market. Learn everyday Hebrew through shopping, bargaining, and meeting colorful characters.",
    chapters: [
      {
        id: "market-ch1",
        title: "A New Morning",
        titleHebrew: "\u05D1\u05D5\u05E7\u05E8 \u05D7\u05D3\u05E9",
        description: "Yael wakes up and heads to the shuk for the first time.",
        level: "beginner",
        vocabIntro: ["builtin:shalom", "builtin:todah", "builtin:bevakasha", "builtin:boker-tov"],
        segments: [
          {
            type: "narration",
            text: "The sun rises over Tel Aviv. Yael opens her eyes and smiles. Today is her first day exploring the famous Carmel Market.",
          },
          {
            type: "dialogue",
            text: "Good morning!",
            hebrew: "\u05D1\u05D5\u05E7\u05E8 \u05D8\u05D5\u05D1",
            hebrewNikud: "\u05D1\u05BC\u05D5\u05B9\u05E7\u05B6\u05E8 \u05D8\u05D5\u05B9\u05D1",
            transliteration: "boker tov",
            speaker: "Yael",
          },
          {
            type: "challenge",
            challengeType: "translate",
            prompt: "How do you say 'hello' or 'peace' in Hebrew?",
            hebrew: "\u05E9\u05DC\u05D5\u05DD",
            hebrewNikud: "\u05E9\u05B8\u05C1\u05DC\u05D5\u05B9\u05DD",
            correctAnswer: "hello / peace",
            options: ["hello / peace", "goodbye", "thank you", "good night"],
          },
          {
            type: "narration",
            text: "She walks through the narrow streets. The sounds of merchants calling out fill the air. The smell of fresh spices is everywhere.",
          },
          {
            type: "dialogue",
            text: "Excuse me, where is the fruit section?",
            hebrew: "\u05E1\u05DC\u05D9\u05D7\u05D4, \u05D0\u05D9\u05E4\u05D4 \u05D4\u05E4\u05D9\u05E8\u05D5\u05EA?",
            hebrewNikud: "\u05E1\u05B0\u05DC\u05D9\u05D7\u05B8\u05D4, \u05D0\u05B5\u05D9\u05E4\u05B9\u05D4 \u05D4\u05E4\u05BC\u05B5\u05D9\u05E8\u05D5\u05B9\u05EA?",
            transliteration: "slicha, eifo ha-peirot?",
            speaker: "Yael",
          },
          {
            type: "challenge",
            challengeType: "fill-blank",
            prompt: "Complete: Yael says _____ to get someone's attention politely.",
            correctAnswer: "\u05E1\u05DC\u05D9\u05D7\u05D4",
            options: ["\u05E1\u05DC\u05D9\u05D7\u05D4", "\u05EA\u05D5\u05D3\u05D4", "\u05DB\u05DF", "\u05DC\u05D0"],
          },
          {
            type: "dialogue",
            text: "Over there! The best fruit in all of Tel Aviv!",
            hebrew: "\u05E9\u05DD! \u05D4\u05E4\u05D9\u05E8\u05D5\u05EA \u05D4\u05DB\u05D9 \u05D8\u05D5\u05D1\u05D5\u05EA \u05D1\u05DB\u05DC \u05EA\u05DC \u05D0\u05D1\u05D9\u05D1!",
            transliteration: "sham! ha-peirot hakhi tovot b'khol Tel Aviv!",
            speaker: "Merchant",
          },
          {
            type: "challenge",
            challengeType: "comprehension",
            prompt: "What is the merchant proud of?",
            correctAnswer: "His fruit is the best in Tel Aviv",
            options: [
              "His fruit is the best in Tel Aviv",
              "He has the lowest prices",
              "He is new to the market",
              "He sells vegetables",
            ],
          },
          {
            type: "narration",
            text: "Yael thanks the merchant and walks toward the colorful stalls. Oranges, pomegranates, dates \u2014 everything looks amazing. But then she notices something strange at the end of the aisle...",
          },
        ],
        cliffhanger: "What did Yael see at the end of the aisle? Continue to Chapter 2 to find out!",
      },
      {
        id: "market-ch2",
        title: "The Mysterious Stall",
        titleHebrew: "\u05D4\u05D3\u05D5\u05DB\u05DF \u05D4\u05DE\u05E1\u05EA\u05D5\u05E8\u05D9",
        description: "Yael discovers a hidden stall with unusual items.",
        level: "beginner",
        vocabIntro: ["builtin:ken", "builtin:lo", "builtin:echad", "builtin:shnayim"],
        segments: [
          {
            type: "narration",
            text: "At the end of the aisle, hidden behind towers of watermelons, Yael finds a small stall she has never seen before. An old man sits behind a table covered with curious objects.",
          },
          {
            type: "dialogue",
            text: "Hello! Would you like to see something special?",
            hebrew: "\u05E9\u05DC\u05D5\u05DD! \u05E8\u05D5\u05E6\u05D4 \u05DC\u05E8\u05D0\u05D5\u05EA \u05DE\u05E9\u05D4\u05D5 \u05DE\u05D9\u05D5\u05D7\u05D3?",
            hebrewNikud: "\u05E9\u05B8\u05C1\u05DC\u05D5\u05B9\u05DD! \u05E8\u05D5\u05B9\u05E6\u05B8\u05D4 \u05DC\u05B4\u05E8\u05B0\u05D0\u05D5\u05B9\u05EA \u05DE\u05B7\u05E9\u05BC\u05C1\u05B6\u05D4\u05D5\u05BC \u05DE\u05B0\u05D9\u05D5\u05BC\u05D7\u05B8\u05D3?",
            transliteration: "shalom! rotzah lir'ot mashehu meyuchad?",
            speaker: "Old Man",
          },
          {
            type: "challenge",
            challengeType: "translate",
            prompt: "The old man says shalom. What does it mean?",
            correctAnswer: "hello / peace",
            options: ["hello / peace", "help me", "go away", "come here"],
          },
          {
            type: "dialogue",
            text: "Yes! What is this?",
            hebrew: "\u05DB\u05DF! \u05DE\u05D4 \u05D6\u05D4?",
            hebrewNikud: "\u05DB\u05BC\u05B5\u05DF! \u05DE\u05B7\u05D4 \u05D6\u05B6\u05D4?",
            transliteration: "ken! mah zeh?",
            speaker: "Yael",
          },
          {
            type: "narration",
            text: "The old man reaches under the table and pulls out a small, very old book. The cover is decorated with golden Hebrew letters.",
          },
          {
            type: "challenge",
            challengeType: "fill-blank",
            prompt: "Yael says _____ to mean 'yes'.",
            correctAnswer: "\u05DB\u05DF",
            options: ["\u05DB\u05DF", "\u05DC\u05D0", "\u05DE\u05D4", "\u05D6\u05D4"],
          },
          {
            type: "dialogue",
            text: "This book is one of a kind. It teaches the secrets of Hebrew that most people have forgotten...",
            hebrew: "\u05D4\u05E1\u05E4\u05E8 \u05D4\u05D6\u05D4 \u05D9\u05D7\u05D9\u05D3 \u05D1\u05DE\u05D9\u05E0\u05D5. \u05D4\u05D5\u05D0 \u05DE\u05DC\u05DE\u05D3 \u05E1\u05D5\u05D3\u05D5\u05EA \u05E9\u05DC \u05E2\u05D1\u05E8\u05D9\u05EA...",
            transliteration: "ha-sefer hazeh yachid b'mino. hu melamed sodot shel ivrit...",
            speaker: "Old Man",
          },
          {
            type: "challenge",
            challengeType: "comprehension",
            prompt: "What is special about the book?",
            correctAnswer: "It teaches forgotten Hebrew secrets",
            options: [
              "It teaches forgotten Hebrew secrets",
              "It contains recipes",
              "It is very expensive",
              "It belongs to Yael's family",
            ],
          },
          {
            type: "narration",
            text: "Yael reaches for the book, but before she can touch it, a gust of wind blows through the market. When she looks up, the old man is gone. But the book remains on the table, glowing faintly...",
          },
        ],
        cliffhanger: "The old man vanished, but left the mysterious book behind. What secrets does it hold? Continue to find out...",
      },
      {
        id: "market-ch3",
        title: "The First Lesson",
        titleHebrew: "\u05D4\u05E9\u05D9\u05E2\u05D5\u05E8 \u05D4\u05E8\u05D0\u05E9\u05D5\u05DF",
        description: "Yael opens the book and begins her real Hebrew journey.",
        level: "beginner",
        vocabIntro: ["builtin:sefer", "builtin:echad", "builtin:shnayim", "builtin:shalosh"],
        segments: [
          {
            type: "narration",
            text: "Yael picks up the book carefully. It feels warm in her hands. She opens the first page and sees beautiful Hebrew calligraphy.",
          },
          {
            type: "dialogue",
            text: "Lesson one: Every word has a root. Every root tells a story.",
            hebrew: "\u05E9\u05D9\u05E2\u05D5\u05E8 \u05D0\u05D7\u05D3: \u05DC\u05DB\u05DC \u05DE\u05D9\u05DC\u05D4 \u05D9\u05E9 \u05E9\u05D5\u05E8\u05E9. \u05DB\u05DC \u05E9\u05D5\u05E8\u05E9 \u05DE\u05E1\u05E4\u05E8 \u05E1\u05D9\u05E4\u05D5\u05E8.",
            transliteration: "shi'ur echad: l'khol milah yesh shoresh. kol shoresh mesaper sipur.",
            speaker: "The Book",
          },
          {
            type: "challenge",
            challengeType: "translate",
            prompt: "The book says every word has a _____. (shoresh)",
            correctAnswer: "root",
            options: ["root", "color", "number", "letter"],
          },
          {
            type: "narration",
            text: "The pages begin to glow. Letters float off the page and swirl around Yael. She hears them whisper their sounds.",
          },
          {
            type: "challenge",
            challengeType: "fill-blank",
            prompt: "How do you say 'one' in Hebrew? (shi'ur _____)",
            correctAnswer: "\u05D0\u05D7\u05D3",
            options: ["\u05D0\u05D7\u05D3", "\u05E9\u05E0\u05D9\u05D9\u05DD", "\u05E9\u05DC\u05D5\u05E9", "\u05D0\u05E8\u05D1\u05E2"],
          },
          {
            type: "narration",
            text: "Suddenly, a voice echoes from the book: 'You are ready to begin your journey. But remember \u2014 the market holds many more secrets. Return when you are ready for the next lesson.'",
          },
          {
            type: "challenge",
            challengeType: "comprehension",
            prompt: "What is the key idea from Lesson One?",
            correctAnswer: "Every Hebrew word has a root that tells a story",
            options: [
              "Every Hebrew word has a root that tells a story",
              "Hebrew is the oldest language",
              "The market is dangerous",
              "Books can talk",
            ],
          },
          {
            type: "narration",
            text: "The book closes itself and shrinks to fit in Yael's pocket. She smiles and walks back into the bustling market, seeing the Hebrew signs with new eyes. This is just the beginning...",
          },
        ],
        cliffhanger: "Yael has begun her Hebrew journey. The book promises more lessons — but first, she must prove she remembers what she learned...",
      },
    ],
  },
  {
    id: "cafe-conversations",
    title: "Caf\u00E9 Conversations",
    titleHebrew: "\u05E9\u05D9\u05D7\u05D5\u05EA \u05D1\u05D1\u05D9\u05EA \u05E7\u05E4\u05D4",
    description: "Practice everyday Hebrew through conversations at a caf\u00E9. Learn to order food, chat with friends, and navigate social situations.",
    chapters: [
      {
        id: "cafe-ch1",
        title: "The First Order",
        titleHebrew: "\u05D4\u05D4\u05D6\u05DE\u05E0\u05D4 \u05D4\u05E8\u05D0\u05E9\u05D5\u05E0\u05D4",
        description: "Learn to order coffee and food in Hebrew.",
        level: "beginner",
        vocabIntro: ["builtin:bevakasha", "builtin:todah", "builtin:mayim", "builtin:lechem"],
        segments: [
          {
            type: "narration",
            text: "Yael sits at a small caf\u00E9 on Dizengoff Street. The waiter approaches with a friendly smile.",
          },
          {
            type: "dialogue",
            text: "Hello! What would you like?",
            hebrew: "\u05E9\u05DC\u05D5\u05DD! \u05DE\u05D4 \u05EA\u05E8\u05E6\u05D9?",
            hebrewNikud: "\u05E9\u05B8\u05C1\u05DC\u05D5\u05B9\u05DD! \u05DE\u05B7\u05D4 \u05EA\u05BC\u05B4\u05E8\u05B0\u05E6\u05B4\u05D9?",
            transliteration: "shalom! mah tirtzi?",
            speaker: "Waiter",
          },
          {
            type: "dialogue",
            text: "Water, please.",
            hebrew: "\u05DE\u05D9\u05DD, \u05D1\u05D1\u05E7\u05E9\u05D4.",
            hebrewNikud: "\u05DE\u05B7\u05D9\u05B4\u05DD, \u05D1\u05BC\u05B0\u05D1\u05B7\u05E7\u05BC\u05B8\u05E9\u05C1\u05B8\u05D4.",
            transliteration: "mayim, bevakasha.",
            speaker: "Yael",
          },
          {
            type: "challenge",
            challengeType: "translate",
            prompt: "What does Yael order?",
            hebrew: "\u05DE\u05D9\u05DD",
            hebrewNikud: "\u05DE\u05B7\u05D9\u05B4\u05DD",
            correctAnswer: "water",
            options: ["water", "coffee", "bread", "juice"],
          },
          {
            type: "challenge",
            challengeType: "fill-blank",
            prompt: "To say 'please' in Hebrew, Yael says: _____",
            correctAnswer: "\u05D1\u05D1\u05E7\u05E9\u05D4",
            options: ["\u05D1\u05D1\u05E7\u05E9\u05D4", "\u05EA\u05D5\u05D3\u05D4", "\u05E1\u05DC\u05D9\u05D7\u05D4", "\u05E9\u05DC\u05D5\u05DD"],
          },
          {
            type: "dialogue",
            text: "Thank you!",
            hebrew: "\u05EA\u05D5\u05D3\u05D4!",
            hebrewNikud: "\u05EA\u05BC\u05D5\u05B9\u05D3\u05B8\u05D4!",
            transliteration: "todah!",
            speaker: "Yael",
          },
          {
            type: "narration",
            text: "The waiter brings the water. But he also brings a small plate of bread \u2014 a gift. Yael smiles. She feels at home already. As she sips her water, she overhears an interesting conversation at the next table...",
          },
        ],
        cliffhanger: "What is the conversation at the next table about? Continue to Chapter 2!",
      },
      {
        id: "cafe-ch2",
        title: "The Eavesdropper",
        titleHebrew: "\u05D4\u05DE\u05D0\u05D6\u05D9\u05E0\u05D4",
        description: "Yael overhears a conversation and learns about family.",
        level: "beginner",
        vocabIntro: ["builtin:ima", "builtin:aba", "builtin:ach", "builtin:achot"],
        segments: [
          {
            type: "narration",
            text: "At the next table, a young man is talking on the phone. He seems excited.",
          },
          {
            type: "dialogue",
            text: "Mom! Yes, I'm at the caf\u00E9. Dad is coming too.",
            hebrew: "\u05D0\u05D9\u05DE\u05D0! \u05DB\u05DF, \u05D0\u05E0\u05D9 \u05D1\u05D1\u05D9\u05EA \u05E7\u05E4\u05D4. \u05D0\u05D1\u05D0 \u05D2\u05DD \u05D1\u05D0.",
            hebrewNikud: "\u05D0\u05B4\u05DE\u05BC\u05B8\u05D0! \u05DB\u05BC\u05B5\u05DF, \u05D0\u05B2\u05E0\u05B4\u05D9 \u05D1\u05BC\u05B0\u05D1\u05B5\u05D9\u05EA \u05E7\u05B8\u05E4\u05B6\u05D4. \u05D0\u05B7\u05D1\u05BC\u05B8\u05D0 \u05D2\u05B7\u05BC\u05DD \u05D1\u05BC\u05B8\u05D0.",
            transliteration: "ima! ken, ani b'veit kafeh. aba gam ba.",
            speaker: "Young Man",
          },
          {
            type: "challenge",
            challengeType: "translate",
            prompt: "What does 'ima' mean?",
            correctAnswer: "mom / mother",
            options: ["mom / mother", "dad / father", "sister", "brother"],
          },
          {
            type: "dialogue",
            text: "My brother and sister are also coming. The whole family!",
            hebrew: "\u05D2\u05DD \u05D4\u05D0\u05D7 \u05D5\u05D4\u05D0\u05D7\u05D5\u05EA \u05E9\u05DC\u05D9 \u05D1\u05D0\u05D9\u05DD. \u05DB\u05DC \u05D4\u05DE\u05E9\u05E4\u05D7\u05D4!",
            hebrewNikud: "\u05D2\u05B7\u05BC\u05DD \u05D4\u05B8\u05D0\u05B8\u05D7 \u05D5\u05B0\u05D4\u05B8\u05D0\u05B8\u05D7\u05D5\u05B9\u05EA \u05E9\u05C1\u05B6\u05DC\u05BC\u05B4\u05D9 \u05D1\u05BC\u05B8\u05D0\u05B4\u05D9\u05DD. \u05DB\u05BC\u05B8\u05DC \u05D4\u05B7\u05DE\u05BC\u05B4\u05E9\u05C1\u05B0\u05E4\u05BC\u05B8\u05D7\u05B8\u05D4!",
            transliteration: "gam ha-ach v'ha-achot sheli ba'im. kol ha-mishpacha!",
            speaker: "Young Man",
          },
          {
            type: "challenge",
            challengeType: "fill-blank",
            prompt: "The word for 'family' in Hebrew is:",
            correctAnswer: "\u05DE\u05E9\u05E4\u05D7\u05D4",
            options: ["\u05DE\u05E9\u05E4\u05D7\u05D4", "\u05D7\u05D1\u05E8\u05D9\u05DD", "\u05D0\u05D7\u05D9\u05DD", "\u05E9\u05DB\u05E0\u05D9\u05DD"],
          },
          {
            type: "narration",
            text: "Yael smiles. She thinks of her own family back home. Maybe tomorrow she'll call her mother and tell her about this beautiful caf\u00E9. For now, she orders a piece of cake and enjoys the warm afternoon...",
          },
          {
            type: "challenge",
            challengeType: "comprehension",
            prompt: "What is the young man excited about?",
            correctAnswer: "His whole family is meeting at the caf\u00E9",
            options: [
              "His whole family is meeting at the caf\u00E9",
              "He got a new job",
              "He's going on vacation",
              "He finished his homework",
            ],
          },
        ],
        cliffhanger: "Yael thinks about calling her own family. But first, she has a surprise encounter the next day...",
      },
      {
        id: "cafe-ch3",
        title: "Making Friends",
        titleHebrew: "\u05DC\u05D4\u05DB\u05D9\u05E8 \u05D7\u05D1\u05E8\u05D9\u05DD",
        description: "Yael meets someone and practices conversation.",
        level: "beginner",
        vocabIntro: ["builtin:shalom", "builtin:ma-nishma", "builtin:shem", "builtin:naim-meod"],
        segments: [
          {
            type: "narration",
            text: "The next day, Yael returns to the same caf\u00E9. She sits at her favorite table and opens her notebook to study Hebrew.",
          },
          {
            type: "dialogue",
            text: "Hi! Are you studying Hebrew?",
            hebrew: "\u05D4\u05D9\u05D9! \u05D0\u05EA \u05DC\u05D5\u05DE\u05D3\u05EA \u05E2\u05D1\u05E8\u05D9\u05EA?",
            hebrewNikud: "\u05D4\u05B7\u05D9\u05D9! \u05D0\u05B7\u05EA\u05BC \u05DC\u05D5\u05B9\u05DE\u05B6\u05D3\u05B6\u05EA \u05E2\u05B4\u05D1\u05B0\u05E8\u05B4\u05D9\u05EA?",
            transliteration: "hai! at lomedet ivrit?",
            speaker: "Noa",
          },
          {
            type: "dialogue",
            text: "Yes! I'm Yael. Nice to meet you!",
            hebrew: "\u05DB\u05DF! \u05D0\u05E0\u05D9 \u05D9\u05E2\u05DC. \u05E0\u05E2\u05D9\u05DD \u05DE\u05D0\u05D5\u05D3!",
            hebrewNikud: "\u05DB\u05BC\u05B5\u05DF! \u05D0\u05B2\u05E0\u05B4\u05D9 \u05D9\u05B8\u05E2\u05B5\u05DC. \u05E0\u05B8\u05E2\u05B4\u05D9\u05DD \u05DE\u05B0\u05D0\u05D5\u05B9\u05D3!",
            transliteration: "ken! ani ya'el. na'im me'od!",
            speaker: "Yael",
          },
          {
            type: "challenge",
            challengeType: "translate",
            prompt: "What does 'na'im me'od' mean?",
            correctAnswer: "nice to meet you",
            options: ["nice to meet you", "how are you", "goodbye", "see you later"],
          },
          {
            type: "dialogue",
            text: "I'm Noa. I can help you practice!",
            hebrew: "\u05D0\u05E0\u05D9 \u05E0\u05D5\u05E2\u05D4. \u05D0\u05E0\u05D9 \u05D9\u05DB\u05D5\u05DC\u05D4 \u05DC\u05E2\u05D6\u05D5\u05E8 \u05DC\u05DA \u05DC\u05EA\u05E8\u05D2\u05DC!",
            hebrewNikud: "\u05D0\u05B2\u05E0\u05B4\u05D9 \u05E0\u05D5\u05B9\u05E2\u05B8\u05D4. \u05D0\u05B2\u05E0\u05B4\u05D9 \u05D9\u05B0\u05DB\u05D5\u05B9\u05DC\u05B8\u05D4 \u05DC\u05B7\u05E2\u05B2\u05D6\u05D5\u05B9\u05E8 \u05DC\u05B8\u05DA\u05B0 \u05DC\u05B0\u05EA\u05B7\u05E8\u05B0\u05D2\u05B5\u05DC!",
            transliteration: "ani no'ah. ani yekhola la'azor lakh letargel!",
            speaker: "Noa",
          },
          {
            type: "challenge",
            challengeType: "comprehension",
            prompt: "What does Noa offer to do?",
            correctAnswer: "Help Yael practice Hebrew",
            options: [
              "Help Yael practice Hebrew",
              "Order food for Yael",
              "Show Yael around the city",
              "Teach Yael to cook",
            ],
          },
          {
            type: "narration",
            text: "And just like that, Yael made her first friend in Israel. They spent the afternoon talking, laughing, and practicing Hebrew together. Noa promised to meet her again tomorrow. This is what learning is really about \u2014 connection.",
          },
        ],
        cliffhanger: "Yael has a new study partner. Tomorrow, Noa has a special surprise planned...",
      },
    ],
  },
  {
    id: "lost-in-jerusalem",
    title: "Lost in Jerusalem",
    titleHebrew: "\u05D0\u05D1\u05D5\u05D3\u05D9\u05DD \u05D1\u05D9\u05E8\u05D5\u05E9\u05DC\u05D9\u05DD",
    description: "Navigate the ancient streets of Jerusalem. Learn directions, places, and how to ask for help in Hebrew.",
    chapters: [
      {
        id: "jerusalem-ch1",
        title: "The Old City",
        titleHebrew: "\u05D4\u05E2\u05D9\u05E8 \u05D4\u05E2\u05EA\u05D9\u05E7\u05D4",
        description: "Explore the narrow streets of the Old City and learn to ask for directions.",
        level: "intermediate",
        vocabIntro: ["builtin:rechov", "builtin:yamina", "builtin:smola", "builtin:yashar"],
        segments: [
          {
            type: "narration",
            text: "Yael and Noa take the bus to Jerusalem. The ancient walls of the Old City rise before them, golden in the morning sun. They enter through the Jaffa Gate.",
          },
          {
            type: "dialogue",
            text: "Wow, it's beautiful! Where should we go first?",
            hebrew: "\u05D5\u05D0\u05D5, \u05D9\u05E4\u05D4! \u05DC\u05D0\u05DF \u05E0\u05DC\u05DA \u05E7\u05D5\u05D3\u05DD?",
            hebrewNikud: "\u05D5\u05B7\u05D0\u05D5, \u05D9\u05B8\u05E4\u05B6\u05D4! \u05DC\u05B0\u05D0\u05B8\u05DF \u05E0\u05B5\u05DC\u05B5\u05DA\u05B0 \u05E7\u05D5\u05B9\u05D3\u05B6\u05DD?",
            transliteration: "wow, yafeh! le'an nelekh kodem?",
            speaker: "Yael",
          },
          {
            type: "dialogue",
            text: "Let's find the Western Wall. Go straight and then turn right.",
            hebrew: "\u05D1\u05D5\u05D0\u05D9 \u05E0\u05DE\u05E6\u05D0 \u05D0\u05EA \u05D4\u05DB\u05D5\u05EA\u05DC. \u05DC\u05DA \u05D9\u05E9\u05E8 \u05D5\u05D0\u05D7\u05E8 \u05DB\u05DA \u05E4\u05E0\u05D9 \u05D9\u05DE\u05D9\u05E0\u05D4.",
            hebrewNikud: "\u05D1\u05BC\u05D5\u05B9\u05D0\u05B4\u05D9 \u05E0\u05B4\u05DE\u05B0\u05E6\u05B8\u05D0 \u05D0\u05B6\u05EA \u05D4\u05B7\u05DB\u05BC\u05D5\u05B9\u05EA\u05B6\u05DC. \u05DC\u05B0\u05DB\u05B4\u05D9 \u05D9\u05B8\u05E9\u05B8\u05C1\u05E8 \u05D5\u05B0\u05D0\u05B7\u05D7\u05B7\u05E8 \u05DB\u05BC\u05B8\u05DA\u05B0 \u05E4\u05B0\u05E0\u05B4\u05D9 \u05D9\u05B8\u05DE\u05B4\u05D9\u05E0\u05B8\u05D4.",
            transliteration: "bo'i nimtza et ha-kotel. lekhi yashar v'achar kakh p'ni yaminah.",
            speaker: "Noa",
          },
          {
            type: "challenge",
            challengeType: "translate",
            prompt: "What does 'yashar' mean?",
            correctAnswer: "straight",
            options: ["straight", "right", "left", "back"],
          },
          {
            type: "narration",
            text: "But the narrow streets are like a maze. After ten minutes, they realize they're lost. They need to ask for directions.",
          },
          {
            type: "dialogue",
            text: "Excuse me, where is the Western Wall?",
            hebrew: "\u05E1\u05DC\u05D9\u05D7\u05D4, \u05D0\u05D9\u05E4\u05D4 \u05D4\u05DB\u05D5\u05EA\u05DC?",
            hebrewNikud: "\u05E1\u05B0\u05DC\u05B4\u05D9\u05D7\u05B8\u05D4, \u05D0\u05B5\u05D9\u05E4\u05B9\u05D4 \u05D4\u05B7\u05DB\u05BC\u05D5\u05B9\u05EA\u05B6\u05DC?",
            transliteration: "slicha, eifo ha-kotel?",
            speaker: "Yael",
          },
          {
            type: "challenge",
            challengeType: "fill-blank",
            prompt: "'Turn right' in Hebrew is: p'neh _____",
            correctAnswer: "\u05D9\u05DE\u05D9\u05E0\u05D4",
            options: ["\u05D9\u05DE\u05D9\u05E0\u05D4", "\u05E9\u05DE\u05D0\u05DC\u05D4", "\u05D9\u05E9\u05E8", "\u05D0\u05D7\u05D5\u05E8\u05D4"],
          },
          {
            type: "narration",
            text: "A kind shopkeeper points them in the right direction. They follow the winding path downward. The sound of prayers grows louder. And then, around one final corner, they see it \u2014 the Western Wall, glowing in the sunlight...",
          },
        ],
        cliffhanger: "They've found the Western Wall. But Yael notices something carved into a stone nearby that changes everything...",
      },
      {
        id: "jerusalem-ch2",
        title: "The Hidden Message",
        titleHebrew: "\u05D4\u05D4\u05D5\u05D3\u05E2\u05D4 \u05D4\u05D7\u05D1\u05D5\u05D9\u05D4",
        description: "Yael discovers an ancient Hebrew inscription and learns about roots.",
        level: "intermediate",
        vocabIntro: ["builtin:avanim", "builtin:katuv", "builtin:yashan", "builtin:chadash"],
        segments: [
          {
            type: "narration",
            text: "Near the Wall, Yael notices an old stone with faded Hebrew letters. The inscription is ancient but still readable.",
          },
          {
            type: "dialogue",
            text: "Noa, look! What's written here?",
            hebrew: "\u05E0\u05D5\u05E2\u05D4, \u05EA\u05E8\u05D0\u05D9! \u05DE\u05D4 \u05DB\u05EA\u05D5\u05D1 \u05E4\u05D4?",
            hebrewNikud: "\u05E0\u05D5\u05B9\u05E2\u05B8\u05D4, \u05EA\u05BC\u05B4\u05E8\u05B0\u05D0\u05B4\u05D9! \u05DE\u05B7\u05D4 \u05DB\u05BC\u05B8\u05EA\u05D5\u05BC\u05D1 \u05E4\u05B9\u05D4?",
            transliteration: "no'ah, tir'i! mah katuv po?",
            speaker: "Yael",
          },
          {
            type: "challenge",
            challengeType: "translate",
            prompt: "What does 'katuv' mean?",
            correctAnswer: "written",
            options: ["written", "old", "new", "stone"],
          },
          {
            type: "dialogue",
            text: "It says: 'From old stones, new words grow.' It's about Hebrew roots!",
            hebrew: "\u05DB\u05EA\u05D5\u05D1 \u05E4\u05D4: '\u05DE\u05D0\u05D1\u05E0\u05D9\u05DD \u05D9\u05E9\u05E0\u05D5\u05EA, \u05DE\u05D9\u05DC\u05D9\u05DD \u05D7\u05D3\u05E9\u05D5\u05EA \u05E6\u05D5\u05DE\u05D7\u05D5\u05EA.' \u05D6\u05D4 \u05E2\u05DC \u05E9\u05D5\u05E8\u05E9\u05D9\u05DD!",
            transliteration: "katuv po: 'me-avanim yeshanot, milim chadashot tzomchot.' zeh al shorashim!",
            speaker: "Noa",
          },
          {
            type: "challenge",
            challengeType: "comprehension",
            prompt: "What is the inscription about?",
            correctAnswer: "How new words grow from old roots",
            options: [
              "How new words grow from old roots",
              "A prayer for peace",
              "Directions to a market",
              "A king's name",
            ],
          },
          {
            type: "narration",
            text: "Noa explains that in Hebrew, most words come from three-letter roots. Understanding the root helps you understand many words at once. Yael realizes this is exactly what the mysterious book from the market was trying to teach her...",
          },
        ],
        cliffhanger: "The connection between the market book and Jerusalem's stones reveals a deeper mystery. What will Yael discover next?",
      },
    ],
  },
];
