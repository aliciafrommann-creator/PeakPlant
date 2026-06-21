# iOS → TestFlight (no terminal)

Goal: a real PeakPlant app on your iPhone via TestFlight, built in the cloud
(EAS) and triggered from a button in GitHub — no local terminal.

Everything below is done in a **browser**. The repo side (icon, build profile,
GitHub workflow) is already in place. What's left are accounts + a few IDs.

## Step 0 — what's already done (by me)

- App icon + splash (`mobile/assets/`), wired in `app.json`.
- iOS build profile in `eas.json` (with the public Supabase keys baked in).
- GitHub workflow **"EAS iOS build"** (manual run button).

## Step 1 — Expo account + project (browser)

1. Sign up at **expo.dev** (free).
2. Create a project in the dashboard → copy its **Project ID** and your
   **username** (the project owner).
3. **Send me the Project ID + username** — I'll add `owner` and
   `extra.eas.projectId` to `app.json` and commit. (EAS needs this to link the
   build to your account.)
4. Account settings → **Access tokens** → create a token (e.g. "github-ci").

## Step 2 — GitHub secret (browser)

GitHub repo → **Settings → Secrets and variables → Actions → New repository
secret**:
- Name: `EXPO_TOKEN`
- Value: the token from Step 1.4

## Step 3 — Apple Developer + App Store Connect (browser, ~1–2 days)

1. Enrol in the **Apple Developer Program** (developer.apple.com, €99/yr).
   Identity verification can take a day or two — start this early.
2. In **App Store Connect** → Apps → **＋** → create an app:
   - Platform: iOS · Name: PeakPlant · Bundle ID: **com.peakplant.app**
     (register the bundle id under Certificates, Identifiers & Profiles first
     if prompted).
3. **App Store Connect API key** (so EAS can sign + upload without a terminal):
   Users and Access → **Integrations / Keys** → App Store Connect API →
   generate a key with **App Manager** role. Note the **Issuer ID** + **Key ID**
   and download the **.p8** file (one-time download).
   - Send me the **Issuer ID, Key ID** and the **.p8** (or add them as EAS
     credentials) — this is the one fiddly part; I'll wire `eas.json` submit +
     credentials so the build self-signs and submits.

## Step 4 — run the build (browser)

GitHub → **Actions → "EAS iOS build" → Run workflow** → tick **submit** →
Run. EAS builds in the cloud, signs it, and submits to TestFlight. First build
takes ~15–30 min; you'll see progress on expo.dev.

## Step 5 — TestFlight (phone)

1. App Store Connect → your app → **TestFlight** → add yourself as an internal
   tester (your Apple ID email).
2. Install **TestFlight** from the App Store on your iPhone, accept the invite,
   install PeakPlant. 🎉

## Before real testers (not blocking your own test)

- Supabase **paid tier** for backups.
- Run `redeem_invite` SQL (join-by-code) if not done.
- Auth email template: add `{{ .Token }}` so the login code arrives.

## Honest notes

- I can't run EAS from here (no Apple account / Expo token in this environment),
  so I can't pre-verify the cloud build — the workflow + config are best-effort
  and we'll fix any first-run hiccup together once Steps 1–3 exist.
- The Step 3 credentials part is the trickiest without a terminal; send me the
  ASC API key details and I'll do the `eas.json` wiring so the GitHub button is
  truly one-click.
