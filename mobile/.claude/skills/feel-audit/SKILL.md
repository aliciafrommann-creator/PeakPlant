---
name: feel-audit
description: The PeakPlant screen-audit method — action hierarchy, PeakPlant verbs, borrowed Instagram/Strava mechanics translated (never copied), and the feel primitives. Use before polishing/redesigning any screen, when the user says a screen "feels generated not designed", asks for Instagram/Strava-level polish, or requests a UX/feel audit.
---

# Feel audit (PeakPlant)

**Polish is not visual decoration. Polish is removing ambiguity.** Never start
by changing fonts/colors/radii — start by auditing what the screen *does*.

## Step 0 — the header (answer before touching any file)

1. Which tab/screen?
2. Its **emotional job**:
   - Home = "this is us right now"
   - Discover = "what should we do next?"
   - Editions/Cards = "our physical cards become memories"
   - Community/Map = "places that help relationships happen"
   - Me/Profile = "privacy, spaces, identity, control"
3. Which product loop is being strengthened?
4. Which ONE mechanic is borrowed from Instagram/Strava?
5. How does it become uniquely PeakPlant? Translations:
   preserved moments ≠ posts · bloom/collectible ≠ likes · weekly couple
   challenge ≠ fitness challenge · memory filmstrip ≠ stories · community date
   spots ≠ Yelp reviews · rituals/repeats ≠ segments · shared Space identity ≠
   public profile.

## Step 1 — action-hierarchy audit (the core)

For the screen, list EVERY tappable with destination, then:
- Flag any two actions with the **same destination** (duplicates) and any dead
  buttons. Remove/merge — one door per action.
- Per screen **state**: exactly **1 primary** action, ≤1 calm secondary,
  optional small tertiary links. More needs a written justification.
- Rename generic labels (SAVE/DONE/SUBMIT/CONTINUE/NEXT) into PeakPlant verbs:
  - Ritual: START THIS WEEK · OPEN THE CARD · BEGIN TOGETHER
  - Preserve: PRESERVE THIS MOMENT · KEEP THE MEMORY · SAVE TO OUR SPACE
  - Plan: PLAN THIS DATE · SAVE FOR US · MAKE THIS OUR NEXT DATE
  - Done: WE DID THIS · WE DID THIS HERE · KEEP WHAT HAPPENED
  - Anonymous share: SHARE ONLY THE SPOT · ADD ANONYMOUS RATING
  - Soft secondary: maybe later · show another · loosen filters
- Every primary action gives **feedback**: haptic (`confirmSuccess`), a Toast
  ("saved to your space ♥"), and a visible consequence in the space.

## Step 2 — feel primitives (use, don't reinvent)

- Taps → `PressableScale` (spring + dim + haptic). Never bare
  `TouchableOpacity` for meaningful CTAs.
- Photos → `FadeInImage` (fade on load, neutral fill — never a hard pop or a
  white hole).
- Progress → `AnimatedFill` (eases, never jumps).
- Loading → `Skeleton`/`MemoryFeedSkeleton`/`IdeaCardSkeleton` — content-shaped,
  not a bare spinner on a main surface.
- Panels that appear/disappear → `LayoutAnimation.easeInEaseOut`.
- ALL motion respects reduce-motion (the primitives already do).

## Step 3 — copy & honesty pass

- German: natural, cute & easy, correct umlauts. No IT-speak
  ("Verbindungsproblem" → "wir versuchen es gleich nochmal").
- No claim the code doesn't keep (MANIFESTO §1): if it syncs to the space, it is
  "private to your space", never "only on your device".
- Empty states are warm invitations ("euer erster Moment beginnt hier"), never
  a checklist.

## Step 4 — verify & report

Run the `verify-peakplant` skill. Then output per screen:
- removed duplicate actions · final primary + secondary · copy changes ·
  feedback added — and what remains **unverifiable headless** (real-device
  feel).

## Definition of done (per screen)

Exactly one clear primary CTA per state · no duplicate destinations · CTA copy
is emotional and specific · primary actions give feedback · secondaries feel
calm · visuals support the hierarchy instead of replacing it.
