import styles from './ImpulseBadge.module.css';

interface ImpulseBadgeProps {
  level: number;
  effect?: string;
  highlight?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLevelPrefix?: boolean;
}

const ImpulseBadge = ({
  level,
  effect,
  highlight = false,
  size = 'md',
  showLevelPrefix = false,
}: ImpulseBadgeProps) => {
  const badge = (
    <span className={styles.number} data-size={size} data-highlight={highlight || undefined}>
      {level}
    </span>
  );

  if (!effect && !showLevelPrefix) return badge;

  return (
    <span className={styles.label}>
      {showLevelPrefix && <span>冲击力</span>}
      {badge}
      {effect && <span>{effect}</span>}
    </span>
  );
};

export default ImpulseBadge;
