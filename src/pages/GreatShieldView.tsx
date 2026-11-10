import React, { useMemo } from 'react';
import { Image, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import shieldData from '../data/zh-CN/great_shield_data.json';
import styles from '../styles/greatShieldView.module.css';
import magicIcon from '../assets/Negations/magic-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import fireIcon from '../assets/Negations/fire-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import lightningIcon from '../assets/Negations/lightning-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import holyIcon from '../assets/Negations/holy-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import guardianIcon from '../assets/icons/char/Guardian.svg';

// 守护者（渡夜者）的被动是「开启强防御」，所以这面盾对玩守护者的玩家最常用，单独做轻标注
const GUARDIAN_SHIELD = '守护者的大盾';

interface ShieldRow {
  name: string;
  guard: number;
  magic: number;
  fire: number;
  lightning: number;
  holy: number;
}

type NumberKey = Exclude<keyof ShieldRow, 'name'>;

const NUMBER_KEYS: NumberKey[] = ['guard', 'magic', 'fire', 'lightning', 'holy'];

interface NumberColumn {
  key: NumberKey;
  title: string;
  // 表头图标：四系抗性用 Negations 里对应的属性图标
  icon?: string;
  defaultSortOrder?: 'ascend' | 'descend';
}

// 五个数值列都可排序，默认按防御强度降序
const NUMBER_COLUMNS: NumberColumn[] = [
  { key: 'guard', title: '防御强度' },
  { key: 'magic', title: '魔力抗性', icon: magicIcon },
  { key: 'fire', title: '火焰抗性', icon: fireIcon },
  { key: 'lightning', title: '雷电抗性', icon: lightningIcon },
  { key: 'holy', title: '神圣抗性', icon: holyIcon },
];

/**
 * 大盾页面：左侧数值表（图片列先留空，后续补图），右侧「防御强度机制」占位。
 */
const GreatShieldView: React.FC = () => {
  const dataSource = useMemo(() => shieldData as ShieldRow[], []);

  // 每列的极值：最高亮绿、最低标红（这几列都是数值越高越好）
  const bounds = useMemo(() => {
    const result = {} as Record<NumberKey, { min: number; max: number }>;
    NUMBER_KEYS.forEach((key) => {
      const values = dataSource.map((row) => row[key]);
      result[key] = { min: Math.min(...values), max: Math.max(...values) };
    });
    return result;
  }, [dataSource]);

  const columns: TableColumnsType<ShieldRow> = [
    {
      title: '图片',
      dataIndex: 'name',
      key: 'image',
      width: 64,
      align: 'center',
      // 图片列暂时留空，后续补截图
      render: () => null,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 160,
      align: 'left',
      render: (name: string) =>
        name === GUARDIAN_SHIELD ? (
          <span className={styles.nameWithIcon}>
            <img src={guardianIcon} alt="" width={18} height={18} className={styles.nameIcon} />
            <span>{name}</span>
          </span>
        ) : (
          name
        ),
    },
    ...NUMBER_COLUMNS.map((column) => ({
      title: column.icon ? (
        <span className={styles.columnHeader}>
          <Image src={column.icon} alt={column.title} width={18} height={18} preview={false} />
          <span>{column.title}</span>
        </span>
      ) : (
        column.title
      ),
      dataIndex: column.key,
      key: column.key,
      width: 96,
      align: 'center' as const,
      defaultSortOrder: column.defaultSortOrder,
      // 数值列第一下点击先看高的
      sortDirections: ['descend', 'ascend'] as Array<'descend' | 'ascend'>,
      sorter: (a: ShieldRow, b: ShieldRow) => a[column.key] - b[column.key],
      render: (value: number) => {
        const { min, max } = bounds[column.key];
        const extremeClass = value === max ? styles.valueMax : value === min ? styles.valueMin : '';
        return <span className={`${styles.value} ${extremeClass}`}>{value}</span>;
      },
    })),
  ];

  return (
    <div className={styles.page}>
      <div className={styles.layout}>
        <section className={styles.card} id="shield-values">
          <h3 className={styles.cardTitle}>
            <span aria-hidden="true">📊</span>
            数值
          </h3>
          <Table<ShieldRow>
            columns={columns}
            dataSource={dataSource}
            rowKey="name"
            size="small"
            bordered
            pagination={false}
            scroll={{ x: 640 }}
            rowClassName={(record) => (record.name === GUARDIAN_SHIELD ? styles.guardianRow : '')}
          />
          <div className={styles.note}>数据来源：b站-模组工艺。</div>
        </section>

        <section className={styles.card} id="shield-mechanics">
          <h3 className={styles.cardTitle}>
            <span aria-hidden="true">🛡️</span>
            防御强度机制
          </h3>
          <div className={styles.placeholder}>资料整理中，后续补充</div>
        </section>
      </div>
    </div>
  );
};

export default GreatShieldView;
