import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Test basic API functionality without database
    res.status(200).json({
      status: 'OK',
      message: 'Kursusaggregator API er klar til brug',
      timestamp: new Date().toISOString(),
      environment: {
        node_env: process.env.NODE_ENV,
        has_database_url: !!process.env.DATABASE_URL,
        has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        has_stripe_key: !!process.env.STRIPE_SECRET_KEY
      }
    })
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      error: 'Health check fejlede',
      details: error instanceof Error ? error.message : 'Ukendt fejl'
    })
  }
}