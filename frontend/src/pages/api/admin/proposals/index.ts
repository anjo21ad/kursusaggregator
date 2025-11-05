import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

type TrendProposal = {
  id: string;
  source: string;
  sourceId: string;
  sourceUrl: string;
  title: string;
  description: string;
  keywords: string[];
  trendScore: number;
  aiCourseProposal: {
    relevanceScore: number;
    suggestedCourseTitle: string;
    suggestedDescription: string;
    keywords: string[];
    estimatedDurationMinutes: number;
    hackernewsData?: {
      author: string;
      time: number;
      score: number;
    };
  };
  estimatedDurationMinutes: number;
  estimatedGenerationCostUsd: number;
  estimatedEngagementScore: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse = {
  success: boolean;
  data?: TrendProposal[];
  error?: string;
  count?: number;
};

/**
 * GET /api/admin/proposals
 *
 * Fetches all trend proposals from Supabase, ordered by creation date (newest first)
 *
 * Authentication: TODO - Add SUPER_ADMIN role check
 * Phase 1: No auth for MVP testing
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[admin/proposals] Missing Supabase credentials');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    // Parse URL for trend_proposals query
    const url = new URL(
      `/rest/v1/trend_proposals?select=*&order=createdAt.desc`,
      supabaseUrl
    );

    console.log('[admin/proposals] Fetching proposals from Supabase');

    // Make HTTPS request
    const data = await new Promise<TrendProposal[]>((resolve, reject) => {
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
        timeout: 10000
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

    console.log(`[admin/proposals] ✅ Fetched ${data.length} proposals`);

    return res.status(200).json({
      success: true,
      data,
      count: data.length
    });
  } catch (error) {
    console.error('[admin/proposals] Error fetching proposals:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch proposals'
    });
  }
}
