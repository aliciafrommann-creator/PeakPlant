import { redirect } from 'next/navigation'

// The shop lives at the global /shop route (single source of truth for the
// live checkout + pricing). Any /[locale]/shop hit redirects there.
export default function LocaleShopRedirect() {
  redirect('/shop')
}
