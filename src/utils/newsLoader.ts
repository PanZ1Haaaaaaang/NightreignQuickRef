import type { NewsAnnouncementMeta, NewsArticle, NewsIndexData } from '../types';

/**
 * 官方公告数据按需加载：
 * - 索引（index.json）在首次打开公告抽屉时才请求
 * - 正文按 id 拆成独立 JSON，每篇一个 chunk，点开哪篇才加载哪篇
 */
const ARTICLE_LOADERS = import.meta.glob<NewsArticle>('../data/news/*.json', {
  import: 'default',
});

const articleCache = new Map<string, Promise<NewsArticle>>();
let indexPromise: Promise<NewsAnnouncementMeta[]> | null = null;

/** 加载公告索引（按日期倒序） */
export const loadNewsIndex = (): Promise<NewsAnnouncementMeta[]> => {
  if (indexPromise) return indexPromise;

  const task = import('../data/news/index.json').then((mod) => {
    const data = mod.default as NewsIndexData;
    return [...data.announcements].sort((a, b) => b.date.localeCompare(a.date));
  });

  indexPromise = task;
  task.catch(() => {
    indexPromise = null; // 失败后允许重试
  });
  return task;
};

/** 按 id 加载单篇公告正文，重复调用复用同一个 Promise */
export const loadNewsArticle = (id: string): Promise<NewsArticle> => {
  const cached = articleCache.get(id);
  if (cached) return cached;

  const loader = ARTICLE_LOADERS[`../data/news/${id}.json`];
  if (!loader) return Promise.reject(new Error(`未找到公告正文：${id}`));

  const task = loader();
  articleCache.set(id, task);
  task.catch(() => {
    articleCache.delete(id);
  });
  return task;
};
