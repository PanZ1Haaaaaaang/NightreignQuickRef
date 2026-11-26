// 夜王Boss数据页的表格列定义（无状态依赖的部分）。
// 只依赖 data.ts 中的静态数据/纯函数与 CSS Modules 样式，
// 因此可以放在模块级，不必每次渲染重建。

import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import DamageTypeIcon from '../../components/common/DamageTypeIcon';
import StatusIcon from '../../components/common/StatusIcon';
import CharacterAvatar from '../../components/common/CharacterAvatar';
import type { CharacterData, EntryData, WildBossData } from '../../types';
import styles from '../../styles/bossDataView.module.css';
import {
  getAbsorptionClass,
  getResistanceClass,
  getLocationColor,
  getTypeColor,
  processSinnerData,
  type LipulaTrade,
  type LipulaBuff,
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
    render: (name: string) => (
      <strong>
        <CharacterAvatar name={name} size={18} />
      </strong>
    ),
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
            <DamageTypeIcon type="standard" />
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
            <DamageTypeIcon type="strike" />
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
            <DamageTypeIcon type="slash" />
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
            <DamageTypeIcon type="pierce" />
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
            <DamageTypeIcon type="magic" />
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
            <DamageTypeIcon type="fire" />
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
            <DamageTypeIcon type="lightning" />
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
            <DamageTypeIcon type="holy" />
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
            <StatusIcon status="bleed" />
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
            <StatusIcon status="poison" />
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
            <StatusIcon status="scarletRot" />
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
            <StatusIcon status="frostbite" />
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
    render: (name: string) => (
      <strong>
        <CharacterAvatar name={name} size={18} />
      </strong>
    ),
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
            <DamageTypeIcon type="standard" />
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
            <DamageTypeIcon type="strike" />
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
            <DamageTypeIcon type="slash" />
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
            <DamageTypeIcon type="pierce" />
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
            <DamageTypeIcon type="magic" />
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
            <DamageTypeIcon type="fire" />
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
            <DamageTypeIcon type="lightning" />
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
            <DamageTypeIcon type="holy" />
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
            <StatusIcon status="bleed" />
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
            <StatusIcon status="poison" />
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
            <StatusIcon status="scarletRot" />
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
            <StatusIcon status="frostbite" />
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
    render: (text: string, record) => (
      <div>
        <div>{text}</div>
        {record.stats ? (
          <div className={styles.lipulaStatsBlock}>
            <div className={styles.lipulaStatsLabel}>15 级属性示例</div>
            <div className={styles.lipulaStats}>
              {[
                ['血量', record.stats.hp],
                ['专注', record.stats.fp],
                ['耐力', record.stats.stamina],
                ['力气', record.stats.str],
                ['敏捷', record.stats.dex],
                ['智力', record.stats.intl],
                ['信仰', record.stats.fth],
                ['感应', record.stats.arc],
              ].map(([label, value]) => (
                <span className={styles.lipulaStat} key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    ),
  },
  {
    title: 'Buff / 具体数值',
    dataIndex: 'buff',
    key: 'buff',
    width: 360,
    render: (buff?: LipulaBuff) =>
      buff ? (
        <div className={styles.lipulaBuff}>
          <Tag color="purple">{buff.name}</Tag>
          <ul className={styles.lipulaBuffEffects}>
            {buff.effects.map((effect) => (
              <li key={effect}>{effect}</li>
            ))}
          </ul>
        </div>
      ) : (
        <span className={styles.emptyCell}>—</span>
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
