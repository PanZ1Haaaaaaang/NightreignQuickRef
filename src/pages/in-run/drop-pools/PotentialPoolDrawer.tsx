import { useEffect, useMemo, useState } from 'react';
import { Button, Drawer, Empty, Space, Spin, Tag } from 'antd';
import { renderImpulseText } from '../../../components/common/renderImpulseText';
import type { EntryData } from '../../../types';
import { POTENTIAL_POOL_TAGS } from '../../../config/potentialPoolConfig';
import { loadPotentialEntries, PotentialEntriesMissingError } from '../../../features/entries/potentialEntries';
import styles from './dropPoolView.module.css';

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
 * 打开抽屉后按需请求词条。
 */
const PotentialPoolDrawer: React.FC<PotentialPoolDrawerProps> = ({ open, onClose, poolKey }) => {
  const [entries, setEntries] = useState<EntryData[] | null>(null);
  const [failure, setFailure] = useState<'retry' | 'reload' | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!open || entries || !poolKey) return;
    let alive = true;
    loadPotentialEntries()
      .then((all) => {
        if (alive) setEntries(all);
      })
      .catch((error: unknown) => {
        if (alive) setFailure(error instanceof PotentialEntriesMissingError ? 'reload' : 'retry');
      });
    return () => {
      alive = false;
    };
  }, [open, entries, poolKey, attempt]);

  const retry = () => {
    setFailure(null);
    setAttempt((previous) => previous + 1);
  };

  const close = () => {
    setFailure(null);
    onClose();
  };

  const meta = poolKey ? POTENTIAL_POOL_TAGS[poolKey] : undefined;
  const list = useMemo(
    () => (entries && poolKey ? entries.filter((entry) => entry.pools?.includes(poolKey)) : []),
    [entries, poolKey],
  );

  /** 「普通 +10% / 深夜 +15%」：高亮当前池对应的那个数值，另一个淡显 */
  const renderExplanation = (entry: EntryData) => {
    const explanation = entry.explanation;
    if (!explanation) return null;
    const activeIndex = poolKey ? activeValueIndex(entry, poolKey) : null;
    if (activeIndex === null) return renderImpulseText(explanation);
    const parts = explanation.split(' / ');
    return parts.map((part, index) => (
      <span key={index} className={index === activeIndex ? styles.buffValue : styles.buffValueMuted}>
        {index > 0 ? ' / ' : ''}
        {renderImpulseText(part)}
      </span>
    ));
  };

  const renderBody = () => {
    if (failure) {
      const resourceMissing = failure === 'reload';
      return (
        <Empty
          description={
            <span role="alert">
              {resourceMissing ? '词条资源无法找到，页面可能已更新。' : '潜在能力词条加载失败。'}
            </span>
          }
        >
          <Space wrap>
            <Button type={resourceMissing ? 'default' : 'primary'} onClick={retry}>
              重试
            </Button>
            {resourceMissing && (
              <Button type="primary" onClick={() => window.location.reload()}>
                刷新页面
              </Button>
            )}
          </Space>
        </Empty>
      );
    }
    if (!entries) {
      return (
        <div className={styles.buffLoading} role="status">
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
      onClose={close}
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
