import type { ReactNode } from 'react';
import styles from './pageLayout.module.css';

interface PageShellProps {
  children: ReactNode;
  className?: string;
}

const PageShell = ({ children, className }: PageShellProps) => (
  <div className={className ? `${styles.shell} ${className}` : styles.shell}>{children}</div>
);

export default PageShell;
