# Tapfolio

Tap-to-share contact card that opens a live portfolio, and logs what each recruiter looked at.

| Route | Who sees it | What it does |
|---|---|---|
| `/` | You | Share screen: **Tap to share** (AirDrop on iPhone, Quick Share on Android) and a QR code. Set the event name ("OSU Career Fair") so each view is tagged. |
| `/c/kaushik` | Recruiter | Business card (Save contact, LinkedIn, call/email) + live portfolio: projects, latest GitHub pushes, resume, experience, skills. |
| `/activity` | You | Your conversations (due follow-ups first), plus card views that weren't part of a conversation. |
| `/conversations/[id]` | You | Who you met, the transcript, what they looked at on your card, and the Claude-drafted follow-up email with a send date. |

Nothing has to be installed on the recruiter's phone. AirDrop / Quick Share / the camera all open the card in their browser.

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

- `ANTHROPIC_API_KEY`: needed for Claude-drafted follow-ups.
- `OWNER_PASSWORD`: puts `/` and `/activity` behind a password. Recruiter pages stay public.
- `GITHUB_TOKEN`: raises the GitHub rate limit for the "Building right now" feed.

## Before deploying

Views and conversations are stored in `.data/*.json` (`src/lib/json-store.ts`), which works locally but not on Vercel (read-only filesystem). Swap that store for Supabase before deploying.
