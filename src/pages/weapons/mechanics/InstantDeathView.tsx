import React, { useMemo, useState } from 'react';
import { Button, Checkbox, Input, Segmented, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { FilterOutlined, SearchOutlined } from '@ant-design/icons';
import deathJson from '../../../data/zh-CN/instant-death.json';
import type { InstantDeathData, InstantDeathEnemyRow, InstantDeathProbabilityRow } from '../../../types';
import PagedTable from '../../../components/common/PagedTable';
import type { PageLocalColumns } from '../../../components/common/PagedTable';
import styles from './instantDeath.module.css';

const DATA = deathJson as unknown as InstantDeathData;

const PROBABILITY_KEYS = ['普通即死', '高级即死'] as const;

const probClass = (v: number) => {
  if (v <= 0) return styles.probZero;
  if (v < 10) return styles.probLow;
  if (v < 20) return styles.probMid;
  return styles.probHigh;
};

const probColumns: TableColumnsType<InstantDeathProbabilityRow> = [
  { title: '敌方血量百分比', dataIndex: 'hp', key: 'hp', width: '22%' },
  {
    title: '① 1 档',
    dataIndex: 't1',
    key: 't1',
    align: 'center',
    render: (v: number) => <span className={probClass(v)}>{v}%</span>,
  },
  {
    title: '② 2 档',
    dataIndex: 't2',
    key: 't2',
    align: 'center',
    render: (v: number) => <span className={probClass(v)}>{v}%</span>,
  },
  {
    title: '③ 3 档',
    dataIndex: 't3',
    key: 't3',
    align: 'center',
    render: (v: number) => <span className={probClass(v)}>{v}%</span>,
  },
  {
    title: '④ 4 档',
    dataIndex: 't4',
    key: 't4',
    align: 'center',
    render: (v: number) => <span className={probClass(v)}>{v}%</span>,
  },
];

const tierColor = (tier: string) => {
  if (tier.startsWith('X')) return 'default';
  if (tier.startsWith('1')) return 'green';
  if (tier.startsWith('2')) return 'blue';
  if (tier.startsWith('3')) return 'orange';
  if (tier.startsWith('4')) return 'red';
  return 'purple';
};

const tierKey = (tier: string) => (!tier ? 'none' : tier.startsWith('X') ? 'X' : tier.trim()[0]);

const TIER_FILTER_OPTIONS = [
  { label: '1 档', value: '1' },
  { label: '2 档', value: '2' },
  { label: '3 档', value: '3' },
  { label: '4 档', value: '4' },
  { label: '不可即死', value: 'X' },
];

const enemyPageSpans = (rows: readonly InstantDeathEnemyRow[]) => {
  const spans: Record<number, number> = {};
  let start = 0;
  while (start < rows.length) {
    const { id, place } = rows[start];
    let end = start + 1;
    while (end < rows.length && rows[end].id === id && rows[end].place === place) {
      end += 1;
    }
    spans[start] = end - start;
    start = end;
  }
  return spans;
};

const buildEnemyColumns = (
  spans: Record<number, number>,
  tierFilter: string[],
  onTierChange: (values: string[]) => void,
): PageLocalColumns<InstantDeathEnemyRow> => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 110,
    onCell: (_, index) => ({ rowSpan: spans[index ?? 0] ?? 0 }),
    render: (v: string) => <span className={styles.mono}>{v}</span>,
  },
  {
    title: '地点',
    dataIndex: 'place',
    key: 'place',
    width: '18%',
    onCell: (_, index) => ({ rowSpan: spans[index ?? 0] ?? 0 }),
  },
  { title: '敌人', dataIndex: 'enemy', key: 'enemy' },
  {
    title: '档位',
    dataIndex: 'tier',
    key: 'tier',
    width: 110,
    align: 'center',
    filterDropdown: ({ confirm, clearFilters }) => (
      <div className={styles.filterPanel}>
        <Checkbox.Group
          value={tierFilter}
          options={TIER_FILTER_OPTIONS}
          onChange={(values) => onTierChange(values as string[])}
        />
        <div className={styles.filterActions}>
          <Button size="small" type="primary" onClick={() => confirm()}>
            确定
          </Button>
          <Button
            size="small"
            onClick={() => {
              onTierChange([]);
              clearFilters?.();
              confirm();
            }}
          >
            重置
          </Button>
        </div>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <FilterOutlined style={{ color: filtered ? 'var(--theme-primary)' : undefined }} />
    ),
    filteredValue: tierFilter,
    render: (v: string) =>
      !v ? (
        <span className={styles.tierEmpty}>—</span>
      ) : v.startsWith('X') ? (
        <Tag color="default">不可即死</Tag>
      ) : (
        <Tag color={tierColor(v)}>{v}</Tag>
      ),
  },
  { title: '备注', dataIndex: 'note', key: 'note', width: '20%', render: (v?: string) => v ?? '' },
];

const InstantDeathView: React.FC = () => {
  const [probTab, setProbTab] = useState<(typeof PROBABILITY_KEYS)[number]>('普通即死');
  const [keyword, setKeyword] = useState('');
  const [showUnkillable, setShowUnkillable] = useState(true);
  const [tierFilter, setTierFilter] = useState<string[]>([]);

  const prob = DATA.probability[probTab];
  const search = keyword.trim();

  const filteredRows = useMemo(() => {
    let rows = DATA.enemyRows;
    if (!showUnkillable) rows = rows.filter((row) => !row.tier.startsWith('X'));
    if (tierFilter.length > 0) rows = rows.filter((row) => tierFilter.includes(tierKey(row.tier)));
    if (!search) return rows;
    return rows.filter(
      (row) =>
        row.id.includes(search) ||
        row.place.includes(search) ||
        row.enemy.includes(search) ||
        (row.note ?? '').includes(search),
    );
  }, [search, showUnkillable, tierFilter]);

  return (
    <div className={styles.wrap} id="instant-death-mechanics">
      <div className={styles.notes}>
        {DATA.notes.map((note) => (
          <p key={note} className={styles.noteItem}>
            {note}
          </p>
        ))}
      </div>

      <h4 className={styles.heading}>即死概率</h4>
      <div className={styles.probHeader}>
        <Segmented
          options={PROBABILITY_KEYS.map((key) => ({ label: key, value: key }))}
          value={probTab}
          onChange={(v) => setProbTab(v as (typeof PROBABILITY_KEYS)[number])}
        />
        <span className={styles.probDesc}>{prob.desc}</span>
      </div>
      <Table
        columns={probColumns}
        dataSource={prob.rows.map((row) => ({ ...row, key: row.hp }))}
        rowKey="key"
        size="small"
        bordered
        pagination={false}
      />
      <p className={styles.note}>
        命中时读取敌方<strong>当前</strong>生命值百分比，按上表分档取值。①~④ 对应敌人 1~4
        档，普通即死与高级即死分开计算。
      </p>

      <h4 className={styles.heading}>敌人档位</h4>
      <div className={styles.toolbar}>
        <span className={styles.count}>共 {filteredRows.length} 条</span>
        <div className={styles.toolbarRight}>
          <Checkbox checked={showUnkillable} onChange={(event) => setShowUnkillable(event.target.checked)}>
            显示不可即死
          </Checkbox>
          <Input
            allowClear
            placeholder="搜索地点 / 敌人 / ID"
            prefix={<SearchOutlined />}
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            style={{ width: 240 }}
          />
        </div>
      </div>
      <PagedTable
        columns={(pageRows) => buildEnemyColumns(enemyPageSpans(pageRows), tierFilter, setTierFilter)}
        dataSource={filteredRows}
        contextKey={JSON.stringify([search, showUnkillable, tierFilter])}
        rowKey={(row) => `${row.id}-${row.enemy}`}
        size="small"
        bordered
      />
      <p className={styles.note}>
        「不可即死」表示该敌人不带可即死标志；小怪未全部列出，但基本都可即死。同名多敌人表示该据点会从中随机出现。
      </p>

      <div className={styles.source}>
        资料整理：{DATA.meta.author}
        <a href={DATA.meta.url} target="_blank" rel="noreferrer">
          《{DATA.meta.title}》
        </a>
        ；敌人档位等数据参考 Smithbox 解包内容。
      </div>
    </div>
  );
};

export default InstantDeathView;
