import { DAMAGE_ICONS } from '@/assets/icons/damage';
import type { DamageType } from '@/types';
import GameIcon, { type GameIconProps } from './GameIcon';

const DamageTypeIcon = ({ type, ...props }: GameIconProps & { type: DamageType }) => (
  <GameIcon src={DAMAGE_ICONS[type]} {...props} />
);

export default DamageTypeIcon;
