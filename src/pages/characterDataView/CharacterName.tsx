import styles from '../../styles/characterDataView.module.css';
import { characterIconOf } from './characterIcons';

interface CharacterNameProps {
  name: string;
  /** 图标边长，默认 20 */
  size?: number;
  /** true：图标在上、名字在下（用于行高较大的表格单元格） */
  stacked?: boolean;
  className?: string;
}

/** 渡夜者名字 + 头像图标；没有对应图标时只显示名字 */
const CharacterName: React.FC<CharacterNameProps> = ({ name, size = 20, stacked = false, className }) => {
  const icon = characterIconOf(name);
  if (!icon) return <span className={className}>{name}</span>;
  return (
    <span className={`${styles.characterName} ${stacked ? styles.characterNameStacked : ''} ${className ?? ''}`}>
      <img
        src={icon}
        alt=""
        width={size}
        height={size}
        className={styles.characterIcon}
        style={{ width: size, height: size }}
      />
      <span>{name}</span>
    </span>
  );
};

export default CharacterName;
