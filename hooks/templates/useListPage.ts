/**
 * Template hook for standard list pages (Orders, Products, etc.).
 * Combines useList, useAction, and usePermission into a single API.
 *
 * Note: UserList intentionally does NOT use this template because it has
 * grown beyond the template's scope (batch operations, advanced filter drawer,
 * form modal state). New simpler list pages should prefer this hook.
 */
'use client';

import { useState } from 'react';
import { useList } from '@/hooks/useList';
import { useAction } from '@/hooks/useAction';
import { usePermission } from '@/hooks/usePermission';
import { useTableViewMode } from '@/store/tableViewStore';
import { PageData } from '@/types/api';

interface ListParams {
  page: number;
  pageSize: number;
  [key: string]: unknown;
}

interface UseListPageOptions<T extends { id: string }> {
  resource: string;
  queryFn: (params: ListParams) => Promise<PageData<T>>;
  deleteFn?: (id: string) => Promise<void>;
  permPrefix?: string;
}

export function useListPage<T extends { id: string }>({
  resource,
  queryFn,
  deleteFn,
  permPrefix,
}: UseListPageOptions<T>) {
  const list = useList<PageData<T>>({ queryKey: [resource] as const, queryFn });
  const _canWrite  = usePermission(permPrefix ? `${permPrefix}:write`  : '');
  const _canDelete = usePermission(permPrefix ? `${permPrefix}:delete` : '');
  const _canExport = usePermission(permPrefix ? `${permPrefix}:export` : '');
  const canWrite  = permPrefix ? _canWrite  : true;
  const canDelete = permPrefix ? _canDelete : true;
  const canExport = permPrefix ? _canExport : false;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useTableViewMode(resource);

  const _deleteAction = useAction<void, string>({
    mutationFn: deleteFn ?? (() => Promise.resolve()),
    invalidateKeys: [[resource]],
    successMessage: `${resource} deleted`,
  });
  const deleteAction = deleteFn ? _deleteAction : null;

  return {
    ...list,
    canWrite,
    canDelete,
    canExport,
    selectedIds,
    setSelectedIds,
    deleteAction,
    viewMode,
    setViewMode,
  };
}
