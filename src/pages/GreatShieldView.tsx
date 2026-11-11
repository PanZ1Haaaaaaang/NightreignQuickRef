import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import shieldData from '../data/zh-CN/great_shield_data.json';
import mechanicJson from '../data/zh-CN/guard_mechanic_data.json';
import type { GuardMechanicData } from '../types';
import styles from '../styles/greatShieldView.module.css';
import magicIcon from '../assets/Negations/magic-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import fireIcon from '../assets/Negations/fire-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import lightningIcon from '../assets/Negations/lightning-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import holyIcon from '../assets/Negations/holy-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import guardianIcon from '../assets/icons/char/Guardian.svg';

// 守护者（渡夜者）的被动是「开启强防御」，所以这面盾对玩守护者的玩家最常用，单独做轻标注
const GUARDIAN_SHIELD = '守护者的大盾';

// 防御强度机制（数据见 src/data/zh-CN/guard_mechanic_data.json）
const MECHANIC = mechanicJson as unknown as GuardMechanicData;

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

// 盾牌截图：目录里的文件名与盾名一一对应，用 glob 一次性拿到 URL（图片本体仍走懒加载）
const SHIELD_IMAGES = import.meta.glob<string>('../assets/Shields/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

const shieldImageOf = (name: string): string | undefined => SHIELD_IMAGES[`../assets/Shields/${name}.png`];

/**
 * 盾牌缩略图：进入视口（提前 200px）才真正设置 src，
 * 29 面盾一屏渲染时不会一次性把全部图片拉下来；占位块保持行高不跳动。
 */
const ShieldThumb: React.FC<{ name: string }> = ({ name }) => {
  const src = shieldImageOf(name);
  const holderRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder || !src) return;

    // 老浏览器 / 无 IntersectionObserver 时直接加载
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );
    observer.observe(holder);

    return () => observer.disconnect();
  }, [src]);

  if (!src) return null;

  return (
    <div ref={holderRef} className={styles.shieldThumb}>
      {visible && (
        <img
          src={src}
          alt={name}
          width={40}
          height={40}
          loading="lazy"
          decoding="async"
          className={styles.shieldImage}
        />
      )}
    </div>
  );
};

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
      key: 'image',
      width: 72,
      align: 'center',
      render: (_: unknown, record: ShieldRow) => <ShieldThumb name={record.name} />,
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
          <p className={styles.mechIntro}>{MECHANIC.intro}</p>
          <ul className={styles.mechTypes}>
            {MECHANIC.types.map((item) => (
              <li key={item.key}>
                <b>{item.key}</b>
                {item.desc}
              </li>
            ))}
          </ul>

          <table className={styles.mechTable}>
            <thead>
              <tr>
                <th>来源</th>
                <th>类型</th>
                <th>效果</th>
              </tr>
            </thead>
            <tbody>
              {MECHANIC.entries.map((entry) => (
                <tr key={entry.name} className={entry.source === '解包' ? undefined : styles.mechUnverified}>
                  <td className={styles.mechName}>
                    {entry.name}
                    {entry.source === '解包' ? null : <span className={styles.sourceTag}>{entry.source}</span>}
                  </td>
                  <td className={styles.mechType}>{entry.type}</td>
                  <td>{entry.effect}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 className={styles.mechSubtitle}>强化系数（防御强度 × 系数）</h4>
          <table className={styles.upgradeTable}>
            <thead>
              <tr>
                {MECHANIC.upgrade.columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MECHANIC.upgrade.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, index) => (
                    <td key={index} className={index === 0 ? styles.upgradeName : undefined}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.note}>{MECHANIC.upgrade.note}</div>
          <ul className={styles.mechNotes}>
            {MECHANIC.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <div className={styles.note}>{MECHANIC.meta.source}</div>
        </section>
      </div>
    </div>
  );
};

export default GreatShieldView;
