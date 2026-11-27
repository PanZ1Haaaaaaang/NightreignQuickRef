import React, { useMemo, useState } from 'react';
import { Button, Drawer } from 'antd';
import type { TableColumnsType } from 'antd';
import { TableOutlined } from '@ant-design/icons';
import FilterBar from '../../../components/common/FilterBar';
import aggroJson from '../../../data/zh-CN/aggro.json';
import spellJson from '../../../data/zh-CN/spell-aggro.json';
import type { AggroData, AggroRow, AggroSpellData } from '../../../types';
import ImpulseBadge from '../../../components/common/ImpulseBadge';
import PagedTable from '../../../components/common/PagedTable';
import { renderImpulseText } from '../../../components/common/renderImpulseText';
import styles from './aggroView.module.css';

const DATA = aggroJson as unknown as AggroData;
const SPELLS = spellJson as unknown as AggroSpellData;

interface AggroRecord {
  key: string;
  name: string;
  impulse: number | null;
  base: number | null;
  hits: number | null;
  total: number | null;
}

const toRecords = (rows: AggroRow[], prefix: string): AggroRecord[] =>
  rows.map((row, i) => ({
    key: `${prefix}-${i}`,
    name: row[0],
    impulse: row[1],
    base: row[2],
    hits: row[3],
    total: row[4],
  }));

const fmt = (v: number | null | undefined) => (v === null || v === undefined ? '—' : v.toLocaleString());

const renderImpulse = (level?: number | null) =>
  level === null || level === undefined ? fmt(level) : <ImpulseBadge level={level} />;

const compareNum = (a: number | null, b: number | null) => {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
};

const aggroColumns: TableColumnsType<AggroRecord> = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  {
    title: '冲击力',
    dataIndex: 'impulse',
    key: 'impulse',
    width: 80,
    align: 'center',
    render: renderImpulse,
    sorter: (a, b) => compareNum(a.impulse, b.impulse),
  },
  {
    title: '基础仇恨值',
    dataIndex: 'base',
    key: 'base',
    width: 110,
    align: 'right',
    render: fmt,
    sorter: (a, b) => compareNum(a.base, b.base),
  },
  {
    title: '次数',
    dataIndex: 'hits',
    key: 'hits',
    width: 70,
    align: 'center',
    render: fmt,
    sorter: (a, b) => compareNum(a.hits, b.hits),
  },
  {
    title: '总仇恨',
    dataIndex: 'total',
    key: 'total',
    width: 100,
    align: 'right',
    render: fmt,
    sorter: (a, b) => compareNum(a.total, b.total),
  },
];

interface ImpulseRecord {
  key: string;
  level: number;
  aggro: number;
  effect: string;
  example: string;
}

const impulseColumns: TableColumnsType<ImpulseRecord> = [
  { title: '冲击力', dataIndex: 'level', key: 'level', width: 80, align: 'center', render: renderImpulse },
  {
    title: '仇恨值',
    dataIndex: 'aggro',
    key: 'aggro',
    width: 100,
    align: 'right',
    render: (v: number) => v.toLocaleString(),
  },
  { title: '效果', dataIndex: 'effect', key: 'effect', width: 120 },
  { title: '示例', dataIndex: 'example', key: 'example' },
];

interface WeaponRecord {
  key: string;
  weapons: string;
  value: number;
}

const weaponColumns: TableColumnsType<WeaponRecord> = [
  { title: '武器', dataIndex: 'weapons', key: 'weapons' },
  {
    title: '基础仇恨值',
    dataIndex: 'value',
    key: 'value',
    width: 110,
    align: 'right',
    render: (v: number) => v.toLocaleString(),
  },
];

const skillColumns: TableColumnsType<{ key: string; name: string; value: string }> = [
  { title: '战技 / 动作', dataIndex: 'name', key: 'name' },
  { title: '仇恨值', dataIndex: 'value', key: 'value', width: '45%' },
];

const CATEGORY_OPTIONS = [
  { label: '常见高仇恨战技', value: 'skills' },
  { label: '角色相关', value: 'character' },
  { label: '法术', value: 'spells' },
  { label: '祷告', value: 'incantations' },
  { label: '局内杂项', value: 'misc' },
];

const AggroView: React.FC = () => {
  const [category, setCategory] = useState('skills');
  const [keyword, setKeyword] = useState('');
  const [drawer, setDrawer] = useState<'impulse' | 'weapon' | null>(null);

  const characterRows = useMemo(() => toRecords(DATA.characterRows, 'char'), []);
  const spellRows = useMemo(() => toRecords(SPELLS.spells, 'spell'), []);
  const incantationRows = useMemo(() => toRecords(SPELLS.incantations, 'incant'), []);
  const miscRows = useMemo(() => toRecords(DATA.miscRows, 'misc'), []);
  const skillRows = useMemo(
    () => DATA.skillHighlights.map((row, i) => ({ key: `skill-${i}`, name: row[0], value: row[1] })),
    [],
  );

  const impulseRows: ImpulseRecord[] = DATA.impulseTable.map((row, i) => ({
    key: `impulse-${i}`,
    level: row[0] as number,
    aggro: row[1] as number,
    effect: row[2] as string,
    example: row[3] as string,
  }));
  const weaponRows: WeaponRecord[] = DATA.weaponTable.map((row, i) => ({
    key: `weapon-${i}`,
    weapons: row[0],
    value: row[1],
  }));

  const activeRows = useMemo(() => {
    const map: Record<string, AggroRecord[]> = {
      character: characterRows,
      spells: spellRows,
      incantations: incantationRows,
      misc: miscRows,
    };
    return map[category] ?? [];
  }, [category, characterRows, spellRows, incantationRows, miscRows]);

  const kw = keyword.trim();
  const filteredAggro = kw ? activeRows.filter((row) => row.name.includes(kw)) : activeRows;
  const filteredSkills = kw ? skillRows.filter((row) => row.name.includes(kw) || row.value.includes(kw)) : skillRows;

  const total = category === 'skills' ? filteredSkills.length : filteredAggro.length;

  return (
    <div className={styles.wrap} id="aggro-mechanics">
      {DATA.intro.map((text) => (
        <p key={text} className={styles.paragraph}>
          {renderImpulseText(text)}
        </p>
      ))}

      <div className={styles.tableArea}>
        <FilterBar
          options={CATEGORY_OPTIONS}
          value={category}
          onChange={setCategory}
          categoryLabel="仇恨分类"
          searchPlaceholder="搜索名称"
          searchValue={keyword}
          onSearchChange={setKeyword}
          meta={
            <>
              {CATEGORY_OPTIONS.find((option) => option.value === category)?.label} · 共 {total} 条
            </>
          }
          actions={
            <>
              <Button size="small" icon={<TableOutlined />} onClick={() => setDrawer('impulse')}>
                冲击力 → 仇恨值
              </Button>
              <Button size="small" icon={<TableOutlined />} onClick={() => setDrawer('weapon')}>
                武器基础值
              </Button>
            </>
          }
        />

        {category === 'skills' ? (
          <PagedTable
            key={category}
            contextKey={kw}
            dataSource={filteredSkills}
            columns={skillColumns}
            rowKey="key"
            size="small"
            bordered
          />
        ) : (
          <PagedTable
            key={category}
            contextKey={kw}
            dataSource={filteredAggro}
            columns={aggroColumns}
            rowKey="key"
            size="small"
            bordered
          />
        )}
      </div>

      <Drawer
        title="冲击力 → 仇恨值"
        placement="right"
        size={640}
        open={drawer === 'impulse'}
        onClose={() => setDrawer(null)}
      >
        <PagedTable
          contextKey="impulse"
          dataSource={impulseRows}
          columns={impulseColumns}
          rowKey="key"
          size="small"
          bordered
        />
      </Drawer>

      <Drawer
        title="武器基础值"
        placement="right"
        size={760}
        open={drawer === 'weapon'}
        onClose={() => setDrawer(null)}
      >
        <PagedTable
          contextKey="weapon"
          dataSource={weaponRows}
          columns={weaponColumns}
          rowKey="key"
          size="small"
          bordered
        />
        <p className={styles.note}>
          基础值单指 R1 的冲击力对应仇恨；模组过多、包含多种冲击力的武器请参考原表。双武器模组可看作原仇恨值 ×2。
        </p>
      </Drawer>

      <div className={styles.source}>
        资料整理：{DATA.meta.author}
        <a href={DATA.meta.articleUrl} target="_blank" rel="noreferrer">
          《{DATA.meta.title}》
        </a>
        ；机制详解见
        <a href={DATA.meta.videoUrl} target="_blank" rel="noreferrer">
          bilibili 视频
        </a>
        ；动作参数来自
        <a href={DATA.meta.unpackerUrl} target="_blank" rel="noreferrer">
          原解包者
        </a>
        （{DATA.meta.unpackerNote}）。
      </div>
    </div>
  );
};

export default AggroView;
