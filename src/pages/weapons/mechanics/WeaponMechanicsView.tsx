import type React from 'react';
import { Tabs } from 'antd';
import type { PageTabProps } from '../../../config/navigationConfig';
import GreatShieldView from './GreatShieldView';
import AilmentView from './AilmentView';
import WeaponScalingView from './WeaponScalingView';
import BlackFlameView from './BlackFlameView';
import InstantDeathView from './InstantDeathView';
import styles from './weaponMechanicsView.module.css';

/**
 * 「武器 → 机制」页：大盾与防御强度、黑焰烧血、即死与骤死三个机制共用页签容器，
 * 顶部导航仍然只占一个位置（否则武器组会多出一格、换行）。
 */
const WeaponMechanicsView: React.FC<PageTabProps> = ({ activeSubTab, onSubTabChange }) => {
  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <Tabs
          type="card"
          activeKey={activeSubTab}
          onChange={onSubTabChange}
          destroyOnHidden={false}
          items={[
            {
              key: 'mechanics-weapon-scaling',
              label: '⚖️ 武器补正适配度',
              children: <WeaponScalingView />,
            },
            {
              key: 'mechanics-ailment',
              label: '🧪 异常值',
              children: <AilmentView />,
            },
            {
              key: 'mechanics-shield',
              label: '🛡️ 大盾与防御强度',
              children: <GreatShieldView />,
            },
            {
              key: 'mechanics-blackflame',
              label: '🔥 黑焰烧血',
              children: <BlackFlameView />,
            },
            {
              key: 'mechanics-instant-death',
              label: '💀 即死与骤死',
              children: <InstantDeathView />,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default WeaponMechanicsView;
