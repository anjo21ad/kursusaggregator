import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabaseClient'
import { fetchUserProfile } from '@/lib/database-adapter'

interface User {
  id: string
  email: string
  role: string
}

export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ user: User } | null> {
  // Get token from Authorization header
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    res.status(401).json({ error: 'Unauthorized - No token provided' })
    return null
  }

  try {
    // Verify token with Supabase
    const {
      data: { user: authUser },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token)

    if (authError || !authUser) {
      res.status(401).json({ error: 'Unauthorized - Invalid token' })
      return null
    }

    // Get user from database to check role (use hybrid adapter)
    const dbUser = await fetchUserProfile(authUser.id)

    if (!dbUser) {
      res.status(404).json({ error: 'User not found in database' })
      return null
    }

    if (!dbUser.isActive) {
      res.status(403).json({ error: 'User account is disabled' })
      return null
    }

    // Check if user is SUPER_ADMIN
    if (dbUser.role !== 'SUPER_ADMIN') {
      res.status(403).json({ error: 'Forbidden - Admin access required' })
      return null
    }

    return { user: {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role
    } }
  } catch (error) {
    console.error('Admin auth error:', error)
    res.status(500).json({ error: 'Internal server error during authentication' })
    return null
  }
}
