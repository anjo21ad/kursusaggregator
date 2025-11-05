import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (serverless-friendly)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
};

/**
 * POST /api/webhooks/n8n-trend
 *
 * Receives trend data from n8n workflow and creates TrendProposal in database.
 *
 * Authentication: Bearer token (N8N_WEBHOOK_SECRET)
 * Source: HackerNews top stories (Phase 1)
 *
 * Uses Supabase client for serverless-friendly database access
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

    // 3. Initialize Supabase client
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[n8n-trend] Missing Supabase credentials:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseServiceKey,
        urlPrefix: supabaseUrl?.substring(0, 20)
      });
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
        error: 'Supabase credentials not configured'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // 4. Check for duplicates (by sourceId)
    let existing, findError;
    try {
      const result = await supabase
        .from('trend_proposals')
        .select('id, status')
        .eq('source_id', payload.sourceId)
        .eq('source', 'hackernews')
        .maybeSingle();

      existing = result.data;
      findError = result.error;
    } catch (err) {
      console.error('[n8n-trend] Supabase fetch error:', err);
      return res.status(500).json({
        success: false,
        message: 'Database query error',
        error: err instanceof Error ? err.message : 'Supabase connection failed'
      });
    }

    if (findError) {
      console.error('[n8n-trend] Error checking for duplicates:', findError);
      return res.status(500).json({
        success: false,
        message: 'Database query error',
        error: findError.message
      });
    }

    if (existing) {
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
    const { data: trendProposal, error: insertError } = await supabase
      .from('trend_proposals')
      .insert({
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
      })
      .select('id, status')
      .single();

    if (insertError) {
      console.error('[n8n-trend] Error creating TrendProposal:', insertError);
      return res.status(500).json({
        success: false,
        message: 'Database insert error',
        error: insertError.message
      });
    }

    console.log(`[n8n-trend] Created TrendProposal: ${trendProposal.id} - ${payload.title}`);

    // 6. Return success
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
