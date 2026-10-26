import React, { useState, useEffect } from 'react';
import { Table, Card, Image, Tabs, Select, Input, Button, Tag, Radio, Segmented, Space, Spin } from 'antd';
import { message } from '../utils/feedback';
import { SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { BossData, EntryData } from '../types';
import bossData from '../data/zh-CN/night_king_data.json';
import wildBossData from '../data/zh-CN/wild_boss_data.json';
import characterData from '../data/character-info/character_data.json';
import DataManager from '../utils/dataManager';
import { Line } from '@ant-design/plots';
import { getCurrentTheme } from '../utils/themeUtils';
import { throttle } from 'lodash';
import styles from '../styles/bossDataView.module.css';
import EnemyRaceSection from './bossDataView/EnemyRaceSection';
import {
  curseData,
  getAbsorptionClass,
  getResistanceClass,
  getLocationColor,
  lipulaTradesData,
  processSinnerData,
} from './bossDataView/data';
import {
  characterColumns,
  lipulaColumns,
  sinnerColumns,
  specialEventColumns,
  wildBossColumns,
} from './bossDataView/columns';

// 导入boss图片
import nightOfTheBeast from '../assets/BossRelics/night-of-the-beast.avif';
import darkNightOfTheBaron from '../assets/BossRelics/dark-night-of-the-baron.avif';
import nightOfTheWise from '../assets/BossRelics/night-of-the-wise.avif';
import nightOfTheChampion from '../assets/BossRelics/night-of-the-champion.avif';
import nightOfTheDemon from '../assets/BossRelics/night-of-the-demon.avif';
import nightOfTheFathom from '../assets/BossRelics/night-of-the-fathom.avif';
import nightOfTheMiasma from '../assets/BossRelics/night-of-the-miasma.avif';
import nightOfTheLord from '../assets/BossRelics/night-of-the-lord.avif';
import nightOfTheBalancers from '../assets/BossRelics/the-will-of-the-balancers.avif';
import nightOfTheDreglords from '../assets/BossRelics/the-night-of-dregs.avif';

// 导入Negations图片
import standardDamage from '../assets/Negations/standard-damage-damage-type-elden-ring-nightreign-wiki-guide.png';
import slashDamage from '../assets/Negations/slash-damage-damage-type-elden-ring-nightreign-wiki-guide.png';
import strikeDamage from '../assets/Negations/strike-damage-damage-type-elden-ring-nightreign-wiki-guide.png';
import pierceDamage from '../assets/Negations/pierce-damage-damage-type-elden-ring-nightreign-wiki-guide.png';
import magicDamage from '../assets/Negations/magic-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import fireDamage from '../assets/Negations/fire-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import lightningDamage from '../assets/Negations/lightning-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import holyDamage from '../assets/Negations/holy-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';

// 导入Resistances图片
import poisonResistance from '../assets/Resistances/poison-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import scarletRotResistance from '../assets/Resistances/scarlet-rot-status-effect-elden-ring-nightreing-wiki-guide-100px.png';
import bleedResistance from '../assets/Resistances/hemorrhage-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import frostResistance from '../assets/Resistances/frostbite-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import sleepResistance from '../assets/Resistances/sleep-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import madnessResistance from '../assets/Resistances/madness-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import deathBlightResistance from '../assets/Resistances/blight_status_effect_elden_ring_wiki_guide_100px.png';

interface BossDataViewProps {
  activeSubTab?: string;
}

const BossDataView: React.FC<BossDataViewProps> = ({ activeSubTab }) => {
  const [filteredData] = useState<BossData[]>(bossData);
  const [wildBossSearchKeyword, setWildBossSearchKeyword] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [characterSearchKeyword, setCharacterSearchKeyword] = useState('');
  const [selectedCharacterLocations, setSelectedCharacterLocations] = useState<string[]>([]);
  const [playerCount, setPlayerCount] = useState<number>(1); // 添加人数选择状态
  const [deepNightDepth, setDeepNightDepth] = useState<number>(0); // 0=普通，1~5=深夜深度
  const [activeBossTab, setActiveBossTab] = useState<string>(activeSubTab || 'boss-data');

  // 特殊事件相关状态
  const [specialEventData, setSpecialEventData] = useState<EntryData[]>([]);
  const [isLinearMode, setIsLinearMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(getCurrentTheme());
  const [chartKey, setChartKey] = useState(0);
  const [loading, setLoading] = useState(true);

  // 羊头诅咒事件数据
  // 折线图配置
  const lineConfig = {
    data: isLinearMode ? curseData.map((item) => ({ ...item, rune: parseInt(item.rune) })) : curseData,
    xField: 'rune',
    yField: 'damageIncrease',
    theme: currentTheme,
    height: 400,
    autoFit: true,
    point: {
      size: 4,
      shape: 'circle',
      style: {
        fill: 'white',
        stroke: '#5B8FF9',
        lineWidth: 2,
      },
    },
    axis: {
      x: {
        // G2 v5 真正读取的是 axis 层级的 labelAutoRotate / labelAutoHide
        // （见 @antv/g2 esm/component/axis.js 的 inferLabelOverlap），
        // label 子对象里的 autoRotate 不生效。
        labelAutoRotate: false,
        labelAutoHide: true,
        label: {
          autoRotate: false,
          autoHide: true,
          autoEllipsis: true,
          style: {
            fill: currentTheme === 'dark' ? '#ffffff' : '#000000',
            fontSize: 12,
          },
          formatter: isLinearMode
            ? (value: string) => {
                const num = parseInt(value);
                if (num >= 1000000) {
                  return (num / 1000000).toFixed(1) + 'M';
                } else if (num >= 1000) {
                  return (num / 1000).toFixed(0) + 'K';
                }
                return value;
              }
            : undefined,
        },
        line: {
          style: {
            stroke: currentTheme === 'dark' ? '#ffffff' : '#000000',
            lineWidth: 1,
          },
        },
        tickLine: {
          style: {
            stroke: currentTheme === 'dark' ? '#ffffff' : '#000000',
            lineWidth: 1,
          },
        },
      },
      y: {
        label: {
          style: {
            fill: currentTheme === 'dark' ? '#ffffff' : '#000000',
            fontSize: 12,
          },
          formatter: (value: string) => `${value}%`,
        },
        line: {
          style: {
            stroke: currentTheme === 'dark' ? '#ffffff' : '#000000',
            lineWidth: 1,
          },
        },
        tickLine: {
          style: {
            stroke: currentTheme === 'dark' ? '#ffffff' : '#000000',
            lineWidth: 1,
          },
        },
      },
    },
    tooltip: {
      title: (datum: { rune: string | number; damageIncrease: number }) => {
        const runeValue = typeof datum.rune === 'number' ? datum.rune.toString() : datum.rune;
        return `卢恩:${runeValue} | 增伤:${datum.damageIncrease.toFixed(2)}%`;
      },
    },
    smooth: true,
    color: '#5B8FF9',
    lineStyle: {
      lineWidth: 3,
    },
  };

  // 标签渲染函数
  const locationTagRender = (props: {
    label: React.ReactNode;
    value: string;
    closable?: boolean;
    onClose?: () => void;
  }) => {
    const { label, value, closable, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
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

  // 获取所有唯一的圆桌厅堂人物位置选项
  const getCharacterLocationOptions = () => {
    const locations = new Set<string>();
    characterData.forEach((character) => {
      if (character.location) {
        locations.add(character.location.trim());
      }
    });

    return Array.from(locations)
      .sort()
      .map((location) => ({
        value: location,
        label: location,
      }));
  };

  // 过滤圆桌厅堂人物数据
  const getFilteredCharacterData = () => {
    let filtered = characterData;

    // 按位置筛选
    if (selectedCharacterLocations.length > 0) {
      filtered = filtered.filter((character) => {
        if (!character.location) return false;
        return selectedCharacterLocations.includes(character.location.trim());
      });
    }

    // 按搜索关键词筛选（仅搜索人物名称）
    if (characterSearchKeyword.trim()) {
      const searchLower = characterSearchKeyword.toLowerCase();
      filtered = filtered.filter((character) => character.name.toLowerCase().includes(searchLower));
    }

    return filtered;
  };

  // 清除圆桌厅堂人物筛选
  const clearCharacterFilters = () => {
    setCharacterSearchKeyword('');
    setSelectedCharacterLocations([]);
  };

  // 根据吸收数值返回CSS类名
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
        const currentIndex = filteredData.findIndex((item) => item.name === record.name);
        const currentImage = bossImageMap[record.name];

        if (!currentImage) return {};

        // 计算相同图片的行数
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < filteredData.length; i++) {
          if (bossImageMap[filteredData[i].name] === currentImage) {
            rowSpan++;
          } else {
            break;
          }
        }

        // 如果是相同图片组的第一行，设置rowSpan
        if (currentIndex === 0 || bossImageMap[filteredData[currentIndex - 1].name] !== currentImage) {
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
            <div className={styles.damageTypeContainer}>
              <Image src={standardDamage} alt="普通" width={18} height={18} preview={false} />
              <span>普通</span>
            </div>
          ),
          dataIndex: 'normalAbsorption',
          key: 'normalAbsorption',
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
          dataIndex: 'strikeAbsorption',
          key: 'strikeAbsorption',
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
          dataIndex: 'slashAbsorption',
          key: 'slashAbsorption',
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
          dataIndex: 'pierceAbsorption',
          key: 'pierceAbsorption',
          width: 60,
          align: 'center',
          render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
        },
      ],
    },
    {
      title: '属性类别',
      children: [
        {
          title: (
            <div className={styles.damageTypeContainer}>
              <Image src={magicDamage} alt="魔力" width={18} height={18} preview={false} />
              <span>魔力</span>
            </div>
          ),
          dataIndex: 'magicAbsorption',
          key: 'magicAbsorption',
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
          dataIndex: 'fireAbsorption',
          key: 'fireAbsorption',
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
          dataIndex: 'lightningAbsorption',
          key: 'lightningAbsorption',
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
          dataIndex: 'holyAbsorption',
          key: 'holyAbsorption',
          width: 60,
          align: 'center',
          render: (value) => <span className={`${styles.resistanceValue} ${getAbsorptionClass(value)}`}>{value}</span>,
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
        const currentIndex = filteredData.findIndex((item) => item.name === record.name);
        const currentImage = bossImageMap[record.name];

        if (!currentImage) return {};

        // 计算相同图片的行数
        let rowSpan = 1;
        for (let i = currentIndex + 1; i < filteredData.length; i++) {
          if (bossImageMap[filteredData[i].name] === currentImage) {
            rowSpan++;
          } else {
            break;
          }
        }

        // 如果是相同图片组的第一行，设置rowSpan
        if (currentIndex === 0 || bossImageMap[filteredData[currentIndex - 1].name] !== currentImage) {
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
            <div className={styles.resistanceTypeContainer}>
              <Image src={poisonResistance} alt="中毒" width={18} height={18} preview={false} />
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
            return <span className={`${styles.resistanceValue} ${originalClass}`}>{calculatedValue}</span>;
          },
        },
        {
          title: (
            <div className={styles.resistanceTypeContainer}>
              <Image src={scarletRotResistance} alt="腐败" width={18} height={18} preview={false} />
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
            return <span className={`${styles.resistanceValue} ${originalClass}`}>{calculatedValue}</span>;
          },
        },
        {
          title: (
            <div className={styles.resistanceTypeContainer}>
              <Image src={bleedResistance} alt="出血" width={18} height={18} preview={false} />
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
            return <span className={`${styles.resistanceValue} ${originalClass}`}>{calculatedValue}</span>;
          },
        },
        {
          title: (
            <div className={styles.resistanceTypeContainer}>
              <Image src={frostResistance} alt="冻伤" width={18} height={18} preview={false} />
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
            return <span className={`${styles.resistanceValue} ${originalClass}`}>{calculatedValue}</span>;
          },
        },
        {
          title: (
            <div className={styles.resistanceTypeContainer}>
              <Image src={sleepResistance} alt="睡眠" width={18} height={18} preview={false} />
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
            return <span className={`${styles.resistanceValue} ${originalClass}`}>{calculatedValue}</span>;
          },
        },
        {
          title: (
            <div className={styles.resistanceTypeContainer}>
              <Image src={madnessResistance} alt="发狂" width={18} height={18} preview={false} />
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
            return <span className={`${styles.resistanceValue} ${originalClass}`}>{calculatedValue}</span>;
          },
        },
        {
          title: (
            <div className={styles.resistanceTypeContainer}>
              <Image src={deathBlightResistance} alt="咒死" width={18} height={18} preview={false} />
              <span>咒死</span>
            </div>
          ),
          dataIndex: 'deathBlightResistance',
          key: 'deathBlightResistance',
          width: 60,
          align: 'center',
          render: (value) => {
            const calculatedValue = calculateResistance(value);
            const originalClass = getResistanceClass(value); // 基于原始数值确定颜色
            return <span className={`${styles.resistanceValue} ${originalClass}`}>{calculatedValue}</span>;
          },
        },
      ],
    },
  ];

  // 罪人装备配置表格列定义
  const sinnerFooter = () => (
    <div className="footer-text">*双人1.1倍血量/三人1.2倍血量 *每个NPC基础数据均为满级 *每个NPC自带仇恨-6的BUFF</div>
  );

  // 野生Boss数据表格列定义
  const wildBossFooter = () => (
    <div className="footer-text">野生Boss数据：包含各种敌人和Boss的吸收值和抗性（异常耐受上限）数据</div>
  );

  // 圆桌厅堂人物数据表格列定义
  const characterFooter = () => (
    <div className="footer-text">圆桌厅堂人物数据：包含各种NPC和角色的吸收值和抗性（异常耐受上限）数据</div>
  );

  // 利普拉的交易选项
  const lipulaFooter = () => (
    <div className="footer-text">
      <div>
        ◦
        炼金碎片小：随羊头施法后掉落，捡起恢复20HP，减少发狂累积量表55，并且获得炼金碎片buff—物理攻击x1.05、受到的发狂累积量x0.7，持续10s
      </div>
      <div>
        ◦
        炼金碎片大：随罪人死亡后掉落，捡起恢复4%+120HP，减少发狂累积量表999(等于清除)，获得炼金碎片buff2—物理攻击x1.05、受到的发狂累积量x0.8，持续20s
      </div>
      <div>
        ◦
        恶魔的眼界：将随意累积发狂量表。具体效果为17s后睁眼，睁眼累积发狂值15/0.35s，持续7s。结束后闭眼17s，然后再次睁眼。睁眼累积发狂值15/0.7s，持续7s
      </div>
      <div>◦ 罪人金身buff：第一层加20%攻击，后续每层加2%攻击</div>
    </div>
  );

  // 特殊事件及地形效果表格列定义
  // 加载特殊事件数据
  useEffect(() => {
    const loadSpecialEventData = async () => {
      try {
        const dataManager = DataManager.getInstance();
        await dataManager.loadGroup('boss');
        setSpecialEventData(dataManager.getInGameSpecialBuff());
        setLoading(false);
      } catch (error) {
        console.error('Failed to load special event data:', error);
        message.error('特殊事件数据加载失败');
        setLoading(false);
      }
    };

    void loadSpecialEventData();
  }, []);

  // 监听主题变化
  useEffect(() => {
    const checkTheme = () => {
      const newTheme = getCurrentTheme();
      if (newTheme !== currentTheme) {
        setCurrentTheme(newTheme);
        setChartKey((prev) => prev + 1);
      }
    };

    // 初始检查
    checkTheme();

    // 监听 localStorage 变化
    const handleStorageChange = () => {
      setTimeout(checkTheme, 50);
    };

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      checkTheme();
    };

    // 监听自定义主题变化事件
    const handleThemeChange = () => {
      setTimeout(checkTheme, 50);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChange', handleThemeChange);
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChange', handleThemeChange);
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [currentTheme]);

  // 处理窗口大小变化和拖拽导致的图表刷新问题
  useEffect(() => {
    const throttledChartRefresh = throttle(() => {
      setChartKey((prev) => prev + 1);
    }, 300);

    const handleResize = () => {
      throttledChartRefresh();
    };

    const handleDragEnd = () => {
      setTimeout(throttledChartRefresh, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('dragend', handleDragEnd);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('dragend', handleDragEnd);
    };
  }, []);

  // 监听标签页切换，确保图表正确渲染
  useEffect(() => {
    if (activeBossTab === 'special-events') {
      const timer = setTimeout(() => {
        setChartKey((prev) => prev + 1);
        window.dispatchEvent(new Event('resize'));
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [activeBossTab]);

  // 监听外部Tab切换
  useEffect(() => {
    if (activeSubTab && activeSubTab !== activeBossTab) {
      setActiveBossTab(activeSubTab);
    }
  }, [activeSubTab, activeBossTab]);

  return (
    <div className={styles.bossDataViewContainer}>
      <Card className={styles.bossCard}>
        <Tabs
          style={{ marginTop: '5px' }}
          type="card"
          activeKey={activeBossTab}
          onChange={setActiveBossTab}
          items={[
            {
              key: 'boss-data',
              label: '🌙 夜王基础数据',
              children: (
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
                    dataSource={filteredData}
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
                    dataSource={filteredData}
                    rowKey="id"
                    scroll={{ x: 600 }}
                    pagination={false}
                    size="small"
                    bordered
                    footer={resistanceFooter}
                  />
                </div>
              ),
            },
            {
              key: 'wild-boss-data',
              label: '☠️ 野生Boss数据',
              children: (
                <div className={styles.wildBossFilterContainer} id="wild-boss-data">
                  <div className={styles.filterInputs}>
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
              ),
            },
            {
              key: 'enemy-race-data',
              label: '🧬 敌人种族说明',
              children: (
                <div id="enemy-race-data">
                  <EnemyRaceSection />
                </div>
              ),
            },
            {
              key: 'character-data',
              label: '🏛️ 圆桌厅堂人物数据',
              children: (
                <div className={styles.wildBossFilterContainer} id="roundtable-characters">
                  <div className={styles.filterInputs}>
                    <Input
                      placeholder="搜索人物名称"
                      prefix={<SearchOutlined />}
                      style={{ width: 200 }}
                      value={characterSearchKeyword}
                      onChange={(e) => setCharacterSearchKeyword(e.target.value)}
                    />
                    <Select
                      mode="multiple"
                      placeholder="选择位置"
                      options={getCharacterLocationOptions()}
                      value={selectedCharacterLocations}
                      onChange={setSelectedCharacterLocations}
                      tagRender={locationTagRender}
                      style={{ minWidth: 200, maxWidth: 400 }}
                    />
                    <Button onClick={clearCharacterFilters}>清除筛选</Button>
                  </div>
                  <Table
                    columns={characterColumns}
                    dataSource={getFilteredCharacterData()}
                    rowKey="name"
                    pagination={false}
                    size="small"
                    bordered
                    footer={characterFooter}
                    sticky={{ offsetHeader: 0 }}
                    scroll={{ x: 1000, y: 700 }}
                  />
                </div>
              ),
            },
            {
              key: 'sinner-data',
              label: '🐐 永夜山羊召唤罪人详情',
              children: (
                <div id="sinner-details">
                  <Table
                    columns={sinnerColumns}
                    dataSource={processSinnerData()}
                    rowKey="key"
                    scroll={{ x: 700 }}
                    pagination={false}
                    size="small"
                    bordered
                    footer={sinnerFooter}
                  />
                </div>
              ),
            },
            {
              key: 'lipula-trades',
              label: '⚖️ 利普拉的交易(Boss战)',
              children: (
                <div id="lipula-trades">
                  <Table
                    columns={lipulaColumns}
                    dataSource={lipulaTradesData}
                    rowKey="key"
                    pagination={false}
                    size="small"
                    bordered
                    footer={lipulaFooter}
                  />
                </div>
              ),
            },
            {
              key: 'special-events',
              label: '🌋 特殊事件及地形效果',
              children: (
                <div id="special-events">
                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                      <Spin spinning={true} />
                    </div>
                  ) : (
                    <>
                      <Table
                        columns={specialEventColumns}
                        dataSource={specialEventData}
                        // 没有游戏 ID 的条目都用 "-" 占位（火山口、地底神殿…），
                        // 单用 entry_id 会撞 key，所以拼上名称
                        rowKey={(record) => `${record.entry_id}|${record.entry_name}`}
                        pagination={false}
                        size="small"
                        bordered
                        style={{ marginBottom: '30px' }}
                      />
                      <div
                        style={{
                          marginTop: '30px',
                          padding: '20px',
                          backgroundColor: 'var(--theme-bg-primary)',
                          borderRadius: '8px',
                          border: '1px solid var(--theme-border)',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                          }}
                        >
                          <h3
                            style={{
                              color: 'var(--theme-text-primary)',
                              fontSize: '16px',
                              fontWeight: 'bold',
                              margin: 0,
                            }}
                          >
                            🪬 恶魔的添翼:卢恩-增伤关系图
                          </h3>
                          <Space.Compact size="small">
                            <Button
                              color={isLinearMode ? 'default' : 'primary'}
                              variant={isLinearMode ? 'outlined' : 'solid'}
                              onClick={() => setIsLinearMode(false)}
                            >
                              非线性模式
                            </Button>
                            <Button
                              color={isLinearMode ? 'primary' : 'default'}
                              variant={isLinearMode ? 'solid' : 'outlined'}
                              onClick={() => setIsLinearMode(true)}
                            >
                              线性模式
                            </Button>
                          </Space.Compact>
                        </div>
                        <div id="line-chart-container" style={{ height: '400px' }}>
                          <Line key={`line-chart-${chartKey}-${activeBossTab}`} {...lineConfig} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default BossDataView;
