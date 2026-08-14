/**
 * Product identities — the one place shop, admin, invoice and shipping order
 * take their names from, so they can never say different things about the same
 * order. Deliberately free of any Stripe/server import: the admin panel is a
 * client component and must not pull the Stripe SDK into the browser bundle.
 *
 * The keys are historic (`pack_3`, `pack_12` come from the pre-deck era) and
 * stay unchanged, because live `orders` rows reference them. What they mean
 * today is below, and it matches the shop cards.
 */

export type ProductKey = 'pack_3' | 'founders' | 'pack_12'

export const PRODUCT_KEYS: ProductKey[] = ['pack_3', 'founders', 'pack_12']

export const PRODUCT_COPY: Record<ProductKey, { en: string; de: string }> = {
  pack_3:   { en: 'edition 01 — one deck',       de: 'Edition 01 — ein Deck' },
  founders: { en: 'founders edition — one deck', de: 'Founders Edition — ein Deck' },
  pack_12:  { en: 'edition 01 — duo, two decks', de: 'Edition 01 — Duo, zwei Decks' },
}

/** How many decks ship per product. pack_12 ("duo") is the only two-deck one. */
export const PRODUCT_DECK_COUNT: Record<ProductKey, number> = {
  pack_3: 1,
  founders: 1,
  pack_12: 2,
}
