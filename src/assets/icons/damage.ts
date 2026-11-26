import type { DamageType } from '../../types';
import standard from '../Negations/standard-damage-damage-type-elden-ring-nightreign-wiki-guide.png';
import strike from '../Negations/strike-damage-damage-type-elden-ring-nightreign-wiki-guide.png';
import slash from '../Negations/slash-damage-damage-type-elden-ring-nightreign-wiki-guide.png';
import pierce from '../Negations/pierce-damage-damage-type-elden-ring-nightreign-wiki-guide.png';
import magic from '../Negations/magic-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import fire from '../Negations/fire-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import lightning from '../Negations/lightning-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';
import holy from '../Negations/holy-upgrade-affinity-elden-ring-nightreign-wiki-guide.png';

export const DAMAGE_ICONS: Record<DamageType, string> = {
  standard,
  strike,
  slash,
  pierce,
  magic,
  fire,
  lightning,
  holy,
};

export const DAMAGE_LABELS: Record<DamageType, string> = {
  standard: '普通',
  strike: '打击',
  slash: '斩击',
  pierce: '突刺',
  magic: '魔力',
  fire: '火焰',
  lightning: '雷电',
  holy: '神圣',
};

const DAMAGE_ALIASES: Partial<Record<string, DamageType>> = {
  普通: 'standard',
  物: 'standard',
  物理: 'standard',
  打击: 'strike',
  斩击: 'slash',
  挥击: 'slash',
  突刺: 'pierce',
  戳击: 'pierce',
  魔: 'magic',
  魔力: 'magic',
  火: 'fire',
  火焰: 'fire',
  雷: 'lightning',
  雷电: 'lightning',
  圣: 'holy',
  神圣: 'holy',
};

export const damageTypeOf = (label: string): DamageType | undefined =>
  Object.hasOwn(DAMAGE_ALIASES, label) ? DAMAGE_ALIASES[label] : undefined;
