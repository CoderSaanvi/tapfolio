# Tapfolio iOS app

The owner's side of Tapfolio, built with Expo and Expo Router: Share, Activity, and Network tabs, onboarding, project demos, and live conversations. It talks to the web app's API (`../src/app/api`); see the root README for what each screen does.

## Run

The web app must be running first (it is the backend):

```bash
cd ..
npm run dev                      # http://localhost:3800
```

Then:

```bash
npm install
echo 'EXPO_PUBLIC_API_URL=http://localhost:3800' > .env.local
npx expo start --ios             # opens Expo Go in the iOS simulator
```

- `EXPO_PUBLIC_API_URL` is where the app sends requests and the base of the QR link it shows. It is baked in at bundle time: after changing it, restart with `npx expo start --ios --clear`.
- On a real phone, `localhost` is the phone itself. Use your Mac's address (`http://<mac-ip>:3800`, same Wi-Fi or your phone's hotspot) or a public tunnel (`npx cloudflared tunnel --url http://localhost:3800`, then the printed https URL). A tunnel is also what makes the QR openable by other people's phones.
- Expo Go sometimes keeps a stale bundle after files change. Quit it and reopen from Metro, or restart Metro with `--clear`.

## Screens

```
src/app/onboarding/     welcome → upload (photo + resume) → questions → building
src/app/(tabs)/index    Share: QR, Tap to share (recruiter/student), banner, event, Start conversation
src/app/(tabs)/activity Activity: stats, time-per-project bars, where-time-goes donut, conversations
src/app/(tabs)/network  Network: everyone met, search, follow-up status, email
src/app/conversation/   live sharing + dictated notes, then review and the Claude-drafted follow-up
src/app/demos           attach videos, photos, or links to projects
src/lib/api.js          fetch wrapper with the owner token; direct-to-storage uploads
```

The owner token from onboarding is kept in the device's secure storage and sent as `Authorization: Bearer` on every request.
