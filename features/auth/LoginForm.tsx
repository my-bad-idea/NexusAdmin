'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { apiFetch } from '@/lib/fetch';
import { useAuthStore } from '@/store/authStore';
import { LoginResponse } from '@/types/auth';
import { loginSchema, LoginFormData } from './loginSchema';
import { cn } from '@/lib/utils';

export function LoginForm() {
  const router = useRouter();
  const t = useTranslations();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const res = await apiFetch<LoginResponse>('/api/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setAuth(res.token, res.user, res.permissions);
      // Set cookie for middleware auth check
      document.cookie = `nexus-token=${res.token}; path=/; max-age=${60 * 60 * 24 * 7}`;
      toast.success(t('auth.success'));
      router.push('/dashboard');
    } catch (err) {
      const e = err as Error;
      setError('password', { message: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
      <div className="w-full max-w-sm rounded-[var(--radius-lg)] p-8 bg-[var(--white)] shadow-[var(--shadow-2)] border border-[var(--border)]">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-[var(--accent)] text-[var(--on-accent)] text-[16px] font-bold">
            N
          </div>
          <span className="text-[var(--text-xl)] font-[var(--font-bold)] text-[var(--txt)]">
            NexusAdmin
          </span>
        </div>

        <h1 className="text-[var(--text-lg)] font-[var(--font-bold)] text-[var(--txt)] mb-1">
          {t('auth.signIn')}
        </h1>
        <p className="text-[var(--text-sm)] text-[var(--txt-muted)] mb-6">
          {t('auth.subtitle')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-[var(--text-sm)] text-[var(--label-text)] font-medium">
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@nexus.com"
              {...register('email')}
              className={cn('nx-input', errors.email && 'nx-input-error')}
            />
            {errors.email && (
              <p className="text-[var(--text-xs)] text-[var(--error-text)]">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[var(--text-sm)] text-[var(--label-text)] font-medium">
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              className={cn('nx-input', errors.password && 'nx-input-error')}
            />
            {errors.password && (
              <p className="text-[var(--text-xs)] text-[var(--error-text)]">{errors.password.message}</p>
            )}
          </div>

          <PrimaryButton type="submit" loading={loading} className="w-full mt-2">
            {t('auth.signIn')}
          </PrimaryButton>
        </form>

        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <p className="text-[var(--text-xs)] text-[var(--txt-muted)] text-center">
            {t('auth.demo')}
          </p>
        </div>
      </div>
    </div>
  );
}
