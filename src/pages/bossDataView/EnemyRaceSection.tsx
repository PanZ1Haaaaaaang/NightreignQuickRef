import React, { useMemo, useState } from 'react';
import { Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import enemyRaceJson from '../../data/zh-CN/enemy_race_data.json';

// ---- 数据类型（对应 src/data/zh-CN/enemy_race_data.json 结构）----
interface RaceInfo {
  name: string;
  enemies: string[];
}

interface SpecialWeaponRow {
  race: string;
  name: string;
  category: string;
  multiplier: number;
}

interface SpecialBuffRow {
  name: string;
  type: string;
  races: string;
  effect: string;
  note: string;
}

interface EnemyRaceData {
  meta: { sourceNote: string };
  races: RaceInfo[];
  specialWeapons: SpecialWeaponRow[];
  specialBuffs: SpecialBuffRow[];
}

const enemyRaceData = enemyRaceJson as unknown as EnemyRaceData;

const RACE_COLORS: Record<string, string> = {
  虚空: 'blue',
  死诞: 'default',
  古龙: 'orange',
  普通龙: 'green',
};

const sectionTitleStyle: React.CSSProperties = {
  color: 'var(--theme-text-primary)',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const DASH = '—';

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 style={sectionTitleStyle}>{children}</h3>
);

// ---- 一、敌人种族表：4 个种族并列成列，成员逐行填充 ----
const RaceOverviewSection: React.FC = () => {
  const rows = useMemo(() => {
    const maxLen = Math.max(...enemyRaceData.races.map((race) => race.enemies.length));
    return Array.from({ length: maxLen }, (_, index) => {
      const row: Record<string, string> = { key: String(index) };
      enemyRaceData.races.forEach((race) => {
        row[race.name] = race.enemies[index] ?? '';
      });
      return row;
    });
  }, []);

  const columns: ColumnsType<Record<string, string>> = enemyRaceData.races.map((race) => ({
    title: <Tag color={RACE_COLORS[race.name] || 'default'}>{race.name}</Tag>,
    dataIndex: race.name,
    key: race.name,
    align: 'center',
  }));

  return (
    <div style={{ marginBottom: 32 }}>
      <SectionTitle>一、敌人种族表</SectionTitle>
      <Table<Record<string, string>>
        columns={columns}
        dataSource={rows}
        rowKey="key"
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

// ---- 二、种族特攻武器：可按种族筛选，种族列纵向合并 ----
const SpecialWeaponSection: React.FC = () => {
  const [selectedRaces, setSelectedRaces] = useState<string[]>([]);

  const raceOptions = useMemo(() => enemyRaceData.races.map((race) => ({ value: race.name, label: race.name })), []);

  const filtered = useMemo(
    () =>
      selectedRaces.length === 0
        ? enemyRaceData.specialWeapons
        : enemyRaceData.specialWeapons.filter((row) => selectedRaces.includes(row.race)),
    [selectedRaces],
  );

  // 种族列的纵向合并（按当前可见行分组）
  const raceSpans = useMemo(() => {
    const spans = new Array<number>(filtered.length).fill(1);
    let start = 0;
    while (start < filtered.length) {
      const key = filtered[start].race;
      let end = start + 1;
      while (end < filtered.length && filtered[end].race === key) {
        end += 1;
      }
      spans[start] = end - start;
      for (let index = start + 1; index < end; index += 1) {
        spans[index] = 0;
      }
      start = end;
    }
    return spans;
  }, [filtered]);

  const columns: ColumnsType<SpecialWeaponRow> = [
    {
      title: '种族',
      dataIndex: 'race',
      key: 'race',
      width: 110,
      align: 'center',
      onCell: (_record, index) => ({
        rowSpan: raceSpans[index ?? 0] ?? 1,
        style: { verticalAlign: 'middle' },
      }),
      render: (value: string) => <Tag color={RACE_COLORS[value] || 'default'}>{value}</Tag>,
    },
    { title: '武器名', dataIndex: 'name', key: 'name', width: 220 },
    { title: '类别', dataIndex: 'category', key: 'category', width: 130, align: 'center' },
    {
      title: '伤害增益倍率',
      dataIndex: 'multiplier',
      key: 'multiplier',
      width: 140,
      align: 'center',
      render: (value: number) => <span style={{ fontWeight: 600 }}>×{value}</span>,
    },
  ];

  return (
    <div style={{ marginBottom: 32 }}>
      <SectionTitle>二、种族特攻武器</SectionTitle>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <Select
          mode="multiple"
          allowClear
          placeholder="按种族筛选"
          options={raceOptions}
          value={selectedRaces}
          onChange={setSelectedRaces}
          maxTagCount="responsive"
          style={{ minWidth: 200, maxWidth: 360 }}
        />
      </div>
      <Table<SpecialWeaponRow>
        columns={columns}
        dataSource={filtered}
        rowKey={(record, index) => `${record.race}-${record.name}-${index}`}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: '没有匹配的数据' }}
      />
    </div>
  );
};

// ---- 三、种族特攻Buff/效果 ----
const SpecialBuffSection: React.FC = () => {
  const columns: ColumnsType<SpecialBuffRow> = [
    { title: '名称', dataIndex: 'name', key: 'name', width: 240 },
    { title: '类型', dataIndex: 'type', key: 'type', width: 110, align: 'center' },
    {
      title: '特攻种族',
      dataIndex: 'races',
      key: 'races',
      width: 150,
      align: 'center',
      render: (value: string) => (
        <span style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
          {value.split('/').map((race) => (
            <Tag key={race} color={RACE_COLORS[race.replace(/^对/, '')] || 'default'} style={{ marginInlineEnd: 0 }}>
              {race}
            </Tag>
          ))}
        </span>
      ),
    },
    {
      title: '效果',
      dataIndex: 'effect',
      key: 'effect',
      width: 460,
      render: (value: string) => <span style={{ whiteSpace: 'pre-line' }}>{value}</span>,
    },
    {
      title: '备注',
      dataIndex: 'note',
      key: 'note',
      render: (value: string) =>
        value ? <span style={{ whiteSpace: 'pre-line' }}>{value}</span> : <span style={{ color: '#999' }}>{DASH}</span>,
    },
  ];

  return (
    <div style={{ marginBottom: 16 }}>
      <SectionTitle>三、种族特攻Buff / 效果</SectionTitle>
      <Table<SpecialBuffRow>
        columns={columns}
        dataSource={enemyRaceData.specialBuffs}
        rowKey={(record, index) => `${record.name}-${index}`}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

// ---- 敌人种族说明（夜王Boss数据页子tab）----
const EnemyRaceSection: React.FC = () => {
  return (
    <div>
      <RaceOverviewSection />
      <SpecialWeaponSection />
      <SpecialBuffSection />
      <div style={{ color: 'var(--theme-text-secondary)', fontSize: 12 }}>{enemyRaceData.meta.sourceNote}</div>
    </div>
  );
};

export default EnemyRaceSection;
