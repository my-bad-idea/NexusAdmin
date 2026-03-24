'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { GhostButton } from '@/components/ui/GhostButton';
import { UserProfile } from '@/types/user';
import { userSchema, UserSchemaData } from './schema';

interface UserFormProps {
  mode: 'create' | 'edit';
  initialData?: UserProfile;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserSchemaData) => Promise<void>;
  isPending?: boolean;
}

const DEPARTMENTS = ['Engineering', 'Product', 'Design', 'Marketing'];
const ROLES = ['Admin', 'Editor', 'Viewer'] as const;
const STATUSES = ['Active', 'Inactive', 'Suspended'] as const;

/* ── Shared native control styles (matching FilterBar / AdvancedFilter) ── */

const inputStyle: React.CSSProperties = {
  height: 'var(--input-height)',
  width: '100%',
  padding: '0 10px',
  border: '1px solid var(--input-border-default)',
  borderRadius: 'var(--input-radius)',
  fontSize: 'var(--text-sm)',
  background: 'var(--input-bg-default)',
  color: 'var(--input-text-default)',
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
};

const selectStyle: React.CSSProperties = {
  height: 'var(--input-height)',
  width: '100%',
  padding: '0 28px 0 10px',
  border: '1px solid var(--input-border-default)',
  borderRadius: 'var(--input-radius)',
  fontSize: 'var(--text-sm)',
  color: 'var(--input-text-default)',
  cursor: 'pointer',
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
  WebkitAppearance: 'none',
  appearance: 'none' as const,
  background: `var(--input-bg-default) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%236B6B6B' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E") no-repeat right 8px center`,
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--text-sm)',
  color: 'var(--label-text)',
  fontWeight: 500,
};

const errorStyle: React.CSSProperties = {
  fontSize: 'var(--text-xs)',
  color: 'var(--error-text)',
};

function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'var(--input-border-focus)';
  e.currentTarget.style.boxShadow = 'var(--input-ring-focus)';
}

function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'var(--input-border-default)';
  e.currentTarget.style.boxShadow = 'none';
}

export function UserForm({ mode, initialData, open, onClose, onSubmit, isPending }: UserFormProps) {
  const t = useTranslations();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<UserSchemaData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      department: '',
      role: 'Viewer',
      status: 'Active',
      tags: [],
    },
  });

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        reset({
          name: initialData.name,
          email: initialData.email,
          department: initialData.department,
          role: initialData.role,
          status: initialData.status,
          tags: initialData.tags ?? [],
        });
      } else {
        reset({ name: '', email: '', department: '', role: 'Viewer', status: 'Active', tags: [] });
      }
    }
  }, [open, mode, initialData, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent
        style={{
          maxWidth: 'var(--dialog-max-w)',
          background: 'var(--dialog-bg)',
          borderRadius: 'var(--dialog-radius)',
          boxShadow: 'var(--dialog-shadow)',
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-bold)', color: 'var(--txt)' }}>
            {mode === 'create' ? t('users.addTitle') : t('users.editTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>
                {t('users.name')} <span style={{ color: 'var(--label-required)' }}>*</span>
              </label>
              <input
                {...register('name')}
                placeholder={t('users.namePlaceholder')}
                style={{
                  ...inputStyle,
                  borderColor: errors.name ? 'var(--input-border-error)' : undefined,
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>
                {t('users.email')} <span style={{ color: 'var(--label-required)' }}>*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder={t('users.emailPlaceholder')}
                style={{
                  ...inputStyle,
                  borderColor: errors.email ? 'var(--input-border-error)' : undefined,
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
            </div>

            {/* Department */}
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>
                {t('users.department')} <span style={{ color: 'var(--label-required)' }}>*</span>
              </label>
              <select
                value={watch('department') ?? ''}
                onChange={(e) => setValue('department', e.target.value)}
                style={{
                  ...selectStyle,
                  borderColor: errors.department ? 'var(--input-border-error)' : undefined,
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <option value="" disabled>{t('users.selectDepartment')}</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <p style={errorStyle}>{errors.department.message}</p>}
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1">
              <label style={labelStyle}>
                {t('users.role')} <span style={{ color: 'var(--label-required)' }}>*</span>
              </label>
              <select
                value={watch('role')}
                onChange={(e) => setValue('role', e.target.value as typeof ROLES[number])}
                style={selectStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.role && <p style={errorStyle}>{errors.role.message}</p>}
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1 md:col-span-2" style={{ maxWidth: '200px' }}>
              <label style={labelStyle}>
                {t('users.status')} <span style={{ color: 'var(--label-required)' }}>*</span>
              </label>
              <select
                value={watch('status')}
                onChange={(e) => setValue('status', e.target.value as typeof STATUSES[number])}
                style={selectStyle}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.status && <p style={errorStyle}>{errors.status.message}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <GhostButton type="button" onClick={handleClose} disabled={isPending}>
              {t('users.cancel')}
            </GhostButton>
            <PrimaryButton type="submit" loading={isPending}>
              {mode === 'create' ? t('users.createUser') : t('users.saveChanges')}
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
