import React, { useEffect, useMemo, useState } from 'react';
import { Input, Table, Tabs, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import CustomPagination from '../components/CustomPagination';
import sorceries from '../data/zh-CN/sorceries.json';
import incantations from '../data/zh-CN/incantations.json';
import weaponArts from '../data/zh-CN/weapon_arts.json';
import uniqueWeaponArts from '../data/zh-CN/unique_weapon_arts.json';
import supportSpells from '../data/zh-CN/support_spells.json';

type Row = Record<string, string>;

const sorceryRows = sorceries as unknown as Row[];
const incantationRows = incantations as unknown as Row[];
const weaponArtRows = weaponArts as unknown as Row[];
const uniqueWeaponArtRows = uniqueWeaponArts as unknown as Row[];
const supportMagicRows = supportSpells['辅助魔法'] as unknown as Row[];
const supportIncantationRows = supportSpells['辅助祷告'] as unknown as Row[];

const TAB_KEYS = ['战技', '专用战技', '魔法', '祷告', '辅助类'];

interface DataTableProps {
  columns: ColumnsType<Row>;
  data: Row[];
  title?: string;
  searchPlaceholder: string;
  marginBottom?: number;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  title,
  searchPlaceholder,
  marginBottom = 24,
}) => {
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const filteredData = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return data;
    return data.filter(row =>
      Object.values(row).some(value => String(value).toLowerCase().includes(k))
    );
  }, [data, keyword]);

  useEffect(() => {
    setPage(1);
  }, [keyword]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pagedData = useMemo(
    () => filteredData.slice((page - 1) * pageSize, page * pageSize),
    [filteredData, page, pageSize]
  );

  return (
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
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder={searchPlaceholder}
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{ width: 280, marginBottom: 12 }}
      />
      <Table<Row>
        className="weapon-skill-magic-table"
        columns={columns}
        dataSource={pagedData}
        rowKey={(_, index) => index ?? 0}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
        pagination={false}
        locale={{ emptyText: '没有匹配的数据' }}
      />
      <CustomPagination
        currentPage={page}
        pageSize={pageSize}
        totalItems={filteredData.length}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </div>
  );
};

const textColumn = (title: string, key: string, width: number): ColumnsType<Row>[number] => ({
  title,
  dataIndex: key,
  key,
  width,
});

const spellColumns: ColumnsType<Row> = [
  textColumn('名称', '名称', 120),
  textColumn('基础威力', '基础威力', 190),
  textColumn('耗蓝', '耗蓝', 90),
  textColumn('霸体', '霸体', 90),
  textColumn('伤害类型', '伤害类型', 90),
  textColumn('加成', '加成', 90),
  textColumn('削韧', '削韧', 160),
  textColumn('备注', '备注', 320),
];

const supportColumns: ColumnsType<Row> = [
  textColumn('名称', '名称', 120),
  textColumn('效果', '效果', 480),
  textColumn('耗蓝', '耗蓝', 80),
  textColumn('持续时间', '持续时间', 100),
  textColumn('备注', '备注', 280),
];

const NOT_IMPLEMENTED = '未实装';

const categoryColorMap: Record<string, string> = {
  厚重: 'volcano', 锋利: 'cyan', 优质: 'green', 寒冷: 'blue', 无属性: 'default',
  毒: 'green', 血: 'red', 火焰: 'volcano', 焰术: 'orange', 神圣: 'gold',
  神秘: 'purple', 雷电: 'geekblue', 魔力: 'magenta',
  短剑: 'blue', 刺剑: 'blue', 重刺剑: 'blue', 直剑: 'blue', 大剑: 'blue',
  特大剑: 'blue', 轻大剑: 'blue', 刀: 'cyan', 大刀: 'cyan', 大曲剑: 'cyan',
  曲剑: 'cyan', 双头剑: 'cyan', 反手剑: 'cyan', 斧: 'volcano', 大斧: 'volcano',
  槌: 'volcano', 大槌: 'volcano', 特大武器: 'volcano', 矛: 'purple', 大矛: 'purple',
  戟: 'purple', 镰刀: 'purple', 鞭: 'purple', 连枷: 'purple', 盾: 'gold',
  火把: 'orange', 弓弩: 'geekblue', 拳头: 'green', 调香瓶: 'magenta',
};

const splitCategoryTags = (category: string, suffix: RegExp): string[] =>
  category
    .split(/[、,，/]/)
    .map(item => item.replace(suffix, '').trim())
    .filter(Boolean);

const renderCategoryTags = (tags: string[]) => (
  <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 4, whiteSpace: 'nowrap' }}>
    {tags.map(tag => (
      <Tag key={tag} color={tag === NOT_IMPLEMENTED ? 'orange' : (categoryColorMap[tag] || 'blue')}>
        {tag}
      </Tag>
    ))}
  </div>
);

const renderWeaponArtCategory = (_: string, record: Row) => {
  if (record['版本'] === 'DLC' || record['分类'] === 'DLC新增') {
    return renderCategoryTags([NOT_IMPLEMENTED]);
  }
  return renderCategoryTags(splitCategoryTags(record['分类'] || '', /战灰$/));
};

const renderUniqueCategory = (_: string, record: Row) => {
  const tags = splitCategoryTags(record['分类'] || '', /类$/);
  if (record['版本'] === 'DLC') {
    return renderCategoryTags([NOT_IMPLEMENTED, ...tags]);
  }
  return renderCategoryTags(tags);
};

const weaponArtColumns: ColumnsType<Row> = [
  {
    title: '分类',
    dataIndex: '分类',
    key: '分类',
    width: 150,
    render: renderWeaponArtCategory,
  },
  textColumn('战技', '战技', 140),
  textColumn('动作', '动作', 120),
  textColumn('耗蓝', '耗蓝', 80),
  textColumn('霸体', '霸体', 80),
  textColumn('类型', '类型', 64),
  textColumn('攻击倍率/基础攻击力', '攻击倍率/基础攻击力', 230),
  textColumn('削韧', '削韧', 170),
  textColumn('物理类型', '物理类型', 90),
  textColumn('伤害类型', '伤害类型', 100),
  textColumn('特殊加成', '特殊加成', 100),
  textColumn('备注', '备注', 320),
];

const uniqueWeaponArtColumns: ColumnsType<Row> = [
  {
    title: '分类',
    dataIndex: '分类',
    key: '分类',
    width: 140,
    render: renderUniqueCategory,
  },
  textColumn('武器', '武器', 130),
  textColumn('战技', '战技', 130),
  textColumn('补正', '补正', 140),
  textColumn('动作', '动作', 120),
  textColumn('耗蓝', '耗蓝', 70),
  textColumn('霸体', '霸体', 70),
  textColumn('类型', '类型', 60),
  textColumn('攻击倍率/基础攻击力', '攻击倍率/基础攻击力', 220),
  textColumn('特殊加成', '特殊加成', 100),
  textColumn('削韧', '削韧', 180),
  textColumn('伤害类型', '伤害类型', 110),
  textColumn('备注', '备注', 320),
];

interface WeaponSkillMagicViewProps {
  activeSubTab?: string;
}

const WeaponSkillMagicView: React.FC<WeaponSkillMagicViewProps> = ({ activeSubTab }) => {
  const [activeTab, setActiveTab] = useState('战技');

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
                <DataTable
                  columns={weaponArtColumns}
                  data={weaponArtRows}
                  searchPlaceholder="搜索战技 / 动作 / 分类 / 备注"
                />
              </div>
            ),
          },
          {
            key: '专用战技',
            label: '🗡️ 专用战技',
            children: (
              <div id="unique-weapon-skills">
                <DataTable
                  columns={uniqueWeaponArtColumns}
                  data={uniqueWeaponArtRows}
                  searchPlaceholder="搜索武器 / 战技 / 动作 / 备注"
                />
              </div>
            ),
          },
          {
            key: '魔法',
            label: '🔮 魔法',
            children: (
              <div id="sorceries">
                <DataTable
                  columns={spellColumns}
                  data={sorceryRows}
                  searchPlaceholder="搜索魔法 / 伤害类型 / 备注"
                />
              </div>
            ),
          },
          {
            key: '祷告',
            label: '🙏 祷告',
            children: (
              <div id="incantations">
                <DataTable
                  columns={spellColumns}
                  data={incantationRows}
                  searchPlaceholder="搜索祷告 / 伤害类型 / 备注"
                />
              </div>
            ),
          },
          {
            key: '辅助类',
            label: '✨ 辅助类',
            children: (
              <div id="support-skills">
                <DataTable
                  title="辅助魔法"
                  columns={supportColumns}
                  data={supportMagicRows}
                  searchPlaceholder="搜索辅助魔法 / 效果 / 备注"
                  marginBottom={24}
                />
                <DataTable
                  title="辅助祷告"
                  columns={supportColumns}
                  data={supportIncantationRows}
                  searchPlaceholder="搜索辅助祷告 / 效果 / 备注"
                  marginBottom={0}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default WeaponSkillMagicView;
