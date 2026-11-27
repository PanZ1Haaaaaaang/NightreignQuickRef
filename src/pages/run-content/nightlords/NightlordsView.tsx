import type { PageTabProps } from '../../../config/navigationConfig';
import RunContentTabs from '../RunContentTabs';
import NightlordStats from './NightlordStats';
import WeaknessSection from './WeaknessSection';
import LipulaTrades from './LipulaTrades';
import SinnerSection from './SinnerSection';
import LipulaSkills from './LipulaSkills';

const NightlordsView = (props: PageTabProps) => (
  <RunContentTabs
    {...props}
    items={[
      { key: 'boss-data', label: '🌙 夜王基础数据', children: <NightlordStats /> },
      { key: 'weakness-data', label: '🎯 弱点累积值', children: <WeaknessSection /> },
      { key: 'lipula-trades', label: '⚖️ 利普拉的交易', children: <LipulaTrades /> },
      { key: 'sinner-data', label: '🐐 永夜利普拉召唤罪人', children: <SinnerSection /> },
      { key: 'lipula-skills', label: '💀 永夜利普拉技能', children: <LipulaSkills /> },
    ]}
  />
);

export default NightlordsView;
