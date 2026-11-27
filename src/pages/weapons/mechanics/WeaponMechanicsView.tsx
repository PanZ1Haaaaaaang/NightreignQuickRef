import type React from 'react';
import { Tabs } from 'antd';
import PageShell from '@/components/common/PageShell';
import type { PageTabProps } from '@/config/navigationConfig';
import GreatShieldView from './GreatShieldView';
import AilmentView from './AilmentView';
import WeaponScalingView from './WeaponScalingView';
import BlackFlameView from './BlackFlameView';
import InstantDeathView from './InstantDeathView';

const WeaponMechanicsView: React.FC<PageTabProps> = ({ activeSubTab, onSubTabChange }) => {
  return (
    <PageShell>
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
    </PageShell>
  );
};

export default WeaponMechanicsView;
