import type { AbilityKind } from '../../types';
import { characterAssetNameOf } from './characters';

const ABILITY_IMAGES = import.meta.glob<string>('../char/*.png', { eager: true, import: 'default' });

const ABILITY_SUFFIX: Record<AbilityKind, string> = {
  passive: 'PassiveAbility',
  skill: 'CharacterSkill',
  ultimate: 'UltimateArt',
};

const ABILITY_KINDS: Partial<Record<string, AbilityKind>> = { 能力: 'passive', 技艺: 'skill', 绝招: 'ultimate' };

export const abilityKindOf = (label: string): AbilityKind | undefined =>
  Object.hasOwn(ABILITY_KINDS, label) ? ABILITY_KINDS[label] : undefined;

export const abilityIconOf = (character: string, kind: AbilityKind): string | undefined => {
  const assetName = characterAssetNameOf(character);
  return assetName ? ABILITY_IMAGES[`../char/${assetName}${ABILITY_SUFFIX[kind]}.png`] : undefined;
};
