import { useMemo, useState } from 'react';
import { Alert, Empty, Input, Pagination, Segmented, Space, Tag, Tooltip, Typography } from 'antd';
import dropPoolsJson from '../data/zh-CN/drop_pools.json';
import type { DropGroup, DropPoolsData, DropSegment } from '../types';
import { POTENTIAL_POOL_LABEL } from '../config/potentialPoolConfig';
import styles from '../styles/dropPoolView.module.css';

const { Title, Text } = Typography;

const DATA = dropPoolsJson as unknown as DropPoolsData;
const PAGE_SIZE = 12;

/** 深夜模式下据点的三种状态（变异 / 入侵可分别对应 +10 / +50 两套掉落） */
type NightState = 'normal' | 'mutation' | 'invasion';

const KIND_CLASS: Record<string, string> = {
  weapon: styles.kindWeapon,
  cursed: styles.kindCursed,
  buff: styles.kindBuff,
  antique: styles.kindAntique,
  accessory: styles.kindAccessory,
  goods: styles.kindGoods,
  other: styles.kindOther,
};

const kindLabel = (kind: string) => DATA.meta.kinds[kind as keyof typeof DATA.meta.kinds] ?? kind;

/**
 * 当前状态下这颗球实际展示的选项：
 * - 普通模式：普通掉落
 * - 深夜 · 普通据点：沿用普通掉落
 * - 深夜 · 变异据点：+10 那套（选项数不变，池子升级）
 * - 深夜 · 入侵据点：+50 那套（要塞 / 教堂变成 3 个选项，boss 只用这套池）
 */
const optionsOf = (group: DropGroup, nightMode: boolean, nightState: NightState) => {
  if (nightMode) {
    if (nightState === 'mutation' && group.mutationOptions?.length) return group.mutationOptions;
    if (nightState === 'invasion' && group.invasionOptions?.length) return group.invasionOptions;
  }
  return group.options;
};

const hasState = (group: DropGroup, nightState: NightState) => {
  if (nightState === 'mutation') return Boolean(group.mutationOptions?.length);
  if (nightState === 'invasion') return Boolean(group.invasionOptions?.length);
  return true;
};

/**
 * 单个槽位：百分比 + 掉落类型
 * buff 段使用「局内-潜在能力」的词条池标签（buff / 紫buff / 特殊buff池…），
 * 普通池蓝色、其余紫色；徘徊赐福金色；锻造石【2】紫色。这里不做悬停。
 */
const SegmentChip: React.FC<{ segment: DropSegment }> = ({ segment }) => {
  const [percent, kind, pool] = segment;
  let label = kindLabel(kind);
  let className = KIND_CLASS[kind] ?? '';

  if (kind === 'buff') {
    if (pool) {
      label = POTENTIAL_POOL_LABEL[pool] ?? label;
      className = pool === 'normal' ? styles.kindBuff : styles.kindBuffPurple;
    }
  } else if (kind === 'wending') {
    label = DATA.meta.kinds.wending ?? '徘徊赐福';
    className = styles.kindWending;
  } else if (kind === '锻造石【2】') {
    className = styles.kindBuffPurple;
  }

  return (
    <span className={`${styles.segment} ${className}`}>
      <b className={styles.percent}>{percent}%</b>
      <span>{label}</span>
    </span>
  );
};

const DropCard: React.FC<{ group: DropGroup; nightMode: boolean; nightState: NightState }> = ({
  group,
  nightMode,
  nightState,
}) => {
  const options = optionsOf(group, nightMode, nightState);
  const titleName = group.names[0] ?? '未命名';
  const otherNames = group.names.slice(1);
  const showMutation = nightMode && nightState === 'mutation';
  const showInvasion = nightMode && nightState === 'invasion';

  return (
    <div
      className={styles.card}
      data-drop-id={group.id}
      data-night={nightMode ? '1' : '0'}
      data-state={nightMode ? nightState : 'normal'}
    >
      <div className={styles.cardHead}>
        <span className={styles.primary}>{titleName}</span>
        <span className={styles.tags}>
          {showMutation && <Tag color="volcano">变异</Tag>}
          {showInvasion && <Tag color="red">入侵</Tag>}
        </span>
      </div>

      {otherNames.length > 0 && (
        <div className={styles.names}>
          {otherNames.map((name) => (
            <Tag key={name} className={styles.nameTag}>
              {name}
            </Tag>
          ))}
        </div>
      )}

      <div className={styles.options}>
        {options.map((option, index) => (
          <Tooltip key={option.id} title={String(option.id)} placement="top" mouseEnterDelay={0.2}>
            <div className={styles.option} data-option-id={option.id}>
              <span className={styles.optionLabel}>选项 {index + 1}</span>
              <div className={styles.segments}>
                {option.segments.map((segment, segmentIndex) => (
                  <SegmentChip key={segmentIndex} segment={segment} />
                ))}
              </div>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
};

const DropPoolView: React.FC = () => {
  const [mode, setMode] = useState<'normal' | 'night'>('normal');
  const [nightState, setNightState] = useState<NightState>('normal');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const night = mode === 'night';
    return DATA.groups.filter((group) => {
      // 变异 / 入侵只列出确实有这套掉落的据点
      if (night && !hasState(group, nightState)) return false;
      const options = optionsOf(group, night, nightState);
      if (kw) {
        const ids = options.map((option) => String(option.id));
        const matched =
          ids.some((id) => id.includes(kw)) || group.names.some((name) => name.toLowerCase().includes(kw));
        if (!matched) return false;
      }
      return true;
    });
  }, [mode, nightState, keyword]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageGroups = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const resetPage = () => setPage(1);

  const stateLabel = DATA.meta.states[nightState] ?? '';

  return (
    <div className="content-wrapper" id="drop-pool-top">
      <Title level={3} className={styles.title}>
        🎁 掉落池
      </Title>

      <Alert
        type="info"
        showIcon
        className={styles.intro}
        title="一颗「潜在能力球」（掉球）里有 2~3 个选项，玩家只能选一个；每个选项下是各槽位的权重占比"
        description={
          <div className={styles.introDesc}>
            <div>普通模式：据点 / 精英的普通掉落，选项数量 2~3 个。</div>
            <div>
              深夜模式：据点分三种状态 —— 普通据点沿用普通掉落；「变异」指红皮怪，选项数量不变、池子升级；
              「入侵」（灾域）会让 要塞 / 教堂的球变成 3 个选项，且 boss 只使用入侵那套池。
            </div>
            <div>
              槽位类型按解包物品表判定（武器 / 诅咒武器 / 潜在能力 / 遗物 / 护符 / 道具），鼠标移到选项上可看掉落 ID。
              潜在能力池：普通 buff 为蓝色、高级 buff 为紫色；5% 的道具槽是徘徊赐福（金色）；锻造石【2】为紫色。
            </div>
          </div>
        }
      />

      <div className={styles.filterBar}>
        <Space size={[16, 10]} wrap>
          <Space size={[8, 8]} wrap>
            <span className={styles.filterLabel}>模式</span>
            <Segmented
              value={mode}
              onChange={(value) => {
                setMode(value as 'normal' | 'night');
                setNightState('normal');
                resetPage();
              }}
              options={[
                { label: '普通', value: 'normal' },
                { label: '深夜', value: 'night' },
              ]}
            />
          </Space>

          {mode === 'night' && (
            <Space size={[8, 8]} wrap>
              <span className={styles.filterLabel}>据点状态</span>
              <Segmented
                value={nightState}
                onChange={(value) => {
                  setNightState(value as NightState);
                  resetPage();
                }}
                options={[
                  { label: '普通据点', value: 'normal' },
                  { label: '变异据点', value: 'mutation' },
                  { label: '入侵据点', value: 'invasion' },
                ]}
              />
            </Space>
          )}

          <Input.Search
            allowClear
            placeholder="搜索地形 / 敌人 / 掉落ID"
            style={{ width: 240, maxWidth: '100%' }}
            onChange={(event) => {
              setKeyword(event.target.value);
              resetPage();
            }}
          />
        </Space>
      </div>

      <div className={styles.resultInfo} id="drop-pool-result">
        共 {filtered.length} 颗球
        {keyword && ` · 搜索「${keyword}」`}
        {mode === 'night' && ` · 深夜 · ${stateLabel}据点`}
      </div>

      {filtered.length === 0 ? (
        <Empty description="没有匹配的掉落" />
      ) : (
        <>
          <div className={styles.grid} id="drop-pool-grid">
            {pageGroups.map((group) => (
              <DropCard key={group.id} group={group} nightMode={mode === 'night'} nightState={nightState} />
            ))}
          </div>
          <div className={styles.pager}>
            <Pagination
              current={currentPage}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              showSizeChanger={false}
              showTotal={(total) => `共 ${total} 颗球`}
              onChange={(nextPage) => setPage(nextPage)}
            />
          </div>
        </>
      )}

      <div className={styles.footnote}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          {DATA.meta.sourceNote} 普通 / 变异 / 入侵分别对应解包里的 +0 / +10 / +50 三套掉落。
        </Text>
      </div>
    </div>
  );
};

export default DropPoolView;
