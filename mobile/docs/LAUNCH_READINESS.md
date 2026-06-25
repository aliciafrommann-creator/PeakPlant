# Launch Readiness — PeakPlant

An honest gap analysis: what the app does today, what's left to launch, and what
needs a human. Checked against the sister-project Build Pack we used as source
(Decision Register 00, UX 05, Architecture 06, Commercial 09, Build/Quality 11)
and PeakPlant's own decisions (PP-001…PP-025).

Legend: ✅ done & verified (tsc/tests/build) · 🟡 built, needs on-device test ·
🔴 not built · ⚪️ deliberately out of scope for the pilot.

---

## 1. What the app does today

**Core diary**
- ✅ Spaces model: couple + friends, one person in many spaces, per-space scoping.
- ✅ Cards: 20-card edition, pick any order, per-space activation (sealed/activated).
- ✅ Moments (diary): create with note + optional photo, list, detail, per space.
- ✅ AI card suggestion (deterministic null-AI; server-AI behind an abstraction).

**Platform (customizable, opt-in)**
- ✅ Feature flags + Customize screen (turn features on/off; core never gated).
- ✅ Shared rhythm: gentle weekly streak, themed (🌶️ couples / 🌻 friends).
- ✅ Moments to do together + Live Places prompts (no partner/perk claims unless verified).
- ✅ Challenges: finite, badge-not-score, join/leave, progress.

**Backend (Supabase, EU/Frankfurt)**
- ✅ Schema + deny-by-default RLS (spaces, members, memories, card_activations,
  challenge_enrollments, profiles) — applied to the live project.
- 🟡 Auth: email OTP sign-in + session gate (built; needs device test + keys).
- 🟡 Repos wired to Supabase behind `isSupabaseConfigured` (built; device test).
- 🟡 Invite-code join via `redeem_invite` RPC (built; run migration + test).
- 🟡 Photo upload → private bucket, EXIF-stripped, signed URLs (built; device test).
- 🟡 Account deletion + sign out (built; run `delete_account` RPC + device test).

**Quality / ops**
- ✅ `tsc` strict 0, Vitest 21/21 (streaks, together, challenges), `expo export` 0.
- ✅ pgTAP RLS suite written (`supabase/tests/rls_test.sql`) — not yet run.
- ✅ Accessibility props on key components; UX/AI-safety/security docs.
- ✅ Web build fixed (mobile excluded); website deploys on Vercel.

---

## 2. Gap to a closed pilot (TestFlight / Play Internal) — Gate 7-ish

These block real people using it, even in a closed test.

| # | Item | State | Owner |
|---|------|-------|-------|
| P1 | Add Supabase keys to `mobile/.env`; on-device test of auth → space → moment | 🟡 | **You** (then we fix) |
| P2 | Run migrations `0002` + `0003` on the project | 🟡 | **You** |
| P3 | Run pgTAP RLS suite green (local/staging) | 🟡 | You + me |
| P4 | App **icon** (1024²) + splash + Android adaptive icon assets | 🔴 | You (design) / me (wire) |
| P5 | Apple Developer + Google Play accounts (entity, ~1–2 days) | 🔴 | **You** |
| P6 | EAS production build + TestFlight/Internal upload | 🔴 | You (`eas`) / me (config ✅) |
| P7 | Device QA pass: permissions denied, offline, low network, upgrade | 🔴 | You + me |
| P8 | Supabase **backups** (paid tier) before real user data | 🔴 | **You** |
| P9 | Privacy policy live at /app-datenschutz (deploy) | 🟡 | auto on next web deploy |

## 3. Gap to public launch — Gate 8

| Item | State | Note |
|------|-------|------|
| Independent security/privacy review | 🔴 | Doc 11 A-08/A-11 gate before public real-value |
| Legal/privacy classification (GDPR, consumer, AT/DE) | 🔴 | Especially once the shop/18+ content is live |
| Monitoring + error reporting (Sentry, sanitized) | 🔴 | Doc 06 A-06-10; I can wire it |
| Atomic server RPCs for unlock/purchase (vs client writes) | 🟡 | Doc 06 A-06-05; fine for diary, needed for value flows |
| 18+ age gate for the Intimacy Collection | 🔴 | PP-007; only when that content ships |
| Restore rehearsal + retention schedule | 🔴 | Doc 11; after backups exist |
| Store privacy disclosures match reality | 🟡 | Draft ready in STORE_LISTING.md |

## 4. Deliberately out of scope for the pilot (⚪️)

Per PeakPlant's product thesis and the rejected/deferred decisions:
- Public feed, followers, social graph, ranking (R-002).
- Voucher economics, redemption fees, monthly billing, business portal,
  sponsored challenges (Doc 09's commercial engine). PeakPlant's revenue is the
  **first-party shop** (website) + future **verified local partnerships** — no
  platform-collected payments in the pilot.
- Communities, shared feed, rituals — feature-flagged "soon", not built yet.
- Maps/discovery, push notifications — not in the pilot scope.

## 5. What I can build next without you

- **GitHub Actions CI**: typecheck + Vitest + expo export on every PR (Doc 11 §18).
- **Offline / error / pending-sync states** across screens (UX 05 §12).
- **Atomic `preserve_moment` / unlock RPCs** (Doc 06 A-06-05) for correctness.
- **Sentry** wiring with PII redaction (Doc 06 A-06-10).
- **Realtime** shared-diary updates with refetch fallback (A-06-07) — optional.
- **Icon/splash** scaffolding (you supply the artwork, I wire all sizes).
- **Communities / rituals / feed** (next platform phases) when you want them.

## 6. What I need from you (the short list)

1. Supabase **anon key** → `mobile/.env`, and run migrations `0002` + `0003`.
2. **Test on device** (Expo Go is enough for auth/spaces/moments) and report back.
3. Decide: enable **Supabase paid tier** (backups) before real users — yes/no.
4. **App icon** artwork (or approve a simple generated one).
5. **Apple/Google developer accounts** under the legal entity.

Everything else on the path I can build and verify here.
