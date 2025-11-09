import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

type ApiResponse = {
  success: boolean;
  data?: {
    id: string;
    status: string;
  };
  message?: string;
  error?: string;
};

/**
 * POST /api/admin/proposals/[id]/approve
 *
 * Approves a trend proposal and updates status to APPROVED
 *
 * Phase 1: Just updates status
 * Phase 2: Will trigger course generation workflow
 *
 * Authentication: TODO - Add SUPER_ADMIN role check
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Get proposal ID from URL
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid proposal ID'
      });
    }

    // Get Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[admin/approve] Missing Supabase credentials');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    console.log(`[admin/approve] Approving proposal: ${id}`);

    // Update proposal status to APPROVED via REST API
    const url = new URL(
      `/rest/v1/trend_proposals?id=eq.${id}`,
      supabaseUrl
    );

    const updatedData = {
      status: 'APPROVED',
      updatedAt: new Date().toISOString()
    };

    const result = await new Promise<any>((resolve, reject) => {
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation' // Return updated object
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

      request.write(JSON.stringify(updatedData));
      request.end();
    });

    // Check if proposal was found and updated
    if (!result || (Array.isArray(result) && result.length === 0)) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }

    const updatedProposal = Array.isArray(result) ? result[0] : result;

    console.log(`[admin/approve] ✅ Approved proposal: ${id}`);

    // Step 1: Generate curriculum outline (creates Course record)
    console.log('[admin/approve] Triggering curriculum generation...');

    const generateCourseResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/generate-course/${id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!generateCourseResponse.ok) {
      const errorData = await generateCourseResponse.json().catch(() => ({}));
      console.error('[admin/approve] Curriculum generation failed:', errorData);

      return res.status(500).json({
        success: false,
        error: `Curriculum generation failed: ${errorData.error || 'Unknown error'}`
      });
    }

    const courseData = await generateCourseResponse.json();
    const courseId = courseData.data?.courseId;

    if (!courseId) {
      console.error('[admin/approve] No courseId returned from curriculum generation');
      return res.status(500).json({
        success: false,
        error: 'Curriculum generation did not return courseId'
      });
    }

    console.log(`[admin/approve] ✅ Curriculum generated, courseId: ${courseId}`);

    // Step 2: Trigger n8n content generation workflow
    console.log('[admin/approve] Triggering content generation workflow...');

    const contentGenerationResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/webhooks/n8n-generate-content`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          proposalId: id,
          courseId: parseInt(courseId, 10),
        }),
      }
    );

    if (!contentGenerationResponse.ok) {
      const errorData = await contentGenerationResponse.json().catch(() => ({}));
      console.error('[admin/approve] Content generation workflow trigger failed:', errorData);

      // Don't fail the entire request - curriculum is already generated
      // Content generation can be retried manually
      console.warn('[admin/approve] ⚠️ Content generation failed, but curriculum exists');
    } else {
      console.log('[admin/approve] ✅ Content generation workflow triggered');
    }

    return res.status(200).json({
      success: true,
      message: 'Proposal approved and course generation started',
      data: {
        id: updatedProposal.id,
        status: updatedProposal.status,
        courseId: courseId,
      }
    });
  } catch (error) {
    console.error('[admin/approve] Error approving proposal:', error);

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve proposal'
    });
  }
}
