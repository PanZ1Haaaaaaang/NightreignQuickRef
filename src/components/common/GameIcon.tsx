export interface GameIconProps {
  size?: number;
  className?: string;
  alt?: string;
}

const GameIcon = ({ src, size = 18, className, alt = '' }: GameIconProps & { src?: string }) =>
  src ? (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain', flexShrink: 0 }}
    />
  ) : null;

export default GameIcon;
