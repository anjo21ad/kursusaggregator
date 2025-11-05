import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';
import { generateCourseFromProposal, saveCourseToDatabase } from '@/lib/ai/course-generator';

type ApiResponse = {
  success: boolean;
  data?: {
    courseId: string;
    proposalId: string;
    title: string;
    cost: number;
    generationTime: number;
  };
  message?: string;
  error?: string;
};

/**
 * POST /api/admin/generate-course/[proposalId]
 *
 * Generates a complete course from an APPROVED trend proposal using Claude AI
 *
 * Phase 1: Generates curriculum only (text content + quiz in Phase 2)
 * Target: <$1 per course, <2 hours generation time
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
    const { proposalId } = req.query;

    if (!proposalId || typeof proposalId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid proposal ID'
      });
    }

    console.log(`[generate-course] Starting generation for proposal: ${proposalId}`);

    // 1. Fetch proposal from Supabase
    const proposal = await fetchProposal(proposalId);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        error: 'Proposal not found'
      });
    }

    // 2. Verify proposal is APPROVED
    if (proposal.status !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: `Proposal must be APPROVED (current status: ${proposal.status})`
      });
    }

    // 3. Update status to GENERATING
    await updateProposalStatus(proposalId, 'GENERATING');

    // 4. Generate course using Claude AI
    console.log('[generate-course] Generating course with Claude AI...');

    const generatedCourse = await generateCourseFromProposal({
      id: proposal.id,
      title: proposal.title,
      description: proposal.description,
      keywords: proposal.keywords,
      sourceUrl: proposal.sourceUrl,
      aiCourseProposal: proposal.aiCourseProposal,
    });

    console.log('[generate-course] ✅ Course generated successfully');

    // 5. Save course to database
    const courseId = await saveCourseToDatabase(proposalId, generatedCourse);

    console.log('[generate-course] ✅ Course saved to database');

    // 6. Return success
    return res.status(201).json({
      success: true,
      message: 'Course generated successfully',
      data: {
        courseId,
        proposalId,
        title: generatedCourse.title,
        cost: generatedCourse.totalCost,
        generationTime: generatedCourse.generationTimeSeconds,
      },
    });
  } catch (error) {
    console.error('[generate-course] Error:', error);

    // Try to update proposal status to APPROVED (rollback)
    const { proposalId } = req.query;
    if (proposalId && typeof proposalId === 'string') {
      try {
        await updateProposalStatus(proposalId, 'APPROVED');
        console.log('[generate-course] Rolled back proposal status to APPROVED');
      } catch (rollbackError) {
        console.error('[generate-course] Failed to rollback status:', rollbackError);
      }
    }

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate course'
    });
  }
}

/**
 * Fetch proposal from Supabase
 */
async function fetchProposal(proposalId: string): Promise<any | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  const url = new URL(
    `/rest/v1/trend_proposals?id=eq.${proposalId}&select=*`,
    supabaseUrl
  );

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    const request = https.request(options, (response) => {
      let body = '';
      response.on('data', (chunk) => (body += chunk));
      response.on('end', () => {
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
          const data = JSON.parse(body);
          resolve(Array.isArray(data) && data.length > 0 ? data[0] : null);
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${body}`));
        }
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    request.end();
  });
}

/**
 * Update proposal status
 */
async function updateProposalStatus(proposalId: string, status: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  const url = new URL(
    `/rest/v1/trend_proposals?id=eq.${proposalId}`,
    supabaseUrl
  );

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    const request = https.request(options, (response) => {
      let body = '';
      response.on('data', (chunk) => (body += chunk));
      response.on('end', () => {
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${body}`));
        }
      });
    });

    request.on('error', reject);
    request.on('timeout', () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });

    request.write(JSON.stringify({
      status,
      updatedAt: new Date().toISOString(),
    }));

    request.end();
  });
}
