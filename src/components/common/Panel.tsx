import type { ReactNode } from 'react';
import styles from './pageLayout.module.css';

interface PanelProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

const Panel = ({ children, id, className }: PanelProps) => (
  <section id={id} className={className ? `${styles.panel} ${className}` : styles.panel}>
    {children}
  </section>
);

export default Panel;
