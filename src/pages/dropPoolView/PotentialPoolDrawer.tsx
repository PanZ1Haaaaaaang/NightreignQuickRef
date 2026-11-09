import { useEffect, useMemo, useState } from 'react';
import { Drawer, Empty, Spin, Tag } from 'antd';
import type { EntryData } from '../../types';
import { POTENTIAL_POOL_TAGS } from '../../config/potentialPoolConfig';
import styles from '../../styles/dropPoolView.module.css';

/** 43 条「局内-潜在能力」词条（约 13KB）：只在第一次点开 buff 槽位时才拉这份 chunk */
let cache: EntryData[] | null = null;
let pending: Promise<EntryData[]> | null = null;

const loadPotentialEntries = (): Promise<EntryData[]> => {
  if (cache) return Promise.resolve(cache);
  if (!pending) {
    pending = import('../../data/zh-CN/in-game_potential_entries_zh-CN.json').then((mod) => {
      const data = ((mod as { default?: EntryData[] }).default ?? mod) as EntryData[];
      cache = data;
      return data;
    });
  }
  return pending;
};

interface PotentialPoolDrawerProps {
  open: boolean;
  onClose: () => void;
  /** normal / purple / night1 / night1b / night2 */
  poolKey: string | null;
}

/** 深夜三档（初夜 / 初夜·监牢 / 次夜），其余按普通档处理 */
const NIGHT_POOLS = new Set(['night1', 'night1b', 'night2']);

const isNightPool = (key: string) => NIGHT_POOLS.has(key);

/**
 * 「生命值上限+10% / +15%」这种写法：普通档取前一个、深夜档取后一个。
 * 只有当这条词条同时挂在普通档和深夜档、且文案正好是两段时才判断，其余情况原样展示。
 * 返回要高亮的下标，判断不出时返回 null。
 */
const activeValueIndex = (entry: EntryData, poolKey: string): number | null => {
  const parts = (entry.explanation ?? '').split(' / ');
  if (parts.length !== 2) return null;
  const tiers = new Set((entry.pools ?? []).map((key) => (isNightPool(key) ? 'night' : 'normal')));
  if (tiers.size !== 2) return null;
  return isNightPool(poolKey) ? 1 : 0;
};

/**
 * 潜在能力池明细：点掉球卡片上的 buff 槽位打开，列出这个池可能出现的词条。
 * 词条数据按需动态 import，加载期间在抽屉里转圈。
 */
const PotentialPoolDrawer: React.FC<PotentialPoolDrawerProps> = ({ open, onClose, poolKey }) => {
  const [entries, setEntries] = useState<EntryData[] | null>(cache);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open || entries || !poolKey) return;
    let alive = true;
    loadPotentialEntries()
      .then((all) => {
        if (alive) setEntries(all);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [open, entries, poolKey]);

  const meta = poolKey ? POTENTIAL_POOL_TAGS[poolKey] : undefined;
  const list = useMemo(
    () => (entries && poolKey ? entries.filter((entry) => entry.pools?.includes(poolKey)) : []),
    [entries, poolKey],
  );

  /** 「普通 +10% / 深夜 +15%」：高亮当前池对应的那个数值，另一个淡显 */
  const renderExplanation = (entry: EntryData) => {
    const activeIndex = poolKey ? activeValueIndex(entry, poolKey) : null;
    if (activeIndex === null || !entry.explanation) return entry.explanation;
    const parts = entry.explanation.split(' / ');
    return parts.map((part, index) => (
      <span key={index} className={index === activeIndex ? styles.buffValue : styles.buffValueMuted}>
        {index > 0 ? ' / ' : ''}
        {part}
      </span>
    ));
  };

  const renderBody = () => {
    if (failed) return <Empty description="加载失败，关闭后重试" />;
    if (!entries) {
      return (
        <div className={styles.buffLoading}>
          <Spin />
          <span>正在加载词条…</span>
        </div>
      );
    }
    if (list.length === 0) return <Empty description="这个池没有对应词条" />;
    return (
      <>
        <div className={styles.buffList}>
          {list.map((entry) => (
            <div key={entry.entry_id} className={styles.buffItem}>
              <div className={styles.buffHead}>
                <span className={styles.buffName}>{entry.entry_name}</span>
                {entry.entry_type && <Tag className={styles.buffTag}>{entry.entry_type}</Tag>}
                {entry.superposability && (
                  <Tag className={styles.buffTag} color={entry.superposability === '可叠加' ? 'green' : 'default'}>
                    {entry.superposability}
                  </Tag>
                )}
              </div>
              {entry.explanation && <div className={styles.buffEffect}>{renderExplanation(entry)}</div>}
            </div>
          ))}
        </div>
        <div className={styles.buffFootnote}>
          同一词条在不同池数值不同时（如「+10% / +15%」），会高亮当前池的数值，另一个淡显。
        </div>
      </>
    );
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="min(560px, 100vw)"
      // 与「基池对照表」同因：避开左上角 fixed-logo（z-index 1050）
      zIndex={1100}
      title={
        <div className={styles.basePoolTitle}>
          <span className={styles.basePoolTitleMain}>潜在能力池 · {meta?.label ?? '词条'}</span>
          <span className={styles.basePoolTitleSub}>
            {meta?.tip ?? ''}
            {entries ? ` · 共 ${list.length} 条` : ''}
          </span>
        </div>
      }
      styles={{ body: { padding: '8px 16px 16px' } }}
    >
      {renderBody()}
    </Drawer>
  );
};

export default PotentialPoolDrawer;
