// 夜王Boss数据页的表格列定义（无状态依赖的部分）。
// 只依赖 data.ts 中的静态数据/纯函数与 CSS Modules 样式，
// 因此可以放在模块级，不必每次渲染重建。

import { Image, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { CharacterData, EntryData, WildBossData } from '../../types';
import styles from '../../styles/bossDataView.module.css';
import standardDamage from '../../assets/Negations/standard-damage-damage-type-elden-ring-nightreign-wiki-guide.png';
import slashDamage from '../../assets/Negations/slash-damage-damage-type-elden-ring-nightreign-wiki-guide.png';
import strikeDamage from '../../assets/Negations/strike-damage-damage-type-elden-ring-nightreign-wiki-guide.png';
import pierceDamage from '../../assets/Negations/pierce-damage-damage-type-elden-ring-nightreign-wiki-guide.png';
import magicDamage from '../../assets/Negations/magic-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import fireDamage from '../../assets/Negations/fire-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import lightningDamage from '../../assets/Negations/lightning-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import holyDamage from '../../assets/Negations/holy-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import poisonResistance from '../../assets/Resistances/poison-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import scarletRotResistance from '../../assets/Resistances/scarlet-rot-status-effect-elden-ring-nightreing-wiki-guide-100px.png';
import bleedResistance from '../../assets/Resistances/hemorrhage-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import frostResistance from '../../assets/Resistances/frostbite-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import {
  getAbsorptionClass,
  getResistanceClass,
  getLocationColor,
  getTypeColor,
  processSinnerData,
  type LipulaTrade,
  type SinnerData,
} from './data';

export const sinnerColumns: ColumnsType<SinnerData> = [
  {
    title: '角色名称',
    dataIndex: 'characterName',
    key: 'characterName',
    width: 100,
    align: 'center',
    fixed: 'left',
    render: (text) => <strong>{text}</strong>,
    onCell: (record) => {
      const currentIndex = processSinnerData().findIndex(
        (item) => item.characterName === record.characterName && item.buildIndex === record.buildIndex,
      );

      // 计算相同角色的行数
      let rowSpan = 1;
      const allData = processSinnerData();
      for (let i = currentIndex + 1; i < allData.length; i++) {
        if (allData[i].characterName === record.characterName) {
          rowSpan++;
        } else {
          break;
        }
      }

      // 如果是相同角色的第一行，设置rowSpan
      if (currentIndex === 0 || allData[currentIndex - 1]?.characterName !== record.characterName) {
        return { rowSpan };
      }

      // 否则隐藏单元格
      return { rowSpan: 0 };
    },
  },
  {
    title: '配置',
    dataIndex: 'buildIndex',
    key: 'buildIndex',
    width: 60,
    align: 'center',
    render: (text) => `配置${text}`,
  },
  {
    title: '左手装备',
    dataIndex: 'leftHand',
    key: 'leftHand',
    width: 200,
    align: 'center',
  },
  {
    title: '右手装备',
    dataIndex: 'rightHand',
    key: 'rightHand',
    width: 200,
    align: 'center',
  },
  {
    title: '消耗品',
    dataIndex: 'consumable',
    key: 'consumable',
    width: 120,
    align: 'center',
  },
];

export const wildBossColumns: ColumnsType<WildBossData> = [
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
      <span className={styles.locationTag}>
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
          <div className={styles.damageTypeContainer}>
            <Image src={standardDamage} alt="普通" width={18} height={18} preview={false} />
            <span>普通</span>
          </div>
        ),
        dataIndex: 'normal',
        key: 'normal',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.damageTypeContainer}>
            <Image src={strikeDamage} alt="打击" width={18} height={18} preview={false} />
            <span>打击</span>
          </div>
        ),
        dataIndex: 'strike',
        key: 'strike',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.damageTypeContainer}>
            <Image src={slashDamage} alt="斩击" width={18} height={18} preview={false} />
            <span>斩击</span>
          </div>
        ),
        dataIndex: 'slash',
        key: 'slash',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.damageTypeContainer}>
            <Image src={pierceDamage} alt="突刺" width={18} height={18} preview={false} />
            <span>突刺</span>
          </div>
        ),
        dataIndex: 'pierce',
        key: 'pierce',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
    ],
  },
  {
    title: '属性类别',
    width: 240,
    children: [
      {
        title: (
          <div className={styles.damageTypeContainer}>
            <Image src={magicDamage} alt="魔力" width={18} height={18} preview={false} />
            <span>魔力</span>
          </div>
        ),
        dataIndex: 'magic',
        key: 'magic',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.damageTypeContainer}>
            <Image src={fireDamage} alt="火焰" width={18} height={18} preview={false} />
            <span>火焰</span>
          </div>
        ),
        dataIndex: 'fire',
        key: 'fire',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.damageTypeContainer}>
            <Image src={lightningDamage} alt="雷电" width={18} height={18} preview={false} />
            <span>雷电</span>
          </div>
        ),
        dataIndex: 'lightning',
        key: 'lightning',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.damageTypeContainer}>
            <Image src={holyDamage} alt="神圣" width={18} height={18} preview={false} />
            <span>神圣</span>
          </div>
        ),
        dataIndex: 'holy',
        key: 'holy',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
    ],
  },
  {
    title: '抗性',
    children: [
      {
        title: (
          <div className={styles.resistanceTypeContainer}>
            <Image src={bleedResistance} alt="出血" width={18} height={18} preview={false} />
            <span>出血</span>
          </div>
        ),
        dataIndex: 'bleed',
        key: 'bleed',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getResistanceClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.resistanceTypeContainer}>
            <Image src={poisonResistance} alt="中毒" width={18} height={18} preview={false} />
            <span>中毒</span>
          </div>
        ),
        dataIndex: 'poison',
        key: 'poison',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getResistanceClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.resistanceTypeContainer}>
            <Image src={scarletRotResistance} alt="腐败" width={18} height={18} preview={false} />
            <span>腐败</span>
          </div>
        ),
        dataIndex: 'scarletRot',
        key: 'scarletRot',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getResistanceClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.resistanceTypeContainer}>
            <Image src={frostResistance} alt="冻伤" width={18} height={18} preview={false} />
            <span>冻伤</span>
          </div>
        ),
        dataIndex: 'frost',
        key: 'frost',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getResistanceClass(value)}`}>{value}</span>,
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

export const characterColumns: ColumnsType<CharacterData> = [
  {
    title: '人物名称',
    dataIndex: 'name',
    key: 'name',
    width: 120,
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
      <span className={styles.locationTag}>
        {text ? (
          <Tag color={getLocationColor(text)} style={{ marginInlineEnd: 2 }}>
            {text}
          </Tag>
        ) : null}
      </span>
    ),
  },
  {
    title: '攻击类别',
    children: [
      {
        title: (
          <div className={styles.damageTypeContainer}>
            <Image src={standardDamage} alt="普通" width={18} height={18} preview={false} />
            <span>普通</span>
          </div>
        ),
        dataIndex: 'normal',
        key: 'normal',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.damageTypeContainer}>
            <Image src={strikeDamage} alt="打击" width={18} height={18} preview={false} />
            <span>打击</span>
          </div>
        ),
        dataIndex: 'strike',
        key: 'strike',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.damageTypeContainer}>
            <Image src={slashDamage} alt="斩击" width={18} height={18} preview={false} />
            <span>斩击</span>
          </div>
        ),
        dataIndex: 'slash',
        key: 'slash',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.damageTypeContainer}>
            <Image src={pierceDamage} alt="突刺" width={18} height={18} preview={false} />
            <span>突刺</span>
          </div>
        ),
        dataIndex: 'pierce',
        key: 'pierce',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
    ],
  },
  {
    title: '属性类别',
    width: 240,
    children: [
      {
        title: (
          <div className={styles.damageTypeContainer}>
            <Image src={magicDamage} alt="魔力" width={18} height={18} preview={false} />
            <span>魔力</span>
          </div>
        ),
        dataIndex: 'magic',
        key: 'magic',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.damageTypeContainer}>
            <Image src={fireDamage} alt="火焰" width={18} height={18} preview={false} />
            <span>火焰</span>
          </div>
        ),
        dataIndex: 'fire',
        key: 'fire',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.damageTypeContainer}>
            <Image src={lightningDamage} alt="雷电" width={18} height={18} preview={false} />
            <span>雷电</span>
          </div>
        ),
        dataIndex: 'lightning',
        key: 'lightning',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.damageTypeContainer}>
            <Image src={holyDamage} alt="神圣" width={18} height={18} preview={false} />
            <span>神圣</span>
          </div>
        ),
        dataIndex: 'holy',
        key: 'holy',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
      },
    ],
  },
  {
    title: '抗性',
    children: [
      {
        title: (
          <div className={styles.resistanceTypeContainer}>
            <Image src={bleedResistance} alt="出血" width={18} height={18} preview={false} />
            <span>出血</span>
          </div>
        ),
        dataIndex: 'bleed',
        key: 'bleed',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getResistanceClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.resistanceTypeContainer}>
            <Image src={poisonResistance} alt="中毒" width={18} height={18} preview={false} />
            <span>中毒</span>
          </div>
        ),
        dataIndex: 'poison',
        key: 'poison',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getResistanceClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.resistanceTypeContainer}>
            <Image src={scarletRotResistance} alt="腐败" width={18} height={18} preview={false} />
            <span>腐败</span>
          </div>
        ),
        dataIndex: 'scarletRot',
        key: 'scarletRot',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getResistanceClass(value)}`}>{value}</span>,
      },
      {
        title: (
          <div className={styles.resistanceTypeContainer}>
            <Image src={frostResistance} alt="冻伤" width={18} height={18} preview={false} />
            <span>冻伤</span>
          </div>
        ),
        dataIndex: 'frost',
        key: 'frost',
        width: 60,
        align: 'center',
        render: (value) => <span className={`${styles.resistanceValue} ${getResistanceClass(value)}`}>{value}</span>,
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

export const lipulaColumns: ColumnsType<LipulaTrade> = [
  {
    title: '利普拉的交易',
    dataIndex: 'desire',
    key: 'desire',
    width: 220,
    align: 'center',
    render: (text) => <strong>{text}</strong>,
    fixed: 'left',
  },
  {
    title: '效果',
    dataIndex: 'effect',
    key: 'effect',
    align: 'left',
    render: (text, record) => (
      <div>
        <div>{text}</div>
        {record.stats && (
          <div style={{ marginTop: 4 }}>
            角色15级时加点示例：血量 {record.stats.hp}｜专注 {record.stats.fp}｜耐力 {record.stats.stamina}｜力气{' '}
            {record.stats.str}｜敏捷 {record.stats.dex}｜智力 {record.stats.intl}｜信仰 {record.stats.fth}｜感应{' '}
            {record.stats.arc}
          </div>
        )}
      </div>
    ),
  },
];

export const specialEventColumns: ColumnsType<EntryData> = [
  {
    title: 'ID',
    dataIndex: 'entry_id',
    key: 'entry_id',
    width: '8%',
    align: 'center',
    onCell: () => ({
      style: { fontSize: '11px', color: 'var(--theme-text-secondary)' },
    }),
    sorter: (a, b) => {
      const idA = a.entry_id || '';
      const idB = b.entry_id || '';
      return idA.localeCompare(idB);
    },
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '类型',
    dataIndex: 'entry_type',
    key: 'entry_type',
    align: 'center',
    width: '15%',
    render: (text) => (text ? <Tag color={getTypeColor(text)}>{text}</Tag> : '-'),
    sorter: (a, b) => {
      const typeA = a.entry_type || '';
      const typeB = b.entry_type || '';
      return typeA.localeCompare(typeB, 'zh-CN');
    },
    sortDirections: ['ascend', 'descend'],
  },
  {
    title: '效果名称',
    dataIndex: 'entry_name',
    key: 'entry_name',
    width: '20%',
  },
  {
    title: '效果描述',
    dataIndex: 'explanation',
    key: 'explanation',
    width: '55%',
    // 数据里用 \n 分行（如「地底神殿的恩惠」），要 pre-wrap 才会真的换行
    render: (text) => <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text || '-'}</span>,
  },
];
