import { CHARACTER_STATS } from '../../assets/icons/attributes';
import GameIcon from './GameIcon';
import styles from './characterStatLabel.module.css';

interface CharacterStatLabelProps {
  stat: keyof typeof CHARACTER_STATS;
  suffix?: string;
}

const CharacterStatLabel = ({ stat, suffix }: CharacterStatLabelProps) => {
  const { icon, label } = CHARACTER_STATS[stat];
  return (
    <span className={styles.label}>
      <GameIcon src={icon} size={16} />
      <span>
        {label}
        {suffix}
      </span>
    </span>
  );
};

export default CharacterStatLabel;
