import { api } from './client';
import { AppConfig } from '@/src/types';

let cached: Promise<AppConfig> | null = null;

/**
 * Optional features the server has turned on (for example AI summaries need an API key there).
 * Fetched once per app session; a failed request is retried next time.
 */
export function getAppConfig(): Promise<AppConfig> {
  cached ??= api.get<AppConfig>('/config').catch(() => {
    cached = null;
    return { aiSummary: false };
  });
  return cached;
}
