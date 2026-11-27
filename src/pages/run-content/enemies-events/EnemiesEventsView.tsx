import { lazy, Suspense } from 'react';
import { Spin } from 'antd';
import type { PageTabProps } from '../../../config/navigationConfig';
import RunContentTabs from '../RunContentTabs';
import EnemyRaceSection from './EnemyRaceSection';
import WildBossSection from './WildBossSection';

const SpecialEventsSection = lazy(() => import('./SpecialEventsSection'));

const EnemiesEventsView = (props: PageTabProps) => (
  <RunContentTabs
    {...props}
    items={[
      { key: 'wild-boss-data', label: '☠️ 野生Boss数据', children: <WildBossSection /> },
      {
        key: 'enemy-race-data',
        label: '🧬 敌人种族说明',
        children: (
          <div id="enemy-race-data">
            <EnemyRaceSection />
          </div>
        ),
      },
      {
        key: 'special-events',
        label: '🌋 特殊事件及地形效果',
        children: (
          <div id="special-events">
            <Suspense fallback={<Spin style={{ display: 'block', margin: '50px auto' }} />}>
              <SpecialEventsSection active={props.activeSubTab === 'special-events'} />
            </Suspense>
          </div>
        ),
      },
    ]}
  />
);

export default EnemiesEventsView;
