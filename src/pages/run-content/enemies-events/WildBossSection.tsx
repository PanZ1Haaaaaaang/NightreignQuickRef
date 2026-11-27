import { useState } from 'react';
import type { MouseEvent, ReactNode } from 'react';
import { Button, Input, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { SearchOutlined } from '@ant-design/icons';
import DamageTypeIcon from '../../../components/common/DamageTypeIcon';
import StatusIcon from '../../../components/common/StatusIcon';
import {
  getAbsorptionClass,
  getLocationColor,
  getResistanceClass,
} from '../../../components/common/combatTablePresentation';
import tableStyles from '../../../components/common/combatTable.module.css';
import wildBossData from '../../../data/zh-CN/wild_boss_data.json';
import type { WildBossData } from '../../../types';

const wildBossColumns: ColumnsType<WildBossData> = [
  {
    title: 'Boss名称',
    dataIndex: 'name',
    key: 'name',
    width: 130,
    align: 'center',
    fixed: 'left',
    render: (text) => <strong>{text}</strong>,
  },
  {
    title: '位置',
    dataIndex: 'location',
    key: 'location',
    width: 90,
    align: 'center',
    render: (text) => (
      <span className={tableStyles.locationTag}>
        {text
          ? text.split('、').map((loc: string) => (
              <Tag
                key={loc}
                color={getLocationColor(loc)}
                // style={{ marginInlineEnd: 1}}
              >
                {loc}
              </Tag>
            ))
          : null}
      </span>
    ),
  },
  {
    title: '攻击类别',
    children: [
      {
        title: (
          <div className={tableStyles.damageTypeContainer}>
            <DamageTypeIcon type="standard" />
            <span>普通</span>
          </div>
        ),
        dataIndex: 'normal',
        key: 'normal',
        width: 60,
        align: 'center',
        render: (value) => (
          <span className={`${tableStyles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>
        ),
      },
      {
        title: (
          <div className={tableStyles.damageTypeContainer}>
            <DamageTypeIcon type="strike" />
            <span>打击</span>
          </div>
        ),
        dataIndex: 'strike',
        key: 'strike',
        width: 60,
        align: 'center',
        render: (value) => (
          <span className={`${tableStyles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>
        ),
      },
      {
        title: (
          <div className={tableStyles.damageTypeContainer}>
            <DamageTypeIcon type="slash" />
            <span>斩击</span>
          </div>
        ),
        dataIndex: 'slash',
        key: 'slash',
        width: 60,
        align: 'center',
        render: (value) => (
          <span className={`${tableStyles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>
        ),
      },
      {
        title: (
          <div className={tableStyles.damageTypeContainer}>
            <DamageTypeIcon type="pierce" />
            <span>突刺</span>
          </div>
        ),
        dataIndex: 'pierce',
        key: 'pierce',
        width: 60,
        align: 'center',
        render: (value) => (
          <span className={`${tableStyles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>
        ),
      },
    ],
  },
  {
    title: '属性类别',
    width: 240,
    children: [
      {
        title: (
          <div className={tableStyles.damageTypeContainer}>
            <DamageTypeIcon type="magic" />
            <span>魔力</span>
          </div>
        ),
        dataIndex: 'magic',
        key: 'magic',
        width: 60,
        align: 'center',
        render: (value) => (
          <span className={`${tableStyles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>
        ),
      },
      {
        title: (
          <div className={tableStyles.damageTypeContainer}>
            <DamageTypeIcon type="fire" />
            <span>火焰</span>
          </div>
        ),
        dataIndex: 'fire',
        key: 'fire',
        width: 60,
        align: 'center',
        render: (value) => (
          <span className={`${tableStyles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>
        ),
      },
      {
        title: (
          <div className={tableStyles.damageTypeContainer}>
            <DamageTypeIcon type="lightning" />
            <span>雷电</span>
          </div>
        ),
        dataIndex: 'lightning',
        key: 'lightning',
        width: 60,
        align: 'center',
        render: (value) => (
          <span className={`${tableStyles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>
        ),
      },
      {
        title: (
          <div className={tableStyles.damageTypeContainer}>
            <DamageTypeIcon type="holy" />
            <span>神圣</span>
          </div>
        ),
        dataIndex: 'holy',
        key: 'holy',
        width: 60,
        align: 'center',
        render: (value) => (
          <span className={`${tableStyles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>
        ),
      },
    ],
  },
  {
    title: '抗性',
    children: [
      {
        title: (
          <div className={tableStyles.resistanceTypeContainer}>
            <StatusIcon status="bleed" />
            <span>出血</span>
          </div>
        ),
        dataIndex: 'bleed',
        key: 'bleed',
        width: 60,
        align: 'center',
        render: (value) => (
          <span className={`${tableStyles.resistanceValue} ${getResistanceClass(value)}`}>{value}</span>
        ),
      },
      {
        title: (
          <div className={tableStyles.resistanceTypeContainer}>
            <StatusIcon status="poison" />
            <span>中毒</span>
          </div>
        ),
        dataIndex: 'poison',
        key: 'poison',
        width: 60,
        align: 'center',
        render: (value) => (
          <span className={`${tableStyles.resistanceValue} ${getResistanceClass(value)}`}>{value}</span>
        ),
      },
      {
        title: (
          <div className={tableStyles.resistanceTypeContainer}>
            <StatusIcon status="scarletRot" />
            <span>腐败</span>
          </div>
        ),
        dataIndex: 'scarletRot',
        key: 'scarletRot',
        width: 60,
        align: 'center',
        render: (value) => (
          <span className={`${tableStyles.resistanceValue} ${getResistanceClass(value)}`}>{value}</span>
        ),
      },
      {
        title: (
          <div className={tableStyles.resistanceTypeContainer}>
            <StatusIcon status="frostbite" />
            <span>冻伤</span>
          </div>
        ),
        dataIndex: 'frost',
        key: 'frost',
        width: 60,
        align: 'center',
        render: (value) => (
          <span className={`${tableStyles.resistanceValue} ${getResistanceClass(value)}`}>{value}</span>
        ),
      },
    ],
  },
  {
    title: '韧性',
    dataIndex: 'basePoise',
    key: 'basePoise',
    width: 60,
    align: 'center',
  },
];

const WildBossSection = () => {
  const [wildBossSearchKeyword, setWildBossSearchKeyword] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // 标签渲染函数
  const locationTagRender = (props: { label: ReactNode; value: string; closable?: boolean; onClose?: () => void }) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const color = getLocationColor(value);

    return (
      <Tag
        color={color}
        onMouseDown={onPreventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginInlineEnd: 2 }}
      >
        {label}
      </Tag>
    );
  };

  // 获取所有唯一的位置选项
  const getLocationOptions = () => {
    const locations = new Set<string>();
    wildBossData.forEach((boss) => {
      if (boss.location) {
        // 处理多个位置用、分隔的情况
        const locationList = boss.location.split('、');
        locationList.forEach((loc) => {
          locations.add(loc.trim());
        });
      }
    });

    return Array.from(locations)
      .sort()
      .map((location) => ({
        value: location,
        label: location,
      }));
  };

  // 过滤野生Boss数据
  const getFilteredWildBossData = () => {
    let filtered = wildBossData;

    // 按位置筛选
    if (selectedLocations.length > 0) {
      filtered = filtered.filter((boss) => {
        if (!boss.location) return false;
        const bossLocations = boss.location.split('、').map((loc) => loc.trim());
        return selectedLocations.some((selectedLoc) => bossLocations.includes(selectedLoc));
      });
    }

    // 按搜索关键词筛选（仅搜索Boss名称）
    if (wildBossSearchKeyword.trim()) {
      const searchLower = wildBossSearchKeyword.toLowerCase();
      filtered = filtered.filter((boss) => boss.name.toLowerCase().includes(searchLower));
    }

    return filtered;
  };

  // 清除野生Boss筛选
  const clearWildBossFilters = () => {
    setWildBossSearchKeyword('');
    setSelectedLocations([]);
  };

  const wildBossFooter = () => (
    <div className="footer-text">野生Boss数据：包含各种敌人和Boss的吸收值和抗性（异常耐受上限）数据</div>
  );

  return (
    <div className={tableStyles.filterableTable} id="wild-boss-data">
      <div className={tableStyles.filterInputs}>
        <Input
          placeholder="搜索Boss名称"
          prefix={<SearchOutlined />}
          style={{ width: 200 }}
          value={wildBossSearchKeyword}
          onChange={(e) => setWildBossSearchKeyword(e.target.value)}
        />
        <Select
          mode="multiple"
          placeholder="选择位置"
          options={getLocationOptions()}
          value={selectedLocations}
          onChange={setSelectedLocations}
          tagRender={locationTagRender}
          style={{ minWidth: 200, maxWidth: 400 }}
        />
        <Button onClick={clearWildBossFilters}>清除筛选</Button>
      </div>
      <Table
        columns={wildBossColumns}
        dataSource={getFilteredWildBossData()}
        rowKey="name"
        pagination={false}
        size="small"
        bordered
        footer={wildBossFooter}
        sticky={{ offsetHeader: 0 }}
        scroll={{ x: 1000, y: 700 }}
      />
    </div>
  );
};

export default WildBossSection;
