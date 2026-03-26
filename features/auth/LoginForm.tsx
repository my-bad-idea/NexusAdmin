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
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-sm rounded-[var(--radius-lg)] p-8"
        style={{
          background: 'var(--white)',
          boxShadow: 'var(--shadow-2)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className="flex items-center justify-center rounded"
            style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--accent)', color: 'var(--on-accent)', fontSize: '16px', fontWeight: 700 }}
          >
            N
          </div>
          <span style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--txt)' }}>
            NexusAdmin
          </span>
        </div>

        <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: 'var(--txt)', marginBottom: '4px' }}>
          {t('auth.signIn')}
        </h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--txt-muted)', marginBottom: '24px' }}>
          {t('auth.subtitle')}
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" style={{ fontSize: 'var(--text-sm)', color: 'var(--label-text)', fontWeight: 500 }}>
              {t('auth.email')}
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@nexus.com"
              {...register('email')}
              style={{
                height: 'var(--input-height)',
                width: '100%',
                padding: '0 10px',
                border: `1px solid ${errors.email ? 'var(--input-border-error)' : 'var(--input-border-default)'}`,
                borderRadius: 'var(--input-radius)',
                fontSize: 'var(--text-sm)',
                background: 'var(--input-bg-default)',
                color: 'var(--input-text-default)',
                outline: 'none',
                transition: 'border-color .15s, box-shadow .15s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--input-border-focus)';
                e.currentTarget.style.boxShadow = 'var(--input-ring-focus)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.email ? 'var(--input-border-error)' : 'var(--input-border-default)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {errors.email && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--error-text)' }}>{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" style={{ fontSize: 'var(--text-sm)', color: 'var(--label-text)', fontWeight: 500 }}>
              {t('auth.password')}
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              style={{
                height: 'var(--input-height)',
                width: '100%',
                padding: '0 10px',
                border: `1px solid ${errors.password ? 'var(--input-border-error)' : 'var(--input-border-default)'}`,
                borderRadius: 'var(--input-radius)',
                fontSize: 'var(--text-sm)',
                background: 'var(--input-bg-default)',
                color: 'var(--input-text-default)',
                outline: 'none',
                transition: 'border-color .15s, box-shadow .15s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--input-border-focus)';
                e.currentTarget.style.boxShadow = 'var(--input-ring-focus)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.password ? 'var(--input-border-error)' : 'var(--input-border-default)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {errors.password && (
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--error-text)' }}>{errors.password.message}</p>
            )}
          </div>

          <PrimaryButton type="submit" loading={loading} className="w-full mt-2">
            {t('auth.signIn')}
          </PrimaryButton>
        </form>

        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--txt-muted)', textAlign: 'center' }}>
            {t('auth.demo')}
          </p>
        </div>
      </div>
    </div>
  );
}
