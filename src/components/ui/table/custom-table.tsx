// Improved CustomTable.tsx with fixed bulk actions and selection

import CustomTablePagination from '@/components/custom/data-table/custom-table-pagination';
import { CustomTableToolbar } from '@/components/custom/data-table/custom-table-toolbar';
import { CustomTableProps } from '@/components/custom/data-table/types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useCustomTable } from '@/hooks/use-custom-table';
import { IconLoader } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

const CustomTable = <T extends Record<string, any>>({
  url,
  preFilled,
  columns,
  filters,
  bulkActions = [],
  onInit,
}: CustomTableProps<T>) => {
  const table = useCustomTable(url, columns, bulkActions, preFilled);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    if (onInit) {
      //@ts-ignore
      onInit(table);
    }
  }, []);
  useEffect(() => {
    setShowBulkActions(table.selectedRows.length > 0);
  }, [table.selectedRows]);

  const areAllRowsSelected = table.data.length > 0 &&
    table.data.every(row =>
      table.selectedRows.some(selectedRow => selectedRow.id === row.id)
    );
  const areSomeRowsSelected = table.selectedRows.length > 0 && !areAllRowsSelected;

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      <div className={table.loading ? 'hidden' : ''}>
        <CustomTableToolbar table={table} filters={filters} />
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && bulkActions && bulkActions.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
          <span className="text-sm font-medium">{table.selectedRows.length} sélectionné(s)</span>
          <div className="flex-1"></div>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, index) => (
              //@ts-ignore
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => action.action(table.selectedRows, table.refresh)}
                disabled={action.disabled ? action.disabled(table.selectedRows) : false}
                className={`flex items-center rounded-lg shadow-sm gap-1 ${action.className ?? ''}`}
              >
                {action.icon && action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Show skeleton when loading */}
      {table.loading && (
        <DataTableSkeleton
          columnCount={table.visibleColumns.length}
          rowCount={table.rowsPerPage}
          filterCount={filters ? Object.keys(filters).length : 0}
          withBulkActions={bulkActions && bulkActions.length > 0}
          withPagination={true}
          withViewOptions={false}
        />
      )}

      {!table.loading && (
        <>
          <div className='relative flex flex-1'>
            {table.loading && (
              <div className='bg-accent absolute inset-0 z-50 flex h-full w-full items-center justify-center rounded-lg border opacity-40'>
                <IconLoader className='animate-spin' />
              </div>
            )}

            <div
              className={`absolute inset-0 flex overflow-hidden rounded-lg border ${table.loading && 'blur-sm'}`}
            >
              <ScrollArea className='h-full w-full'>
                <Table>
                  <TableHeader className='bg-muted sticky top-0 z-10'>
                    <TableRow>
                      {/* Selection checkbox column */}
                      {bulkActions && bulkActions.length > 0 && (
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={areAllRowsSelected}
                            //@ts-ignore
                            indeterminate={areSomeRowsSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                const newSelectedRows = [...table.selectedRows];
                                table.data.forEach(row => {
                                  if (!table.selectedRows.some(selectedRow => selectedRow.id === row.id)) {
                                    newSelectedRows.push(row);
                                  }
                                });
                                table.selectedRows = newSelectedRows;
                                table.onSelectAllRows({ target: { checked: true } } as any);
                              } else {
                                const filteredSelectedRows = table.selectedRows.filter(
                                  selectedRow => !table.data.some(row => row.id === selectedRow.id)
                                );
                                table.selectedRows = filteredSelectedRows;
                                table.onSelectAllRows({ target: { checked: false } } as any);
                              }
                            }}
                            aria-label="Select all"
                            className="rounded-lg"
                          />
                        </TableHead>
                      )}

                      {table.columns.map(
                        (col) =>
                          // @ts-ignore
                          table.visibleColumns.includes(col.data) && (
                            <TableHead
                              // @ts-ignore
                              key={col.data}
                              colSpan={col.width ? +col.width : 1}
                              className={col.sortable ? 'cursor-pointer hover:bg-muted-foreground/10' : ''}
                              onClick={() => {
                                if (col.sortable) {
                                  // @ts-ignore
                                  table.onSort(col.data);
                                }
                              }}
                            >
                              <div className="flex items-center">
                                {col.label}
                                {col.sortable && (
                                  <span className="ml-1">
                                    {/* @ts-ignore */}
                                    {table.sortBy === col.data && table.sortDir === 'asc' && '▲'}
                                    {/* @ts-ignore */}
                                    {table.sortBy === col.data && table.sortDir === 'desc' && '▼'}
                                  </span>
                                )}
                              </div>
                            </TableHead>
                          )
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {table.data?.length ? (
                      table.data.map((row) => (
                        <TableRow key={row.id}>
                          {/* Row selection checkbox */}
                          {bulkActions && bulkActions.length > 0 && (
                            <TableCell>
                              <Checkbox
                                checked={table.selectedRows.some(
                                  (selectedRow) => selectedRow.id === row.id
                                )}
                                onCheckedChange={(checked) =>
                                  table.onCheckboxChange({ target: { checked } } as any, row)
                                }
                                aria-label="Select row"
                                className="rounded-lg"
                              />
                            </TableCell>
                          )}

                          {table.columns.map(
                            (col) =>
                              // @ts-ignore
                              table.visibleColumns.includes(col.data) &&
                              // @ts-ignore
                              (col.render ? (
                                <TableCell
                                  // @ts-ignore
                                  key={col.data + '-' + row.id}
                                  colSpan={col.width ? +col.width : 1}
                                >
                                  {col.render(
                                    row[col.data],
                                    row,
                                    table.refresh
                                  )}
                                </TableCell>
                              ) : (
                                <TableCell
                                  // @ts-ignore
                                  key={`${col.data}-${row.id}`}
                                  colSpan={col.width ? +col.width : 1}
                                >
                                  {/*@ts-ignore*/}
                                  {row[col.data] ?? ''}
                                </TableCell>
                              ))
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={(bulkActions && bulkActions.length > 0 ? 1 : 0) + (table.visibleColumns.length ?? 0)}
                          className='h-24 text-center'
                        >
                          Aucune donnée disponible
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <ScrollBar orientation='horizontal' />
              </ScrollArea>
            </div>
          </div>
          <CustomTablePagination<T> table={table} />
        </>
      )}
    </div>
  );
};

export default CustomTable;