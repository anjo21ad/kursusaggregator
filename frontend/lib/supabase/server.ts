/**
 * Server-side Supabase client for Next.js Pages Router
 *
 * This client is used in getServerSideProps to:
 * - Read auth cookies from incoming requests
 * - Verify user sessions server-side
 * - Check course access before rendering
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { GetServerSidePropsContext } from 'next'

export function createClient(context: GetServerSidePropsContext) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = context.req.cookies[name]
          console.log(`🍪 [server.ts] Cookie GET: ${name} = ${value ? 'FOUND' : 'NOT FOUND'}`)
          console.log(`🍪 [server.ts] All cookies:`, Object.keys(context.req.cookies))
          return value
        },
        set(name: string, value: string, options: CookieOptions) {
          context.res.setHeader(
            'Set-Cookie',
            `${name}=${value}; Path=${options.path || '/'}; ${options.maxAge ? `Max-Age=${options.maxAge};` : ''} ${options.sameSite ? `SameSite=${options.sameSite};` : ''} ${options.secure ? 'Secure;' : ''}`
          )
        },
        remove(name: string, options: CookieOptions) {
          context.res.setHeader(
            'Set-Cookie',
            `${name}=; Path=${options.path || '/'}; Max-Age=0`
          )
        },
      },
    }
  )
}
