import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'
import { fetchUserProfile } from '@/lib/database-adapter'
import { prisma } from '@/lib/prisma'

// Helper function to wrap promises with timeout
function withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    )
  ])
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now()
  console.log('[/api/user/profile] Request started')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    console.log('[/api/user/profile] No token provided')
    return res.status(401).json({ error: 'No authorization token provided' })
  }

  try {
    // Verificer token med Supabase først (dette virker altid via HTTPS)
    console.log('[/api/user/profile] Verifying token with Supabase...')
    const authResult = await withTimeout(
      supabase.auth.getUser(token),
      3000,
      'Auth verification timeout'
    )

    const { data: { user }, error: authError } = authResult
    if (authError || !user) {
      console.log('[/api/user/profile] Token verification failed:', authError?.message)
      return res.status(401).json({ error: 'Invalid token' })
    }
    console.log('[/api/user/profile] Token verified for user:', user.id)

    // Use hybrid database adapter (Supabase REST API for reliability)
    console.log('[/api/user/profile] Fetching user profile...')
    const dbUser = await withTimeout(
      fetchUserProfile(user.id),
      2000,
      'Profile fetch timeout'
    )

    // If user doesn't exist in our DB, create them automatically (WRITE - use Prisma)
    if (!dbUser) {
      console.log('[/api/user/profile] User not found in DB, creating...')
      try {
        const newUser = await withTimeout(
          prisma.user.create({
            data: {
              id: user.id,
              email: user.email!,
              firstName: user.user_metadata?.firstName || null,
              lastName: user.user_metadata?.lastName || null,
              role: 'COMPANY_USER', // Default role
            },
          }),
          3000,
          'User creation timeout'
        )

        const elapsed = Date.now() - startTime
        console.log(`[/api/user/profile] Request completed in ${elapsed}ms (new user created)`)

        return res.status(200).json({
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          isActive: newUser.isActive,
          createdAt: newUser.createdAt,
          company: null,
          provider: null
        })
      } catch (createError) {
        // If Prisma fails, return basic profile from Supabase Auth
        console.warn('[/api/user/profile] Database unavailable for user creation:', createError)
        const elapsed = Date.now() - startTime
        console.log(`[/api/user/profile] Request completed in ${elapsed}ms (fallback to Supabase Auth)`)

        return res.status(200).json({
          id: user.id,
          email: user.email,
          firstName: user.user_metadata?.firstName || null,
          lastName: user.user_metadata?.lastName || null,
          role: user.user_metadata?.role || 'COMPANY_USER',
          isActive: true,
          createdAt: user.created_at,
          company: null,
          provider: null,
          _dbUnavailable: true
        });
      }
    }

    // Return user profile data
    const elapsed = Date.now() - startTime
    console.log(`[/api/user/profile] Request completed in ${elapsed}ms (existing user)`)
    res.status(200).json(dbUser)
  } catch (error) {
    const elapsed = Date.now() - startTime
    console.error(`[/api/user/profile] Request failed after ${elapsed}ms:`, error)
    res.status(500).json({ error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' })
  }
}