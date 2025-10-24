// Claude AI client configuration
import Anthropic from '@anthropic-ai/sdk';

// Get API key from environment variable
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

// Initialize Anthropic client with API key from environment
export const anthropic = new Anthropic({
  apiKey: apiKey,
});

// Model configuration
// Valid models: claude-3-5-sonnet-20241022, claude-3-opus-20240229, claude-3-sonnet-20240229
// Note: claude-sonnet-4-20250514 may not be a valid model name
export const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022' as const; // Updated to valid model
export const DEFAULT_MAX_TOKENS = 4096;

// Streaming configuration
export const STREAM_CONFIG = {
  model: CLAUDE_MODEL,
  max_tokens: DEFAULT_MAX_TOKENS,
  temperature: 0.7, // Balanced between creativity and consistency
} as const;
