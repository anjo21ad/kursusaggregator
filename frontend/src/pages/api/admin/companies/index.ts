import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/middleware/adminAuth'
import { supabase } from '@/lib/supabaseClient'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify admin access
  const auth = await requireAdmin(req, res)
  if (!auth) return

  if (req.method === 'GET') {
    try {
      // Fetch all companies with user count and purchase count
      const { data: companies, error } = await supabase
        .from('companies')
        .select(`
          id,
          name,
          cvr,
          email,
          phone,
          address,
          city,
          postalCode,
          website,
          isActive,
          createdAt,
          updatedAt,
          users:users(count),
          purchases:purchases(count),
          leads:leads(count)
        `)
        .order('createdAt', { ascending: false })

      if (error) {
        console.error('Supabase error fetching companies:', error)
        return res.status(500).json({ error: 'Kunne ikke hente virksomheder' })
      }

      // Transform to include counts
      const companiesWithCounts = (companies || []).map((company: any) => ({
        id: company.id,
        name: company.name,
        cvr: company.cvr,
        email: company.email,
        phone: company.phone,
        address: company.address,
        city: company.city,
        postalCode: company.postalCode,
        website: company.website,
        isActive: company.isActive,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
        userCount: company.users?.[0]?.count || 0,
        purchaseCount: company.purchases?.[0]?.count || 0,
        leadCount: company.leads?.[0]?.count || 0,
      }))

      return res.status(200).json({ companies: companiesWithCounts })
    } catch (error) {
      console.error('Error fetching companies:', error)
      return res.status(500).json({ error: 'Serverfejl' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { name, cvr, email, phone, address, city, postalCode, website } = req.body

      if (!name || !email) {
        return res.status(400).json({ error: 'Navn og email er påkrævet' })
      }

      const { data, error } = await supabase
        .from('companies')
        .insert({
          name,
          cvr,
          email,
          phone,
          address,
          city,
          postalCode,
          website,
          isActive: true,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating company:', error)
        return res.status(500).json({ error: 'Kunne ikke oprette virksomhed' })
      }

      return res.status(201).json({ company: data })
    } catch (error) {
      console.error('Error creating company:', error)
      return res.status(500).json({ error: 'Serverfejl' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
