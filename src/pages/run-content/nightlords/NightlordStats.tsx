import { useState } from 'react';
import { Image, Radio, Segmented, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import DamageTypeIcon from '../../../components/common/DamageTypeIcon';
import StatusIcon from '../../../components/common/StatusIcon';
import { getAbsorptionClass, getResistanceClass } from '../../../components/common/combatTablePresentation';
import tableStyles from '../../../components/common/combatTable.module.css';
import bossData from '../../../data/zh-CN/night_king_data.json';
import type { BossData } from '../../../types';
import styles from './nightlordStats.module.css';
import nightOfTheBeast from '../../../assets/BossRelics/night-of-the-beast.avif';
import darkNightOfTheBaron from '../../../assets/BossRelics/dark-night-of-the-baron.avif';
import nightOfTheWise from '../../../assets/BossRelics/night-of-the-wise.avif';
import nightOfTheChampion from '../../../assets/BossRelics/night-of-the-champion.avif';
import nightOfTheDemon from '../../../assets/BossRelics/night-of-the-demon.avif';
import nightOfTheFathom from '../../../assets/BossRelics/night-of-the-fathom.avif';
import nightOfTheMiasma from '../../../assets/BossRelics/night-of-the-miasma.avif';
import nightOfTheLord from '../../../assets/BossRelics/night-of-the-lord.avif';
import nightOfTheBalancers from '../../../assets/BossRelics/the-will-of-the-balancers.avif';
import nightOfTheDreglords from '../../../assets/BossRelics/the-night-of-dregs.avif';

const nightlordRows: BossData[] = bossData;

const NightlordStats = () => {
  const [playerCount, setPlayerCount] = useState<number>(1); // 添加人数选择状态
  const [deepNightDepth, setDeepNightDepth] = useState<number>(0); // 0=普通，1~5=深夜深度

  // 计算韧性函数
  const calculatePoise = (basePoise: number, record: BossData): number | string => {
    const poiseMultipliers = {
      1: 1, // 单人
      2: 1.82, // 双人
      3: 3.33, // 三人
    };
    const scaledPoise = basePoise * poiseMultipliers[playerCount as keyof typeof poiseMultipliers];
    if (deepNightDepth === 0) return Math.round(scaledPoise);
    const damageRate = record.deepNightPoiseDamageRate?.[deepNightDepth - 1] ?? 1;
    const dlcMultiplier = record.deepNightDlcPoiseMultiplier ?? 1;
    return (scaledPoise / damageRate / dlcMultiplier).toFixed(2);
  };

  // 计算抗性函数
  const calculateResistance = (baseResistance: number | string): number | string => {
    if (typeof baseResistance === 'string') {
      return baseResistance; // 如果是"免疫"，直接返回
    }

    const resistanceMultipliers = {
      1: 1, // 单人
      2: 2.67, // 双人
      3: 4, // 三人
    };
    return Math.round(baseResistance * resistanceMultipliers[playerCount as keyof typeof resistanceMultipliers]);
  };

  // Boss名称到图片的映射
  const bossImageMap: { [key: string]: string } = {
    '"黑夜野兽"格拉狄乌斯': nightOfTheBeast,
    '"黑夜之爵"艾德雷': darkNightOfTheBaron,
    '"黑夜之智"格诺斯塔': nightOfTheWise,
    '"坚盾"弗堤士': nightOfTheWise,
    '"超越之光"亚尼姆斯': nightOfTheWise,
    '"深海黑夜"玛利斯': nightOfTheFathom,
    征兆: nightOfTheFathom,
    '"黑夜雾霾"卡莉果': nightOfTheMiasma,
    '"黑夜王"布德奇冥': nightOfTheLord,
    '"黑夜之魔"利普拉': nightOfTheDemon,
    '"黑夜光骑士"弗格尔': nightOfTheChampion,
    黑夜轮廓: nightOfTheLord,
    '"继承英雄武器的众女孩"哈尔莫妮亚': nightOfTheBalancers,
    个体: nightOfTheBalancers,
    头领: nightOfTheBalancers,
    合体: nightOfTheBalancers,
    反叛的史柴格斯: nightOfTheDreglords,
    冲动的史柴格斯: nightOfTheDreglords,
  };

  const getDeepNightHpMultiplier = (record: BossData) => {
    if (deepNightDepth === 0) return 1;
    const depthMultiplier = record.deepNightHealthMultipliers?.[deepNightDepth - 1] ?? 1;
    const dlcMultiplier = record.deepNightDlcMultiplier ?? 1;
    return depthMultiplier * dlcMultiplier;
  };

  const defaultFooter = () => (
    <div className="footer-text">
      {deepNightDepth > 0 && <div>◦ 当前显示深度{deepNightDepth}深夜血量：DLC 夜王已乘深夜 0.8（合体安定者除外）</div>}
      <div>◦ 普通夜王血量 = 基础血量 × 玩家人数</div>
      <div>◦ 永夜王血量为倍率加成：永夜王血量 = 基础血量 × 永夜王血量加成倍率 × 玩家人数</div>
      <div>◦ 永夜王血量为独立数值：永夜王血量 = 永夜王血量 × 玩家人数</div>
      <div>◦ DLC夜王有额外血量倍率1.25 （合体安定者除外）</div>
      <div>◦ 安定者头领获得buff：攻击力+5%，韧性攻击+15%</div>
      <div>◦ 安定者永夜个体血量倍率为 1 / 1.35 / 1.7，合体血量倍率为 1 / 1.75 / 2.5</div>
      <div>◦ 安定者永夜个体每次被击杀都会永久为自身添加一层buff：属性攻击力+7%，韧性攻击+5%</div>
      <div>
        ◦ 冲动的史柴格斯抗性说明：基于反叛的史柴格斯 普通/切割/打击/突刺/魔力/雷 ×0.95、火 ×0.91、圣 ×0.92，出血
        ×2.15、冻伤 ×2.15、睡眠 ×3.96
      </div>
    </div>
  );

  const resistanceFooter = () => (
    <div className="footer-text">
      <div>
        ◦ 韧性倍率：单人100%，双人182%，三人333%｜ 普通韧性 = 基础韧性 × 韧性倍率 ｜ 永夜王韧性 = 永夜王韧性 × 韧性倍率
      </div>
      {deepNightDepth > 0 && (
        <div>◦ 深夜韧性 = 韧性 × 人数倍率 ÷ 削韧承受倍率（0.88~0.84）；DLC 夜王再 ÷1.136（合体安定者除外）</div>
      )}
      <div>◦ 抗性(异常耐受上限)倍率：单人100%，双人267%，三人400%｜ 抗性 = 基础抗性 × 抗性倍率</div>
    </div>
  );

  // 左侧表格列定义：血量 + 吸收
  const leftColumns: ColumnsType<BossData> = [
    {
      title: '图片',
      key: 'image',
      width: 42,
      align: 'center',
      render: (_, record) => {
        const imageSrc = bossImageMap[record.name];
        return imageSrc ? (
          <Image src={imageSrc} alt={record.name} width={40} height={40} className={styles.bossImage} preview={false} />
        ) : null;
      },
      onCell: (record) => {
        // 找到相同图片的下一个boss的索引
        const currentIndex = nightlordRows.findIndex((item) => item.name === record.name);
        const currentImage = bossImageMap[record.name];

        if (!currentImage) return {};

        // 计算相同图片的行数
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < nightlordRows.length; i++) {
          if (bossImageMap[nightlordRows[i].name] === currentImage) {
            rowSpan++;
          } else {
            break;
          }
        }

        // 如果是相同图片组的第一行，设置rowSpan
        if (currentIndex === 0 || bossImageMap[nightlordRows[currentIndex - 1].name] !== currentImage) {
          return { rowSpan };
        }

        // 否则隐藏单元格
        return { rowSpan: 0 };
      },
    },
    {
      title: 'Boss名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      align: 'center',
      fixed: 'left',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: `Boss血量(${playerCount}人${deepNightDepth > 0 ? `·深度${deepNightDepth}` : ''})`,
      children: [
        {
          title: '基础血量',
          dataIndex: 'baseHealth',
          key: 'baseHealth',
          width: 80,
          align: 'center',
          render: (value, record) => {
            if (typeof value === 'number') {
              // baseHealthMultiplier：会显示的额外缩放（如头领的 ×3.75）
              const rawMultiplier = record.baseHealthMultiplier;
              const factors = Array.isArray(rawMultiplier)
                ? rawMultiplier.filter((f): f is number => typeof f === 'number')
                : typeof rawMultiplier === 'number'
                  ? [rawMultiplier]
                  : [];
              // dlcMultiplier：DLC 全局缩放，只算不显示
              const dlcScale = typeof record.dlcMultiplier === 'number' ? record.dlcMultiplier : 1;
              const scale = factors.reduce((a, b) => a * b, 1) * dlcScale;
              // basePlayerMultipliers：人数倍率覆盖（默认按人数 1/2/3）
              const players =
                Array.isArray(record.basePlayerMultipliers) &&
                typeof record.basePlayerMultipliers[playerCount - 1] === 'number'
                  ? record.basePlayerMultipliers[playerCount - 1]
                  : playerCount;
              const deepNightScale = getDeepNightHpMultiplier(record);
              return (
                <span className={styles.healthBase}>
                  {Math.round(value * 3.54 * players * scale * deepNightScale).toLocaleString()}
                  {factors.length ? `(×${factors.join('×')})` : ''}
                </span>
              );
            }
            return <span className={styles.healthBase}>{value}</span>;
          },
        },
        {
          title: '永夜王血量',
          dataIndex: 'nightreignHealthMultiplier',
          key: 'nightreignHealthMultiplier',
          width: 100,
          align: 'center',
          render: (value, record) => {
            if (typeof record.nightreignHealth === 'number') {
              // 倍率为 "-" 时按 1 处理（如只存在于永夜、但不吃额外倍率的形态）；支持多因子数组
              // nightreignHealthMultiplier：永夜王倍率（为数字时一律显示，含 ×1）
              const factors = Array.isArray(value)
                ? value.filter((f): f is number => typeof f === 'number')
                : typeof value === 'number'
                  ? [value]
                  : [];
              // dlcMultiplier：DLC 全局缩放，只算不显示
              const dlcScale = typeof record.dlcMultiplier === 'number' ? record.dlcMultiplier : 1;
              const scale = factors.reduce((a, b) => a * b, 1) * dlcScale;
              // nightreignPlayerMultipliers：人数倍率覆盖（默认按人数 1/2/3）
              const players =
                Array.isArray(record.nightreignPlayerMultipliers) &&
                typeof record.nightreignPlayerMultipliers[playerCount - 1] === 'number'
                  ? record.nightreignPlayerMultipliers[playerCount - 1]
                  : playerCount;
              const deepNightScale = getDeepNightHpMultiplier(record);
              const nightreignHealth = Math.round(record.nightreignHealth * 3.54 * players * scale * deepNightScale);
              return (
                <span className={styles.healthNightreign}>
                  {nightreignHealth.toLocaleString()}
                  {factors.length ? `(×${factors.join('×')})` : ''}
                </span>
              );
            }
            // 复合写法（多 Boss 共享血条，如「4000(160, 237, 422)」）直接显示原文
            if (typeof record.nightreignHealth === 'string' && record.nightreignHealth !== '-') {
              return <span className={styles.healthNightreign}>{record.nightreignHealth}</span>;
            }
            return <span className={styles.healthNightreign}>{value}</span>;
          },
        },
      ],
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
          dataIndex: 'normalAbsorption',
          key: 'normalAbsorption',
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
          dataIndex: 'strikeAbsorption',
          key: 'strikeAbsorption',
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
          dataIndex: 'slashAbsorption',
          key: 'slashAbsorption',
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
          dataIndex: 'pierceAbsorption',
          key: 'pierceAbsorption',
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
      children: [
        {
          title: (
            <div className={tableStyles.damageTypeContainer}>
              <DamageTypeIcon type="magic" />
              <span>魔力</span>
            </div>
          ),
          dataIndex: 'magicAbsorption',
          key: 'magicAbsorption',
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
          dataIndex: 'fireAbsorption',
          key: 'fireAbsorption',
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
          dataIndex: 'lightningAbsorption',
          key: 'lightningAbsorption',
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
          dataIndex: 'holyAbsorption',
          key: 'holyAbsorption',
          width: 60,
          align: 'center',
          render: (value) => (
            <span className={`${tableStyles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>
          ),
        },
      ],
    },
  ];

  // 右侧表格列定义： + 韧性
  const rightColumns: ColumnsType<BossData> = [
    {
      title: '',
      key: 'image',
      width: 42,
      align: 'center',
      render: (_, record) => {
        const imageSrc = bossImageMap[record.name];
        return imageSrc ? (
          <Image src={imageSrc} alt={record.name} width={40} height={40} className={styles.bossImage} preview={false} />
        ) : null;
      },
      onCell: (record) => {
        // 找到相同图片的下一个boss的索引
        const currentIndex = nightlordRows.findIndex((item) => item.name === record.name);
        const currentImage = bossImageMap[record.name];

        if (!currentImage) return {};

        // 计算相同图片的行数
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < nightlordRows.length; i++) {
          if (bossImageMap[nightlordRows[i].name] === currentImage) {
            rowSpan++;
          } else {
            break;
          }
        }

        // 如果是相同图片组的第一行，设置rowSpan
        if (currentIndex === 0 || bossImageMap[nightlordRows[currentIndex - 1].name] !== currentImage) {
          return { rowSpan };
        }

        // 否则隐藏单元格
        return { rowSpan: 0 };
      },
    },
    {
      title: 'Boss名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      align: 'center',
      ellipsis: true,
      fixed: 'left',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: `韧性(${playerCount}人${deepNightDepth > 0 ? `·深度${deepNightDepth}` : ''})`,
      children: [
        {
          title: '基础韧性',
          dataIndex: 'basePoise',
          key: 'basePoise',
          width: 70,
          align: 'center',
          render: (value, record) => {
            if (typeof value === 'number') {
              return <span className={styles.healthBase}>{calculatePoise(value, record)}</span>;
            }
            return <span className={styles.healthBase}>{value}</span>;
          },
        },
        {
          title: '永夜王韧性',
          dataIndex: 'nightreignPoise',
          key: 'nightreignPoise',
          width: 80,
          align: 'center',
          render: (value, record) => {
            if (typeof value === 'number') {
              return <span className={styles.healthNightreign}>{calculatePoise(value, record)}</span>;
            }
            return <span className={styles.healthNightreign}>{value}</span>;
          },
        },
      ],
    },
    {
      title: `抗性 (${playerCount}人)`,
      children: [
        {
          title: (
            <div className={tableStyles.resistanceTypeContainer}>
              <StatusIcon status="poison" />
              <span>中毒</span>
            </div>
          ),
          dataIndex: 'poisonResistance',
          key: 'poisonResistance',
          width: 60,
          align: 'center',
          render: (value) => {
            const calculatedValue = calculateResistance(value);
            const originalClass = getResistanceClass(value); // 基于原始数值确定颜色
            return <span className={`${tableStyles.resistanceValue} ${originalClass}`}>{calculatedValue}</span>;
          },
        },
        {
          title: (
            <div className={tableStyles.resistanceTypeContainer}>
              <StatusIcon status="scarletRot" />
              <span>腐败</span>
            </div>
          ),
          dataIndex: 'scarletRotResistance',
          key: 'scarletRotResistance',
          width: 60,
          align: 'center',
          render: (value) => {
            const calculatedValue = calculateResistance(value);
            const originalClass = getResistanceClass(value); // 基于原始数值确定颜色
            return <span className={`${tableStyles.resistanceValue} ${originalClass}`}>{calculatedValue}</span>;
          },
        },
        {
          title: (
            <div className={tableStyles.resistanceTypeContainer}>
              <StatusIcon status="bleed" />
              <span>出血</span>
            </div>
          ),
          dataIndex: 'bleedResistance',
          key: 'bleedResistance',
          width: 60,
          align: 'center',
          render: (value) => {
            const calculatedValue = calculateResistance(value);
            const originalClass = getResistanceClass(value); // 基于原始数值确定颜色
            return <span className={`${tableStyles.resistanceValue} ${originalClass}`}>{calculatedValue}</span>;
          },
        },
        {
          title: (
            <div className={tableStyles.resistanceTypeContainer}>
              <StatusIcon status="frostbite" />
              <span>冻伤</span>
            </div>
          ),
          dataIndex: 'frostResistance',
          key: 'frostResistance',
          width: 60,
          align: 'center',
          render: (value) => {
            const calculatedValue = calculateResistance(value);
            const originalClass = getResistanceClass(value); // 基于原始数值确定颜色
            return <span className={`${tableStyles.resistanceValue} ${originalClass}`}>{calculatedValue}</span>;
          },
        },
        {
          title: (
            <div className={tableStyles.resistanceTypeContainer}>
              <StatusIcon status="sleep" />
              <span>睡眠</span>
            </div>
          ),
          dataIndex: 'sleepResistance',
          key: 'sleepResistance',
          width: 60,
          align: 'center',
          render: (value) => {
            const calculatedValue = calculateResistance(value);
            const originalClass = getResistanceClass(value); // 基于原始数值确定颜色
            return <span className={`${tableStyles.resistanceValue} ${originalClass}`}>{calculatedValue}</span>;
          },
        },
        {
          title: (
            <div className={tableStyles.resistanceTypeContainer}>
              <StatusIcon status="madness" />
              <span>发狂</span>
            </div>
          ),
          dataIndex: 'madnessResistance',
          key: 'madnessResistance',
          width: 60,
          align: 'center',
          render: (value) => {
            const calculatedValue = calculateResistance(value);
            const originalClass = getResistanceClass(value); // 基于原始数值确定颜色
            return <span className={`${tableStyles.resistanceValue} ${originalClass}`}>{calculatedValue}</span>;
          },
        },
      ],
    },
  ];

  return (
    <div id="night-king-basic">
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <Radio.Group value={playerCount} onChange={(e) => setPlayerCount(e.target.value)} size="medium">
          <Radio.Button value={1}>单人模式</Radio.Button>
          <Radio.Button value={2}>双人模式</Radio.Button>
          <Radio.Button value={3}>三人模式</Radio.Button>
        </Radio.Group>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--theme-text-secondary, #999)', fontSize: '13px' }}>深夜深度</span>
          <Segmented
            value={deepNightDepth}
            onChange={(value) => setDeepNightDepth(Number(value))}
            size="medium"
            options={[
              { label: '普通', value: 0 },
              { label: '深度1', value: 1 },
              { label: '深度2', value: 2 },
              { label: '深度3', value: 3 },
              { label: '深度4', value: 4 },
              { label: '深度5', value: 5 },
            ]}
          />
        </div>
      </div>
      <Table
        columns={leftColumns}
        dataSource={nightlordRows}
        rowKey="id"
        scroll={{ x: 800 }}
        pagination={false}
        size="small"
        bordered
        footer={defaultFooter}
        style={{ marginBottom: '24px' }}
      />
      <Table
        columns={rightColumns}
        dataSource={nightlordRows}
        rowKey="id"
        scroll={{ x: 600 }}
        pagination={false}
        size="small"
        bordered
        footer={resistanceFooter}
      />
    </div>
  );
};

export default NightlordStats;
