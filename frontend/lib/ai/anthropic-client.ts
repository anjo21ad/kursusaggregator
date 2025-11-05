import Anthropic from '@anthropic-ai/sdk';

/**
 * Anthropic Claude API Client
 *
 * Configured for course generation with Claude Sonnet 4.5
 * Phase 1: Text-only content generation
 *
 * Environment variable required:
 * - ANTHROPIC_API_KEY
 */

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Model configuration
export const CLAUDE_MODEL = 'claude-sonnet-4-20250514'; // Claude Sonnet 4.5

// Pricing (as of Nov 2025)
const PRICING = {
  input: 3.0 / 1_000_000,  // $3 per million input tokens
  output: 15.0 / 1_000_000, // $15 per million output tokens
};

/**
 * Generate content using Claude API
 *
 * @param systemPrompt - System instructions for Claude
 * @param userPrompt - User message/task
 * @param maxTokens - Maximum output tokens (default: 4000)
 * @returns Generated content and metadata
 */
export async function generateContent(
  systemPrompt: string,
  userPrompt: string,
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
    console.log('[anthropic] Generating content with Claude Sonnet 4.5...');
    console.log('[anthropic] Max tokens:', maxTokens);

    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
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
    const totalCost =
      inputTokens * PRICING.input + outputTokens * PRICING.output;

    console.log('[anthropic] ✅ Generation complete');
    console.log(`[anthropic] Tokens: ${inputTokens} in + ${outputTokens} out`);
    console.log(`[anthropic] Cost: $${totalCost.toFixed(4)}`);

    return {
      content: textContent,
      usage: {
        inputTokens,
        outputTokens,
        totalCost,
      },
    };
  } catch (error) {
    console.error('[anthropic] Error generating content:', error);
    throw new Error(
      `Claude API error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generate JSON-structured content using Claude API
 *
 * Ensures output is valid JSON by instructing Claude to return JSON only
 *
 * @param systemPrompt - System instructions
 * @param userPrompt - User message
 * @param maxTokens - Maximum output tokens
 * @returns Parsed JSON object and usage metadata
 */
export async function generateJSON<T = any>(
  systemPrompt: string,
  userPrompt: string,
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
    console.error('[anthropic] Failed to parse JSON response:', response.content);
    throw new Error(
      `Failed to parse Claude response as JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

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

export default anthropic;
