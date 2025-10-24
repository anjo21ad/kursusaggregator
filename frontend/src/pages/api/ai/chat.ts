// AI Chat API - Streaming endpoint for course recommendations
import { NextApiRequest, NextApiResponse } from 'next';
import { anthropic, STREAM_CONFIG } from '@/lib/ai/client';
import {
  COURSE_MATCHING_SYSTEM_PROMPT,
  buildCourseMatchingPrompt,
  AIResponse
} from '@/lib/ai/prompts';
import { fetchCoursesForAI, getCompanyContext } from '@/lib/ai/course-fetcher';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const startTime = Date.now();

  try {
    const { query, sessionId, userId } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'User ID is required' });
    }

    // Verify user authentication - extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('AI Chat API: Missing or invalid Authorization header');
      return res.status(401).json({ error: 'Unauthorized - Missing token' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('AI Chat API: Invalid token or user not found:', authError);
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    // Fetch available courses and company context
    const [courses, companyContext] = await Promise.all([
      fetchCoursesForAI({ limit: 30 }), // Limit to 30 for better AI performance
      getCompanyContext(userId),
    ]);

    if (courses.length === 0) {
      return res.status(200).json({
        understanding: 'Der er desværre ingen kurser tilgængelige i øjeblikket.',
        recommendations: [],
        error: 'NO_COURSES_AVAILABLE',
      });
    }

    // Build the full prompt
    const userPrompt = buildCourseMatchingPrompt(query, companyContext, courses);

    // Setup SSE headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let fullResponse = '';
    let aiResponse: AIResponse | null = null;

    // DEBUG: Log API call details
    console.log('=== AI CHAT API DEBUG ===');
    console.log('[1] About to call Anthropic API');
    console.log('[2] Model:', STREAM_CONFIG.model);
    console.log('[3] Max tokens:', STREAM_CONFIG.max_tokens);
    console.log('[4] Anthropic API Key (env check):', process.env.ANTHROPIC_API_KEY ?
      `${process.env.ANTHROPIC_API_KEY.substring(0, 25)}...${process.env.ANTHROPIC_API_KEY.substring(process.env.ANTHROPIC_API_KEY.length - 10)}` :
      'NOT SET');
    console.log('[5] API Key length:', process.env.ANTHROPIC_API_KEY?.length || 0);
    console.log('[6] Query:', query.substring(0, 50));
    console.log('[7] Available courses:', courses.length);
    console.log('========================');

    // Stream from Claude
    let stream;
    try {
      stream = await anthropic.messages.stream({
        ...STREAM_CONFIG,
        system: COURSE_MATCHING_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      console.log('[DEBUG] Anthropic stream created successfully');

    } catch (apiError) {
      console.error('=== ANTHROPIC API ERROR ===');
      console.error('Failed to create stream:', apiError instanceof Error ? apiError.message : String(apiError));
      console.error('==========================');
      throw apiError;
    }

    // Stream chunks to client
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        const text = chunk.delta.text;
        fullResponse += text;

        // Send chunk to client
        res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`);
      }
    }

    console.log('[DEBUG] Stream completed, full response length:', fullResponse.length);

    // Try to parse the complete response as JSON
    try {
      // Extract JSON from response (handle cases where AI adds extra text)
      const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]) as AIResponse;
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: 'Failed to parse AI response'
      })}\n\n`);
      res.end();
      return;
    }

    const responseTime = Date.now() - startTime;

    // Log interaction to database (optional - don't fail if it doesn't work)
    try {
      console.log('[DEBUG] Attempting to log AI interaction to database...');
      console.log('[DEBUG] Data:', {
        user_id: userId,
        session_id: sessionId || `session_${Date.now()}`,
        query: query.substring(0, 50),
        model: STREAM_CONFIG.model,
      });

      await prisma.aIInteraction.create({
        data: {
          user_id: userId,                            // snake_case as per schema
          session_id: sessionId || `session_${Date.now()}`,  // snake_case as per schema
          query,
          recommendations: aiResponse as any,         // Prisma Json type
          model_used: STREAM_CONFIG.model,            // snake_case as per schema
          response_time_ms: responseTime,             // snake_case as per schema
        },
      });
      console.log('[DEBUG] AI interaction logged successfully');
    } catch (dbError) {
      console.error('[WARNING] Failed to log AI interaction (non-fatal):', dbError instanceof Error ? dbError.message : String(dbError));
      // Don't fail the request if logging fails - this is optional analytics
    }

    // Send final complete response
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      response: aiResponse
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error('=== AI CHAT API ERROR ===');
    console.error('Error type:', error?.constructor?.name || 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : String(error));

    // Avoid JSON.stringify on error objects as it can cause issues
    if (error && typeof error === 'object') {
      console.error('Error details:', {
        name: (error as any).name,
        message: (error as any).message,
        status: (error as any).status,
        type: (error as any).type,
      });
    }

    // Log stack trace separately to avoid source mapping issues
    if (error instanceof Error && error.stack) {
      console.error('Stack trace available (not shown to avoid source map errors)');
    }
    console.error('========================');

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Make sure response headers are set
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
    }

    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: errorMessage
    })}\n\n`);
    res.end();
  }
}
