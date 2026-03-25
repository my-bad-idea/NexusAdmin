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
import { fetchUsers, createUser, updateUser, deleteUser, batchDisableUsers } from '@/queries/users';
import { UserProfile } from '@/types/user';
import { UserSchemaData } from './schema';
import { Search, SlidersHorizontal, Plus, Download } from 'lucide-react';
import { toast } from 'sonner';
import { DatePicker } from '@/components/common/DatePicker';

const USERS_KEY = ['users'];

function getAdvFilterFields(t: (key: string) => string): FilterFieldConfig[] {
  return [
    { key: 'keyword', label: t('advFilter.keyword'), type: 'text' },
    {
      key: 'department', label: t('advFilter.department'), type: 'select',
      options: [
        { label: t('advFilter.allDepartments'), value: '' },
        { label: 'Engineering', value: 'Engineering' },
        { label: 'Product', value: 'Product' },
        { label: 'Design', value: 'Design' },
        { label: 'Marketing', value: 'Marketing' },
        { label: 'Sales', value: 'Sales' },
        { label: 'HR', value: 'HR' },
      ],
    },
    {
      key: 'role', label: t('advFilter.role'), type: 'select', halfRow: true,
      options: [
        { label: t('advFilter.allRoles'), value: '' },
        { label: 'Admin', value: 'Admin' },
        { label: 'Editor', value: 'Editor' },
        { label: 'Viewer', value: 'Viewer' },
      ],
    },
    {
      key: 'status', label: t('advFilter.status'), type: 'select', halfRow: true,
      options: [
        { label: t('advFilter.allStatus'), value: '' },
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' },
        { label: 'Suspended', value: 'Suspended' },
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
  const [advFilterValue, setAdvFilterValue] = useState<Record<string, unknown>>({});

  const advFilterCount = useMemo(
    () => Object.values(advFilterValue).filter(
      (v) => v !== '' && v !== undefined && v !== null && !(Array.isArray(v) && v.length === 0)
    ).length,
    [advFilterValue]
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

  const handleAdvApply = () => {
    Object.entries(advFilterValue).forEach(([key, val]) => {
      if (val && !(Array.isArray(val) && val.length === 0)) {
        list.setFilter(key, Array.isArray(val) ? val.join(',') : String(val));
      } else {
        list.setFilter(key, '');
      }
    });
  };

  const handleAdvReset = () => {
    setAdvFilterValue({});
    Object.keys(advFilterValue).forEach((key) => list.setFilter(key, ''));
  };

  const advFilterFields = useMemo(() => getAdvFilterFields(t), [t]);
  const columns = createUserColumns(handleEdit, handleDelete, t);
  const hasFilters = list.filters.keyword || list.filters.role || list.filters.status || list.filters.dateFrom;

  return (
    <PageContainer
      title={t('users.title')}
      titleExtra={selectedIds.length > 0 ? (
        <span style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '3px 10px', borderRadius: 'var(--radius-sm)',
          background: 'var(--accent-light)', color: 'var(--accent)',
          fontSize: '11.5px', fontWeight: 500,
        }}>
          ✓ <span style={{ fontFamily: 'var(--font-mono-custom)', fontWeight: 700 }}>
            {selectedIds.length}
          </span> {t('users.selected')}
        </span>
      ) : undefined}
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          {canWrite && (
            <PrimaryButton onClick={() => { setEditUser(undefined); setFormOpen(true); }}>
              <Plus size={14} className="md:mr-1" />
              <span className="hidden md:inline">{t('users.addUser')}</span>
            </PrimaryButton>
          )}
          {canExport && (
            <OutlineButton onClick={() => toast(t('users.exporting'))}>
              <Download size={14} className="md:mr-1" />
              <span className="hidden md:inline">{t('users.export')}</span>
            </OutlineButton>
          )}
          <WarnButton
            className="max-[480px]:hidden"
            disabled={selectedIds.length === 0}
            onClick={() => {
              if (selectedIds.length > 0) batchDisableAction.mutate(selectedIds);
            }}
          >
            {t('users.disable')}
          </WarnButton>
          {canDelete && (
            <DestructiveButton
              className="max-[480px]:hidden"
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
      <div
        className="flex flex-wrap items-center gap-2 mb-[10px] rounded-[var(--radius-md)] px-3 py-2"
        style={{ background: 'var(--white)', border: '1px solid var(--border)' }}
      >
        <div className="relative flex-1 min-w-[160px] max-[480px]:min-w-full">
          <Search
            size={12}
            className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--txt-muted)' }}
          />
          <input
            placeholder={t('users.searchPlaceholder')}
            value={list.filters.keyword ?? ''}
            onChange={(e) => list.setFilter('keyword', e.target.value)}
            style={{
              width: '100%', height: '28px', paddingLeft: '28px', paddingRight: '8px',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              fontSize: '12px', background: 'var(--bg)', color: 'var(--txt)',
              outline: 'none', transition: 'border-color .15s, box-shadow .15s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,.12)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
        <select
          value={list.filters.role ?? ''}
          onChange={(e) => list.setFilter('role', e.target.value)}
          className="shrink-0 max-[480px]:min-w-full"
          style={{
            height: '28px', padding: '0 24px 0 8px', minWidth: '120px',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            fontSize: '12px', background: 'var(--bg)', color: 'var(--txt)',
            outline: 'none', cursor: 'pointer',
            WebkitAppearance: 'none', appearance: 'none' as const,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 7px center',
          }}
        >
          <option value="">{t('users.roleAll')}</option>
          <option value="Admin">Admin</option>
          <option value="Editor">Editor</option>
          <option value="Viewer">Viewer</option>
        </select>
        <select
          value={list.filters.status ?? ''}
          onChange={(e) => list.setFilter('status', e.target.value)}
          className="shrink-0 max-[480px]:min-w-full"
          style={{
            height: '28px', padding: '0 24px 0 8px', minWidth: '120px',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            fontSize: '12px', background: 'var(--bg)', color: 'var(--txt)',
            outline: 'none', cursor: 'pointer',
            WebkitAppearance: 'none', appearance: 'none' as const,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat', backgroundPosition: 'right 7px center',
          }}
        >
          <option value="">{t('users.statusAll')}</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
        </select>
        <div className="hidden lg:block shrink-0">
          <DatePicker
            value={list.filters.dateFrom ?? ''}
            onChange={(v) => list.setFilter('dateFrom', v)}
            className="shrink-0"
            style={{
              height: '28px', minWidth: '160px',
              fontSize: '11px', fontFamily: 'var(--font-mono-custom)',
            }}
          />
        </div>
        <div className="flex gap-1.5 ml-auto w-full md:w-auto">
          <PrimaryButton
            onClick={() => list.refetch()}
            className="h-[28px] px-3 text-[12px]"
          >
            {t('users.search')}
          </PrimaryButton>
          <GhostButton
            onClick={list.resetFilters}
            className="h-[28px] px-3 text-[12px]"
            style={{ border: '1px solid var(--border)' }}
          >
            {t('users.reset')}
          </GhostButton>
          <button
            onClick={() => setAdvFilterOpen(true)}
            className="inline-flex items-center gap-[5px] shrink-0 transition-all"
            style={{
              height: '28px', padding: '0 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px', fontWeight: 500,
              border: `1px solid ${advFilterCount > 0 ? 'var(--accent)' : 'var(--border)'}`,
              background: advFilterCount > 0 ? 'var(--accent-light)' : 'var(--bg)',
              color: advFilterCount > 0 ? 'var(--accent)' : 'var(--txt-sec)',
              cursor: 'pointer',
            }}
          >
            <SlidersHorizontal size={13} />
            {t('users.filters')}
            {advFilterCount > 0 && (
              <span
                className="grid place-items-center rounded-full"
                style={{
                  width: '16px', height: '16px',
                  background: 'var(--accent)', color: '#fff',
                  fontFamily: 'var(--font-mono-custom)', fontSize: '9px',
                }}
              >
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
        emptyScene={hasFilters ? 'no-results' : 'empty'}
        emptyResource="users"
        onEmptyAction={canWrite ? () => setFormOpen(true) : undefined}
        paginationResource="users"
      />

      {/* Advanced Filter Drawer */}
      <AdvancedFilter
        open={advFilterOpen}
        onClose={() => setAdvFilterOpen(false)}
        fields={advFilterFields}
        value={advFilterValue}
        onChange={setAdvFilterValue}
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
        confirmText={t('confirm.confirmWord')}
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
        confirmText={t('confirm.confirmWord')}
        onConfirm={async () => {
          await Promise.all(selectedIds.map((id) => deleteUser(id)));
          await list.refetch();
          setBatchDeleteOpen(false);
          setSelectedIds([]);
        }}
        onCancel={() => setBatchDeleteOpen(false)}
      />
    </PageContainer>
  );
}
