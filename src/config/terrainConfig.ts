import type { DropGroup } from '../types';

/** 特殊地形：游戏内英文名 / 中文名 / 页面下拉用的常见叫法 */
export type TerrainKey = 'mountaintop' | 'crater' | 'rottedWoods' | 'shroudedCity' | 'greatHollow';

export interface TerrainMeta {
  key: TerrainKey;
  /** 游戏内英文名 */
  en: string;
  /** 游戏内中文名 */
  zh: string;
  /** 玩家常用叫法（「特殊地形」下拉里显示这个） */
  commonName: string;
}

export const TERRAIN_CONFIG: TerrainMeta[] = [
  { key: 'mountaintop', en: 'Mountaintop', zh: '山顶', commonName: '山顶' },
  { key: 'crater', en: 'The Crater', zh: '火山口', commonName: '火山' },
  { key: 'rottedWoods', en: 'Rotted Woods', zh: '腐败森林', commonName: '腐败森林' },
  { key: 'shroudedCity', en: 'Noklateo, the Shrouded City', zh: '隐城诺克拉提奥', commonName: '隐城' },
  { key: 'greatHollow', en: 'The Great Hollow', zh: '大空洞', commonName: '大空洞' },
];

export const TERRAIN_OPTIONS = TERRAIN_CONFIG.map(({ key, commonName }) => ({ value: key, label: commonName }));

/**
 * 据点名 → 特殊地形。只看 names[0]，避免「癫火山妖」里的“火山”把（癫火）大型营地误判进来。
 * 大空洞的卡片名都以「大空洞-」开头；主城 Boss 那块「主城Boss，野外红名，大空洞左上主城下水道」也含「大空洞」。
 */
const TERRAIN_KEYWORDS: Array<[TerrainKey, string[]]> = [
  ['greatHollow', ['大空洞']],
  ['crater', ['火山']],
  ['mountaintop', ['山顶']],
  ['shroudedCity', ['隐城']],
  ['rottedWoods', ['腐败森林']],
];

export const terrainOf = (group: DropGroup): TerrainKey | null => {
  const name = group.names[0] ?? '';
  const hit = TERRAIN_KEYWORDS.find(([, keywords]) => keywords.some((keyword) => name.includes(keyword)));
  return hit ? hit[0] : null;
};
