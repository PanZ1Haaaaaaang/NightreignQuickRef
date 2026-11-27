import { useMemo, useState } from 'react';
import { Segmented, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import CharacterStatLabel from '@/components/common/CharacterStatLabel';
import lipulaTradesJson from '@/data/zh-CN/lipula-trades.json';
import { getLipulaOption } from '@/features/nightfarers/lipula';
import type { NightfarerStats } from '@/types';
import styles from './lipula.module.css';

const ABILITY_ORDER = ['生命', '集中', '耐力', '力气', '灵巧', '智力', '信仰', '感应'] as const;

interface LipulaBuff {
  name: string;
  effects: string[];
}

interface LipulaTrade {
  key: string;
  desire: string;
  effect: string;
  stats?: NightfarerStats;
  buff?: LipulaBuff;
}

interface LipulaScenario {
  key: string;
  label: string;
  summary: string;
  tradeKeys: string[];
}

const lipulaTradesData = lipulaTradesJson.trades as LipulaTrade[];
const lipulaNotes = lipulaTradesJson.notes;
const lipulaScenarios = lipulaTradesJson.scenarios as LipulaScenario[];

const lipulaColumns: ColumnsType<LipulaTrade> = [
  {
    title: '利普拉的交易',
    dataIndex: 'desire',
    key: 'desire',
    width: 220,
    align: 'center',
    render: (text) => <strong>{text}</strong>,
    fixed: 'left',
  },
  {
    title: '效果',
    dataIndex: 'effect',
    key: 'effect',
    align: 'left',
    render: (text: string, record) => (
      <div>
        <div>{text}</div>
        {record.stats ? (
          <div className={styles.lipulaStatsBlock}>
            <div className={styles.lipulaStatsLabel}>15 级能力点示例</div>
            <div className={styles.lipulaStats}>
              {ABILITY_ORDER.map((stat) => (
                <span className={styles.lipulaStat} key={stat}>
                  <CharacterStatLabel stat={stat} />
                  <strong>{record.stats?.[stat] ?? 0}</strong>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    ),
  },
  {
    title: 'Buff / 具体数值',
    dataIndex: 'buff',
    key: 'buff',
    width: 360,
    render: (buff?: LipulaBuff) =>
      buff ? (
        <div className={styles.lipulaBuff}>
          <Tag color="purple">{buff.name}</Tag>
          <ul className={styles.lipulaBuffEffects}>
            {buff.effects.map((effect) => (
              <li key={effect}>{effect}</li>
            ))}
          </ul>
        </div>
      ) : (
        <span className={styles.emptyCell}>—</span>
      ),
  },
];

const tradeByKey = new Map(lipulaTradesData.map((trade) => [trade.key, trade]));

const LipulaTrades: React.FC = () => {
  const [scenarioKey, setScenarioKey] = useState(lipulaScenarios[2]?.key ?? 'boss');
  const scenario = lipulaScenarios.find((item) => item.key === scenarioKey) ?? lipulaScenarios[0];
  const trades = useMemo<LipulaTrade[]>(
    () =>
      (scenario?.tradeKeys ?? [])
        .map((key) => tradeByKey.get(key))
        .filter((trade): trade is LipulaTrade => Boolean(trade))
        .map((trade) => {
          const stats = getLipulaOption(trade.key)?.stats;
          return stats ? { ...trade, stats } : trade;
        }),
    [scenario],
  );

  return (
    <div id="lipula-trades">
      <div className={styles.lipulaScenarioBar}>
        <Segmented
          value={scenario?.key}
          onChange={(value) => setScenarioKey(String(value))}
          options={lipulaScenarios.map((item) => ({ label: item.label, value: item.key }))}
        />
        <span className={styles.lipulaScenarioCount}>共 {trades.length} 项</span>
      </div>
      <p className={styles.lipulaHint}>{scenario?.summary}</p>
      <Table columns={lipulaColumns} dataSource={trades} rowKey="key" pagination={false} size="small" bordered />
      <div className={styles.lipulaNotes}>
        <div className={styles.lipulaNotesTitle}>补充说明</div>
        {lipulaNotes.map((note) => (
          <div className={styles.lipulaNoteItem} key={note.title}>
            <strong>{note.title}</strong>：{note.desc}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LipulaTrades;
