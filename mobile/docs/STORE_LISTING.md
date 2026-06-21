# Store Listing — App Store & Google Play

Draft metadata for submission. Fill the TODOs and replace screenshots before
release. The privacy answers below must match the actual app behavior.

## Identity

- **App name:** PeakPlant
- **Subtitle (iOS, ≤30 chars):** collect moments. grow together.
- **Bundle ID (iOS):** com.peakplant.app
- **Package (Android):** com.peakplant.app
- **Category:** Lifestyle (secondary: Health & Fitness / Social — TBD)
- **Privacy policy URL:** https://peak-plant.com/app-datenschutz
- **Support URL / email:** https://peak-plant.com · hello@peak-plant.com
- **Age rating:** 17+/18+ (the brand includes an adult intimacy collection)

## Short description (Google Play, ≤80 chars)

A private moment diary for couples and friends. Collect moments, grow together.

## Promotional text (iOS, ≤170 chars)

Physical cards meet a private shared diary. Preserve real moments together —
no feed, no scores, no pressure. Just the moments that stay with you.

## Full description

PeakPlant turns real moments into a private diary you keep with the people who
matter — your partner, or a small circle of friends.

Each physical Moment Card invites you to do or talk about something together.
When the moment happens, you preserve it: a note, an optional photo, a memory
that stays long after the conversation ends.

• Private spaces — a couple space, friends spaces; you choose who's in.
• Collect moments — 20 cards per edition, in any order, no completion pressure.
• Shared rhythm — a gentle, optional streak you collect together (never a threat).
• Moments to do together — small real-world ideas, with nearby places.
• Challenges — finite, badge-not-score goals you can opt into.
• Customizable — turn features on or off; the diary always works.

What PeakPlant is NOT: a social network, a feed, a scoreboard. No public
profiles, no followers, no ads. Your diary is private to your space.

Made for the moments that stay with you.

## Keywords (iOS, ≤100 chars, comma-separated)

couple,relationship,diary,memories,friends,moments,journal,cards,together,connection

## Screenshots needed (per device size)

1. Welcome — "collect moments. grow together."
2. Us (home) — space switcher + shared rhythm banner
3. Grow — the 20-card edition grid (suggested card highlighted)
4. Card detail — a prompt + "preserve this moment"
5. Moments — the shared diary list
6. To do together — ideas + a local partner place
7. Challenges — a challenge with progress + badge
8. Customize — feature toggles (shows it's yours to shape)

iOS sizes: 6.7" and 6.5" (required), 5.5" optional. Android: phone + 7"/10"
tablet optional. Use real (seeded) content; no lorem ipsum.

## Apple — App Privacy answers

Data used to track you: **None.**

Data linked to you:
- **Contact info → Email address** — App functionality (account/auth).
- **User content → Photos** — App functionality (diary). Stored privately.
- **User content → Other (notes/moments)** — App functionality.
- **Identifiers → User ID** — App functionality (account).

Data NOT collected: location, contacts, browsing history, search history,
purchases (in-app), usage data for advertising, diagnostics tied to identity.

Account deletion: **Yes — in-app** (Customize → Account & data → delete account).

## Google Play — Data Safety answers

- Collects: Email, Photos/Videos, Other user content (notes), User IDs.
- Purpose: App functionality / Account management. **No advertising.**
- Data encrypted in transit: **Yes.**
- Users can request deletion: **Yes — in-app + email.**
- Data shared with third parties: **No** (Supabase is a processor, not a recipient).

## Review notes (for Apple/Google reviewers)

- Sign-in uses an emailed one-time code (no password). A demo account can be
  provided on request: TODO email + code flow note.
- The app is fully usable without granting camera/photo permissions.
- Account deletion is reachable at: Customize (Us tab header) → Account & data
  → delete account.

## Pre-submission checklist

- [ ] App icon (1024×1024) + adaptive icon assets added (see app.json).
- [ ] Screenshots captured on required device sizes.
- [ ] Privacy policy live at the URL above.
- [ ] In-app account deletion verified on device.
- [ ] EAS production build (`eas build -p ios|android --profile production`).
- [ ] Apple Developer + Google Play accounts created under the legal entity.
- [ ] Supabase backups enabled (paid tier) before real user data.
