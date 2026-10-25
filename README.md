# Tapfolio

Your resume, as a card recruiters remember.

Upload a resume and a photo; Claude builds a live contact card and portfolio. At the career fair you share it by QR or AirDrop, the recruiter can save your contact or leave their info, and your phone keeps track of who looked, what held their attention, and who you still owe a follow-up.

Two apps in one repo:

- **Web** (`src/`): a Next.js app that serves the recruiter-facing card and the owner's screens, plus the API both apps use.
- **iOS app** (`mobile/`): an Expo app for the owner: Share, Activity, and Network tabs, onboarding, project demos, live conversations.

Everything is plain JavaScript.

## What a recruiter sees

`/c/<slug>` opens in their browser; nothing to install.

- **Contact card** first: banner (school logo + text, editable), photo, name, headline, **Save my contact**, and Call / Email / LinkedIn / Share tiles (a tile only shows when the owner has that detail).
- **Leave your info**: a short form (name, email, company, role, note) that lands in the owner's Network.
- **Projects** come first, each with a demo tag and inline video, metrics in big numbers, tags, and links.
- **Experience**: one two-sentence summary per role with the resume's numbers shown big; the original bullets sit behind "Details". Roles without numbers just get the sentence.
- Resume (PDF), education, skills.

The link can carry who it was shared with: `?for=recruiter` leads with experience and the resume, `?for=student` with projects and a "let's connect" note. `?src=qr|tap` and `?ev=<event>` tag how and where it was opened.

Every open, scroll into a section (with time spent), and tap is recorded against an anonymous session, and against a conversation when the link came from one.

## What the owner sees (iOS app)

- **Share**: the QR, **Tap to share** (asks "for a recruiter" or "for a student", then opens the share sheet with AirDrop on top), the banner text, the event you're at, **Start conversation**, and project demos.
- **Activity**: opens, viewers, average visit, a bar chart of time per project, a donut of where viewing time goes, how the card was opened, and how many people left their info. Refreshes every 15 seconds while open. Below it, every conversation with follow-ups due first.
- **Network**: everyone you've met, one row per person, folded across conversations and the card's form by email or name + company: company, role, where you met, how many times, follow-up status, one-tap email, search.
- **Conversation**: share from a live link, dictate notes with the keyboard mic, then **End & review**: Claude fills in who you met, drafts a 90–150 word follow-up scheduled 1–3 days out (using what they looked at to choose which projects to mention, without ever saying so), and the app reminds you on the send date. Nothing is sent automatically.

The same owner screens exist on the web at `/`, `/activity`, `/network`, and `/conversations/<id>`, and the web app installs to the home screen from Safari (Share → Add to Home Screen).

## Onboarding

The first launch goes to onboarding: photo, resume PDF, a few optional questions (name to show, pronouns, roles you want, what you're building, links), then **Build my Tapfolio**. Claude reads the resume and writes the whole card (`buildProfileDraft` in `src/lib/ai.js`), usually in under a minute, including the two-sentence role summaries and metrics. Cards built before summaries existed get them the next time the owner's app loads the profile.

After the build, **Project demos** lists the projects so you can attach videos, photos, or a demo link to each. **Rebuild my card** on the Share tab starts over with a new resume.

The phone that onboards becomes the card's owner: onboarding returns a secret token, kept in an httpOnly cookie on the web and sent as `Authorization: Bearer` by the app. Owner-only routes check it; only its SHA-256 hash is stored.

## Run it locally

Web (the API lives here, so run this first):

```bash
npm install
npm run dev          # http://localhost:3800
npm run dev:phone    # also reachable at http://<your-mac-ip>:3800 on the same Wi-Fi
```

iOS app:

```bash
cd mobile
npm install
echo 'EXPO_PUBLIC_API_URL=http://localhost:3800' > .env.local   # simulator; use your Mac's address or a tunnel for a real phone
npx expo start --ios
```

`EXPO_PUBLIC_API_URL` is baked in at bundle time: after changing it, restart Expo with `--clear`. For a real phone, or for QR codes other phones can open, the backend needs a public address, e.g. `npx cloudflared tunnel --url http://localhost:3800`, and the app should point at that URL. The card page needs HTTPS or `localhost` for the microphone and for some browser APIs; plain `http://<ip>` works for sharing but not for live transcription.

`GET /api/health` reports which storage the server is using, whether the AI key is present, and (when hosted) the running commit.

## Env

Copy `.env.local.example` to `.env.local`.

- `ANTHROPIC_API_KEY`: building cards, role summaries, and follow-up drafts. Without it, drafting falls back to a plain template and cards keep their bullets.
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: store everything in Supabase. Without them the app uses `.data/` on this machine.
- `GITHUB_TOKEN`: raises the GitHub rate limit for the "Building right now" feed.

## Storage

With Supabase configured, profiles, conversations, card views, and visitors live in Postgres (schema in `supabase/migrations/`, applied in order; every query goes through `src/lib/supabase.js`), and photos, resumes, and demo videos in the public `uploads` bucket. Uploads go straight from the phone to storage through one-time signed URLs (`/api/uploads`), so large videos never pass through the server. Tables have RLS on with no policies: only the server, with the service role key, can read them.

Without Supabase, the same data lives in `.data/*.json` and `.data/uploads/` for local development.

## Deploying (Vercel)

Vercel's filesystem is read-only, so the `.data/` fallback does not work there: without Supabase, onboarding fails at the photo/resume upload (the error says so). The hosted app needs, under Project → Settings → Environment Variables, then a redeploy:

- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`: the project's API URL (Supabase → Project Settings → API).
- `SUPABASE_SERVICE_ROLE_KEY`: the `service_role` secret from the same page. Server-only; never expose it to the browser or the app.

Apply every file in `supabase/migrations/` to the Supabase project (SQL editor, in order). They create the tables, turn on RLS, and create the `uploads` bucket. Then point the iOS app's `EXPO_PUBLIC_API_URL` at the deployed site.

## Layout

```
src/app/            web pages: c/[slug] (card), onboarding, activity, network, conversations
src/app/api/        onboarding, profile/me, profile/media, uploads, files, events, visitors,
                    insights, contacts, conversations, health
src/components/     card, portfolio, activity, network, conversation, tracking, ui
src/lib/            ai.js (Claude), profiles, conversations-store, events-store, visitors-store,
                    insights, contacts, sessions, storage, supabase, track
supabase/migrations/
mobile/src/app/     (tabs)/index · activity · network, onboarding/*, conversation/[id], demos
mobile/src/components, mobile/src/lib (api.js, session, onboarding, followup, reminders, theme)
```
