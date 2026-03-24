import { Button } from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

type ButtonBaseProps = React.ComponentPropsWithoutRef<'button'> & VariantProps<typeof buttonVariants>;

interface PrimaryButtonProps extends Omit<ButtonBaseProps, 'variant'> {
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function PrimaryButton({ children, loading, disabled, className, style, ...props }: PrimaryButtonProps) {
  return (
    <Button
      variant="default"
      disabled={disabled || loading}
      className={cn(
        'h-[var(--btn-height-sm)] px-3 text-[var(--text-sm)] font-[var(--font-medium)]',
        'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)]',
        'hover:bg-[var(--btn-primary-bg-hover)] hover:shadow-[0_2px_8px_rgba(99,102,241,.3)]',
        'active:bg-[var(--btn-primary-bg-active)] active:scale-[.98]',
        'rounded-[var(--btn-radius)]',
        'transition-[background,box-shadow,transform] duration-[var(--duration-normal)]',
        className
      )}
      style={style}
      {...props}
    >
      {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
      {children}
    </Button>
  );
}
