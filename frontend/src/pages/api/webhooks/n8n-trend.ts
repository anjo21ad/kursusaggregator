import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

type N8nTrendPayload = {
  sourceId: string;
  sourceUrl: string;
  title: string;
  score: number;
  author: string;
  time: number;
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
};

/**
 * Make HTTPS request to Supabase REST API
 * Uses native Node.js https module to avoid fetch() issues on Vercel
 */
async function supabaseRequest(
  url: string,
  apiKey: string,
  method: string,
  path: string,
  body?: any,
  retries = 3
): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const parsedUrl = new URL(url);

      const options = {
        hostname: parsedUrl.hostname,
        port: 443,
        path: `/rest/v1${path}`,
        method,
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        timeout: 10000
      };

      const result = await new Promise<any>((resolve, reject) => {
        const request = https.request(options, (response) => {
          let data = '';

          response.on('data', (chunk) => {
            data += chunk;
          });

          response.on('end', () => {
            try {
              const parsed = data ? JSON.parse(data) : null;
              resolve({
                statusCode: response.statusCode,
                data: parsed,
                headers: response.headers
              });
            } catch (err) {
              resolve({
                statusCode: response.statusCode,
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
          reject(new Error('Request timeout'));
        });

        if (body) {
          request.write(JSON.stringify(body));
        }

        request.end();
      });

      return result;

    } catch (err) {
      if (attempt === retries) {
        throw err;
      }
      // Exponential backoff: wait 2^attempt seconds
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

/**
 * POST /api/webhooks/n8n-trend
 * Receives trend data from n8n workflow and creates TrendProposal in database
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed',
      error: 'Only POST requests are accepted'
    });
  }

  try {
    // 1. Authenticate
    const authHeader = req.headers.authorization;
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;

    if (!expectedSecret) {
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

    const token = authHeader.substring(7);
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

    // 3. Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
        error: 'Supabase credentials not configured'
      });
    }

    // 4. Check for duplicates
    const findResult = await supabaseRequest(
      supabaseUrl,
      supabaseServiceKey,
      'GET',
      `/trend_proposals?source_id=eq.${encodeURIComponent(payload.sourceId)}&source=eq.hackernews&select=id,status`
    );

    if (findResult.statusCode !== 200 && findResult.statusCode !== 404) {
      return res.status(500).json({
        success: false,
        message: 'Database query error',
        error: `Status ${findResult.statusCode}: ${findResult.rawData || 'Unknown error'}`
      });
    }

    // If record exists, return it
    if (findResult.data && Array.isArray(findResult.data) && findResult.data.length > 0) {
      const existing = findResult.data[0];
      return res.status(200).json({
        success: true,
        message: 'Trend already exists',
        data: {
          id: existing.id,
          status: existing.status
        }
      });
    }

    // 5. Create TrendProposal
    const insertData = {
      source: 'hackernews',
      source_id: payload.sourceId,
      source_url: payload.sourceUrl,
      title: payload.title,
      description: payload.aiAnalysis.suggestedDescription || '',
      keywords: payload.aiAnalysis.keywords || [],
      trend_score: payload.score || 0,
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
      status: 'PENDING'
    };

    const insertResult = await supabaseRequest(
      supabaseUrl,
      supabaseServiceKey,
      'POST',
      '/trend_proposals',
      insertData
    );

    if (insertResult.statusCode !== 201) {
      return res.status(500).json({
        success: false,
        message: 'Database insert error',
        error: `Status ${insertResult.statusCode}: ${JSON.stringify(insertResult.data || insertResult.rawData)}`
      });
    }

    const trendProposal = Array.isArray(insertResult.data) ? insertResult.data[0] : insertResult.data;

    console.log(`[n8n-trend] Created TrendProposal: ${trendProposal.id} - ${payload.title}`);

    return res.status(201).json({
      success: true,
      message: 'Trend proposal created successfully',
      data: {
        id: trendProposal.id,
        status: trendProposal.status
      }
    });

  } catch (error) {
    console.error('[n8n-trend] Error processing webhook:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
