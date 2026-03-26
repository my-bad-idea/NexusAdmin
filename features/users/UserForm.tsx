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
import { cn } from '@/lib/utils';

interface UserFormProps {
  mode: 'create' | 'edit';
  initialData?: UserProfile;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserSchemaData) => Promise<void>;
  isPending?: boolean;
}

const DEPARTMENTS = [
  { value: 'Engineering', labelKey: 'enums.dept.engineering' },
  { value: 'Product', labelKey: 'enums.dept.product' },
  { value: 'Design', labelKey: 'enums.dept.design' },
  { value: 'Marketing', labelKey: 'enums.dept.marketing' },
];
const ROLES = [
  { value: 'Admin', labelKey: 'roles.admin' },
  { value: 'Editor', labelKey: 'roles.editor' },
  { value: 'Viewer', labelKey: 'roles.viewer' },
] as const;
const STATUSES = [
  { value: 'Active', labelKey: 'enums.status.active' },
  { value: 'Inactive', labelKey: 'enums.status.inactive' },
  { value: 'Suspended', labelKey: 'enums.status.suspended' },
] as const;

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
      <DialogContent className="max-w-[var(--dialog-max-w)] bg-[var(--dialog-bg)] rounded-[var(--dialog-radius)] shadow-[var(--dialog-shadow)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--text-md)] font-[var(--font-bold)] text-[var(--txt)]">
            {mode === 'create' ? t('users.addTitle') : t('users.editTitle')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[var(--text-sm)] text-[var(--label-text)] font-medium">
                {t('users.name')} <span className="text-[var(--label-required)]">*</span>
              </label>
              <input
                {...register('name')}
                placeholder={t('users.namePlaceholder')}
                className={cn('nx-input', errors.name && 'nx-input-error')}
              />
              {errors.name && <p className="text-[var(--text-xs)] text-[var(--error-text)]">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-[var(--text-sm)] text-[var(--label-text)] font-medium">
                {t('users.email')} <span className="text-[var(--label-required)]">*</span>
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder={t('users.emailPlaceholder')}
                className={cn('nx-input', errors.email && 'nx-input-error')}
              />
              {errors.email && <p className="text-[var(--text-xs)] text-[var(--error-text)]">{errors.email.message}</p>}
            </div>

            {/* Department */}
            <div className="flex flex-col gap-1">
              <label className="text-[var(--text-sm)] text-[var(--label-text)] font-medium">
                {t('users.department')} <span className="text-[var(--label-required)]">*</span>
              </label>
              <select
                value={watch('department') ?? ''}
                onChange={(e) => setValue('department', e.target.value)}
                className={cn('nx-select', errors.department && 'nx-input-error')}
              >
                <option value="" disabled>{t('users.selectDepartment')}</option>
                {DEPARTMENTS.map((d) => <option key={d.value} value={d.value}>{t(d.labelKey)}</option>)}
              </select>
              {errors.department && <p className="text-[var(--text-xs)] text-[var(--error-text)]">{errors.department.message}</p>}
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1">
              <label className="text-[var(--text-sm)] text-[var(--label-text)] font-medium">
                {t('users.role')} <span className="text-[var(--label-required)]">*</span>
              </label>
              <select
                value={watch('role')}
                onChange={(e) => setValue('role', e.target.value as typeof ROLES[number]['value'])}
                className="nx-select"
              >
                {ROLES.map((r) => <option key={r.value} value={r.value}>{t(r.labelKey)}</option>)}
              </select>
              {errors.role && <p className="text-[var(--text-xs)] text-[var(--error-text)]">{errors.role.message}</p>}
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1 md:col-span-2 max-w-[200px]">
              <label className="text-[var(--text-sm)] text-[var(--label-text)] font-medium">
                {t('users.status')} <span className="text-[var(--label-required)]">*</span>
              </label>
              <select
                value={watch('status')}
                onChange={(e) => setValue('status', e.target.value as typeof STATUSES[number]['value'])}
                className="nx-select"
              >
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{t(s.labelKey)}</option>)}
              </select>
              {errors.status && <p className="text-[var(--text-xs)] text-[var(--error-text)]">{errors.status.message}</p>}
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
