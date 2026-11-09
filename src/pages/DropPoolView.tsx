import { useMemo, useState } from 'react';
import { Alert, Button, Empty, Grid, Input, Pagination, Segmented, Space, Tag, Tooltip, Typography } from 'antd';
import { TableOutlined } from '@ant-design/icons';
import dropPoolsJson from '../data/zh-CN/drop_pools.json';
import type { DropGroup, DropPoolsData, DropSegment } from '../types';
import { POTENTIAL_POOL_LABEL } from '../config/potentialPoolConfig';
import { BASE_POOL_KINDS, KIND_CLASS } from './dropPoolView/poolKinds';
import BasePoolDrawer from './dropPoolView/BasePoolDrawer';
import PotentialPoolDrawer from './dropPoolView/PotentialPoolDrawer';
import styles from '../styles/dropPoolView.module.css';

const { Title, Text } = Typography;

const DATA = dropPoolsJson as unknown as DropPoolsData;
const PAGE_SIZE = 12;

/** 深夜模式下据点的三种状态（变异 / 入侵可分别对应 +10 / +50 两套掉落） */
type NightState = 'normal' | 'mutation' | 'invasion';

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
 * 普通池蓝色、其余紫色；徘徊赐福金色；锻造石【2】紫色。
 * 第四项 note：元素变体（出血 / 冻伤 / 火焰…）、护符分类、特殊效果名等；detail 只放池内拆分。
 * 12 个基池的槽位可点击：打开「基池对照表」并高亮对应行；
 * buff 槽位可点击：打开「潜在能力池明细」，词条数据按需懒加载。
 */
const SegmentChip: React.FC<{
  segment: DropSegment;
  onPoolClick?: (kind: string) => void;
  onBuffClick?: (pool: string) => void;
}> = ({ segment, onPoolClick, onBuffClick }) => {
  const [percent, kind, pool, note, detail] = segment;
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
  } else if ((kind === 'specialBuff' || kind === 'weaponItem') && note) {
    label = note;
  } else if (kind === 'accessory' && note) {
    label = `护符池（${note}）`;
  }

  const canOpenBasePool = BASE_POOL_KINDS.has(kind) && Boolean(onPoolClick);
  const canOpenBuff = kind === 'buff' && Boolean(pool) && Boolean(onBuffClick);
  const clickable = canOpenBasePool || canOpenBuff;

  const chip = (
    <span
      className={`${styles.segment} ${className} ${clickable ? styles.clickable : ''}`}
      onClick={
        canOpenBasePool ? () => onPoolClick?.(kind) : canOpenBuff ? () => onBuffClick?.(pool as string) : undefined
      }
    >
      <b className={styles.percent}>{percent}%</b>
      <span>{label}</span>
    </span>
  );

  // 悬停说明：只放池内拆分；癫火武器额外列出 3 把可能武器；可点的槽位提示点了会打开什么
  const detailText = kind === 'flameWeapon' && detail ? `可能的武器：${detail}` : (detail ?? null);
  const clickHint = canOpenBasePool ? '点击查看基池对照表' : canOpenBuff ? '点击查看该池可能的词条' : null;
  const tooltip =
    detailText || clickHint ? (
      <div className={styles.tipBox}>
        {detailText && <div>{detailText}</div>}
        {clickHint && <div className={styles.tipHint}>{clickHint}</div>}
      </div>
    ) : null;

  if (tooltip) {
    return (
      <Tooltip title={tooltip} placement="bottom" mouseEnterDelay={0.2}>
        <span className={styles.noteHover}>{chip}</span>
      </Tooltip>
    );
  }
  return chip;
};

const DropCard: React.FC<{
  group: DropGroup;
  nightMode: boolean;
  nightState: NightState;
  onPoolClick?: (kind: string) => void;
  onBuffClick?: (pool: string) => void;
}> = ({ group, nightMode, nightState, onPoolClick, onBuffClick }) => {
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
          <div key={option.id} className={styles.option} data-option-id={option.id}>
            <Tooltip title={String(option.id)} placement="top" mouseEnterDelay={0.2}>
              <span className={styles.optionLabel}>选项 {index + 1}</span>
            </Tooltip>
            <div className={styles.segments}>
              {option.segments.map((segment, segmentIndex) => (
                <SegmentChip key={segmentIndex} segment={segment} onPoolClick={onPoolClick} onBuffClick={onBuffClick} />
              ))}
            </div>
          </div>
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
  const [basePoolOpen, setBasePoolOpen] = useState(false);
  /** 从卡片槽位点进来时要高亮的基池 kind；从按钮打开则为 null */
  const [basePoolKind, setBasePoolKind] = useState<string | null>(null);
  /** 潜在能力池明细：当前池 key（normal / purple / …） */
  const [buffOpen, setBuffOpen] = useState(false);
  const [buffPool, setBuffPool] = useState<string | null>(null);
  const screens = Grid.useBreakpoint();
  // 窄屏时把「基池对照表」放到说明末尾：Alert 右上角放按钮会把标题挤成多行
  const narrow = screens.md === false;

  const openBasePool = (kind?: string) => {
    setBasePoolKind(kind ?? null);
    setBasePoolOpen(true);
  };

  /** buff 槽位：打开潜在能力池明细（词条 JSON 在抽屉里懒加载） */
  const openBuffPool = (pool: string) => {
    setBuffPool(pool);
    setBuffOpen(true);
  };

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

  const basePoolButton = (
    <Button size="small" icon={<TableOutlined />} onClick={() => openBasePool()}>
      基池对照表
    </Button>
  );

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
        action={narrow ? undefined : basePoolButton}
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
              武器槽会标到具体池（12 个基池的名称、池 ID、条目数见「基池对照表」）；「窄」池 = 战灰可换的武器，
              悬停可看池内 75% 变体 / 25% 原版的构成。
            </div>
            {narrow && <div className={styles.introAction}>{basePoolButton}</div>}
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
              <DropCard
                key={group.id}
                group={group}
                nightMode={mode === 'night'}
                nightState={nightState}
                onPoolClick={openBasePool}
                onBuffClick={openBuffPool}
              />
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
          {DATA.meta.sourceNote} & 黑夜君临 掉落数据 by：Supuritto
        </Text>
      </div>

      <BasePoolDrawer
        open={basePoolOpen}
        onClose={() => setBasePoolOpen(false)}
        basePools={DATA.meta.basePools}
        kinds={DATA.meta.kinds}
        focusKind={basePoolKind}
      />

      <PotentialPoolDrawer open={buffOpen} onClose={() => setBuffOpen(false)} poolKey={buffPool} />
    </div>
  );
};

export default DropPoolView;
