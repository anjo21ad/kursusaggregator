/**
 * Client-side Supabase client for Next.js Pages Router
 *
 * This client is used in browser/React components to:
 * - Manage authentication with cookie storage (not localStorage)
 * - Ensure server-side can read auth cookies in getServerSideProps
 * - Maintain session across page navigations
 */

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton instance for convenience
export const supabase = createClient()
