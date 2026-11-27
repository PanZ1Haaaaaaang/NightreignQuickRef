import potentialEntriesUrl from '@/data/zh-CN/in-game-potential-entries.json?url&no-inline';
import type { EntryData } from '@/types';

export class PotentialEntriesMissingError extends Error {}

let entriesPromise: Promise<EntryData[]> | null = null;

export const loadPotentialEntries = (): Promise<EntryData[]> => {
  // 使用 fetch 请求带哈希的资源，避免动态 import 在当前文档中缓存失败。
  entriesPromise ??= fetch(potentialEntriesUrl, { cache: 'no-cache' })
    .then(async (response) => {
      const isHtmlFallback = response.ok && response.headers.get('content-type')?.includes('text/html');
      if (response.status === 404 || response.status === 410 || isHtmlFallback) {
        throw new PotentialEntriesMissingError('找不到潜在能力词条资源');
      }
      if (!response.ok) throw new Error('潜在能力词条请求失败');

      const entries = (await response.json()) as EntryData[];
      if (!Array.isArray(entries)) throw new Error('潜在能力词条格式错误');
      return entries;
    })
    .catch((error: unknown) => {
      entriesPromise = null;
      throw error;
    });
  return entriesPromise;
};
