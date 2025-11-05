import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const envVars = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    HAS_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SERVICE_KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length,
    SERVICE_KEY_PREFIX: process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20),
    HAS_WEBHOOK_SECRET: !!process.env.N8N_WEBHOOK_SECRET,
    ALL_SUPABASE_KEYS: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
  };

  return res.status(200).json(envVars);
}
