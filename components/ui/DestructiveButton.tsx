import { Button } from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

type ButtonBaseProps = React.ComponentPropsWithoutRef<'button'> & VariantProps<typeof buttonVariants>;

interface DestructiveButtonProps extends Omit<ButtonBaseProps, 'variant'> {
  loading?: boolean;
}

export function DestructiveButton({ children, loading, disabled, className, ...props }: DestructiveButtonProps) {
  return (
    <Button
      variant="destructive"
      disabled={disabled || loading}
      className={cn(
        'h-[var(--btn-height-sm)] px-3 text-[var(--text-sm)] font-[var(--font-medium)]',
        'bg-[var(--btn-danger-bg)] text-[var(--btn-danger-text)] border border-[color-mix(in_srgb,var(--btn-delete)_20%,transparent)]',
        'hover:bg-[var(--danger-bg)] hover:text-[var(--danger)]',
        'active:scale-[.98] rounded-[var(--btn-radius)]',
        'transition-[background,color] duration-[var(--duration-normal)]',
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
      {children}
    </Button>
  );
}
