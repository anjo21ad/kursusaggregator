import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

/**
 * Test endpoint to verify Supabase REST API connectivity from Vercel
 *
 * Uses Node.js https module instead of fetch() to avoid "TypeError: fetch failed"
 * issues in Vercel serverless runtime.
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
    // Parse URL
    const url = new URL(`${supabaseUrl}/rest/v1/trend_proposals?select=id,title,status&limit=5`);

    console.log('[test-supabase] Making HTTPS request to:', url.hostname + url.pathname);

    // Make HTTPS request using Node.js https module
    const data = await new Promise<any>((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: 'GET',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      };

      const request = https.request(options, (response) => {
        let body = '';

        response.on('data', (chunk) => {
          body += chunk;
        });

        response.on('end', () => {
          if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
            try {
              const parsed = JSON.parse(body);
              resolve(parsed);
            } catch (err) {
              reject(new Error(`Failed to parse JSON: ${err}`));
            }
          } else {
            reject(new Error(`HTTP ${response.statusCode}: ${body}`));
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
      message: '✅ Supabase REST API connection successful!',
      data: {
        recordsFound: Array.isArray(data) ? data.length : 0,
        sampleRecords: data
      },
      method: 'Node.js https module (not fetch)'
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
