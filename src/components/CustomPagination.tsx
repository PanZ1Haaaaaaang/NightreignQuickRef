import React from 'react';
import { Button, Select } from 'antd';
import { TABLE_PAGE_SIZES } from '@/config/tablePagination';

const pageSizeOptions = TABLE_PAGE_SIZES.map((size) => ({ value: size, label: `${size} 条` }));

export interface CustomPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  itemUnit?: string;
  ariaLabel?: string;
  loading?: boolean;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  itemUnit = '条记录',
  ariaLabel = '表格分页',
  loading = false,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (loading || totalItems === 0) {
    return null;
  }

  return (
    <nav
      aria-label={ariaLabel}
      className="custom-pagination-row"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '15px',
      }}
    >
      <div className="page-size-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {onPageSizeChange ? (
          <>
            <span className="pagination-label">每页显示</span>
            <Select
              aria-label="每页显示条数"
              value={pageSize}
              onChange={(value) => {
                onPageSizeChange(value);
                onPageChange(1);
              }}
              options={pageSizeOptions}
              size="small"
              style={{ width: '100px' }}
            />
          </>
        ) : (
          <span className="pagination-label">
            每页 {pageSize} {itemUnit}
          </span>
        )}
        <span className="pagination-label">
          共 {totalItems} {itemUnit}
        </span>
      </div>

      <div className="page-nav-controls" style={{ display: 'flex', alignItems: 'center' }}>
        <Button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} size="medium">
          上一页
        </Button>

        <span
          role="status"
          className="page-position"
          style={{
            color: 'var(--theme-text-secondary)',
            fontSize: '14px',
          }}
        >
          第 {currentPage} 页，共 {totalPages} 页
        </span>

        <Button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages} size="medium">
          下一页
        </Button>
      </div>
    </nav>
  );
};

export default CustomPagination;
