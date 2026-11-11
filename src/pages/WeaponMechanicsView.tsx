import React, { useEffect, useState } from 'react';
import { Tabs } from 'antd';
import GreatShieldView from './GreatShieldView';
import ImpulseView from './ImpulseView';
import styles from '../styles/weaponMechanicsView.module.css';

const TAB_KEYS = ['mechanics-shield', 'mechanics-impulse'];

/**
 * 「武器 → 机制」页：把大盾与防御强度、冲击力两个机制放在同一个页签容器里，
 * 顶部导航仍然只占一个位置（否则武器组会多出一格、换行）。
 */
const WeaponMechanicsView: React.FC<{ activeSubTab?: string }> = ({ activeSubTab }) => {
  const [tab, setTab] = useState(activeSubTab && TAB_KEYS.includes(activeSubTab) ? activeSubTab : 'mechanics-shield');

  useEffect(() => {
    if (activeSubTab && TAB_KEYS.includes(activeSubTab)) setTab(activeSubTab);
  }, [activeSubTab]);

  return (
    <div className={styles.page}>
      <Tabs
        type="card"
        activeKey={tab}
        onChange={setTab}
        destroyOnHidden={false}
        items={[
          {
            key: 'mechanics-shield',
            label: '🛡️ 大盾与防御强度机制',
            children: <GreatShieldView />,
          },
          {
            key: 'mechanics-impulse',
            label: '💥 冲击力机制',
            children: <ImpulseView />,
          },
        ]}
      />
    </div>
  );
};

export default WeaponMechanicsView;
