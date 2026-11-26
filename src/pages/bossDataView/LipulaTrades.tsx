import { useMemo, useState } from 'react';
import { Segmented, Table } from 'antd';
import { lipulaColumns } from './columns';
import { lipulaNotes, lipulaScenarios, lipulaTradesData } from './data';
import type { LipulaStats, LipulaTrade } from './data';
import { getLipulaOption } from '../../features/nightfarers/lipula';
import type { NightfarerStats } from '../../types';
import styles from '../../styles/bossDataView.module.css';

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
