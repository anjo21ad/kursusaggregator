import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

type N8nTrendPayload = {
  // HackerNews Data
  sourceId: string;
  sourceUrl: string;
  title: string;
  score: number;
  author: string;
  time: number;

  // AI Analysis
  aiAnalysis: {
    relevanceScore: number;
    suggestedCourseTitle: string;
    suggestedDescription: string;
    keywords: string[];
    estimatedDurationMinutes: number;
    estimatedGenerationCostUsd: number;
  };
};

type ApiResponse = {
  success: boolean;
  message: string;
  data?: {
    id: string;
    status: string;
  };
  error?: string;
  debug?: any; // Debug info for troubleshooting
};

/**
 * POST /api/webhooks/n8n-trend
 *
 * Receives trend data from n8n workflow and creates TrendProposal in database.
 *
 * Authentication: Bearer token (N8N_WEBHOOK_SECRET)
 * Source: HackerNews top stories (Phase 1)
 *
 * Uses Node.js https module for maximum compatibility with Vercel runtime
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST requests are accepted'
    });
  }

  try {
    // 1. Authenticate request
    const authHeader = req.headers.authorization;
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!expectedSecret) {
      console.error('[n8n-trend] N8N_WEBHOOK_SECRET not configured');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
        error: 'Webhook secret not configured'
      });
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    if (token !== expectedSecret) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
        error: 'Invalid webhook secret'
      });
    }

    // 2. Validate payload
    const payload: N8nTrendPayload = req.body;

    if (!payload.sourceId || !payload.title || !payload.sourceUrl) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload',
        error: 'Missing required fields: sourceId, title, sourceUrl'
      });
    }

    if (!payload.aiAnalysis || !payload.aiAnalysis.relevanceScore) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload',
        error: 'Missing AI analysis data'
      });
    }

    // 3. Get Supabase credentials (read env vars at runtime)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('[n8n-trend] Supabase config check:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
      urlPrefix: supabaseUrl?.substring(0, 40)
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[n8n-trend] Missing Supabase credentials');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
        error: 'Supabase credentials not configured'
      });
    }

    // Helper function: HTTPS request with retry logic
    const httpsRequest = async (
      url: URL,
      options: https.RequestOptions,
      body?: string,
      retries = 3
    ): Promise<any> => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          console.log(`[n8n-trend] HTTPS request attempt ${attempt + 1}/${retries + 1}: ${url.pathname}`);

          const result = await new Promise<any>((resolve, reject) => {
            const request = https.request(
              {
                ...options,
                hostname: url.hostname,
                port: 443,
                path: url.pathname + url.search,
                timeout: 10000 // 10 second timeout
              },
              (response) => {
                let responseBody = '';

                response.on('data', (chunk) => {
                  responseBody += chunk;
                });

                response.on('end', () => {
                  if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
                    try {
                      const parsed = JSON.parse(responseBody);
                      resolve(parsed);
                    } catch (err) {
                      reject(new Error(`Failed to parse JSON: ${err}`));
                    }
                  } else {
                    reject(new Error(`HTTP ${response.statusCode}: ${responseBody}`));
                  }
                });
              }
            );

            request.on('error', (err) => {
              reject(err);
            });

            request.on('timeout', () => {
              request.destroy();
              reject(new Error('Request timeout after 10 seconds'));
            });

            if (body) {
              request.write(body);
            }

            request.end();
          });

          return result;
        } catch (err) {
          console.error(`[n8n-trend] HTTPS attempt ${attempt + 1} failed:`, err);

          // If last attempt, throw error
          if (attempt === retries) {
            throw err;
          }

          // Exponential backoff: 2s, 4s, 8s
          const delay = Math.pow(2, attempt + 1) * 1000;
          console.log(`[n8n-trend] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      throw new Error('All retry attempts failed');
    };

    // 4. Check for duplicates (by sourceId)
    try {
      const duplicateCheckUrl = new URL(
        `/rest/v1/trend_proposals?source_id=eq.${encodeURIComponent(payload.sourceId)}&source=eq.hackernews&select=id,status`,
        supabaseUrl
      );

      const existing = await httpsRequest(
        duplicateCheckUrl,
        {
          method: 'GET',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.pgrst.object+json' // Return single object or null
          }
        }
      );

      // If we got a result, trend already exists
      if (existing && existing.id) {
        console.log(`[n8n-trend] Duplicate found: ${existing.id}`);
        return res.status(200).json({
          success: true,
          message: 'Trend already exists',
          data: {
            id: existing.id,
            status: existing.status
          }
        });
      }
    } catch (err) {
      // If error is "406 Not Acceptable" or "Multiple rows", continue to insert
      // If error is 404 or empty result, that's fine - no duplicate exists
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('406') || errorMsg.includes('Multiple') || errorMsg.includes('404')) {
        console.log('[n8n-trend] No duplicate found (expected)');
      } else {
        // Unexpected error - log and continue
        console.error('[n8n-trend] Error checking duplicates (non-fatal):', err);
      }
    }

    // 5. Create TrendProposal via REST API
    const proposalData = {
      // Source Data
      source: 'hackernews',
      source_id: payload.sourceId,
      source_url: payload.sourceUrl,

      // Trend Information
      title: payload.title,
      description: payload.aiAnalysis.suggestedDescription || '',
      keywords: payload.aiAnalysis.keywords || [],
      trend_score: payload.score || 0,

      // AI Analysis
      ai_course_proposal: {
        relevanceScore: payload.aiAnalysis.relevanceScore,
        suggestedCourseTitle: payload.aiAnalysis.suggestedCourseTitle,
        suggestedDescription: payload.aiAnalysis.suggestedDescription,
        keywords: payload.aiAnalysis.keywords,
        estimatedDurationMinutes: payload.aiAnalysis.estimatedDurationMinutes,
        hackernewsData: {
          author: payload.author,
          time: payload.time,
          score: payload.score
        }
      },

      estimated_duration_minutes: payload.aiAnalysis.estimatedDurationMinutes,
      estimated_generation_cost_usd: payload.aiAnalysis.estimatedGenerationCostUsd,
      estimated_engagement_score: payload.aiAnalysis.relevanceScore,

      // Status (defaults to PENDING)
      status: 'PENDING'
    };

    try {
      const insertUrl = new URL('/rest/v1/trend_proposals', supabaseUrl);

      const createdProposals = await httpsRequest(
        insertUrl,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseServiceKey,
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation' // Return created object
          }
        },
        JSON.stringify(proposalData)
      );

      const trendProposal = Array.isArray(createdProposals) ? createdProposals[0] : createdProposals;

      if (!trendProposal || !trendProposal.id) {
        throw new Error('Failed to create trend proposal - no ID returned');
      }

      console.log(`[n8n-trend] ✅ Created TrendProposal: ${trendProposal.id} - ${payload.title}`);

      // 6. Return success
      return res.status(201).json({
        success: true,
        message: 'Trend proposal created successfully',
        data: {
          id: trendProposal.id,
          status: trendProposal.status
        }
      });
    } catch (err) {
      console.error('[n8n-trend] Error creating TrendProposal:', err);
      return res.status(500).json({
        success: false,
        message: 'Database insert error',
        error: err instanceof Error ? err.message : 'Failed to insert trend proposal'
      });
    }

  } catch (error) {
    console.error('[n8n-trend] Error processing webhook:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
