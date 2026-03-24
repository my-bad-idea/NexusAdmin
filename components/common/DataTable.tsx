'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  RowSelectionState,
} from '@tanstack/react-table';
import { useState, useEffect } from 'react';
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
  paginationResource,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const selectionColumn: ColumnDef<T> = {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={table.getToggleAllPageRowsSelectedHandler()}
        className="cursor-pointer"
        style={{ accentColor: 'var(--accent)', verticalAlign: 'middle' }}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        onClick={(e) => e.stopPropagation()}
        className="cursor-pointer"
        style={{ accentColor: 'var(--accent)', verticalAlign: 'middle' }}
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
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: enableSelection,
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
  });

  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(Object.keys(rowSelection).filter((k) => rowSelection[k]));
    }
  }, [rowSelection, onSelectionChange]);

  const totalPages = Math.ceil(total / pageSize);
  const py = density === 'compact' ? 'py-2 px-3' : 'py-3 px-4';

  if (isLoading) {
    return <SkeletonTable rows={7} columns={columns.length + (enableSelection ? 1 : 0)} />;
  }

  if (error) {
    return (
      <div
        className="rounded-[var(--table-radius)] p-8 text-center border border-[var(--border)]"
        style={{ background: 'var(--white)', color: 'var(--danger)' }}
      >
        {error.message}
      </div>
    );
  }

  if (data.length === 0 && !isLoading) {
    return (
      <div
        className="rounded-[var(--table-radius)] border border-[var(--border)]"
        style={{ background: 'var(--white)' }}
      >
        <EmptyState scene={emptyScene} resource={emptyResource} onAction={onEmptyAction} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Fetching progress bar */}
      {isFetching && !isLoading && (
        <div className="h-0.5 rounded-full overflow-hidden" style={{ background: 'var(--accent-light)' }}>
          <div
            className="h-full rounded-full animate-pulse"
            style={{ width: '60%', background: 'var(--accent)' }}
          />
        </div>
      )}

      {/* Table wrapper - hide on mobile if auto, show cards */}
      <div
        className="rounded-[var(--table-radius)] overflow-hidden border border-[var(--table-border)]"
        style={{ background: 'var(--white)', boxShadow: 'var(--shadow-1)' }}
      >
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: '700px' }}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} style={{ background: 'var(--table-header-bg)', borderBottom: '1px solid var(--table-border)' }}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      style={{
                        padding: header.column.id === 'select' ? '7px 0' : '7px 10px',
                        textAlign: header.column.id === 'select' ? 'center' : 'left',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '.05em',
                        color: 'var(--table-header-text)',
                        verticalAlign: 'middle',
                        width: header.getSize() !== 150 ? header.getSize() : undefined,
                        cursor: enableSorting && header.column.getCanSort() ? 'pointer' : 'default',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                      }}
                      onClick={enableSorting ? header.column.getToggleSortingHandler() : undefined}
                    >
                      {header.column.id === 'select' ? (
                        flexRender(header.column.columnDef.header, header.getContext())
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {enableSorting && header.column.getCanSort() && (
                            <span style={{ opacity: 0.4, fontSize: '9px', marginLeft: '2px' }}>
                              {header.column.getIsSorted() === 'asc' ? '↑'
                                : header.column.getIsSorted() === 'desc' ? '↓'
                                : '↕'}
                            </span>
                          )}
                        </span>
                      )}
                    </th>
                  ))}
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
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        padding: cell.column.id === 'select' ? '8px 0' : '8px 10px',
                        textAlign: cell.column.id === 'select' ? 'center' : undefined,
                        fontSize: '12.5px',
                        color: 'var(--txt)',
                        verticalAlign: 'middle',
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
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
                      <div key={cell.id} style={{ fontSize: 'var(--text-sm)' }}>
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
                    <span key={cell.id} style={{ fontSize: 'var(--text-xs)' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination — inside card with border-top */}
        {total > 0 && onPageChange && (
          <div
            className="flex items-center justify-between flex-wrap gap-2"
            style={{
              borderTop: '1px solid var(--border)',
              padding: '8px 12px',
              fontSize: '11px',
              color: 'var(--txt-muted)',
            }}
          >
            <div className="pagination-info">
              Showing{' '}
              <span style={{ fontFamily: 'var(--font-mono-custom)', fontWeight: 500, color: 'var(--txt-sec)' }}>
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
              </span>{' '}
              of{' '}
              <span style={{ fontFamily: 'var(--font-mono-custom)', fontWeight: 500, color: 'var(--txt-sec)' }}>
                {total}
              </span>
              {paginationResource ? ` ${paginationResource}` : ''}
            </div>
            <div className="flex items-center gap-[3px]">
              <button
                onClick={() => onPageChange(page - 1, pageSize)}
                disabled={page <= 1}
                className="grid place-items-center rounded-[var(--radius-sm)] transition-all"
                style={{
                  width: '24px', height: '24px',
                  border: '1px solid var(--border)',
                  background: page <= 1 ? 'var(--bg)' : 'var(--bg)',
                  color: page <= 1 ? 'var(--txt-muted)' : 'var(--txt-sec)',
                  cursor: page <= 1 ? 'default' : 'pointer',
                  opacity: page <= 1 ? 0.35 : 1,
                  fontSize: '11.5px', fontFamily: 'var(--font-mono-custom)',
                }}
              >
                <ChevronLeft size={12} />
              </button>
              {getPageNumbers(page, totalPages).map((p, i) =>
                p === '...' ? (
                  <span key={`sep-${i}`} style={{ color: 'var(--txt-muted)', fontSize: '12px', padding: '0 2px' }}>
                    ···
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => onPageChange(p, pageSize)}
                    className="grid place-items-center rounded-[var(--radius-sm)] transition-all"
                    style={{
                      width: '24px', height: '24px',
                      border: `1px solid ${p === page ? 'var(--accent)' : 'var(--border)'}`,
                      background: p === page ? 'var(--accent)' : 'var(--bg)',
                      color: p === page ? '#fff' : 'var(--txt-sec)',
                      fontWeight: p === page ? 600 : 400,
                      cursor: 'pointer',
                      fontSize: '11.5px', fontFamily: 'var(--font-mono-custom)',
                    }}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => onPageChange(page + 1, pageSize)}
                disabled={page >= totalPages}
                className="grid place-items-center rounded-[var(--radius-sm)] transition-all"
                style={{
                  width: '24px', height: '24px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: page >= totalPages ? 'var(--txt-muted)' : 'var(--txt-sec)',
                  cursor: page >= totalPages ? 'default' : 'pointer',
                  opacity: page >= totalPages ? 0.35 : 1,
                  fontSize: '11.5px', fontFamily: 'var(--font-mono-custom)',
                }}
              >
                <ChevronRight size={12} />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: '11px', color: 'var(--txt-muted)' }}>Per page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  if (onPageSizeChange) onPageSizeChange(newSize);
                  else onPageChange(1, newSize);
                }}
                style={{
                  height: '24px', padding: '0 20px 0 7px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  fontSize: '11px', fontFamily: 'var(--font-mono-custom)',
                  color: 'var(--txt)', cursor: 'pointer', outline: 'none',
                  WebkitAppearance: 'none', appearance: 'none',
                  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 5px center',
                }}
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
