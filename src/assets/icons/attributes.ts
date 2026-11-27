import type { NightfarerStat } from '@/types';
import arcane from './attributes/arcane.webp';
import dexterity from './attributes/dexterity.webp';
import endurance from './attributes/endurance.webp';
import faith from './attributes/faith.webp';
import intelligence from './attributes/intelligence.webp';
import mind from './attributes/mind.webp';
import strength from './attributes/strength.webp';
import vigor from './attributes/vigor.webp';

const ABILITY_POINTS = {
  生命: { label: '生命力', icon: vigor },
  集中: { label: '集中力', icon: mind },
  耐力: { label: '耐力', icon: endurance },
  力气: { label: '力气', icon: strength },
  灵巧: { label: '灵巧', icon: dexterity },
  智力: { label: '智力', icon: intelligence },
  信仰: { label: '信仰', icon: faith },
  感应: { label: '感应', icon: arcane },
} satisfies Record<NightfarerStat, { label: string; icon: string }>;

export const CHARACTER_STATS = {
  ...ABILITY_POINTS,
  HP: { label: '血量', icon: ABILITY_POINTS.生命.icon },
  FP: { label: '专注值', icon: ABILITY_POINTS.集中.icon },
  ST: { label: '精力', icon: ABILITY_POINTS.耐力.icon },
};

// 兼容逐级数据与属性评级表的原始字段名。
const POINT_ALIASES: Partial<Record<string, NightfarerStat>> = {
  生命力: '生命',
  集中力: '集中',
  专注: '集中',
  力量: '力气',
  敏捷: '灵巧',
};

export const abilityPointOf = (key: string): NightfarerStat | undefined => {
  if (Object.hasOwn(ABILITY_POINTS, key)) return key as NightfarerStat;
  return Object.hasOwn(POINT_ALIASES, key) ? POINT_ALIASES[key] : undefined;
};
