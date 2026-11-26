import { useEffect, useState } from 'react';

type PaginationState = { page: number; pageSize: number; contextKey: string };

const reconcilePage = (state: PaginationState, contextKey: string, pageSize: number, lastPage: number) => {
  if (state.contextKey !== contextKey || state.pageSize !== pageSize) return { page: 1, pageSize, contextKey };
  if (state.page > lastPage) return { ...state, page: lastPage };
  return state;
};

export const usePagination = (totalItems: number, pageSize: number, contextKey: string, minItems: number) => {
  const [state, setState] = useState({ page: 1, pageSize, contextKey });
  const showPagination = totalItems >= minItems;
  const lastPage = showPagination ? Math.ceil(totalItems / pageSize) : 1;
  const currentPage = reconcilePage(state, contextKey, pageSize, lastPage).page;

  useEffect(() => {
    setState((previous) => reconcilePage(previous, contextKey, pageSize, lastPage));
  }, [contextKey, pageSize, lastPage]);

  return {
    currentPage,
    showPagination,
    onPageChange: (page: number) => setState({ page: Math.max(1, Math.min(page, lastPage)), pageSize, contextKey }),
  };
};
