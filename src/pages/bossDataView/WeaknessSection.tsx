import React, { useEffect, useMemo, useState } from 'react';
import { Image, Input, Segmented, Select, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import weaknessJson from '../../data/zh-CN/boss_weakness_data.json';
import magicIcon from '../../assets/Negations/magic-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import fireIcon from '../../assets/Negations/fire-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import lightningIcon from '../../assets/Negations/lightning-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import holyIcon from '../../assets/Negations/holy-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import standardIcon from '../../assets/Negations/standard-damage-damage-type-elden-ring-nightreign-wiki-guide.png';
import poisonIcon from '../../assets/Resistances/poison-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import frostIcon from '../../assets/Resistances/frostbite-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import rotIcon from '../../assets/Resistances/scarlet-rot-status-effect-elden-ring-nightreing-wiki-guide-100px.png';
import blightIcon from '../../assets/Resistances/blight_status_effect_elden_ring_wiki_guide_100px.png';
import bleedIcon from '../../assets/Resistances/hemorrhage-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import sleepIcon from '../../assets/Resistances/sleep-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import madnessIcon from '../../assets/Resistances/madness-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import CustomPagination from '../../components/CustomPagination';
import beastImg from '../../assets/BossRelics/night-of-the-beast.avif';
import fathomImg from '../../assets/BossRelics/night-of-the-fathom.avif';
import miasmaImg from '../../assets/BossRelics/night-of-the-miasma.avif';
import demonImg from '../../assets/BossRelics/night-of-the-demon.avif';
import lordImg from '../../assets/BossRelics/night-of-the-lord.avif';
import dregsImg from '../../assets/BossRelics/the-night-of-dregs.avif';
import styles from '../../styles/weaknessSection.module.css';

const BOSS_IMAGES = {
  beast: beastImg,
  fathom: fathomImg,
  miasma: miasmaImg,
  demon: demonImg,
  lord: lordImg,
  dregs: dregsImg,
};
type PlayerCount = '1' | '2' | '3';

interface BossWeaknessRow {
  boss: string;
  image: keyof typeof BOSS_IMAGES;
  stage: string;
  single: string;
  duo: string;
  trio: string;
  effect: string;
}

interface BuildupRow {
  name: string;
  attr: string;
  value: string;
}

interface WeaknessData {
  meta: { title: string; author: string; source: string; sourceUrl: string; videoUrl: string; note: string };
  intro: string;
  notes: string[];
  bosses: BossWeaknessRow[];
  actions: { columns: string[]; rows: string[][] };
  arts: BuildupRow[];
  spells: BuildupRow[];
  items: BuildupRow[];
}

const DATA = weaknessJson as unknown as WeaknessData;

/** 表里的「火（可变）」「圣（可变）」之类，按主属性上色 */
const ATTR_COLOR: Record<string, string> = {
  火焰: 'volcano',
  神圣: 'gold',
  雷电: 'geekblue',
  魔力: 'purple',
  出血: 'magenta',
  骤死: 'red',
  无属性: 'default',
};

const baseAttr = (attr: string) => attr.replace(/（.*$/, '').trim();

const attrTag = (attr: string) => {
  const key = Object.keys(ATTR_COLOR).find((k) => attr.startsWith(k)) ?? '无属性';
  return <Tag color={ATTR_COLOR[key]}>{attr}</Tag>;
};

const damageOption = (value: string, icon: string) => ({
  value,
  label: (
    <span className="damage-type-option">
      <img src={icon} alt="" className="damage-type-icon" />
      <span>{value}</span>
    </span>
  ),
});

/** 异常类别在前、属性类别在后（与「夜王基础数据」的图标保持一致） */
const DAMAGE_FILTER_OPTIONS = [
  {
    label: '异常类别',
    options: [
      damageOption('中毒', poisonIcon),
      damageOption('冻伤', frostIcon),
      damageOption('腐败', rotIcon),
      damageOption('骤死', blightIcon),
      damageOption('出血', bleedIcon),
      damageOption('催眠', sleepIcon),
      damageOption('发狂', madnessIcon),
    ],
  },
  {
    label: '属性类别',
    options: [
      damageOption('魔力', magicIcon),
      damageOption('火焰', fireIcon),
      damageOption('雷电', lightningIcon),
      damageOption('神圣', holyIcon),
    ],
  },
  {
    label: '其他',
    options: [damageOption('无属性', standardIcon)],
  },
];

const numStyle: React.CSSProperties = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

/** 同一夜王的连续行合并（触发效果同样按夜王合并） */
const groupSpans = (rows: BossWeaknessRow[]) => {
  const spans: Record<number, number> = {};
  let i = 0;
  while (i < rows.length) {
    let j = i;
    while (j + 1 < rows.length && rows[j + 1].boss === rows[i].boss) j += 1;
    spans[i] = j - i + 1;
    i = j + 1;
  }
  return spans;
};

const PLAYER_LABEL: Record<PlayerCount, string> = { '1': '单人', '2': '双人', '3': '三人' };

const BuildupTable: React.FC<{ rows: BuildupRow[]; keyword: string; damageTypes: string[]; empty: string }> = ({
  rows,
  keyword,
  damageTypes,
  empty,
}) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filtered = useMemo(() => {
    const kw = keyword.trim();
    const selected = damageTypes.length > 0 ? new Set(damageTypes) : null;
    return rows.filter((row) => {
      if (selected && !selected.has(baseAttr(row.attr))) return false;
      if (!kw) return true;
      return row.name.includes(kw) || row.attr.includes(kw) || row.value.includes(kw);
    });
  }, [rows, keyword, damageTypes]);

  useEffect(() => {
    setPage(1);
  }, [keyword, rows, damageTypes]);

  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const columns: TableColumnsType<BuildupRow> = [
    { title: '名称', dataIndex: 'name', key: 'name', width: '32%' },
    {
      title: '属性',
      dataIndex: 'attr',
      key: 'attr',
      width: 150,
      render: (attr: string) => attrTag(attr),
    },
    { title: '累积值', dataIndex: 'value', key: 'value', render: (v: string) => <span style={numStyle}>{v}</span> },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={paged}
        rowKey={(row) => `${row.name}-${row.attr}`}
        size="small"
        bordered
        pagination={false}
        scroll={{ x: 520 }}
        locale={{ emptyText: empty }}
      />
      <CustomPagination
        currentPage={page}
        pageSize={pageSize}
        totalItems={filtered.length}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </>
  );
};

const WeaknessSection: React.FC = () => {
  const [playerCount, setPlayerCount] = useState<PlayerCount>('1');
  const [tab, setTab] = useState<'actions' | 'arts' | 'spells' | 'items'>('actions');
  const [keyword, setKeyword] = useState('');
  const [damageTypes, setDamageTypes] = useState<string[]>([]);

  const spans = useMemo(() => groupSpans(DATA.bosses), []);
  const thresholdKey = playerCount === '1' ? 'single' : playerCount === '2' ? 'duo' : 'trio';

  const bossColumns: TableColumnsType<BossWeaknessRow> = [
    {
      title: '夜王',
      dataIndex: 'boss',
      key: 'boss',
      width: 240,
      onCell: (_, index) => ({ rowSpan: spans[index ?? 0] ?? 0 }),
      render: (boss: string, record) => (
        <span className={styles.bossCell}>
          <Image
            src={BOSS_IMAGES[record.image]}
            alt={boss}
            width={40}
            height={40}
            preview={false}
            className={styles.bossImage}
          />
          <strong>{boss}</strong>
        </span>
      ),
    },
    { title: '阶段', dataIndex: 'stage', key: 'stage', width: 220 },
    {
      title: `阈值（${PLAYER_LABEL[playerCount]}）`,
      dataIndex: thresholdKey,
      key: thresholdKey,
      width: 150,
      render: (v: string) => <span style={numStyle}>{v}</span>,
    },
    {
      title: '触发效果',
      dataIndex: 'effect',
      key: 'effect',
      onCell: (_, index) => ({ rowSpan: spans[index ?? 0] ?? 0 }),
    },
  ];

  const actionRows = useMemo(() => {
    const rows = DATA.actions.rows.map((row) =>
      Object.fromEntries(DATA.actions.columns.map((col, i) => [col, row[i]])),
    );
    const kw = keyword.trim();
    if (!kw) return rows;
    return rows.filter((row) => Object.values(row).some((cell) => String(cell).includes(kw)));
  }, [keyword]);

  return (
    <div className={styles.wrap} id="weakness-data">
      <p className={styles.intro}>{DATA.intro}</p>

      <div className={styles.noteGrid}>
        {DATA.notes.map((note) => (
          <div key={note} className={styles.noteItem}>
            {note}
          </div>
        ))}
      </div>

      <h4 className={styles.sectionTitle}>
        夜王弱点阈值
        <span className={styles.sectionHint}>格内三个数依次对应第 0 / 1 / 2 次触发</span>
      </h4>
      <div className={styles.toolbar}>
        <Segmented
          value={playerCount}
          onChange={(value) => setPlayerCount(value as PlayerCount)}
          options={[
            { label: '单人模式', value: '1' },
            { label: '双人模式', value: '2' },
            { label: '三人模式', value: '3' },
          ]}
        />
      </div>
      <Table
        columns={bossColumns}
        dataSource={DATA.bosses}
        rowKey={(row) => `${row.boss}-${row.stage}`}
        size="small"
        bordered
        pagination={false}
        scroll={{ x: 760 }}
      />

      <h4 className={styles.sectionTitle}>
        玩家侧累积值
        <span className={styles.sectionHint}>种类与模组不同会直接影响累积值</span>
      </h4>
      <div className={styles.toolbar}>
        <Segmented
          value={tab}
          onChange={(value) => setTab(value as typeof tab)}
          options={[
            { label: '常见动作', value: 'actions' },
            { label: '专属战技', value: 'arts' },
            { label: '法术 · 祷告', value: 'spells' },
            { label: '道具 · 词条', value: 'items' },
          ]}
        />
        <div className={styles.toolbarRight}>
          {tab === 'actions' ? null : (
            <Select
              mode="multiple"
              allowClear
              showSearch={false}
              placeholder="按伤害类型筛选"
              options={DAMAGE_FILTER_OPTIONS}
              value={damageTypes}
              onChange={setDamageTypes}
              maxTagCount="responsive"
              listHeight={360}
              className="damage-type-select"
              style={{ minWidth: 220, maxWidth: 300 }}
            />
          )}
          <Input
            allowClear
            placeholder="搜索名称 / 属性 / 数值"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 220 }}
          />
        </div>
      </div>

      {tab === 'actions' ? (
        <Table
          dataSource={actionRows}
          rowKey="武器类型"
          size="small"
          bordered
          pagination={false}
          scroll={{ x: 720 }}
          columns={DATA.actions.columns.map((col) => ({
            title: col,
            dataIndex: col,
            key: col,
            render: (v: string) => <span style={numStyle}>{v}</span>,
          }))}
        />
      ) : (
        <BuildupTable
          rows={tab === 'arts' ? DATA.arts : tab === 'spells' ? DATA.spells : DATA.items}
          keyword={keyword}
          damageTypes={damageTypes}
          empty="没有匹配的条目"
        />
      )}

      <div className={styles.source}>
        数据来自 {DATA.meta.author} 的《{DATA.meta.source}》，原文{' '}
        <a href={DATA.meta.sourceUrl} target="_blank" rel="noreferrer">
          bilibili 专栏
        </a>{' '}
        · 机制演示{' '}
        <a href={DATA.meta.videoUrl} target="_blank" rel="noreferrer">
          bilibili 视频
        </a>
        。{DATA.meta.note}
      </div>
    </div>
  );
};

export default WeaknessSection;
