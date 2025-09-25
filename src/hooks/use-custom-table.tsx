import type React from "react";
import type { FieldValues } from "react-hook-form";

import {
  CustomTableBulkAction,
  CustomTableColumn,
  CustomTableTableState
} from '@/components/custom/data-table/types';
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useApi from "./use-api";

export const useCustomTable = <T extends Record<string, any>>(
  url: string,
  columns: CustomTableColumn<T>[],
  bulkActions: CustomTableBulkAction<T>[] = [],
  preFilled: any = {},
  initialState: Partial<CustomTableTableState<T>> = {}
) => {
  const [state, setState] = useState<CustomTableTableState<T>>({
    data: [],
    loading: false,
    error: null,
    pages: 0,
    currentPage: 0,
    rowsPerPage: 10,
    recordCount: 0,
    sortBy: null,
    sortDir: 'desc',
    selectedRows: [],
    visibleColumns: columns.map((column) => column.data),
    filters: {},
    ...initialState,
  });
  const { trigger } = useApi();

  const fetchData = useCallback(async (currentState: CustomTableTableState<T>) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    const config = {
      ...preFilled || {},
      ...currentState.filters,
      start: currentState.currentPage * currentState.rowsPerPage,
      length: currentState.rowsPerPage,
      sortBy: currentState.sortBy,
      sortDir: currentState.sortDir,
    };

    const { data, error } = await trigger(url, {
      data: config,
    });

    if (error) {
      setState((prev) => ({ ...prev, error: error?.message, loading: false }));
      return;
    }

    if (data) {
      setState((prev) => ({
        ...prev,
        data: data.data,
        pages: Math.ceil(data.recordsFiltered / currentState.rowsPerPage),
        recordCount: data.recordsTotal,
        loading: false,
        selectedRows: prev.selectedRows.filter(selected =>
          data.data.some(newRow => newRow.id === selected.id)
        ),
      }));
    }
  }, [url, preFilled]);

  // Use a ref to track the latest state for fetchData
  const stateRef = useRef(state);
  stateRef.current = state;

  // Effect for state changes that should trigger refetch
  useEffect(() => {
    fetchData(stateRef.current);
  }, [state.filters, state.currentPage, state.rowsPerPage, state.sortBy, state.sortDir]);

  const onCheckboxChange = useCallback((event: React.ChangeEvent<HTMLInputElement> | { target: { checked: boolean } }, row: T) => {
    const checked = event.target.checked;
    setState((prev) => {
      if (checked) {
        const isAlreadySelected = prev.selectedRows.some(selectedRow => selectedRow.id === row.id);
        return {
          ...prev,
          selectedRows: isAlreadySelected ? prev.selectedRows : [...prev.selectedRows, row]
        };
      } else {
        return {
          ...prev,
          selectedRows: prev.selectedRows.filter((selectedRow) => selectedRow.id !== row.id)
        };
      }
    });
  }, []);

  const onSelectAllRows = useCallback((event: React.ChangeEvent<HTMLInputElement> | { target: { checked: boolean } }) => {
    const checked = event.target.checked;
    setState((prev) => ({
      ...prev,
      selectedRows: checked ? [...prev.data] : [],
    }));
  }, []);

  const onSort = useCallback((column: keyof T) => {
    setState((prev) => ({
      ...prev,
      sortBy: column,
      sortDir: prev.sortBy === column && prev.sortDir === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const onFilter = useCallback((filterData: FieldValues) => {
    const filteredData = Object.fromEntries(
      Object.entries(filterData).filter(([, value]) => {
        // Handle arrays properly for multi-select filters
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== "" && value !== null && value !== undefined;
      })
    );
    setState((prev) => ({ ...prev, filters: filteredData, currentPage: 0 }));
  }, []);

  const setFilters = useCallback((filters: FieldValues) => {
    setState((prev) => ({
      ...prev,
      filters,
      currentPage: 0, // Reset to the first page when filters change
    }));
  }, []);

  const setVisibleColumns = useCallback((columns: (keyof T)[]) => {
    setState((prev) => ({ ...prev, visibleColumns: columns }));
  }, []);

  // Add function to reset selected rows
  const resetSelectedRows = useCallback(() => {
    setState((prev) => ({ ...prev, selectedRows: [] }));
  }, []);

  // Add reload method
  const reload = useCallback(async () => {
    await fetchData(stateRef.current);
  }, [fetchData]);

  const tableActions = useMemo(() => ({
    setCurrentPage: (page: number) => setState((prev) => ({ ...prev, currentPage: page })),
    setRowsPerPage: (rowsPerPage: number) => setState((prev) => ({ ...prev, rowsPerPage, currentPage: 0 })),
    onCheckboxChange,
    onSelectAllRows,
    onSort,
    onFilter,
    setVisibleColumns,
    refresh: () => fetchData(stateRef.current),
    reload, // Add reload to the returned actions
    setFilters,
    resetSelectedRows,
  }), [onCheckboxChange, onSelectAllRows, onSort, onFilter, setVisibleColumns, fetchData, reload, setFilters, resetSelectedRows]);

  return {
    ...state,
    columns,
    bulkActions,
    ...tableActions,
  };
};