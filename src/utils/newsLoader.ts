import type { NewsAnnouncementMeta, NewsArticle, NewsIndexData, NewsTitleMap, NewsTranslation } from '../types';

/**
 * 官方公告数据按需加载：
 * - 索引（index.json）在首次打开公告抽屉时才请求
 * - 正文按 id 拆成独立 JSON，每篇一个 chunk，点开哪篇才加载哪篇
 * - 译文同理（zh-CN/<id>.json），只有原文/译文切换后才加载
 */
const ARTICLE_LOADERS = import.meta.glob<NewsArticle>('../data/news/*.json', {
  import: 'default',
});

// 译文目录单独一个 glob：构建时就能知道哪些公告有译文（hasNewsTranslation 是同步的）
const ZH_LOADERS = import.meta.glob<NewsTranslation>('../data/news/zh-CN/*.json', {
  import: 'default',
});

const ZH_INDEX_KEY = '../data/news/zh-CN/index.json';
const zhKey = (id: string) => `../data/news/zh-CN/${id}.json`;

const articleCache = new Map<string, Promise<NewsArticle>>();
const translationCache = new Map<string, Promise<NewsTranslation>>();
let indexPromise: Promise<NewsAnnouncementMeta[]> | null = null;
let titleMapPromise: Promise<Record<string, string>> | null = null;

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

// ===== 译文 =====

/** 该公告是否已有译文文件（构建期即可判定，用于决定要不要显示「中文/原文」切换） */
export const hasNewsTranslation = (id: string): boolean => Boolean(ZH_LOADERS[zhKey(id)]);

/** 按 id 加载单篇译文正文；没有译文时返回 null */
export const loadNewsTranslation = (id: string): Promise<NewsTranslation | null> => {
  const cached = translationCache.get(id);
  if (cached) return cached;

  const loader = ZH_LOADERS[zhKey(id)];
  if (!loader) return Promise.resolve(null);

  const task = loader();
  translationCache.set(id, task);
  task.catch(() => {
    translationCache.delete(id);
  });
  return task;
};

/**
 * 加载公告中文标题表（zh-CN/index.json）。
 * 只在一处维护标题，列表页不必加载整篇译文；文件不存在时返回空表。
 */
export const loadNewsTitleMap = (): Promise<Record<string, string>> => {
  if (titleMapPromise) return titleMapPromise;

  const loader = ZH_LOADERS[ZH_INDEX_KEY];
  if (!loader) return Promise.resolve({});

  const task = loader().then((data) => (data as unknown as NewsTitleMap).titles ?? {});
  titleMapPromise = task;
  task.catch(() => {
    titleMapPromise = null;
  });
  return task;
};
