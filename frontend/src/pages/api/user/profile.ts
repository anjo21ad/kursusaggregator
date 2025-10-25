import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'
import { fetchUserProfile } from '@/lib/database-adapter'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' })
  }

  // Verificer token med Supabase først (dette virker altid via HTTPS)
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Use hybrid database adapter (Supabase REST API for reliability)
  const dbUser = await fetchUserProfile(user.id)

  // If user doesn't exist in our DB, create them automatically (WRITE - use Prisma)
  if (!dbUser) {
    try {
      const newUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!,
          firstName: user.user_metadata?.firstName || null,
          lastName: user.user_metadata?.lastName || null,
          role: 'COMPANY_USER', // Default role
        },
      })

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
      console.warn('⚠️  Database unavailable for user creation, using Supabase Auth data only');

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
  res.status(200).json(dbUser)
}