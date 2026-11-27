import { useState } from 'react';
import { Table } from 'antd';
import type { TableColumnType, TableProps } from 'antd';
import { DEFAULT_TABLE_PAGE_SIZE, MIN_PAGINATED_ROWS } from '@/config/tablePagination';
import { usePagination } from '@/hooks/usePagination';
import CustomPagination from '@/components/CustomPagination';

export type PageLocalColumns<Row extends object> = (TableColumnType<Row> & {
  sorter?: never;
  onFilter?: never;
  children?: never;
})[];

type PagedTableProps<Row extends object> = Omit<TableProps<Row>, 'pagination' | 'columns' | 'dataSource'> & {
  /** 传入完整的筛选结果，表头排序完成后再分页。 */
  dataSource: readonly Row[];
  /** 使用列工厂时，由调用方完成全量排序和筛选，再按实际显示的行计算合并单元格。 */
  columns: TableProps<Row>['columns'] | ((pageRows: readonly Row[]) => PageLocalColumns<Row>);
  contextKey: string;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
};

const PagedTable = <Row extends object>({
  dataSource,
  columns,
  contextKey,
  pageSize: controlledPageSize,
  onPageSizeChange,
  onChange,
  ...tableProps
}: PagedTableProps<Row>) => {
  const [localPageSize, setLocalPageSize] = useState(DEFAULT_TABLE_PAGE_SIZE);
  const pageSize = controlledPageSize ?? localPageSize;
  const { currentPage, showPagination, onPageChange } = usePagination(
    dataSource.length,
    pageSize,
    contextKey,
    MIN_PAGINATED_ROWS,
  );
  const start = (currentPage - 1) * pageSize;
  const pageLocal = typeof columns === 'function';
  const tableRows = pageLocal && showPagination ? dataSource.slice(start, start + pageSize) : dataSource;
  const pageColumns = pageLocal ? columns(tableRows) : columns;

  return (
    <>
      <Table<Row>
        {...tableProps}
        columns={pageColumns}
        dataSource={tableRows}
        pagination={showPagination && !pageLocal ? { current: currentPage, pageSize, placement: ['none'] } : false}
        onChange={(pagination, filters, sorter, extra) => {
          if (currentPage > 1 && (extra.action === 'sort' || extra.action === 'filter')) onPageChange(1);
          onChange?.(pagination, filters, sorter, extra);
        }}
      />
      {showPagination && (
        <CustomPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={dataSource.length}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange ?? setLocalPageSize}
          loading={typeof tableProps.loading === 'object' ? (tableProps.loading.spinning ?? true) : tableProps.loading}
        />
      )}
    </>
  );
};

export default PagedTable;
