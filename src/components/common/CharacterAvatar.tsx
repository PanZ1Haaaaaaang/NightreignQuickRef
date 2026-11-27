import { characterIconOf } from '../../assets/icons/characters';
import styles from './CharacterAvatar.module.css';

interface CharacterAvatarProps {
  name: string;
  /** 与头像并列的显示文字，默认使用渡夜者名。 */
  label?: string;
  /** 图标边长，默认 20 */
  size?: number;
  /** true：图标在上、名字在下（用于行高较大的表格单元格） */
  stacked?: boolean;
  showName?: boolean;
  className?: string;
  /** 名称文本的类名；用于覆盖字体、省略等文本样式。 */
  labelClassName?: string;
}

/** 渡夜者名字 + 头像图标；没有对应图标时只显示名字 */
const CharacterAvatar: React.FC<CharacterAvatarProps> = ({
  name,
  label = name,
  size = 20,
  stacked = false,
  showName = true,
  className,
  labelClassName,
}) => {
  const icon = characterIconOf(name);
  if (!icon) return <span className={className}>{label}</span>;

  return (
    <span className={[styles.avatar, stacked ? styles.stacked : '', className ?? ''].filter(Boolean).join(' ')}>
      <img
        src={icon}
        alt={showName ? '' : label}
        width={size}
        height={size}
        className={styles.icon}
        style={{ width: size, height: size }}
      />
      {showName && <span className={labelClassName}>{label}</span>}
    </span>
  );
};

export default CharacterAvatar;
