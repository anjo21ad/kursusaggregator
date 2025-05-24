import { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil' as const,
})


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { course } = req.body

  if (!course) {
    return res.status(400).json({ error: 'Missing course data' })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'dkk',
            product_data: {
              name: course.title,
              description: course.description,
            },
            unit_amount: course.priceCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.origin}/?success=true&courseId=${course.id}`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}
