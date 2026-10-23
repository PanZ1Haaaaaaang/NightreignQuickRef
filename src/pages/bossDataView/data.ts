// 夜王Boss数据页的静态数据、类型与纯函数。
// 原先全部堆在 BossDataView 组件函数体内（每次渲染都会重新创建），
// 抽到模块级后只创建一次，同时让组件文件专注在有状态的部分。

import { typeColorMap } from '../../types';
import sinnerList from '../../data/zh-CN/sinner_list.json';
import styles from '../../styles/bossDataView.module.css';

export interface SinnerData {
  key: string;
  characterName: string;
  buildIndex: number;
  leftHand: string;
  rightHand: string;
  consumable: string;
}

export interface LipulaStats {
  level: number; // 等级
  hp: number; // 血
  fp: number; // 蓝
  stamina: number; // 绿
  str: number; // 力
  dex: number; // 敏
  intl: number; // 智
  fth: number; // 信
  arc: number; // 感
}

export interface LipulaTrade {
  key: string;
  desire: string;
  effect: string;
  stats?: LipulaStats;
}

export const curseData = [
  { rune: '0', damageIncrease: 0 },
  { rune: '1000', damageIncrease: 0.4 },
  { rune: '2000', damageIncrease: 0.8 },
  { rune: '5000', damageIncrease: 2 },
  { rune: '10000', damageIncrease: 4 },
  { rune: '20000', damageIncrease: 8 },
  { rune: '30000', damageIncrease: 12 },
  { rune: '50000', damageIncrease: 20 },
  { rune: '60000', damageIncrease: 22 },
  { rune: '80000', damageIncrease: 26 },
  { rune: '100000', damageIncrease: 30 },
  { rune: '150000', damageIncrease: 33.75 },
  { rune: '200000', damageIncrease: 37.5 },
  { rune: '300000', damageIncrease: 45 },
  { rune: '500000', damageIncrease: 60 },
  { rune: '700000', damageIncrease: 75 },
  { rune: '900000', damageIncrease: 90 },
  { rune: '1000000', damageIncrease: 91.2 },
  { rune: '1100000', damageIncrease: 92.42 },
  { rune: '1500000', damageIncrease: 97.26 },
];

export const locationColorMap: Record<string, string> = {
  要塞: 'cyan',
  监牢: 'volcano',
  大教堂: 'orange',
  // DLC 新增据点
  湖沼: 'cyan',
  锻造村: 'volcano',
  大空洞主城: 'purple',
  神殿塔: 'geekblue',
  大空洞大教堂: 'orange',
  大空洞遗迹: 'magenta',
  大空洞异变: 'red',
  遗迹: 'magenta',
  营地: 'green',
  矿洞: 'magenta',
  主城: 'gold',
  主城地下: 'gold',
  主城楼顶: 'gold',
  野外蓝名: 'blue',
  野外红名: 'red',
  火山口: 'purple',
  山顶: 'purple',
  隐城: 'purple',
  腐败森林: 'purple',
  第一夜: 'geekblue',
  第二夜: 'cyan',
  突发事件: 'yellow',
  // 圆桌厅堂人物位置颜色
  训练场: 'green',
  可选角色: 'blue',
  执行者绝招: 'magenta',
  复仇者家人: 'cyan',
};

export const lipulaTradesData: LipulaTrade[] = [
  {
    key: '1',
    desire: '我想要力气变的更大',
    effect: '改变角色属性加点',
    stats: { level: 15, hp: 47, fp: 6, stamina: 23, str: 73, dex: 9, intl: 3, fth: 3, arc: 3 },
  },
  {
    key: '2',
    desire: '我想要灵巧变的更高',
    effect: '改变角色属性加点',
    stats: { level: 15, hp: 43, fp: 10, stamina: 23, str: 9, dex: 72, intl: 3, fth: 3, arc: 3 },
  },
  {
    key: '3',
    desire: '我想要智力变的更高',
    effect: '改变角色属性加点',
    stats: { level: 15, hp: 33, fp: 28, stamina: 17, str: 9, dex: 9, intl: 55, fth: 24, arc: 3 },
  },
  {
    key: '4',
    desire: '我想要信仰变的更高',
    effect: '改变角色属性加点',
    stats: { level: 15, hp: 33, fp: 28, stamina: 17, str: 9, dex: 9, intl: 24, fth: 55, arc: 3 },
  },
  {
    key: '5',
    desire: '我想要感应变的更高',
    effect: '改变角色属性加点',
    stats: { level: 15, hp: 41, fp: 26, stamina: 26, str: 39, dex: 39, intl: 30, fth: 30, arc: 35 },
  },
  { key: '6', desire: '我想要能抵抗异常状态', effect: '提升全异常抗性，减少10%精力上限' },
  { key: '7', desire: '我想要死亡远离我', effect: '第一次收到致命攻击时免死并回满血，但是血量上限永久减少20%' },
  {
    key: '8',
    desire: '我想要厉害的武器',
    effect: '在维克的战矛、颠火圣印记、指纹石盾、黑刀、米凯拉骑士剑、黄金树弓中抽取一把武器',
  },
  { key: '9', desire: '我想要大幅度地升级', effect: '升三级，但是此后每次喝药将会降低一级' },
  { key: '10', desire: '我想要圣杯瓶', effect: '圣杯瓶使用次数增加一次，但是减少血量上限' },
  {
    key: '11',
    desire: '我想要体验大器晚成',
    effect:
      '立即减少血量、专注值、精力上限30%，如果在boss战开始后两分钟不倒地，血量、专注值、精力恢复正常并增加上限20%',
  },
  {
    key: '12',
    desire: '我想要全力战斗',
    effect: '利普拉开始战斗后立即进入金身强化状态，场上的玩家和boss都获得持续一分钟的buff',
  },
  {
    key: '13',
    desire: '我想要恶魔的力量',
    effect: '获得一个会随机攻击敌人的恶魔眼球，但是眼球每次攻击敌人会为角色累计发狂值',
  },
];

// 位置 → Tag 颜色
export const getLocationColor = (location: string | null | undefined): string => {
  if (!location) return 'default';
  return locationColorMap[location] || 'default';
};

// 词条类型 → Tag 颜色
export const getTypeColor = (type: string | null | undefined): string => {
  if (!type) return 'default';
  return typeColorMap[type] || 'default';
};

// 抗性数值 → 颜色类名
export const getResistanceClass = (value: number | string): string => {
  if (value === '-' || value === null || value === undefined) {
    return '';
  }

  const numValue = typeof value === 'string' ? parseInt(value) : value;

  if (numValue <= 154) {
    return styles.resistanceLow;
  } else if (numValue <= 252) {
    return styles.resistanceMedium;
  } else if (numValue <= 542) {
    return styles.resistanceHigh;
  }
  return '';
};

// 吸收率 → 颜色类名
export const getAbsorptionClass = (value: number | string): string => {
  if (value === null || value === undefined || typeof value !== 'number') {
    return '';
  }

  if (value > 1) {
    return styles.absorption1;
  } else if (value < 1) {
    if (value <= 0.3) {
      return styles.absorption4;
    } else if (value <= 0.7) {
      return styles.absorption3;
    } else {
      return styles.absorption2;
    }
  }
  return '';
};

// 罪人数据 → 表格行
export const processSinnerData = (): SinnerData[] => {
  const sinnerTableData: SinnerData[] = [];

  Object.entries(sinnerList).forEach(([characterName, builds]) => {
    builds.forEach((build: { 左手: string | string[]; 右手: string | string[]; 消耗品: string }, index: number) => {
      sinnerTableData.push({
        key: `${characterName}-${index}`,
        characterName,
        buildIndex: index + 1,
        leftHand: Array.isArray(build.左手) ? build.左手.join(' + ') : build.左手,
        rightHand: Array.isArray(build.右手) ? build.右手.join(' + ') : build.右手,
        consumable: build.消耗品,
      });
    });
  });

  return sinnerTableData;
};
