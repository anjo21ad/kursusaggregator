import type { NextApiRequest, NextApiResponse } from 'next';

type GenerateContentRequest = {
  proposalId: string;
  courseId: number;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data?: {
    workflowTriggered: boolean;
  };
  error?: string;
};

/**
 * POST /api/webhooks/n8n-generate-content
 *
 * Triggers n8n Content Generation Workflow to generate detailed course content
 *
 * This endpoint is called from the admin dashboard after:
 * 1. Admin approves TrendProposal
 * 2. Curriculum outline is generated (generateCourseFromProposal)
 * 3. Course record is created in database
 *
 * The n8n workflow will then:
 * - Fetch the proposal and course data
 * - Loop through curriculum sections
 * - Generate detailed content + quiz for each section
 * - Update Course.curriculumJson with complete content
 * - Set status to PUBLISHED
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
    // 1. Authenticate (Supabase service role key required)
    const authHeader = req.headers.authorization;
    const expectedSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!expectedSecret) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
        error: 'Service role key not configured'
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
        error: 'Invalid service role key'
      });
    }

    // 2. Validate payload
    const payload: GenerateContentRequest = req.body;

    if (!payload.proposalId || !payload.courseId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload',
        error: 'Missing required fields: proposalId, courseId'
      });
    }

    // 3. Trigger n8n workflow
    const n8nWebhookUrl = process.env.N8N_CONTENT_GENERATION_WEBHOOK_URL;

    if (!n8nWebhookUrl) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error',
        error: 'n8n webhook URL not configured'
      });
    }

    console.log(`[n8n-generate-content] Triggering content generation for course ${payload.courseId}`);

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        proposalId: payload.proposalId,
        courseId: payload.courseId
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[n8n-generate-content] n8n workflow trigger failed:', {
        status: response.status,
        error: errorText
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to trigger content generation workflow',
        error: `n8n returned status ${response.status}: ${errorText}`
      });
    }

    console.log(`[n8n-generate-content] ✅ Content generation workflow triggered for course ${payload.courseId}`);

    return res.status(200).json({
      success: true,
      message: 'Content generation workflow triggered successfully',
      data: {
        workflowTriggered: true
      }
    });

  } catch (error) {
    console.error('[n8n-generate-content] Error triggering workflow:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
