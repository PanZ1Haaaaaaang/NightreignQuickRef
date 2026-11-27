import { useMemo, useState } from 'react';
import { Segmented, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import lipulaTradesJson from '../../../data/zh-CN/lipula-trades.json';
import { getLipulaOption } from '../../../features/nightfarers/lipula';
import type { NightfarerStats } from '../../../types';
import styles from './lipula.module.css';

interface LipulaStats {
  level: number; // 等级
  hp: number; // 血
  fp: number; // 蓝
  stamina: number; // 绿
  str: number; // 力
  dex: number; // 敏
  intl: number; // 智
  fth: number; // 信
  arc: number; // 感
}

interface LipulaBuff {
  name: string;
  effects: string[];
}

interface LipulaTrade {
  key: string;
  desire: string;
  effect: string;
  stats?: LipulaStats;
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
            <div className={styles.lipulaStatsLabel}>15 级属性示例</div>
            <div className={styles.lipulaStats}>
              {[
                ['血量', record.stats.hp],
                ['专注', record.stats.fp],
                ['耐力', record.stats.stamina],
                ['力气', record.stats.str],
                ['敏捷', record.stats.dex],
                ['智力', record.stats.intl],
                ['信仰', record.stats.fth],
                ['感应', record.stats.arc],
              ].map(([label, value]) => (
                <span className={styles.lipulaStat} key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
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
const toStats = (stats: NightfarerStats): LipulaStats => ({
  level: 15,
  hp: stats['生命'] ?? 0,
  fp: stats['集中'] ?? 0,
  stamina: stats['耐力'] ?? 0,
  str: stats['力气'] ?? 0,
  dex: stats['灵巧'] ?? 0,
  intl: stats['智力'] ?? 0,
  fth: stats['信仰'] ?? 0,
  arc: stats['感应'] ?? 0,
});

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
          return stats ? { ...trade, stats: toStats(stats) } : trade;
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
