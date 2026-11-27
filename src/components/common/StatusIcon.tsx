import { STATUS_ICONS } from '@/assets/icons/status';
import type { StatusType } from '@/types';
import GameIcon, { type GameIconProps } from './GameIcon';

const StatusIcon = ({ status, ...props }: GameIconProps & { status: StatusType }) => (
  <GameIcon src={STATUS_ICONS[status]} {...props} />
);

export default StatusIcon;
