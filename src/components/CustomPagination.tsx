import React from 'react';
import { Button, Select } from 'antd';
import { TABLE_PAGE_SIZES } from '../config/tablePagination';

const pageSizeOptions = TABLE_PAGE_SIZES.map((size) => ({ value: size, label: `${size} 条` }));

export interface CustomPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  loading?: boolean;
}

// 词条详情页 / 武器战技页共用的分页条
const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  loading = false,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (loading || totalItems === 0) {
    return null;
  }

  return (
    <nav
      aria-label="表格分页"
      className="custom-pagination-row"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '15px',
      }}
    >
      <div className="page-size-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--theme-text-secondary)', fontSize: '14px' }}>每页显示</span>
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
        <span style={{ color: 'var(--theme-text-secondary)', fontSize: '14px' }}>共 {totalItems} 条记录</span>
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
