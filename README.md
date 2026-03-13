# Davar — Learn Hebrew

Interactive Hebrew learning app with flashcards, spaced repetition, grammar drills, stories, and quizzes.

## Features

- **Spaced Repetition** — FSRS-powered flashcards that adapt to your memory
- **Grammar** — Verb conjugation tables (5 binyanim), trainer exercises, adjective agreement practice
- **Stories** — Interactive narrative chapters with inline challenges
- **Daily Challenge** — 5 new questions every day
- **Vocabulary Garden** — Visual SRS progress as growing plants
- **Quizzes** — Multiple choice, fill-in, listening, matching, cloze
- **AI Conversation** — Practice Hebrew chat with AI (bring your own API key)
- **Progress Tracking** — XP, streaks, achievements, prestige, weekly league
- **Cloud Sync** — Optional Supabase account for cross-device progress
- **PWA** — Installable as a mobile/desktop app

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Cloud Sync Setup (Optional)

The app works fully offline with localStorage. To enable accounts and cross-device sync:

1. Create a free project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in the Supabase SQL Editor
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials
4. (Optional) Enable Google OAuth in Supabase Authentication > Providers > Google

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Tech Stack

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4
- ts-fsrs (spaced repetition)
- Supabase (auth + cloud sync)
