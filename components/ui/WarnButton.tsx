import { Button } from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React from 'react';

type ButtonBaseProps = React.ComponentPropsWithoutRef<'button'> & VariantProps<typeof buttonVariants>;

interface WarnButtonProps extends Omit<ButtonBaseProps, 'variant'> {
  loading?: boolean;
}

export function WarnButton({ children, loading, disabled, className, ...props }: WarnButtonProps) {
  return (
    <Button
      variant="outline"
      disabled={disabled || loading}
      className={cn(
        'h-[var(--btn-height-sm)] px-3 text-[var(--text-sm)] font-[var(--font-medium)]',
        'bg-[var(--btn-warn-bg)] text-[var(--btn-warn-text)] border border-[color-mix(in_srgb,var(--btn-disable)_20%,transparent)]',
        'hover:bg-[color-mix(in_srgb,var(--btn-warn-bg)_80%,var(--btn-warn-text)_10%)]',
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
