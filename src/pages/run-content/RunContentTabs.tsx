import { Card, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import type { PageTabProps } from '../../config/navigationConfig';
import styles from './runContentTabs.module.css';

interface RunContentTabsProps extends PageTabProps {
  items: NonNullable<TabsProps['items']>;
}

const RunContentTabs = ({ activeSubTab, onSubTabChange, items }: RunContentTabsProps) => (
  <div className={styles.bossDataViewContainer}>
    <Card className={styles.bossCard}>
      <Tabs style={{ marginTop: '5px' }} type="card" activeKey={activeSubTab} onChange={onSubTabChange} items={items} />
    </Card>
  </div>
);

export default RunContentTabs;
