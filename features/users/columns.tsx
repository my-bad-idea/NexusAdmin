'use client';

import { ColumnDef } from '@tanstack/react-table';
import { UserProfile } from '@/types/user';
import { RoleBadge } from '@/components/ui/RoleBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { GhostButton } from '@/components/ui/GhostButton';
import { usePermission } from '@/hooks/usePermission';
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import React from 'react';

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

function getAvatarColor(name: string) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface ActionsProps {
  user: UserProfile;
  onEdit: (user: UserProfile) => void;
  onDelete: (user: UserProfile) => void;
  t: (key: string) => string;
}

function UserActions({ user, onEdit, onDelete, t }: ActionsProps) {
  const canWrite  = usePermission('user:write');
  const canDelete = usePermission('user:delete');

  if (!canWrite && !canDelete) return null;

  return (
    <div className="flex items-center justify-center gap-[3px]">
      {canWrite && (
        <GhostButton
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(user); }}
          className="h-[22px] px-2 text-[11px]"
          style={{ border: '1px solid var(--border)' } as React.CSSProperties}
        >
          {t('users.edit')}
        </GhostButton>
      )}
      {(canWrite || canDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="inline-flex items-center justify-center cursor-pointer rounded transition-all"
            style={{
              height: '22px', padding: '0 6px',
              border: '1px solid var(--border)',
              background: 'var(--bg)', color: 'var(--txt-sec)',
              fontSize: '11px', letterSpacing: '2px',
            }}
          >
            ···
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            {canWrite && (
              <DropdownMenuItem
                onClick={() => onEdit(user)}
                className="text-xs gap-2"
              >
                <Pencil size={12} />
                {t('users.editDetails')}
              </DropdownMenuItem>
            )}
            {canWrite && canDelete && <DropdownMenuSeparator />}
            {canDelete && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(user)}
                className="text-xs gap-2"
              >
                <Trash2 size={12} />
                {t('users.delete')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export function createUserColumns(
  onEdit: (user: UserProfile) => void,
  onDelete: (user: UserProfile) => void,
  t: (key: string) => string
): ColumnDef<UserProfile>[] {
  return [
    {
      accessorKey: 'name',
      header: t('users.colName'),
      cell: ({ row }) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
            display: 'grid', placeItems: 'center',
            background: getAvatarColor(row.original.name),
            fontFamily: 'var(--font-mono-custom)', fontSize: '9.5px', fontWeight: 500, color: '#fff',
          }}>
            {row.original.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 500, color: 'var(--txt)', fontSize: '12.5px' }}>{row.original.name}</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--txt-muted)' }}>{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'department',
      header: t('users.colDepartment'),
      enableSorting: false,
      cell: ({ getValue }) => (
        <span style={{ fontSize: '12.5px', color: 'var(--txt-sec)' }}>{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'role',
      header: t('users.colRole'),
      enableSorting: false,
      cell: ({ getValue }) => <RoleBadge role={getValue() as UserProfile['role']} />,
    },
    {
      accessorKey: 'status',
      header: t('users.colStatus'),
      enableSorting: false,
      cell: ({ getValue }) => <StatusBadge status={getValue() as UserProfile['status']} />,
    },
    {
      accessorKey: 'createdAt',
      header: t('users.colCreated'),
      cell: ({ getValue }) => (
        <span style={{ fontSize: '12px', color: 'var(--txt-sec)', fontFamily: 'var(--font-mono-custom)' }}>
          {new Date(getValue() as string).toISOString().slice(0, 10)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      size: 90,
      enableSorting: false,
      cell: ({ row }) => (
        <UserActions user={row.original} onEdit={onEdit} onDelete={onDelete} t={t} />
      ),
    },
  ];
}
