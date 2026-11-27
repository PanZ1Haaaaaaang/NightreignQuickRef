// 夜王Boss数据页的静态数据、类型与纯函数。
// 原先全部堆在 BossDataView 组件函数体内（每次渲染都会重新创建），
// 抽到模块级后只创建一次，同时让组件文件专注在有状态的部分。

import { typeColorMap } from '../../types';
import sinnerList from '../../data/zh-CN/sinner_list.json';
import lipulaTradesJson from '../../data/zh-CN/lipula_trades.json';

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

export interface LipulaBuff {
  name: string;
  effects: string[];
}

export interface LipulaTrade {
  key: string;
  desire: string;
  effect: string;
  stats?: LipulaStats;
  buff?: LipulaBuff;
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

export interface LipulaScenario {
  key: string;
  label: string;
  summary: string;
  tradeKeys: string[];
}

export const lipulaTradesData = lipulaTradesJson.trades as LipulaTrade[];
export const lipulaNotes = lipulaTradesJson.notes;
export const lipulaScenarios = lipulaTradesJson.scenarios as LipulaScenario[];

// 词条类型 → Tag 颜色
export const getTypeColor = (type: string | null | undefined): string => {
  if (!type) return 'default';
  return typeColorMap[type] || 'default';
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
