# Design System

The mobile app mirrors the PeakPlant website: editorial, minimal, warm, premium.

## Colors (`constants/colors.ts`)

| Token | Value | Use |
|-------|-------|-----|
| background | `#ffffff` | base surface |
| backgroundWarm | `#faf9f7` | cards, memory surfaces |
| backgroundCream | `#f9f6ef` | soft highlight blocks |
| backgroundDark | `#1A1A1A` | hero/edition headers, code block |
| text | `#1A1A1A` | primary text |
| textMuted / textSubtle / textFaint | `#555` / `#777` / `#bbb` | secondary text |
| accent | `#C9A96E` | warm gold — labels, small marks only |
| border | `#e8e4de` | hairlines |

## Typography (`constants/typography.ts`)

- Headings: weight `200`–`300`, negative letter-spacing, large sizes
- Body: weight `300`, ~15px, line-height ~22
- Labels: 9–11px, weight `500`, UPPERCASE, wide letter-spacing (2–3)
- Emotional/brand copy: lowercase, sometimes italic

## Spacing (`constants/spacing.ts`)

4 · 8 · 16 · 24 · 32 · 48 · 64. Screen padding = 24.

## Components

- `ui/Text` — variant-based typography wrapper
- `ui/Button` — primary / secondary / ghost / gold
- `ui/Logo` — wordmark + gold dot
- `ui/Surface` — tokenized background surface
- `memory/MemoryCard`, `memory/MemoryListItem`
- `edition/EditionHeader`, `edition/MomentCardItem`

## Rules

DO: light type, whitespace, near-black + warm off-whites, subtle gold, sharp
radii. DO NOT: gradients, pink hearts, gamification visuals, completion-pressure
progress bars, social-feed layouts.
