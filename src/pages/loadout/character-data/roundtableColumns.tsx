import { Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import CharacterAvatar from '../../../components/common/CharacterAvatar';
import DamageTypeIcon from '../../../components/common/DamageTypeIcon';
import StatusIcon from '../../../components/common/StatusIcon';
import {
  getAbsorptionClass,
  getLocationColor,
  getResistanceClass,
} from '../../../components/common/combatTablePresentation';
import styles from '../../../components/common/combatTable.module.css';
import type { CharacterData } from '../../../types';

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
