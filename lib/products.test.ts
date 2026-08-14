import { describe, it, expect } from 'vitest'
import { PRODUCT_KEYS, PRODUCT_COPY, PRODUCT_DECK_COUNT } from './products'

/**
 * Product identities are shared by shop, admin, invoice, shipping order and
 * mails. When they drift, a supplier ships the wrong thing or a customer reads
 * a name that does not match what they bought — the old `sub_*` "Abo-Lieferung"
 * labels did exactly that.
 */
describe('product identities', () => {
  it('has copy and a deck count for every key', () => {
    for (const key of PRODUCT_KEYS) {
      expect(PRODUCT_COPY[key]?.de, `German name for ${key}`).toBeTruthy()
      expect(PRODUCT_COPY[key]?.en, `English name for ${key}`).toBeTruthy()
      expect(PRODUCT_DECK_COUNT[key], `deck count for ${key}`).toBeGreaterThan(0)
    }
  })

  it('carries no keys beyond the known ones (no subscription leftovers)', () => {
    expect(Object.keys(PRODUCT_COPY).sort()).toEqual([...PRODUCT_KEYS].sort())
    expect(Object.keys(PRODUCT_DECK_COUNT).sort()).toEqual([...PRODUCT_KEYS].sort())
    for (const key of Object.keys(PRODUCT_COPY)) {
      expect(key.startsWith('sub_')).toBe(false)
    }
  })

  it('ships two decks only for the duo', () => {
    expect(PRODUCT_DECK_COUNT.pack_12).toBe(2)
    expect(PRODUCT_DECK_COUNT.pack_3).toBe(1)
    expect(PRODUCT_DECK_COUNT.founders).toBe(1)
  })
})
