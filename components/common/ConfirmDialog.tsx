'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { GhostButton } from '@/components/ui/GhostButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { DestructiveButton } from '@/components/ui/DestructiveButton';
import { AlertTriangle, Info, Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  type: 'danger' | 'warning' | 'info';
  title: string;
  description: string;
  count?: number;
  confirmText?: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

const ICON_MAP = {
  danger:  { Icon: Trash2,        color: 'var(--danger)',  bg: 'var(--danger-bg)' },
  warning: { Icon: AlertTriangle, color: 'var(--warn)',    bg: 'var(--warn-bg)' },
  info:    { Icon: Info,          color: 'var(--info)',    bg: 'var(--info-bg)' },
};

export function ConfirmDialog({
  open,
  type,
  title,
  description,
  count,
  confirmText = 'confirm',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const t = useTranslations();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { Icon, color, bg } = ICON_MAP[type];

  const isDanger = type === 'danger';
  const canConfirm = !isDanger || input.toLowerCase() === confirmText.toLowerCase();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleCancel = () => {
    setInput('');
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <DialogContent
        style={{
          maxWidth: 'var(--dialog-max-w)',
          background: 'var(--dialog-bg)',
          borderRadius: 'var(--dialog-radius)',
          boxShadow: 'var(--dialog-shadow)',
        }}
      >
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className="flex items-center justify-center rounded-full shrink-0 mt-0.5"
              style={{ width: '36px', height: '36px', background: bg }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--font-bold)', color: 'var(--txt)' }}>
                {title}
              </DialogTitle>
              <DialogDescription style={{ fontSize: 'var(--text-sm)', color: 'var(--txt-muted)', marginTop: '4px' }}>
                {description}
                {count !== undefined && (
                  <span style={{ fontWeight: 'var(--font-medium)', color: 'var(--txt-sec)' }}>
                    {' '}({count} item{count !== 1 ? 's' : ''})
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isDanger && (
          <div className="mt-2">
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--txt-sec)', marginBottom: '6px' }}>
              Type <strong style={{ color: 'var(--danger)' }}>{confirmText}</strong> to confirm:
            </p>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={confirmText}
              style={{
                height: 'var(--input-height)',
                width: '100%',
                padding: '0 10px',
                border: `1px solid ${input && !canConfirm ? 'var(--danger)' : 'var(--border)'}`,
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
                e.currentTarget.style.borderColor = input && !canConfirm ? 'var(--danger)' : 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        )}

        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <GhostButton onClick={handleCancel} disabled={loading}>
            {t('confirm.cancel')}
          </GhostButton>
          {type === 'danger' ? (
            <DestructiveButton onClick={handleConfirm} loading={loading} disabled={!canConfirm}>
              {t('confirm.delete')}
            </DestructiveButton>
          ) : type === 'warning' ? (
            <PrimaryButton
              onClick={handleConfirm}
              loading={loading}
              style={{ background: 'var(--warn)', color: '#fff' } as React.CSSProperties}
            >
              {t('confirm.confirm')}
            </PrimaryButton>
          ) : (
            <PrimaryButton onClick={handleConfirm} loading={loading}>
              {t('confirm.confirm')}
            </PrimaryButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
