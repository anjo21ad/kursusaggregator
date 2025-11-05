import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Test endpoint to verify Supabase REST API connectivity from Vercel
 *
 * Uses direct fetch() to Supabase REST API instead of @supabase/supabase-js
 * to avoid "TypeError: fetch failed" issues in Vercel serverless runtime.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({
      success: false,
      error: 'Missing credentials',
      details: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey
      }
    });
  }

  try {
    // Test REST API call with timeout
    const url = `${supabaseUrl}/rest/v1/trend_proposals?select=id,title,status&limit=5`;

    console.log('[test-supabase] Making REST API call to:', url.replace(/\/rest.*/, '/rest/v1/...'));

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `Supabase API returned ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      message: '✅ Supabase REST API connection successful!',
      data: {
        recordsFound: Array.isArray(data) ? data.length : 0,
        sampleRecords: data
      },
      method: 'Direct REST API with native fetch()'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      type: err instanceof Error ? err.constructor.name : typeof err,
      stack: err instanceof Error ? err.stack : undefined
    });
  }
}
