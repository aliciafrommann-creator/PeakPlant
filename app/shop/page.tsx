import { loadOffers } from '../../lib/shop'
import { ShopClient } from './ShopClient'

/**
 * Server shell for the shop. It asks Stripe what each deck costs and whether
 * it can be sold at all, then hands that to the page. The client never sees a
 * price we made up — and never a buy button that would lead nowhere (see
 * lib/shop.ts).
 */
export const revalidate = 300 // 5 min — a price change goes live without a deploy

export default async function ShopPage() {
  const offers = await loadOffers()
  return <ShopClient offers={offers} />
}
