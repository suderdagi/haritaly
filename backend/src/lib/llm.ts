import { AppError } from './errors';

/**
 * Minimal OpenAI client built on fetch, so there is no SDK dependency.
 *
 * It asks for Structured Outputs: the model must answer with JSON that matches `schema`.
 * The caller still validates the result with Zod, because the API response is external input.
 */

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 15_000;

export const DEFAULT_MODEL = 'gpt-4o-mini';

export function llmModel(): string {
  return process.env.OPENAI_MODEL || DEFAULT_MODEL;
}

export class LLMUnavailableError extends AppError {
  constructor(message = 'AI features are not configured on this server') {
    super(503, message);
    this.name = 'LLMUnavailableError';
  }
}

export class LLMResponseError extends AppError {
  constructor(message = 'Could not generate an AI response right now, please try again') {
    super(502, message);
    this.name = 'LLMResponseError';
  }
}

export interface JsonCompletionRequest {
  system: string;
  user: string;
  /** Name and JSON Schema of the expected answer */
  schemaName: string;
  schema: Record<string, unknown>;
}

export async function completeJson(req: JsonCompletionRequest): Promise<unknown> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new LLMUnavailableError();
  }

  let response: Response;
  try {
    response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: llmModel(),
        temperature: 0.3,
        messages: [
          { role: 'system', content: req.system },
          { role: 'user', content: req.user },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: req.schemaName, strict: true, schema: req.schema },
        },
      }),
      // A slow model must not keep the request (and the user) waiting forever
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    console.error('LLM request failed', error);
    throw new LLMResponseError();
  }

  if (!response.ok) {
    // Log the status for debugging, but never forward the provider's error body to the client
    console.error(`LLM request returned HTTP ${response.status}`);
    throw new LLMResponseError();
  }

  const body = (await response.json()) as {
    choices?: { message?: { content?: string | null; refusal?: string | null } }[];
  };
  const content = body.choices?.[0]?.message?.content;

  if (!content) {
    throw new LLMResponseError();
  }

  try {
    return JSON.parse(content);
  } catch {
    throw new LLMResponseError();
  }
}
