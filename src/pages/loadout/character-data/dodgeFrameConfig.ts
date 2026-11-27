import type { AbilityKind, NightfarerName } from '@/types';

export interface DodgeProfile {
  id: string;
  name: string;
  characters: string[];
  ability?: { character: NightfarerName; kind: AbilityKind };
  variants: { id: string; label: string }[];
}

const directions = ['前', '后', '左', '右'];

const directionalVariants = (firstAction: number) =>
  directions.map((label, offset) => ({
    id: `a000_${String(firstAction + offset).padStart(6, '0')}`,
    label,
  }));

// 只在速查界面展示已匹配到角色或情境的动作。其余动作仍收录于 TAE 数据。
export const commonDodgeProfiles: DodgeProfile[] = [
  {
    id: 'light-roll',
    name: '轻档翻滚',
    characters: ['追踪者', '铁之眼', '复仇者', '执行者', '送葬者'],
    variants: directionalVariants(27100),
  },
  { id: 'medium-roll', name: '中档翻滚', characters: ['无赖'], variants: directionalVariants(27110) },
  { id: 'guardian', name: '闪避', characters: ['守护者'], variants: directionalVariants(27150) },
  { id: 'recluse', name: '闪避', characters: ['隐士'], variants: directionalVariants(27190) },
  { id: 'duchess', name: '闪避', characters: ['女爵'], variants: directionalVariants(27160) },
  {
    id: 'duchess-double',
    name: '双重踏步',
    characters: ['女爵'],
    variants: directionalVariants(27170).filter(({ label }) => label !== '后'),
  },
  { id: 'duchess-flip', name: '后空翻', characters: ['女爵'], variants: [{ id: 'a000_027171', label: '后' }] },
  {
    id: 'duchess-backstep',
    name: '闪身',
    characters: ['女爵'],
    variants: [
      { id: 'a000_027060', label: '第一次' },
      { id: 'a000_027070', label: '第二次' },
    ],
  },
  { id: 'scholar', name: '闪避', characters: ['学者'], variants: directionalVariants(27230) },
  {
    id: 'scholar-rapier',
    name: '刺剑后撤',
    characters: ['学者'],
    variants: [
      { id: 'a279_030100', label: '单持' },
      { id: 'a279_032100', label: '共持' },
    ],
  },
];

export const situationalDodgeProfiles: DodgeProfile[] = [
  {
    id: 'grapple-roll',
    name: '钩爪位移中翻滚',
    characters: ['追踪者'],
    ability: { character: '追踪者', kind: 'skill' },
    variants: directionalVariants(27180),
  },
  {
    id: 'sixth-sense',
    name: '「第六感」自动闪避',
    characters: ['追踪者'],
    ability: { character: '追踪者', kind: 'passive' },
    variants: directionalVariants(27300),
  },
  {
    id: 'steel-guard',
    name: '「强力防御」移动',
    characters: ['守护者'],
    ability: { character: '守护者', kind: 'passive' },
    variants: directionalVariants(27200),
  },
  { id: 'throw-counter', name: '投技反制', characters: ['全渡夜者'], variants: directionalVariants(27210) },
  {
    id: 'cursed-sword',
    name: '「攫阳」妖刀闪避',
    characters: ['执行者'],
    ability: { character: '执行者', kind: 'skill' },
    variants: directionalVariants(27220),
  },
  {
    id: 'trance',
    name: '「恍惚」主动闪避',
    characters: ['送葬者'],
    ability: { character: '送葬者', kind: 'skill' },
    variants: directionalVariants(27240),
  },
  {
    id: 'enhanced-trance',
    name: '「恍惚」受击自动闪避',
    characters: ['送葬者'],
    ability: { character: '送葬者', kind: 'skill' },
    variants: directionalVariants(27310),
  },
  {
    id: 'emergency-roll',
    name: '紧急翻滚',
    characters: ['受击硬直中'],
    variants: [
      { id: 'a000_027500', label: '前' },
      { id: 'a000_027502', label: '左' },
      { id: 'a000_027503', label: '右' },
      { id: 'a000_027506', label: '后（右分支）' },
      { id: 'a000_027507', label: '后（左分支）' },
    ],
  },
];
