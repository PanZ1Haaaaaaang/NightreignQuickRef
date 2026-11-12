import React, { useMemo, useState } from 'react';
import { Input, Segmented, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import scholarJson from '../../data/zh-CN/scholar_knowledge_data.json';
import type { ScholarCategory, ScholarItem, ScholarKnowledgeData } from '../../types';
import styles from '../../styles/scholarKnowledge.module.css';

const DATA = scholarJson as unknown as ScholarKnowledgeData;

const GOODS_IMAGES = import.meta.glob('../../assets/Goods/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const goodsImageOf = (name?: string) => (name ? GOODS_IMAGES[`../../assets/Goods/${name}.png`] : undefined);

const ScholarKnowledge: React.FC = () => {
  const [category, setCategory] = useState<string>(DATA.categories[0]?.key ?? '');
  const [keyword, setKeyword] = useState('');

  const current: ScholarCategory | undefined = useMemo(
    () => DATA.categories.find((item) => item.key === category),
    [category],
  );

  const items = useMemo(() => {
    if (!current) return [];
    const kw = keyword.trim();
    if (!kw) return current.items;
    return current.items.filter((item) => item.name.includes(kw));
  }, [current, keyword]);

  const columns: TableColumnsType<ScholarItem> = [
    {
      title: '物品',
      dataIndex: 'name',
      key: 'name',
      width: '18%',
      render: (name: string, record) => {
        const src = goodsImageOf(record.image);
        return (
          <span className={styles.itemCell}>
            <span className={styles.thumb}>
              {src ? <img src={src} alt="" /> : <span className={styles.thumbFallback}>图</span>}
            </span>
            <span className={styles.itemName}>
              {name}
              {record.usePoints ? <em className={styles.itemMeta}>{record.usePoints}</em> : null}
              {record.upgrade ? <em className={styles.itemMeta}>{record.upgrade}</em> : null}
            </span>
          </span>
        );
      },
    },
    {
      title: (
        <span>
          1 级<span className={styles.colHint}>（初始）</span>
        </span>
      ),
      dataIndex: 'lv1',
      key: 'lv1',
      width: '26%',
    },
    {
      title: (
        <span>
          2 级<span className={styles.colHint}>(12 点数)</span>
        </span>
      ),
      dataIndex: 'lv2',
      key: 'lv2',
      width: '28%',
    },
    {
      title: (
        <span>
          3 级<span className={styles.colHint}>(24 点数)</span>
        </span>
      ),
      dataIndex: 'lv3',
      key: 'lv3',
      render: (value: string) => value || <span className={styles.dash}>—</span>,
    },
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.introBox}>
        <p className={styles.introText}>能增加使用道具的携带数，并且会根据使用次数多寡，阶段性强化效果。</p>
        <p className={styles.introText}>道具会根据类别划分等级：等级 2 能强化效果；等级 3 会发动更出众的效果。</p>
      </div>

      <ul className={styles.notes}>
        {DATA.intro.slice(2).map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>

      <div className={styles.categoryBar}>
        <Segmented
          value={category}
          onChange={(value) => setCategory(String(value))}
          options={DATA.categories.map((item) => ({ label: item.name, value: item.key }))}
        />
        <Input
          allowClear
          placeholder="搜索道具名称"
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ width: 200 }}
        />
      </div>

      {current ? (
        <div className={styles.categoryMeta}>
          <Tag color="blue">{current.name}</Tag>
          <span>
            使用点数：<b>{current.usePoints}</b>
          </span>
          <span>
            升阶需求：<b>{current.upgrade}</b>
          </span>
          <span className={styles.count}>共 {current.items.length} 件</span>
        </div>
      ) : null}

      <Table
        columns={columns}
        dataSource={items}
        rowKey="name"
        size="small"
        bordered
        pagination={false}
        locale={{ emptyText: '没有匹配的道具' }}
      />

      {DATA.meta.damageNote ? <div className={styles.source}>{DATA.meta.damageNote}</div> : null}

      <div className={styles.source}>
        资料来源：
        <a href={DATA.meta.url} target="_blank" rel="noreferrer">
          {DATA.meta.source}
        </a>
        （作者：{DATA.meta.author}，版本 {DATA.meta.version}）。
      </div>
    </div>
  );
};

export default ScholarKnowledge;
