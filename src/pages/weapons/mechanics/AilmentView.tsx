import React, { useEffect, useState } from 'react';
import { Button, Drawer, Spin, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { LineChartOutlined, TableOutlined } from '@ant-design/icons';
import ailmentJson from '../../../data/zh-CN/ailments.json';
import type { AilmentData, AilmentEffect, AilmentWeaponRow } from '../../../types';
import { getCurrentTheme } from '../../../utils/themeUtils';
import styles from './ailmentView.module.css';
import { statusTypeIn } from '../../../assets/icons/status';
import CharacterAvatar from '../../../components/common/CharacterAvatar';
import StatusIcon from '../../../components/common/StatusIcon';
import { useNightfarerLevel15 } from '../../../features/nightfarers/useNightfarerLevel15';
import ScalingCurveChart from './ScalingCurveChart';

const DATA = ailmentJson as unknown as AilmentData;
const AILMENT_CURVES = DATA.curves.filter(({ key }) => key === 'serpent' || key === 'anomaly');

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

const getCharacterBonus = (name: string, sense: number): CharacterBonus => {
  const { threshold, maxVal, growVal } = DATA.sensing.curve;
  const raw = Math.max(0, sense - threshold) * (growVal / (maxVal - threshold));
  const bonus = Math.floor(raw);
  return { key: name, name, sense, bonus, multiplier: 1 + bonus / 100 };
};

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

const SensingBonusTable = () => {
  const snapshots = useNightfarerLevel15();
  if (!snapshots) {
    return (
      <div className={styles.drawerLoading} role="status">
        <Spin size="small" aria-hidden />
        <span>正在加载角色等级数据…</span>
      </div>
    );
  }

  const characterBonuses = [...snapshots]
    .map(([name, { stats }]) => getCharacterBonus(name, stats.感应))
    .sort((a, b) => b.sense - a.sense);

  return (
    <Table
      columns={bonusColumns}
      dataSource={characterBonuses}
      locale={{ emptyText: '暂无角色等级数据' }}
      rowKey="key"
      size="small"
      bordered
      pagination={false}
    />
  );
};

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
      <Drawer
        title="感应加成异常值"
        size={560}
        open={sensingOpen}
        onClose={() => setSensingOpen(false)}
        destroyOnHidden
      >
        <p className={styles.paragraph}>
          <strong>公式：</strong>
          {DATA.sensing.formula}
        </p>
        <p className={styles.paragraph}>
          <strong>蛇弓专用异常补正公式：</strong>
          {DATA.sensing.serpentFormula}
        </p>
        <SensingBonusTable />
        <p className={styles.drawerNote}>{DATA.sensing.note}</p>
      </Drawer>

      <Drawer title="补正曲线" size={760} open={curveOpen} onClose={() => setCurveOpen(false)}>
        <p className={styles.hint}>
          横轴为属性值，纵轴为成长值（%）；5 号曲线用于蛇弓异常补正，6 号曲线用于感应加成异常值。
        </p>
        <ScalingCurveChart curves={AILMENT_CURVES} height={360} theme={theme} />
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
