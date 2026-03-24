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
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const canWrite  = permPrefix ? usePermission(`${permPrefix}:write`)  : true;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const canDelete = permPrefix ? usePermission(`${permPrefix}:delete`) : true;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const canExport = permPrefix ? usePermission(`${permPrefix}:export`) : false;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useTableViewMode(resource);

  const deleteAction = deleteFn
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useAction<void, string>({
        mutationFn: deleteFn,
        invalidateKeys: [[resource]],
        successMessage: `${resource} deleted`,
      })
    : null;

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
