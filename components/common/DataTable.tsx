'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  SortingState,
  useReactTable,
  RowSelectionState,
} from '@tanstack/react-table';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { SkeletonTable } from './SkeletonTable';
import { EmptyState } from './EmptyState';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps<T extends { id: string }> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  isFetching?: boolean;
  error?: Error | null;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
  onPageSizeChange?: (size: number) => void;
  enableSelection?: boolean;
  onSelectionChange?: (selectedIds: string[]) => void;
  emptyScene?: 'empty' | 'no-results' | 'no-permission';
  emptyResource?: string;
  onEmptyAction?: () => void;
  density?: 'compact' | 'relaxed';
  striped?: boolean;
  enableSorting?: boolean;
  sortState?: SortingState;
  onSortChange?: (updater: SortingState | ((prev: SortingState) => SortingState)) => void;
  enableColumnVisibility?: boolean;
  mobileView?: 'auto' | 'table' | 'card';
  hiddenColumns?: string[];
  paginationResource?: string;
}

function getPageNumbers(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | '...')[] = [];
  pages.push(1);
  if (page > 3) pages.push('...');
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (page < totalPages - 2) pages.push('...');
  if (totalPages > 1) pages.push(totalPages);
  return pages;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  isFetching = false,
  error,
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  enableSelection = false,
  onSelectionChange,
  emptyScene = 'empty',
  emptyResource,
  onEmptyAction,
  density = 'compact',
  striped = true,
  enableSorting = true,
  sortState: externalSortState,
  onSortChange: externalOnSortChange,
  paginationResource,
}: DataTableProps<T>) {
  const t = useTranslations();
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const sorting = externalSortState ?? internalSorting;
  const setSorting = externalOnSortChange ?? setInternalSorting;
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectionColumn: ColumnDef<T> = {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="cursor-pointer align-middle"
        style={{ accentColor: 'var(--accent)' }}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        onClick={(e) => e.stopPropagation()}
        className="cursor-pointer align-middle"
        style={{ accentColor: 'var(--accent)' }}
      />
    ),
    size: 40,
  };

  const allColumns = enableSelection ? [selectionColumn, ...columns] : columns;

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: enableSelection,
    manualPagination: true,
    manualSorting: true,
    pageCount: Math.ceil(total / pageSize),
  });

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Object.keys(rowSelection).filter((k) => rowSelection[k]));
    }
  }, [rowSelection, onSelectionChange]);

  const totalPages = Math.ceil(total / pageSize);

  if (isLoading) {
    return <SkeletonTable rows={7} columns={columns.length + (enableSelection ? 1 : 0)} />;
  }

  if (error) {
    return (
      <div className="rounded-[var(--table-radius)] p-8 text-center border border-[var(--border)] bg-[var(--white)] text-[var(--danger)]">
        {error.message}
      </div>
    );
  }

  if (data.length === 0 && !isLoading) {
    return (
      <div className="rounded-[var(--table-radius)] border border-[var(--border)] bg-[var(--white)]">
        <EmptyState scene={emptyScene} resource={emptyResource} onAction={onEmptyAction} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Fetching progress bar */}
      {isFetching && !isLoading && (
        <div className="h-0.5 rounded-full overflow-hidden bg-[var(--accent-light)]">
          <div className="h-full rounded-full animate-pulse w-[60%] bg-[var(--accent)]" />
        </div>
      )}

      {/* Table wrapper */}
      <div className="rounded-[var(--table-radius)] overflow-hidden border border-[var(--table-border)] bg-[var(--white)] shadow-[var(--shadow-1)]">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse min-w-[700px]">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="bg-[var(--table-header-bg)] border-b border-[var(--table-border)]">
                  {hg.headers.map((header) => {
                    const isSelect = header.column.id === 'select';
                    const canSort = enableSorting && header.column.getCanSort();
                    return (
                      <th
                        key={header.id}
                        className={cn(
                          'py-[7px] text-[10.5px] font-semibold uppercase tracking-[.05em] text-[var(--table-header-text)] align-middle select-none whitespace-nowrap',
                          isSelect ? 'px-0 text-center' : 'px-2.5 text-left',
                          canSort && 'cursor-pointer',
                        )}
                        style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                        onClick={enableSorting ? header.column.getToggleSortingHandler() : undefined}
                      >
                        {isSelect ? (
                          flexRender(header.column.columnDef.header, header.getContext())
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {canSort && (
                              <span className="opacity-40 text-[9px] ml-0.5">
                                {header.column.getIsSorted() === 'asc' ? '↑'
                                  : header.column.getIsSorted() === 'desc' ? '↓'
                                  : '↕'}
                              </span>
                            )}
                          </span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={cn(
                    'border-b border-[var(--table-border)] transition-colors cursor-pointer',
                    row.getIsSelected()
                      ? 'bg-[var(--table-row-selected)] shadow-[inset_4px_0_0_var(--table-row-selected-bar)]'
                      : [
                          'hover:bg-[var(--table-row-hover)]',
                          striped && index % 2 === 1 && 'bg-[var(--table-row-stripe)]',
                        ]
                  )}
                  onClick={() => enableSelection && row.toggleSelected()}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isSelect = cell.column.id === 'select';
                    return (
                      <td
                        key={cell.id}
                        className={cn(
                          'py-2 text-[12.5px] text-[var(--txt)] align-middle',
                          isSelect ? 'px-0 text-center' : 'px-2.5',
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile card view */}
        <div className="md:hidden flex flex-col divide-y divide-[var(--border)]">
          {table.getRowModel().rows.map((row) => {
            const cells = row.getVisibleCells().filter((c) => c.column.id !== 'select');
            const firstTwo = cells.slice(0, 2);
            const actions = cells.find((c) => c.column.id === 'actions');
            return (
              <div
                key={row.id}
                className={cn(
                  'p-4 flex flex-col gap-2 transition-colors',
                  row.getIsSelected() && 'border-l-4 border-[var(--sel-border)] bg-[var(--surface-3)]'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {firstTwo.map((cell) => (
                      <div key={cell.id} className="text-[var(--text-sm)]">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    ))}
                  </div>
                  {actions && (
                    <div>{flexRender(actions.column.columnDef.cell, actions.getContext())}</div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {cells.slice(2).filter((c) => c.column.id !== 'actions').map((cell) => (
                    <span key={cell.id} className="text-[var(--text-xs)]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {total > 0 && onPageChange && (
          <div className="flex items-center justify-between flex-wrap gap-2 border-t border-[var(--border)] px-3 py-2 text-[11px] text-[var(--txt-muted)]">
            <div>
              {t('datatable.showing')}{' '}
              <span className="font-[var(--font-mono)] font-medium text-[var(--txt-sec)]">
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
              </span>{' '}
              {t('datatable.of')}{' '}
              <span className="font-[var(--font-mono)] font-medium text-[var(--txt-sec)]">
                {total}
              </span>
              {paginationResource ? ` ${paginationResource}` : ''}
            </div>
            <div className="flex items-center gap-[3px]">
              <button
                onClick={() => onPageChange(page - 1, pageSize)}
                disabled={page <= 1}
                className={cn(
                  'grid place-items-center w-6 h-6 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] font-[var(--font-mono)] text-[11.5px] transition-all',
                  page <= 1 ? 'text-[var(--txt-muted)] opacity-35 cursor-default' : 'text-[var(--txt-sec)] cursor-pointer',
                )}
              >
                <ChevronLeft size={12} />
              </button>
              {getPageNumbers(page, totalPages).map((p, i) =>
                p === '...' ? (
                  <span key={`sep-${i}`} className="text-[var(--txt-muted)] text-[12px] px-0.5">···</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => onPageChange(p, pageSize)}
                    className={cn(
                      'grid place-items-center w-6 h-6 rounded-[var(--radius-sm)] font-[var(--font-mono)] text-[11.5px] cursor-pointer transition-all border',
                      p === page
                        ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)] font-semibold'
                        : 'border-[var(--border)] bg-[var(--bg)] text-[var(--txt-sec)]',
                    )}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => onPageChange(page + 1, pageSize)}
                disabled={page >= totalPages}
                className={cn(
                  'grid place-items-center w-6 h-6 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg)] font-[var(--font-mono)] text-[11.5px] transition-all',
                  page >= totalPages ? 'text-[var(--txt-muted)] opacity-35 cursor-default' : 'text-[var(--txt-sec)] cursor-pointer',
                )}
              >
                <ChevronRight size={12} />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[var(--txt-muted)]">{t('datatable.perPage')}</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  if (onPageSizeChange) onPageSizeChange(newSize);
                  else onPageChange(1, newSize);
                }}
                className="nx-select-mini"
                style={{ height: '24px' }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
