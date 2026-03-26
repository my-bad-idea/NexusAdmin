'use client';

import { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useList } from '@/hooks/useList';
import { useAction } from '@/hooks/useAction';
import { usePermission } from '@/hooks/usePermission';
import { PageContainer } from '@/components/common/PageContainer';
import { DataTable } from '@/components/common/DataTable';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { AdvancedFilter, FilterFieldConfig } from '@/components/common/AdvancedFilter';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { OutlineButton } from '@/components/ui/OutlineButton';
import { GhostButton } from '@/components/ui/GhostButton';
import { DestructiveButton } from '@/components/ui/DestructiveButton';
import { WarnButton } from '@/components/ui/WarnButton';
import { UserForm } from './UserForm';
import { createUserColumns } from './columns';
import { fetchUsers, createUser, updateUser, deleteUser, batchDeleteUsers, batchDisableUsers } from '@/queries/users';
import { UserProfile } from '@/types/user';
import { UserSchemaData } from './schema';
import { Search, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { DatePicker } from '@/components/common/DatePicker';
import { cn } from '@/lib/utils';

const USERS_KEY = ['users'];

function getAdvFilterFields(t: (key: string) => string): FilterFieldConfig[] {
  return [
    { key: 'keyword', label: t('advFilter.keyword'), type: 'text' },
    {
      key: 'department', label: t('advFilter.department'), type: 'select',
      options: [
        { label: t('advFilter.allDepartments'), value: '' },
        { label: t('enums.dept.engineering'), value: 'Engineering' },
        { label: t('enums.dept.product'), value: 'Product' },
        { label: t('enums.dept.design'), value: 'Design' },
        { label: t('enums.dept.marketing'), value: 'Marketing' },
        { label: t('enums.dept.sales'), value: 'Sales' },
        { label: t('enums.dept.hr'), value: 'HR' },
      ],
    },
    {
      key: 'role', label: t('advFilter.role'), type: 'select', halfRow: true,
      options: [
        { label: t('advFilter.allRoles'), value: '' },
        { label: t('roles.admin'), value: 'Admin' },
        { label: t('roles.editor'), value: 'Editor' },
        { label: t('roles.viewer'), value: 'Viewer' },
      ],
    },
    {
      key: 'status', label: t('advFilter.status'), type: 'select', halfRow: true,
      options: [
        { label: t('advFilter.allStatus'), value: '' },
        { label: t('enums.status.active'), value: 'Active' },
        { label: t('enums.status.inactive'), value: 'Inactive' },
        { label: t('enums.status.suspended'), value: 'Suspended' },
      ],
    },
    { key: 'createdDate', label: t('advFilter.createdDate'), type: 'date-range' },
    {
      key: 'lastLogin', label: t('advFilter.lastLogin'), type: 'date-preset',
      presets: [
        { label: t('advFilter.anyTime'), value: '' },
        { label: t('advFilter.last24h'), value: '1d' },
        { label: t('advFilter.last7d'), value: '7d' },
        { label: t('advFilter.last30d'), value: '30d' },
        { label: t('advFilter.last90d'), value: '90d' },
        { label: t('advFilter.neverLoggedIn'), value: 'never' },
      ],
    },
    {
      key: 'permissions', label: t('advFilter.permissions'), type: 'checkbox-group',
      options: [
        { label: t('advFilter.read'), value: 'read' },
        { label: t('advFilter.write'), value: 'write' },
        { label: t('advFilter.deletePermission'), value: 'delete' },
        { label: t('advFilter.adminAccess'), value: 'admin' },
      ],
    },
    { key: 'tags', label: t('advFilter.tags'), type: 'text' },
  ];
}

export function UserList() {
  const t = useTranslations();
  const canWrite  = usePermission('user:write');
  const canDelete = usePermission('user:delete');
  const canExport = usePermission('user:export');

  const list = useList<{ list: UserProfile[]; total: number; page: number; pageSize: number }>({
    queryKey: USERS_KEY,
    queryFn: fetchUsers,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserProfile | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | undefined>();
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [advFilterOpen, setAdvFilterOpen] = useState(false);

  // Advanced filter keys — count active filters from URL params
  const ADV_FILTER_KEYS = ['keyword', 'department', 'role', 'status', 'createdDate', 'lastLogin', 'permissions', 'tags'] as const;
  const advFilterCount = useMemo(
    () => ADV_FILTER_KEYS.filter((k) => {
      const v = list.filters[k];
      return v !== '' && v !== undefined;
    }).length,
    [list.filters]
  );

  const createAction = useAction<UserProfile, UserSchemaData>({
    mutationFn: createUser,
    invalidateKeys: [USERS_KEY],
    successMessage: t('users.createdSuccess'),
    onSuccess: () => setFormOpen(false),
  });

  const updateAction = useAction<UserProfile, UserSchemaData & { id: string }>({
    mutationFn: updateUser,
    invalidateKeys: [USERS_KEY],
    successMessage: t('users.updatedSuccess'),
    onSuccess: () => { setFormOpen(false); setEditUser(undefined); },
  });

  const deleteAction = useAction<void, string>({
    mutationFn: deleteUser,
    invalidateKeys: [USERS_KEY],
    successMessage: t('users.deletedSuccess'),
    onSuccess: () => setDeleteTarget(undefined),
  });

  const batchDisableAction = useAction({
    mutationFn: (ids: string[]) => batchDisableUsers(ids),
    invalidateKeys: [USERS_KEY],
    successMessage: (data: { succeeded: string[]; failed: { id: string; reason: string }[] }) =>
      t('users.disabledCount', { count: data.succeeded.length }),
  });

  const batchDeleteAction = useAction<void, string[]>({
    mutationFn: batchDeleteUsers,
    invalidateKeys: [USERS_KEY],
    successMessage: t('users.deletedSuccess'),
  });

  const handleEdit = useCallback((user: UserProfile) => {
    setEditUser(user);
    setFormOpen(true);
  }, []);

  const handleDelete = useCallback((user: UserProfile) => {
    setDeleteTarget(user);
  }, []);

  const handleFormSubmit = async (data: UserSchemaData) => {
    if (editUser) {
      await updateAction.mutateAsync({ ...data, id: editUser.id });
    } else {
      await createAction.mutateAsync(data);
    }
  };

  const handleAdvApply = (values: Record<string, unknown>) => {
    const updates: Record<string, string> = {};
    ADV_FILTER_KEYS.forEach((key) => {
      const val = values[key];
      if (val && !(Array.isArray(val) && val.length === 0)) {
        updates[key] = Array.isArray(val) ? val.join(',') : String(val);
      } else {
        updates[key] = '';
      }
    });
    list.setFilters(updates);
  };

  const handleAdvReset = () => {
    const updates: Record<string, string> = {};
    ADV_FILTER_KEYS.forEach((key) => { updates[key] = ''; });
    list.setFilters(updates);
  };

  const advFilterFields = useMemo(() => getAdvFilterFields(t), [t]);
  const columns = createUserColumns(handleEdit, handleDelete, t);
  const hasFilters = ADV_FILTER_KEYS.some((k) => list.filters[k]);

  return (
    <PageContainer
      title={t('users.title')}
      titleExtra={selectedIds.length > 0 ? (
        <span className="flex items-center gap-[5px] px-2.5 py-[3px] rounded-[var(--radius-sm)] bg-[var(--accent-light)] text-[var(--accent)] text-[11.5px] font-medium">
          ✓ <span className="font-[var(--font-mono)] font-bold">
            {selectedIds.length}
          </span> {t('users.selected')}
        </span>
      ) : undefined}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {canWrite && (
            <PrimaryButton onClick={() => { setEditUser(undefined); setFormOpen(true); }}>
              {t('users.addUser')}
            </PrimaryButton>
          )}
          {canExport && (
            <OutlineButton onClick={() => toast(t('users.exporting'))}>
              {t('users.export')}
            </OutlineButton>
          )}
          <WarnButton
            disabled={selectedIds.length === 0}
            onClick={() => {
              if (selectedIds.length > 0) batchDisableAction.mutate(selectedIds);
            }}
          >
            {t('users.disable')}
          </WarnButton>
          {canDelete && (
            <DestructiveButton
              disabled={selectedIds.length === 0}
              onClick={() => {
                if (selectedIds.length > 0) setBatchDeleteOpen(true);
              }}
            >
              {t('users.deleteBatch')}
            </DestructiveButton>
          )}
        </div>
      }
    >
      {/* FilterBar */}
      <div className="flex flex-wrap items-center gap-2 mb-[10px] rounded-[var(--radius-md)] px-3 py-2 bg-[var(--white)] border border-[var(--border)]">
        <div className="relative flex-1 min-w-[160px]">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--txt-muted)]"
          />
          <input
            placeholder={t('users.searchPlaceholder')}
            value={list.filters.keyword ?? ''}
            onChange={(e) => list.setFilter('keyword', e.target.value)}
            className="nx-input nx-input-sm"
            style={{ paddingLeft: 28, paddingRight: 8 }}
          />
        </div>
        <select
          value={list.filters.role ?? ''}
          onChange={(e) => list.setFilter('role', e.target.value)}
          className="nx-select nx-select-sm shrink-0"
        >
          <option value="">{t('users.roleAll')}</option>
          <option value="Admin">{t('roles.admin')}</option>
          <option value="Editor">{t('roles.editor')}</option>
          <option value="Viewer">{t('roles.viewer')}</option>
        </select>
        <select
          value={list.filters.status ?? ''}
          onChange={(e) => list.setFilter('status', e.target.value)}
          className="nx-select nx-select-sm shrink-0"
        >
          <option value="">{t('users.statusAll')}</option>
          <option value="Active">{t('enums.status.active')}</option>
          <option value="Inactive">{t('enums.status.inactive')}</option>
          <option value="Suspended">{t('enums.status.suspended')}</option>
        </select>
        <DatePicker
          value={list.filters.dateFrom ?? ''}
          onChange={(v) => list.setFilter('dateFrom', v)}
          className="shrink-0 h-7 min-w-[160px] text-[11px] font-[var(--font-mono)]"
        />
        <div className="flex gap-1.5 ml-auto">
          <PrimaryButton
            onClick={() => list.refetch()}
            className="h-[28px] px-3 text-[12px]"
          >
            {t('users.search')}
          </PrimaryButton>
          <GhostButton
            onClick={list.resetFilters}
            className="h-[28px] px-3 text-[12px] border border-[var(--border)]"
          >
            {t('users.reset')}
          </GhostButton>
          <button
            onClick={() => setAdvFilterOpen(true)}
            className={cn(
              'inline-flex items-center gap-[5px] shrink-0 h-7 px-2.5 rounded-[var(--radius-sm)] text-[12px] font-medium cursor-pointer border transition-all',
              advFilterCount > 0
                ? 'border-[var(--accent)] bg-[var(--accent-light)] text-[var(--accent)]'
                : 'border-[var(--border)] bg-[var(--bg)] text-[var(--txt-sec)]',
            )}
          >
            <SlidersHorizontal size={13} />
            {t('users.filters')}
            {advFilterCount > 0 && (
              <span className="grid place-items-center w-4 h-4 rounded-full bg-[var(--accent)] text-[var(--on-accent)] font-[var(--font-mono)] text-[9px]">
                {advFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={list.data?.list ?? []}
        isLoading={list.isLoading}
        isFetching={list.isFetching}
        error={list.error}
        total={list.data?.total ?? 0}
        page={list.page}
        pageSize={list.pageSize}
        onPageChange={(p) => list.setPage(p)}
        onPageSizeChange={list.setPageSize}
        enableSelection
        onSelectionChange={setSelectedIds}
        sortState={list.sortState}
        onSortChange={list.onSortChange}
        emptyScene={hasFilters ? 'no-results' : 'empty'}
        emptyResource={t('search.users')}
        onEmptyAction={canWrite ? () => setFormOpen(true) : undefined}
      />

      {/* Advanced Filter Drawer */}
      <AdvancedFilter
        open={advFilterOpen}
        onClose={() => setAdvFilterOpen(false)}
        fields={advFilterFields}
        value={list.filters}
        onApply={handleAdvApply}
        onReset={handleAdvReset}
      />

      {/* User Form Modal */}
      <UserForm
        mode={editUser ? 'edit' : 'create'}
        initialData={editUser}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditUser(undefined); }}
        onSubmit={handleFormSubmit}
        isPending={createAction.isPending || updateAction.isPending}
      />

      {/* Single delete confirm */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        type="danger"
        title={t('users.deleteTitle')}
        description={t('users.deleteDesc', { name: deleteTarget?.name ?? '' })}
        onConfirm={() => deleteAction.mutateAsync(deleteTarget!.id)}
        onCancel={() => setDeleteTarget(undefined)}
      />

      {/* Batch delete confirm */}
      <ConfirmDialog
        open={batchDeleteOpen}
        type="danger"
        title={t('users.batchDeleteTitle')}
        description={t('users.batchDeleteDesc')}
        count={selectedIds.length}
        onConfirm={async () => {
          await batchDeleteAction.mutateAsync(selectedIds);
          setBatchDeleteOpen(false);
          setSelectedIds([]);
        }}
        onCancel={() => setBatchDeleteOpen(false)}
      />
    </PageContainer>
  );
}
