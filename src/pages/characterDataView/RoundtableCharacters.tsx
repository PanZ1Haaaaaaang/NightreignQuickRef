import React, { useMemo, useState } from 'react';
import { Table, Input, Select, Button, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import characterData from '../../data/character-info/character_data.json';
import { getLocationColor } from '../bossDataView/data';
import { characterColumns } from '../bossDataView/columns';
import styles from '../../styles/bossDataView.module.css';

/**
 * 圆桌厅堂人物数据：渡夜者与友方 NPC 的吸收值 / 抗性（异常耐受上限）。
 * 原先挂在「夜王Boss数据」页，按照「渡夜者就是角色」的口径挪到角色数据页。
 */
const RoundtableCharacters: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  const locationOptions = useMemo(() => {
    const locations = new Set<string>();
    characterData.forEach((character) => {
      if (character.location) locations.add(character.location.trim());
    });
    return Array.from(locations)
      .sort()
      .map((location) => ({ value: location, label: location }));
  }, []);

  const filtered = useMemo(() => {
    let rows = characterData;

    if (selectedLocations.length > 0) {
      rows = rows.filter((character) => character.location && selectedLocations.includes(character.location.trim()));
    }
    if (keyword.trim()) {
      const lower = keyword.trim().toLowerCase();
      rows = rows.filter((character) => character.name.toLowerCase().includes(lower));
    }
    return rows;
  }, [keyword, selectedLocations]);

  const locationTagRender = (props: {
    label: React.ReactNode;
    value: string;
    closable?: boolean;
    onClose?: () => void;
  }) => {
    const { label, value, closable, onClose } = props;
    const preventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };

    return (
      <Tag
        color={getLocationColor(value)}
        onMouseDown={preventMouseDown}
        closable={closable}
        onClose={onClose}
        style={{ marginInlineEnd: 2 }}
      >
        {label}
      </Tag>
    );
  };

  return (
    <div className={styles.wildBossFilterContainer}>
      <div className={styles.filterInputs}>
        <Input
          placeholder="搜索人物名称"
          prefix={<SearchOutlined />}
          style={{ width: 200 }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Select
          mode="multiple"
          placeholder="选择位置"
          options={locationOptions}
          value={selectedLocations}
          onChange={setSelectedLocations}
          tagRender={locationTagRender}
          style={{ minWidth: 200, maxWidth: 400 }}
        />
        <Button
          onClick={() => {
            setKeyword('');
            setSelectedLocations([]);
          }}
        >
          清除筛选
        </Button>
      </div>
      <Table
        columns={characterColumns}
        dataSource={filtered}
        rowKey="name"
        pagination={false}
        size="small"
        bordered
        footer={() => (
          <div className="footer-text">
            圆桌厅堂人物数据：渡夜者与友方 NPC 的吸收值和抗性（异常耐受上限）。吸收值越低，受到的对应伤害越少
          </div>
        )}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default RoundtableCharacters;
