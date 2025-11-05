import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

/**
 * Test Supabase connection using native Node.js https module
 * This bypasses fetch() issues in Vercel serverless runtime
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
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey
    });
  }

  try {
    // Parse Supabase URL
    const url = new URL(`${supabaseUrl}/rest/v1/trend_proposals`);

    // Make request using native https module (more reliable than fetch on Vercel)
    const result = await new Promise<any>((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: 443,
        path: `${url.pathname}?select=count&limit=1`,
        method: 'GET',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'count=exact'
        },
        timeout: 10000 // 10 second timeout
      };

      const request = https.request(options, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({
              statusCode: response.statusCode,
              headers: response.headers,
              data: parsed
            });
          } catch (err) {
            resolve({
              statusCode: response.statusCode,
              headers: response.headers,
              rawData: data
            });
          }
        });
      });

      request.on('error', (err) => {
        reject(err);
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout after 10 seconds'));
      });

      request.end();
    });

    return res.status(200).json({
      success: true,
      message: 'Supabase connection successful using https module',
      result
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      errorType: err instanceof Error ? err.constructor.name : typeof err,
      stack: err instanceof Error ? err.stack : undefined
    });
  }
}
