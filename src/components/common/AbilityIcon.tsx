import { abilityIconOf } from '@/assets/icons/abilities';
import type { AbilityKind } from '@/types';
import GameIcon, { type GameIconProps } from './GameIcon';

const AbilityIcon = ({ character, kind, ...props }: GameIconProps & { character: string; kind: AbilityKind }) => (
  <GameIcon src={abilityIconOf(character, kind)} {...props} />
);

export default AbilityIcon;
