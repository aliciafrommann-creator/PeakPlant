# PeakPlant Card QR Format

This is the contract between the physical product (printed cards) and the app's
scanner. The parsing/resolution logic lives in `lib/qr.ts` and is fully unit
tested in `lib/qr.test.ts` — keep this document and that code in sync.

A card's QR encodes **a route, never personal data**. There are two families.

---

## 1. Card reference (everyday prompt cards)

Reusable. Scanning opens the card's prompt; it can be scanned any number of
times by anyone holding the physical card. This is the default for normal
edition cards.

Encode **any one** of these forms (the app accepts all three):

| Form | Example |
|------|---------|
| Custom scheme | `peakplant://card/card-04` |
| HTTPS (universal link) | `https://peak-plant.com/c/card-04` |
| Bare id | `card-04` |

- `card-04` is the **card id**: lowercase `card-` followed by 1–4 digits.
- For printed cards prefer the **HTTPS** form: it also works as a tap-through on
  phones without the app installed (it opens the web preview / store).
- Query strings and fragments are ignored, so campaign tags are safe:
  `https://peak-plant.com/c/card-04?ref=box2026` resolves to `card-04`.

## 2. Activation token (rare / collectible "unlock" cards)

**Single-use and time-boxed.** Use this only for cards that should unlock
something once (rare cards, limited drops, gift cards). After the first
successful scan on a device the token is recorded as redeemed; a second scan is
reported to the user as *already unlocked*.

```
PP1.<cardId>.<expiry>.<nonce>
```

| Field | Rule | Example |
|-------|------|---------|
| version | literal `PP1` | `PP1` |
| cardId | `card-` + 1–4 digits | `card-12` |
| expiry | `YYYYMMDD`, inclusive (valid through 23:59:59 UTC that day) | `20271231` |
| nonce | 4–32 chars, `[A-Za-z0-9]`, **unique per printed card** | `a3f9c2` |

Full example, and the same wrapped in routes (all accepted):

```
PP1.card-12.20271231.a3f9c2
peakplant://t/PP1.card-12.20271231.a3f9c2
https://peak-plant.com/t/PP1.card-12.20271231.a3f9c2
```

### Nonce requirements for the printer

- Every physical unlock card must carry a **distinct** nonce. Reusing a nonce
  across two cards means redeeming one marks the other as used.
- Generate nonces with a CSPRNG; 6+ hex chars (24+ bits) is the floor, 8–12 is
  comfortable. They are not secret, but must be unguessable enough that someone
  can't enumerate valid cards.

---

## Resolution outcomes

`resolveScan(payload, ctx)` returns exactly one of:

| Status | Meaning | User-facing copy (EN) |
|--------|---------|-----------------------|
| `ok` | open `cardId` (token redeemed if present) | — (navigates) |
| `malformed` | not a PeakPlant payload | "that doesn't look like a PeakPlant card." |
| `unknown_card` | well-formed, but no such released card | "this card belongs to an edition that isn't out yet." |
| `expired` | token past its expiry day | "this unlock code has expired." |
| `used` | single-use token already redeemed | "this card has already been unlocked." |

Order of checks for tokens: unknown card → expired → used. So a card that isn't
released yet always reads as `unknown_card`, never as expired/used.

---

## Deep links through authentication

Card references also work as **app links / universal links**. If someone opens a
card link before signing in or before a space exists, the destination is stashed
(`lib/pendingDestination.ts`) and resumed after the auth/onboarding gate, so they
land on the card they scanned — not the home tab. Configure the associated
domains / intent filters in `app.json` before relying on HTTPS links in print.

---

## Beta status & post-beta hardening

The beta verifies tokens **offline** against their self-describing fields, and
records redemption **per device** (`lib/redeemedTokens.ts`). Known, intentional
limitations to close before treating activation tokens as anti-fraud:

- **No signature.** A `PP1` token is forgeable by anyone who knows the format.
  Acceptable for "unlock a prompt you already physically own"; **not**
  acceptable for anything of monetary value. Post-beta: server-signed tokens
  (HMAC with a server-only secret) and a server-side redemption ledger so a
  token can't be reused after a reinstall or on a second device.
- **Redemption is device-local.** Reinstalling the app clears the redeemed set.
- Everyday `card-*` references are deliberately unsigned and reusable — that is
  the intended behavior, not a gap.
