import { useMemo } from 'react';
import type { ReactNode } from 'react';
import { Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import CustomPagination from '../../components/CustomPagination';
import { renderImpulseText } from '../../components/common/renderImpulseText';
import { MIN_PAGINATED_ROWS } from '../../config/tablePagination';
import { TALISMAN_CATEGORIES } from '../../config/talismanCategoryConfig';
import { usePagination } from '../../hooks/usePagination';
import type { EntryData } from '../../types';
import { compareEntryIds, compareEntryNames, entrySearchFields, entrySearchTerms } from './entryTableData';

type TalismanSort = Pick<SorterResult<EntryData>, 'columnKey' | 'order'>;
type EffectRow = EntryData & { talismanSpan: number; categorySpan: number };

interface TalismanEntriesTableProps {
  entries: EntryData[];
  keyword: string;
  categories: string[];
  sort: TalismanSort;
  onSortChange: (sort: TalismanSort) => void;
  contextKey: string;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  loading: boolean;
  renderEntryName: (name: string, entry: EntryData) => ReactNode;
}

const TalismanEntriesTable = ({
  entries,
  keyword,
  categories,
  sort,
  onSortChange,
  contextKey,
  pageSize,
  onPageSizeChange,
  loading,
  renderEntryName,
}: TalismanEntriesTableProps) => {
  const groups = useMemo(() => {
    const byTalisman = new Map<string, EntryData[]>();
    for (const entry of entries) {
      const key = entry.talisman || entry.entry_id;
      const effects = byTalisman.get(key);
      if (effects) effects.push(entry);
      else byTalisman.set(key, [entry]);
    }
    return [...byTalisman.values()];
  }, [entries]);

  const visibleGroups = useMemo(() => {
    const terms = entrySearchTerms(keyword);
    const filtered = groups.filter((effects) => {
      if (categories.length && !effects.some((effect) => categories.includes(effect.category ?? '其他'))) {
        return false;
      }
      if (terms.length === 0) return true;
      const fields = effects.flatMap(entrySearchFields);
      return terms.every((term) => fields.some((field) => field.includes(term)));
    });

    // 以首条效果排序，护符内各效果保留原始顺序。
    if (!sort.order || (sort.columnKey !== 'entry_id' && sort.columnKey !== 'entry_name')) return filtered;
    const compare = sort.columnKey === 'entry_name' ? compareEntryNames : compareEntryIds;
    const direction = sort.order === 'ascend' ? 1 : -1;
    return filtered.sort((a, b) => direction * compare(a[0], b[0]));
  }, [groups, keyword, categories, sort.columnKey, sort.order]);

  const { currentPage, showPagination, onPageChange } = usePagination(
    visibleGroups.length,
    pageSize,
    contextKey,
    MIN_PAGINATED_ROWS,
  );
  const pageGroups = showPagination
    ? visibleGroups.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : visibleGroups;
  const rows = pageGroups.flatMap((effects) => {
    const sameCategory = effects.every((effect) => effect.category === effects[0].category);
    return effects.map((effect, index) => ({
      ...effect,
      talismanSpan: index === 0 ? effects.length : 0,
      categorySpan: sameCategory ? (index === 0 ? effects.length : 0) : 1,
    }));
  });

  const columns: TableColumnsType<EffectRow> = [
    {
      title: 'ID',
      dataIndex: 'entry_id',
      key: 'entry_id',
      width: '8%',
      align: 'center',
      onCell: () => ({ style: { fontSize: '11px', color: 'var(--theme-text-secondary)' } }),
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      sortOrder: sort.columnKey === 'entry_id' ? sort.order : null,
    },
    {
      title: '护符',
      dataIndex: 'talisman',
      key: 'talisman',
      width: '14%',
      onCell: (effect) => ({ rowSpan: effect.talismanSpan }),
      render: (text) => text || '-',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: '9%',
      align: 'center',
      onCell: (effect) => ({ rowSpan: effect.categorySpan }),
      render: (text: string) => {
        const meta = TALISMAN_CATEGORIES[text];
        return meta ? <Tag color={meta.color}>{meta.label}</Tag> : '-';
      },
    },
    {
      title: '词条名称',
      dataIndex: 'entry_name',
      key: 'entry_name',
      width: '25%',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      sortOrder: sort.columnKey === 'entry_name' ? sort.order : null,
      render: renderEntryName,
    },
    {
      title: '解释',
      dataIndex: 'explanation',
      key: 'explanation',
      width: '38%',
      onCell: () => ({ style: { padding: '12px 8px' } }),
      render: (text: string | null) =>
        text ? (
          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6', fontSize: '13px' }}>
            {renderImpulseText(text)}
          </div>
        ) : (
          '-'
        ),
    },
  ];

  return (
    <>
      <Table<EffectRow>
        columns={columns}
        dataSource={rows}
        rowKey="entry_id"
        pagination={false}
        onChange={(_, __, sorter) => {
          if (!Array.isArray(sorter)) onSortChange({ columnKey: sorter.columnKey, order: sorter.order });
        }}
        size="small"
        bordered
        loading={loading}
        scroll={{ x: 680 }}
      />
      {showPagination && (
        <CustomPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={visibleGroups.length}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          itemUnit="件护符"
          ariaLabel="护符分页"
          loading={loading}
        />
      )}
    </>
  );
};

export default TalismanEntriesTable;
