import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // 3. Check for duplicates (by sourceId)
    const existing = await prisma.trendProposal.findFirst({
      where: {
        sourceId: payload.sourceId,
        source: 'hackernews'
      }
    });

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

    // 4. Create TrendProposal
    const trendProposal = await prisma.trendProposal.create({
      data: {
        // Source Data
        source: 'hackernews',
        sourceId: payload.sourceId,
        sourceUrl: payload.sourceUrl,

        // Trend Information
        title: payload.title,
        description: payload.aiAnalysis.suggestedDescription || '',
        keywords: payload.aiAnalysis.keywords || [],
        trendScore: payload.score || 0,

        // AI Analysis
        aiCourseProposal: {
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

        estimatedDurationMinutes: payload.aiAnalysis.estimatedDurationMinutes,
        estimatedGenerationCostUsd: payload.aiAnalysis.estimatedGenerationCostUsd,
        estimatedEngagementScore: payload.aiAnalysis.relevanceScore,

        // Status (defaults to PENDING in schema)
        status: 'PENDING'
      }
    });

    console.log(`[n8n-trend] Created TrendProposal: ${trendProposal.id} - ${trendProposal.title}`);

    // 5. Return success
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
  } finally {
    await prisma.$disconnect();
  }
}
