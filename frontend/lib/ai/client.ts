/**
 * Unified Anthropic Claude AI Client
 *
 * Single source of truth for all AI interactions across the platform
 * Features: Cost tracking, JSON generation, streaming, error handling
 *
 * Used by:
 * - Course Generator (auto-generated courses from trends)
 * - AI Chatbot (course matching and recommendations)
 * - Future: Quiz Generator, Content Generator, etc.
 */

import Anthropic from '@anthropic-ai/sdk';

// ============================================================================
// CONFIGURATION
// ============================================================================

const apiKey = process.env.ANTHROPIC_API_KEY;

// Debug: Log API key status (masked for security)
if (apiKey) {
  const masked = `${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 10)}`;
  console.log('[AI Client] Using Anthropic API Key:', masked);
  console.log('[AI Client] Key length:', apiKey.length, 'characters');
} else {
  console.error('[AI Client] ANTHROPIC_API_KEY environment variable is not set!');
  throw new Error('ANTHROPIC_API_KEY environment variable is required');
}

// Initialize Anthropic client
export const anthropic = new Anthropic({ apiKey });

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

// Available models
export const CLAUDE_SONNET_3_5 = 'claude-3-5-sonnet-20241022' as const;
export const CLAUDE_SONNET_4 = 'claude-sonnet-4-20250514' as const;

// Default model (production-ready)
export const CLAUDE_MODEL = CLAUDE_SONNET_3_5;
export const DEFAULT_MAX_TOKENS = 4096;

// Streaming configuration (for chatbot)
export const STREAM_CONFIG = {
  model: CLAUDE_MODEL,
  max_tokens: DEFAULT_MAX_TOKENS,
  temperature: 0.7, // Balanced between creativity and consistency
} as const;

// ============================================================================
// PRICING (per million tokens)
// ============================================================================

const PRICING: Record<string, { input: number; output: number }> = {
  'claude-3-5-sonnet-20241022': { input: 3.0, output: 15.0 },
  'claude-sonnet-4-20250514': { input: 3.0, output: 15.0 },
};

/**
 * Calculate cost for API call
 */
function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = PRICING[model] || PRICING[CLAUDE_SONNET_3_5];
  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000;
}

// ============================================================================
// CORE GENERATION FUNCTIONS
// ============================================================================

/**
 * Generate content using Claude API
 *
 * Returns generated text content with usage metadata and cost tracking
 *
 * @param systemPrompt - System instructions for Claude
 * @param userPrompt - User message/task
 * @param model - Claude model to use (default: CLAUDE_SONNET_3_5)
 * @param maxTokens - Maximum output tokens (default: 4000)
 * @returns Generated content and metadata
 */
export async function generateContent(
  systemPrompt: string,
  userPrompt: string,
  model: string = CLAUDE_SONNET_3_5,
  maxTokens: number = 4000
): Promise<{
  content: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  };
}> {
  try {
    console.log('[AI] Generating content with Claude...');
    console.log(`[AI] Model: ${model}, Max tokens: ${maxTokens}`);

    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract text content
    const textContent = response.content
      .filter((block) => block.type === 'text')
      .map((block) => ('text' in block ? block.text : ''))
      .join('\n');

    // Calculate cost
    const inputTokens = response.usage.input_tokens;
    const outputTokens = response.usage.output_tokens;
    const totalCost = calculateCost(model, inputTokens, outputTokens);

    console.log('[AI] ✅ Generation complete');
    console.log(`[AI] Tokens: ${inputTokens} in + ${outputTokens} out`);
    console.log(`[AI] Cost: $${totalCost.toFixed(4)}`);

    return {
      content: textContent,
      usage: {
        inputTokens,
        outputTokens,
        totalCost,
      },
    };
  } catch (error) {
    console.error('[AI] Error generating content:', error);
    throw new Error(
      `Claude API error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate JSON-structured content using Claude API
 *
 * Ensures output is valid JSON by instructing Claude to return JSON only.
 * Automatically cleans markdown code blocks if present.
 *
 * @param systemPrompt - System instructions
 * @param userPrompt - User message
 * @param model - Claude model to use
 * @param maxTokens - Maximum output tokens
 * @returns Parsed JSON object and usage metadata
 */
export async function generateJSON<T = any>(
  systemPrompt: string,
  userPrompt: string,
  model: string = CLAUDE_SONNET_3_5,
  maxTokens: number = 4000
): Promise<{
  data: T;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalCost: number;
  };
}> {
  const response = await generateContent(
    systemPrompt + '\n\nIMPORTANT: Return ONLY valid JSON. No markdown, no explanations, just pure JSON.',
    userPrompt,
    model,
    maxTokens
  );

  try {
    // Remove markdown code blocks if present
    let jsonString = response.content.trim();

    // Remove ```json and ``` if present
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const data = JSON.parse(jsonString);

    return {
      data,
      usage: response.usage,
    };
  } catch (error) {
    console.error('[AI] Failed to parse JSON response:', response.content.substring(0, 200));
    throw new Error(
      `Failed to parse Claude response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Estimate token count (rough approximation)
 * Rule of thumb: ~4 characters per token
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Check if Anthropic API key is configured
 */
export function isConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

// ============================================================================
// LEGACY EXPORTS (for backwards compatibility)
// ============================================================================

export default anthropic;
