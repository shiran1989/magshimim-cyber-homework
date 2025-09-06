import { useState, useCallback } from 'react';

export const usePagination = (initialPage = 0, initialPageSize = 20) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0); // Reset to first page when page size changes
  }, []);

  const resetPagination = useCallback(() => {
    setPage(0);
  }, []);

  return {
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
    resetPagination,
  };
};
