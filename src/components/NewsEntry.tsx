import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Drawer, Empty, Segmented, Space, Spin, Tag, Typography } from 'antd';
import { ArrowLeftOutlined, LinkOutlined, NotificationOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { NIGHTREIGN_VERSION } from '../config/versionConfig';
import {
  hasNewsTranslation,
  loadNewsArticle,
  loadNewsIndex,
  loadNewsTitleMap,
  loadNewsTranslation,
} from '../utils/newsLoader';
import type { NewsAnnouncementMeta, NewsArticle, NewsBlock, NewsCategory, NewsTranslation } from '../types';

const { Paragraph, Text, Title } = Typography;

/** 已读记录：存最后一次查看时对应的版本发布日期（版本配置更新后红点会重新出现） */
const NEWS_SEEN_KEY = 'nq_news_seen_date';

const CATEGORY_META: Record<NewsCategory, { label: string; color: string }> = {
  update: { label: '更新文件', color: 'geekblue' },
  regulation: { label: '规则调整', color: 'purple' },
  dlc: { label: 'DLC', color: 'gold' },
  notice: { label: '通知', color: 'default' },
};

const hasUnreadNews = (): boolean => {
  try {
    return localStorage.getItem(NEWS_SEEN_KEY) !== NIGHTREIGN_VERSION.releaseDate;
  } catch {
    // 隐私模式等场景 localStorage 不可用时不显示红点
    return false;
  }
};

// 正文块渲染：类型见 NewsBlock，与官网原文的段落结构一一对应
const renderBlock = (block: NewsBlock, index: number) => {
  switch (block.type) {
    case 'section':
      return (
        <Title key={index} level={4} className="news-block-section">
          {block.text}
        </Title>
      );
    case 'subsection':
      return (
        <Title key={index} level={5} className="news-block-subsection">
          {block.text}
        </Title>
      );
    case 'label':
      return (
        <p key={index} className="news-block-label">
          {block.text}
        </p>
      );
    case 'p':
      return (
        <Paragraph key={index} className="news-block-paragraph">
          {block.text}
        </Paragraph>
      );
    case 'ul':
      return (
        <ul key={index} className="news-block-list">
          {block.items.map((item, itemIndex) =>
            typeof item === 'string' ? (
              <li key={itemIndex}>{item}</li>
            ) : (
              <li key={itemIndex}>
                {item.text}
                <ul className="news-block-sublist">
                  {item.sub.map((sub, subIndex) => (
                    <li key={subIndex}>{sub}</li>
                  ))}
                </ul>
                {item.tail && <div className="news-block-list-tail">{item.tail}</div>}
              </li>
            ),
          )}
        </ul>
      );
    case 'image':
      return <img key={index} className="news-block-image" src={block.src} alt={block.alt ?? ''} loading="lazy" />;
    default:
      return (
        <div key={index} className="news-block-kv">
          {block.items.map((item) => (
            <div key={item.label}>
              <span className="news-kv-label">{item.label}</span>
              <span className="news-kv-value">{item.value}</span>
            </div>
          ))}
        </div>
      );
  }
};

/** 正文渲染所需的展示数据：原文/译文共用同一套渲染，只换 title + blocks */
interface NewsDisplay {
  title: string;
  blocks: NewsBlock[];
  /** 当前展示的语言 */
  lang: 'ja' | 'zh-CN';
  /** 译文署名（可选） */
  translator?: string;
}

/**
 * 首页「更新公告」入口：版本号旁的小链接 + 抽屉。
 * 索引、正文、译文都按需加载（见 utils/newsLoader.ts），首屏不请求公告数据。
 * 译文规则：有中文标题就默认显示译文，可切换回原文；没译文时显示原文。
 */
const NewsEntry: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'article' | 'list'>('article');
  const [unread, setUnread] = useState(false);
  // null 表示索引还没加载完成
  const [announcements, setAnnouncements] = useState<NewsAnnouncementMeta[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [indexError, setIndexError] = useState<string | null>(null);
  // 错误带上 id：只有当前选中的那篇出错才显示错误，切走后不再挡住已缓存的正文
  const [articleError, setArticleError] = useState<{ id: string; message: string } | null>(null);
  // 请求令牌：切走后返回的过期请求直接丢弃，避免把旧正文写回来
  const articleRequestRef = useRef(0);
  // 正文容器：切换公告/视图时把抽屉内容滚回顶部，否则会停在上一页的滚动位置
  const contentRef = useRef<HTMLDivElement>(null);

  // 中文标题表（zh-CN/index.json）：列表页只加载这一份，不拉整篇译文
  const [titleMap, setTitleMap] = useState<Record<string, string>>({});
  const [titleMapLoaded, setTitleMapLoaded] = useState(false);
  // 译文正文：null 表示还没加载
  const [translation, setTranslation] = useState<(NewsTranslation & { id: string }) | null>(null);
  // 标题有、正文文件缺失时回退原文，并隐藏切换
  const [translationMissingId, setTranslationMissingId] = useState<string | null>(null);
  // 默认显示译文（有译文时），用户可切回原文
  const [showOriginal, setShowOriginal] = useState(false);
  const translationRequestRef = useRef(0);

  useEffect(() => {
    contentRef.current?.closest('.ant-drawer-body')?.scrollTo({ top: 0 });
  }, [open, view, activeId]);

  useEffect(() => {
    setUnread(hasUnreadNews());
  }, []);

  // 打开抽屉后才加载公告索引
  useEffect(() => {
    if (!open || announcements !== null) return;

    setIndexError(null);
    loadNewsIndex()
      .then((list) => setAnnouncements(list))
      .catch(() => setIndexError('公告索引加载失败，请稍后重试'));
  }, [open, announcements]);

  // 中文标题表同样按需加载（文件很小，和索引一起拿）
  useEffect(() => {
    if (!open || titleMapLoaded) return;

    let alive = true;
    loadNewsTitleMap()
      .then((map) => {
        if (alive) setTitleMap(map);
      })
      .catch(() => {
        // 标题表读不到就回退原文标题，不影响正文
      })
      .finally(() => {
        if (alive) setTitleMapLoaded(true);
      });

    return () => {
      alive = false;
    };
  }, [open, titleMapLoaded]);

  // 默认定位到当前版本对应的公告（无匹配则取最新一篇）
  useEffect(() => {
    if (activeId || !announcements || announcements.length === 0) return;
    const preferred = announcements.find((item) => item.id === NIGHTREIGN_VERSION.newsId);
    setActiveId(preferred ? preferred.id : announcements[0].id);
  }, [announcements, activeId]);

  // 原文正文按需加载。
  // 注意：令牌每次渲染前都要 +1（包括已经命中缓存、直接 return 的分支），
  // 否则「加载 A → 切回已缓存的 B」时，A 的迟到结果会把正文写成 A，导致一直转圈。
  useEffect(() => {
    const token = ++articleRequestRef.current;
    if (!activeId || article?.id === activeId) return;

    loadNewsArticle(activeId)
      .then((data) => {
        if (token !== articleRequestRef.current) return;
        setArticle(data);
        setArticleError(null);
      })
      .catch(() => {
        if (token !== articleRequestRef.current) return;
        setArticleError({ id: activeId, message: '公告正文加载失败，请稍后重试' });
      });
  }, [activeId, article?.id]);

  // 是否算“有译文”：标题表里有这条（标题是唯一入口），且正文文件没缺失
  // 是否算“有译文”：中文标题和译文正文文件都在才启用（缺任一都显示原文，避免标题和正文对不上）
  const translationAvailable =
    activeId !== null &&
    Boolean(titleMap[activeId]) &&
    hasNewsTranslation(activeId) &&
    translationMissingId !== activeId;

  // 译文正文按需加载（开关默认就看译文，所以一进来就会加载）
  useEffect(() => {
    const token = ++translationRequestRef.current;
    if (!activeId || !translationAvailable || translation?.id === activeId) return;

    loadNewsTranslation(activeId)
      .then((data) => {
        if (token !== translationRequestRef.current) return;
        if (!data) {
          // 只填了中文标题、还没写正文：回退原文
          setTranslationMissingId(activeId);
          return;
        }
        setTranslation({ ...data, id: activeId });
      })
      .catch(() => {
        if (token === translationRequestRef.current) setTranslationMissingId(activeId);
      });
  }, [activeId, translationAvailable, translation?.id]);

  const handleOpen = () => {
    setOpen(true);
    setUnread(false);
    // 每次从入口进来都先看正文，列表是次级入口
    setView('article');
    // 每次进来都按“默认看译文”处理
    setShowOriginal(false);
    try {
      localStorage.setItem(NEWS_SEEN_KEY, NIGHTREIGN_VERSION.releaseDate);
    } catch {
      // 忽略存储失败
    }
  };

  const selectArticle = (id: string) => {
    setActiveId(id);
    setView('article');
    // 换一篇就回到默认（有译文看译文）
    setShowOriginal(false);
  };

  const renderList = () => (
    <div className="news-list">
      {(announcements ?? []).map((item) => (
        <div
          key={item.id}
          role="button"
          tabIndex={0}
          className={`news-list-item${item.id === activeId ? ' is-active' : ''}`}
          onClick={() => selectArticle(item.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              selectArticle(item.id);
            }
          }}
        >
          <span className="news-list-date">{item.date}</span>
          <span className="news-list-title">{(hasNewsTranslation(item.id) && titleMap[item.id]) || item.title}</span>
          <Tag color={CATEGORY_META[item.category].color} className="news-list-tag">
            {CATEGORY_META[item.category].label}
          </Tag>
        </div>
      ))}
    </div>
  );

  const renderArticle = (meta: NewsArticle, display: NewsDisplay) => (
    <article className="news-article">
      <div className="news-article-head">
        <div className="news-article-meta">
          <Space size={8} wrap>
            <Text className="news-article-date">{meta.date}</Text>
            <Tag color={CATEGORY_META[meta.category].color}>{CATEGORY_META[meta.category].label}</Tag>
            {display.lang === 'ja' ? (
              <Tag variant="outlined">原文・日本語</Tag>
            ) : (
              <Tag variant="outlined" color="blue">
                中文译文{display.translator ? ` · ${display.translator}` : ''}
              </Tag>
            )}
          </Space>
          {translationAvailable && (
            <Segmented
              size="small"
              value={display.lang === 'zh-CN' ? 'zh' : 'ja'}
              options={[
                { label: '中文', value: 'zh' },
                { label: '原文', value: 'ja' },
              ]}
              onChange={(value) => setShowOriginal(value === 'ja')}
            />
          )}
        </div>
        <Title level={3} className="news-article-title">
          {display.title}
        </Title>
      </div>
      <div className="news-article-body">{display.blocks.map(renderBlock)}</div>
      <div className="news-article-footer">
        <a href={meta.sourceUrl} target="_blank" rel="noopener noreferrer">
          <LinkOutlined /> 前往官网查看原文
        </a>
      </div>
    </article>
  );

  const renderSpinner = () => (
    <div className="news-loading">
      <Spin />
    </div>
  );

  // 「加载中」由数据是否就绪推导，不用独立的 loading 状态：
  // 否则来回切换公告时，被作废的请求不会清掉 loading，就会一直转圈。
  const renderBody = () => {
    if (view === 'list') {
      if (announcements === null) return indexError ? <Empty description={indexError} /> : renderSpinner();
      return announcements.length > 0 ? renderList() : <Empty description="暂无公告" />;
    }

    if (activeId === null) {
      if (announcements && announcements.length === 0) return <Empty description="暂无公告" />;
      return indexError ? <Empty description={indexError} /> : renderSpinner();
    }

    if (articleError?.id === activeId) return <Empty description={articleError.message} />;
    if (!article || article.id !== activeId) return renderSpinner();

    // 有译文且没手动切回原文：先确保译文已就绪，未就绪时转圈（加载失败会回退原文）
    const useTranslation = translationAvailable && !showOriginal;
    const translationReady = translation !== null && translation.id === activeId;
    if (useTranslation && !translationReady) return renderSpinner();

    if (useTranslation && translationReady) {
      return renderArticle(article, {
        title: titleMap[activeId],
        blocks: translation.blocks,
        lang: 'zh-CN',
        translator: translation.translator,
      });
    }

    return renderArticle(article, { title: article.title, blocks: article.blocks, lang: 'ja' });
  };

  return (
    <>
      <Badge dot={unread} size="small" offset={[-2, 6]}>
        <Button
          type="text"
          size="small"
          className="news-entry-btn"
          icon={<NotificationOutlined />}
          onClick={handleOpen}
        >
          更新公告
        </Button>
      </Badge>

      <Drawer
        className="news-drawer"
        title="官方更新公告"
        open={open}
        size="min(720px, 100vw)"
        styles={{ body: { padding: '16px 20px 24px' } }}
        extra={
          (announcements?.length ?? 0) > 1 ? (
            <Button
              type="text"
              size="small"
              icon={view === 'list' ? <ArrowLeftOutlined /> : <UnorderedListOutlined />}
              onClick={() => setView(view === 'list' ? 'article' : 'list')}
            >
              {view === 'list' ? '返回正文' : '全部公告'}
            </Button>
          ) : null
        }
        onClose={() => setOpen(false)}
      >
        <div ref={contentRef}>{renderBody()}</div>
      </Drawer>
    </>
  );
};

export default NewsEntry;
