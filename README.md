# Tapfolio

Tap-to-share contact card that opens a live portfolio, and logs what each recruiter looked at.

| Route | Who sees it | What it does |
|---|---|---|
| `/` | You | Share screen: **Tap to share** (AirDrop on iPhone, Quick Share on Android) and a QR code. Set the event name ("OSU Career Fair") so each view is tagged. |
| `/c/kaushik` | Recruiter | Business card (Save contact, LinkedIn, call/email) + live portfolio: projects, latest GitHub pushes, resume, experience, skills. |
| `/activity` | You | Your conversations (due follow-ups first), plus card views that weren't part of a conversation. |
| `/conversations/[id]` | You | Who you met, the transcript, what they looked at on your card, and the Claude-drafted follow-up email with a send date. |

Nothing has to be installed on the recruiter's phone. AirDrop / Quick Share / the camera all open the card in their browser.

The recruiter page is built for phones: the contact card comes first, and the card's "Explore" list links to every section (projects, experience, resume, education, skills). A floating "Contact card" button brings them back to it.

## Onboarding: Claude builds your card

The first time a phone opens the app it goes to `/onboarding`: add a photo and a resume PDF, answer a few optional questions (roles you want, what you're building, links), and tap **Build my Tapfolio**. Claude reads the resume (`buildProfileDraft` in `src/lib/ai.ts`) and fills in the whole card and portfolio in this format, usually in under a minute. Onboarding also asks for the name to show on the card and pronouns (blank = the resume's name). After the build, an optional **Project demos** step lists the projects Claude found so you can attach demo videos, photos, or a demo link to each; it's also on the share screen for later. Recruiters see a **▶ Demo** tag and can play videos inline (the file server supports range requests, which iPhone Safari needs), and plays are recorded for the follow-up.

The phone is remembered as the card's owner (a cookie), so it opens straight to the share screen after that. "Rebuild my card" at the bottom of the share screen starts over with a new resume.

Built profiles live in `.data/profiles.json`, and uploaded photos and resumes in `.data/uploads/`. The hand-written example stays at `/c/kaushik`.

## Install on your iPhone

Open the app in Safari, tap **Share → Add to Home Screen**. It opens full-screen from its own icon, straight to the QR and **Tap to share**, with a bottom tab bar for Share and Activity.

## The follow-up flow

1. Walk up to a recruiter, tap **Start conversation** (ask before recording). The phone transcribes live using the browser's built-in speech recognition.
2. **Tap to share.** The link carries the conversation's id, so whatever they look at on your card is attached to this conversation.
3. Tap **End & review**. Fix the transcript if the mic misheard, then **Draft follow-up**.
4. Claude (`src/lib/ai.ts`) reads the transcript, your notes, and their card activity, fills in their name/company/email, and drafts a 90–150 word email scheduled 1–3 days out. It uses what they viewed to pick which projects to emphasize, but never mentions that you saw it.
5. On the send date the conversation shows **Due today** in Activity. Tap **Open in Mail** to send it from your own email. Nothing is sent automatically.

Without a working `ANTHROPIC_API_KEY`, drafting falls back to a plain template so the app still works.

## Run

```bash
npm install
npm run dev          # http://localhost:3800
npm run dev:phone    # reachable from your phone on the same Wi-Fi: http://<your-mac-ip>:3800
```

Edit your content in `src/data/profile.ts`. Images and the resume live in `public/`.

The microphone only works on `localhost` or HTTPS. Over plain `http://<ip>:3800` on your phone, the card and sharing work but live transcription won't; deploy, or use an HTTPS tunnel, to record on the phone.

## Env

Copy `.env.local.example` to `.env.local`.

- `ANTHROPIC_API_KEY`: needed for building cards and drafting follow-ups.
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: store everything in Supabase. Without them the app uses `.data/` on this machine.
- `GITHUB_TOKEN`: raises the GitHub rate limit for the "Building right now" feed.

## Deploying (Vercel)

Vercel's filesystem is read-only, so the `.data/` fallback does not work there: without Supabase, onboarding fails at the photo/resume upload. The hosted app needs these environment variables (Project → Settings → Environment Variables, then redeploy):

- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`: the project's API URL (Supabase → Project Settings → API).
- `SUPABASE_SERVICE_ROLE_KEY`: the `service_role` secret from the same page. Server-only; never expose it to the browser or the app.

Apply every file in `supabase/migrations/` to the project (SQL editor, in order). They create the tables, turn on RLS, and create the `uploads` bucket.

## Storage and accounts

With Supabase configured, profiles, conversations, card views, and visitors live in Postgres (schema in `supabase/migrations/`; every query goes through `src/lib/supabase.ts`), and photos, resumes, and demo videos in the public `uploads` bucket. Uploads go straight from the phone to storage through one-time signed URLs (`/api/uploads`), so large videos never pass through the server.

Each card has an owner: onboarding returns a secret token, kept in an httpOnly cookie on the web and sent as `Authorization: Bearer` by the mobile app. Owner-only routes (conversations, follow-ups, demos, Activity) check it; only its SHA-256 hash is stored.
