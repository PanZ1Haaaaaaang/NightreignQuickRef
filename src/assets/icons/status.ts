import type { StatusType } from '../../types';
import poison from '../Resistances/poison-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import scarletRot from '../Resistances/scarlet-rot-status-effect-elden-ring-nightreing-wiki-guide-100px.png';
import bleed from '../Resistances/hemorrhage-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import frostbite from '../Resistances/frostbite-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import sleep from '../Resistances/sleep-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import madness from '../Resistances/madness-status-effect-elden-ring-nightreign-wiki-guide-100px.png';
import deathBlight from '../Resistances/blight_status_effect_elden_ring_wiki_guide_100px.png';

export const STATUS_ICONS: Record<StatusType, string> = {
  poison,
  scarletRot,
  bleed,
  frostbite,
  sleep,
  madness,
  deathBlight,
};

export const STATUS_LABELS: Record<StatusType, string> = {
  poison: '中毒',
  scarletRot: '腐败',
  bleed: '出血',
  frostbite: '冻伤',
  sleep: '睡眠',
  madness: '发狂',
  deathBlight: '骤死',
};

const STATUS_ALIASES: Record<string, StatusType> = {
  出血: 'bleed',
  冰冻: 'frostbite',
  冻伤: 'frostbite',
  中毒: 'poison',
  猩红腐败: 'scarletRot',
  腐败: 'scarletRot',
  睡眠: 'sleep',
  催眠: 'sleep',
  发狂: 'madness',
  骤死: 'deathBlight',
  咒死: 'deathBlight',
};

const STATUS_SHORT_NAMES: Partial<Record<string, StatusType>> = { 毒: 'poison', 冻: 'frostbite', 血: 'bleed' };

export const statusTypeOf = (label: string): StatusType | undefined => {
  if (Object.hasOwn(STATUS_ALIASES, label)) return STATUS_ALIASES[label];
  return Object.hasOwn(STATUS_SHORT_NAMES, label) ? STATUS_SHORT_NAMES[label] : undefined;
};

export const statusTypeIn = (text: string): StatusType | undefined =>
  Object.entries(STATUS_ALIASES).find(([label]) => text.includes(label))?.[1];
