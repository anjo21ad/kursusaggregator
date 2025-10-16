import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabaseClient'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verificer admin authentication
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'No authorization token provided' })
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Check user role
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, firstName: true, lastName: true }
  })

  if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' })
  }

  const { providerId, status, reason } = req.body

  if (!providerId || !status) {
    return res.status(400).json({ error: 'Provider ID and status are required' })
  }

  const validStatuses = ['PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED']
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' })
  }

  try {
    // Hent provider først for at verificere den eksisterer
    const existingProvider = await prisma.provider.findUnique({
      where: { id: providerId },
      include: {
        users: {
          select: { id: true, email: true, firstName: true, lastName: true }
        }
      }
    })

    if (!existingProvider) {
      return res.status(404).json({ error: 'Provider not found' })
    }

    // Opdater provider status
    const updatedProvider = await prisma.provider.update({
      where: { id: providerId },
      data: {
        status: status,
        approvedAt: status === 'APPROVED' ? new Date() : null,
        updatedAt: new Date()
      }
    })

    // Log admin action (kunne udvides med audit trail)
    console.log(`
    🔧 Admin Action:
    - Admin: ${dbUser.firstName} ${dbUser.lastName} (${user.email})
    - Action: Changed provider status
    - Provider: ${existingProvider.companyName} (ID: ${providerId})
    - From: ${existingProvider.status} → To: ${status}
    - Reason: ${reason || 'None provided'}
    - Timestamp: ${new Date().toISOString()}
    `)

    // Send notification emails baseret på status
    if (status === 'APPROVED') {
      // TODO: Send approval email til provider
      console.log(`📧 TODO: Send approval email to ${existingProvider.contactEmail}`)
      
      // TODO: Notify provider users that they can now log in
      for (const providerUser of existingProvider.users) {
        console.log(`📧 TODO: Send welcome email to ${providerUser.email}`)
      }
    } else if (status === 'REJECTED') {
      // TODO: Send rejection email med reason
      console.log(`📧 TODO: Send rejection email to ${existingProvider.contactEmail} with reason: ${reason}`)
    } else if (status === 'SUSPENDED') {
      // TODO: Send suspension notification
      console.log(`📧 TODO: Send suspension email to ${existingProvider.contactEmail} with reason: ${reason}`)
    }

    res.status(200).json({
      success: true,
      message: `Provider status updated to ${status}`,
      provider: {
        id: updatedProvider.id,
        companyName: updatedProvider.companyName,
        status: updatedProvider.status,
        approvedAt: updatedProvider.approvedAt
      }
    })

  } catch (error) {
    console.error('Provider status update error:', error)
    res.status(500).json({
      error: 'Failed to update provider status',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}