import React, { useEffect, useState } from 'react';
import { Button, Drawer, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { LineChartOutlined, TableOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import ailmentJson from '../data/zh-CN/ailment_data.json';
import type { AilmentData, AilmentEffect, AilmentWeaponRow } from '../types';
import { getCurrentTheme } from '../utils/themeUtils';
import styles from '../styles/ailmentView.module.css';
import { statusTypeIn } from '../assets/icons/status';
import CharacterAvatar from '../components/common/CharacterAvatar';
import StatusIcon from '../components/common/StatusIcon';

const DATA = ailmentJson as unknown as AilmentData;

const renderStatusLabel = (text: string) => {
  const status = statusTypeIn(text);
  return status ? (
    <span className={styles.iconLabel}>
      <StatusIcon status={status} size={20} className={styles.cellIcon} />
      <span>{text}</span>
    </span>
  ) : (
    text
  );
};

interface CharacterBonus {
  key: string;
  name: string;
  sense: number;
  bonus: number;
  multiplier: number;
}

// 感应值直接读站内角色数据（15 级），加成公式来自「成长曲线」的异常补正曲线
const CHARACTER_MODULES = import.meta.glob('../data/character-info/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, Record<string, Array<Record<string, number | string>>>>;

const CHARACTER_BONUSES: CharacterBonus[] = Object.entries(CHARACTER_MODULES)
  .filter(([path]) => !path.includes('character_data'))
  .map(([, data]) => {
    const name = Object.keys(data)[0];
    const levels = data[name];
    const last = levels[levels.length - 1];
    const sense = Number(last['感应']);
    const { threshold, maxVal, growVal } = DATA.sensing.curve;
    const raw = Math.max(0, sense - threshold) * (growVal / (maxVal - threshold));
    const bonus = Math.floor(raw);
    return { key: name, name, sense, bonus, multiplier: 1 + bonus / 100 };
  })
  .sort((a, b) => b.sense - a.sense);

const bonusColumns: TableColumnsType<CharacterBonus> = [
  {
    title: '角色',
    dataIndex: 'name',
    key: 'name',
    render: (name: string) => <CharacterAvatar name={name} />,
  },
  { title: '感应（15 级）', dataIndex: 'sense', key: 'sense', width: 130, align: 'center' },
  {
    title: '异常值加成',
    dataIndex: 'bonus',
    key: 'bonus',
    width: 120,
    align: 'center',
    render: (v: number) => `${v}%`,
  },
  {
    title: '倍率',
    dataIndex: 'multiplier',
    key: 'multiplier',
    width: 100,
    align: 'center',
    render: (v: number) => `×${v.toFixed(2)}`,
  },
];

const effectColumns: TableColumnsType<AilmentEffect> = [
  {
    title: '异常',
    dataIndex: 'name',
    key: 'name',
    width: 160,
    align: 'center',
    render: renderStatusLabel,
  },
  { title: '效果', dataIndex: 'desc', key: 'desc' },
];

const weaponColumns: TableColumnsType<AilmentWeaponRow> = [
  { title: '武器类型', dataIndex: 'type', key: 'type', width: '26%' },
  { title: '档位 1 · 自带属性', dataIndex: 'tier1', key: 'tier1' },
  { title: '档位 2 · 血 / 毒 / 寒冷质变', dataIndex: 'tier2', key: 'tier2' },
  { title: '档位 3 · 自带属性 + 对应质变', dataIndex: 'tier3', key: 'tier3' },
];

const listColumns: TableColumnsType<{ name: string; value: string }> = [
  { title: '武器', dataIndex: 'name', key: 'name', width: '40%' },
  {
    title: '异常值（基础）',
    dataIndex: 'value',
    key: 'value',
    render: renderStatusLabel,
  },
];

const skillColumns: TableColumnsType<{ name: string; value: string }> = [
  { title: '战技', dataIndex: 'name', key: 'name', width: '28%' },
  {
    title: '异常值',
    dataIndex: 'value',
    key: 'value',
    render: renderStatusLabel,
  },
];

const CURVE_COLORS = ['#1677ff', '#fa8c16'];

const CurveChart: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const data = DATA.curves
    .filter((curve) => curve.key === 'serpent' || curve.key === 'anomaly')
    .flatMap((curve) =>
      curve.stages.map((stat, index) => ({
        stat,
        value: curve.growth[index],
        curve: curve.name,
      })),
    );
  const config = {
    data,
    xField: 'stat',
    yField: 'value',
    colorField: 'curve',
    theme,
    height: 360,
    autoFit: true,
    point: { sizeField: 4, shapeField: 'circle' },
    scale: {
      color: { range: CURVE_COLORS },
    },
    axis: {
      x: { title: '属性值' },
      y: { title: '成长值（%）' },
    },
    legend: { color: { position: 'bottom' as const } },
  };
  return <Line {...config} />;
};

const AilmentView: React.FC = () => {
  const [sensingOpen, setSensingOpen] = useState(false);
  const [curveOpen, setCurveOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(getCurrentTheme());

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(getCurrentTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['tomato-theme'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.wrap} id="ailment-values">
      <h4 className={styles.heading}>异常状态效果</h4>
      <Table
        columns={effectColumns}
        dataSource={DATA.effects.map((row) => ({ ...row, key: row.name }))}
        rowKey="key"
        size="small"
        bordered
        pagination={false}
      />

      <div className={styles.sectionHeader}>
        <h4 className={styles.heading}>{DATA.sensing.title}</h4>
        <div className={styles.sectionActions}>
          <Button size="small" icon={<LineChartOutlined />} onClick={() => setCurveOpen(true)}>
            补正曲线
          </Button>
          <Button size="small" icon={<TableOutlined />} onClick={() => setSensingOpen(true)}>
            感应加成对照
          </Button>
        </div>
      </div>
      <div className={styles.sensingBox}>
        <p className={styles.paragraph}>{DATA.sensing.desc}</p>
        <p className={styles.paragraph}>
          <strong>公式：</strong>
          {DATA.sensing.formula}
        </p>
      </div>
      <Drawer title="感应加成异常值" size={560} open={sensingOpen} onClose={() => setSensingOpen(false)}>
        <p className={styles.paragraph}>
          <strong>公式：</strong>
          {DATA.sensing.formula}
        </p>
        <p className={styles.paragraph}>
          <strong>蛇弓专用异常补正公式：</strong>
          {DATA.sensing.serpentFormula}
        </p>
        <Table
          columns={bonusColumns}
          dataSource={CHARACTER_BONUSES}
          rowKey="key"
          size="small"
          bordered
          pagination={false}
        />
        <p className={styles.drawerNote}>{DATA.sensing.note}</p>
      </Drawer>

      <Drawer title="补正曲线" size={760} open={curveOpen} onClose={() => setCurveOpen(false)}>
        <p className={styles.hint}>
          横轴为属性值，纵轴为成长值（%）；5 号曲线用于蛇弓异常补正，6 号曲线用于感应加成异常值。
        </p>
        <CurveChart theme={theme} />
        <p className={styles.hint}>5 号：0→99 → 0→300；6 号：0/10/99 → 0/0/160。</p>
      </Drawer>

      <h4 className={styles.heading}>毒 / 血 / 冰数值（以出血为例）</h4>
      <p className={styles.hint}>每个单元格的四个数值依次对应 白 / 蓝 / 紫 / 橙 武器。</p>
      <Table
        columns={weaponColumns}
        dataSource={DATA.weaponRows.map((row) => ({ ...row, key: row.type }))}
        rowKey="key"
        size="small"
        bordered
        pagination={false}
      />

      <h4 className={styles.heading}>例外</h4>
      <ul className={styles.list}>
        {DATA.exceptions.map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>

      <div className={styles.twoCol}>
        <section>
          <h4 className={styles.heading}>其他异常</h4>
          <Table
            columns={listColumns}
            dataSource={DATA.otherRows.map((row) => ({ ...row, key: row.name }))}
            rowKey="key"
            size="small"
            bordered
            pagination={false}
          />
        </section>
        <section>
          <h4 className={styles.heading}>常用异常战技</h4>
          <Table
            columns={skillColumns}
            dataSource={DATA.skillRows.map((row) => ({ ...row, key: row.name }))}
            rowKey="key"
            size="small"
            bordered
            pagination={false}
          />
        </section>
      </div>

      <div className={styles.source}>
        资料整理：{DATA.meta.author}《{DATA.meta.title}》；{DATA.meta.note}
      </div>
    </div>
  );
};

export default AilmentView;
