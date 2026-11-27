import type { ReactNode } from 'react';
import { Input, Segmented } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import styles from './filterBar.module.css';

interface FilterBarProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  categoryLabel: string;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  meta?: ReactNode;
  actions?: ReactNode;
}

const FilterBar = ({
  options,
  value,
  onChange,
  categoryLabel,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  meta,
  actions,
}: FilterBarProps) => (
  <div className={styles.bar}>
    <div className={styles.controls}>
      <Segmented<string>
        className={styles.categories}
        aria-label={categoryLabel}
        options={options.map((option) => ({
          ...option,
          className: option.value === value ? styles.selectedCategory : undefined,
        }))}
        value={value}
        onChange={onChange}
      />
      <div className={styles.fields}>
        <Input
          className={styles.search}
          aria-label={searchPlaceholder}
          placeholder={searchPlaceholder}
          prefix={<SearchOutlined />}
          allowClear
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
        {actions}
      </div>
    </div>
    {meta != null && <div className={styles.summary}>{meta}</div>}
  </div>
);

export default FilterBar;
