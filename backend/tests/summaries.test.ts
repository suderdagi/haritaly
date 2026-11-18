import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildPrompt, hashInput, namesMatch, normalizeName } from '@/src/lib/summaries';
import { completeJson, LLMResponseError, LLMUnavailableError } from '@/src/lib/llm';

describe('place name matching', () => {
  it('ignores case, Turkish characters and punctuation', () => {
    expect(normalizeName('Kahve Dünyası!')).toBe('kahve dunyası');
    expect(namesMatch('KAHVE DÜNYASI', 'kahve dünyası')).toBe(true);
  });

  it('matches a branch name that contains the short name', () => {
    expect(namesMatch('Kronotrop', 'Kronotrop Cihangir')).toBe(true);
  });

  it('does not match different places or very short names', () => {
    expect(namesMatch('Kronotrop', 'Petra Roasting')).toBe(false);
    expect(namesMatch('Ev', 'Evim Kafe')).toBe(false);
  });
});

describe('prompt', () => {
  const mentions = [
    { id: 1, rating: 5, notes: 'Harika', description: null, favoriteFood: 'Cheesecake', favoriteDrink: null },
    { id: 2, rating: 3, notes: null, description: null, favoriteFood: null, favoriteDrink: 'Filtre kahve' },
  ];

  it('labels friends anonymously and includes their entries', () => {
    const prompt = buildPrompt('Kronotrop', mentions);
    expect(prompt).toContain('Friend 1: rating 5/5; favorite food: Cheesecake; notes: Harika');
    expect(prompt).toContain('Friend 2: rating 3/5; favorite drink: Filtre kahve');
  });

  it('produces a new cache key when the input or model changes', () => {
    const prompt = buildPrompt('Kronotrop', mentions);
    expect(hashInput(prompt, 'gpt-4o-mini')).toBe(hashInput(prompt, 'gpt-4o-mini'));
    expect(hashInput(prompt, 'gpt-4o-mini')).not.toBe(hashInput(prompt + '!', 'gpt-4o-mini'));
    expect(hashInput(prompt, 'gpt-4o-mini')).not.toBe(hashInput(prompt, 'gpt-4o'));
  });
});

describe('LLM client', () => {
  const request = { system: 's', user: 'u', schemaName: 'x', schema: {} };

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('returns 503 when no API key is configured', async () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    await expect(completeJson(request)).rejects.toBeInstanceOf(LLMUnavailableError);
  });

  it('sends the key and parses the JSON answer', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [{ message: { content: '{"ok":true}' } }] }))
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(completeJson(request)).resolves.toEqual({ ok: true });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.authorization).toBe('Bearer sk-test');
    expect(JSON.parse(init.body).response_format.type).toBe('json_schema');
  });

  it('turns provider errors and broken JSON into a 502', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-test');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('rate limited', { status: 429 })));
    await expect(completeJson(request)).rejects.toBeInstanceOf(LLMResponseError);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: 'not json' } }] })))
    );
    await expect(completeJson(request)).rejects.toBeInstanceOf(LLMResponseError);
  });
});
