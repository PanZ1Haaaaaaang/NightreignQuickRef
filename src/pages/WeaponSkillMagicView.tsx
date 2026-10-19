import React, { useEffect, useState } from 'react';
import { Table, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';

// 占位行类型：列名与列数量待定，先只放一个名称列
interface PlaceholderRow {
  key: string;
  name: string;
}

const placeholderColumns: ColumnsType<PlaceholderRow> = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 240,
  },
];

const emptyData: PlaceholderRow[] = [];

const TAB_KEYS = ['战技', '专用战技', '魔法', '祷告', '辅助类'];

interface WeaponSkillMagicViewProps {
  activeSubTab?: string;
}

const PlaceholderTable: React.FC<{ title?: string; marginBottom?: number }> = ({ title, marginBottom = 24 }) => (
  <div style={{ marginBottom }}>
    {title && (
      <div
        style={{
          margin: '8px 0 12px',
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--color-text-1)',
        }}
      >
        {title}
      </div>
    )}
    <Table<PlaceholderRow>
      columns={placeholderColumns}
      dataSource={emptyData}
      pagination={false}
      size="small"
      bordered
      locale={{ emptyText: '数据待补充（列名与列数量待定）' }}
    />
  </div>
);

const WeaponSkillMagicView: React.FC<WeaponSkillMagicViewProps> = ({ activeSubTab }) => {
  const [activeTab, setActiveTab] = useState('战技');

  // FunctionMenu 的子项通过 activeSubTab 一次性传入，随后由用户手动切换
  useEffect(() => {
    if (activeSubTab && TAB_KEYS.includes(activeSubTab)) {
      setActiveTab(activeSubTab);
    }
  }, [activeSubTab]);

  return (
    <div className="content-wrapper">
      <Tabs
        type="card"
        style={{ marginTop: '20px' }}
        activeKey={activeTab}
        onChange={setActiveTab}
        className="custom-tabs"
        items={[
          {
            key: '战技',
            label: '⚔️ 战技',
            children: (
              <div id="weapon-skills">
                <PlaceholderTable />
              </div>
            ),
          },
          {
            key: '专用战技',
            label: '🗡️ 专用战技',
            children: (
              <div id="unique-weapon-skills">
                <PlaceholderTable />
              </div>
            ),
          },
          {
            key: '魔法',
            label: '🔮 魔法',
            children: (
              <div id="sorceries">
                <PlaceholderTable />
              </div>
            ),
          },
          {
            key: '祷告',
            label: '🙏 祷告',
            children: (
              <div id="incantations">
                <PlaceholderTable />
              </div>
            ),
          },
          {
            key: '辅助类',
            label: '✨ 辅助类',
            children: (
              <div id="support-skills">
                {/* 与「夜王基础数据」一致：上下两张表 */}
                <PlaceholderTable title="辅助魔法" marginBottom={24} />
                <PlaceholderTable title="辅助祷告" marginBottom={0} />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default WeaponSkillMagicView;
