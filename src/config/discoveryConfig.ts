import type { DropSegment } from '../types';

/** 观察力基础值：所有渡夜者默认 100 */
export const DISCOVERY_BASE = 100;

/** 武器固有「提升观察力」最多 6 把 */
export const WEAPON_SLOT_LIMIT = 6;
/** 小要塞遗物：解包里只有 10 档（0.16 ~ 1.6），即 +16/层、最多 +160 */
export const FORTRESS_MAX_STACK = 10;

/**
 * 观察力模拟的可选来源（数值 = 解包 SpEffectParam.itemDropRate × 100）。
 * - 7050303 遗物「白银鸟爪效果共享给附近队友」+20，最多 2 层
 * - 8510000/1/2 武器固有「提升观察力」+20/+30/+40，最多 6 把
 * - 311000 护符 银色粪金龟 +40（与贪欲者的烙印按相加处理）
 * - 370000 护符 贪欲者的烙印 +40
 * - 702000/702001 铁眼被动 +30，最多 3 人
 * - 6060400 遗物「每次打倒小型要塞的强敌」+16/层
 */
export interface DiscoverySetup {
  fowlShare: number;
  /** 腌制白银鸟爪（自己使用）+30 */
  fowlItem: boolean;
  weapon20: number;
  weapon30: number;
  weapon40: number;
  silverScarab: boolean;
  greedEmblem: boolean;
  ironeye: number;
  fortress: number;
}

export const DEFAULT_DISCOVERY_SETUP: DiscoverySetup = {
  fowlShare: 0,
  fowlItem: false,
  weapon20: 0,
  weapon30: 0,
  weapon40: 0,
  silverScarab: false,
  greedEmblem: false,
  ironeye: 0,
  fortress: 0,
};

export const weaponCount = (setup: DiscoverySetup) => setup.weapon20 + setup.weapon30 + setup.weapon40;

export const calcDiscovery = (setup: DiscoverySetup): number =>
  DISCOVERY_BASE +
  setup.fowlShare * 20 +
  (setup.fowlItem ? 30 : 0) +
  setup.weapon20 * 20 +
  setup.weapon30 * 30 +
  setup.weapon40 * 40 +
  (setup.silverScarab ? 40 : 0) +
  (setup.greedEmblem ? 40 : 0) +
  setup.ironeye * 30 +
  setup.fortress * 16;

/**
 * 换算「观察力 D」下每个槽位的实际权重：
 * - 带 luck 标记（第 6 项 = 1）的槽位权重 × D/100，其余不变；
 * - 再按最大余数法取整，保证同一选项内合计仍是 100。
 * 观察力 100 时原样返回。
 */
export const adjustSegmentPercents = (segments: DropSegment[], discovery: number): number[] => {
  if (discovery === DISCOVERY_BASE) return segments.map(([percent]) => percent);
  const scaled = segments.map(([percent, , , , , luck]) => percent * (luck ? discovery / DISCOVERY_BASE : 1));
  const total = scaled.reduce((sum, value) => sum + value, 0);
  if (total === 0) return segments.map(([percent]) => percent);

  const raw = scaled.map((value) => (value / total) * 100);
  const floors = raw.map((value) => Math.floor(value));
  let rest = 100 - floors.reduce((sum, value) => sum + value, 0);
  const order = raw.map((value, index) => ({ index, frac: value - Math.floor(value) })).sort((a, b) => b.frac - a.frac);
  for (let i = 0; i < order.length && rest > 0; i += 1, rest -= 1) floors[order[i].index] += 1;
  return floors;
};
