import { Button } from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';

type ButtonBaseProps = React.ComponentPropsWithoutRef<'button'> & VariantProps<typeof buttonVariants>;

export function OutlineButton({ children, className, ...props }: Omit<ButtonBaseProps, 'variant'>) {
  return (
    <Button
      variant="outline"
      className={cn(
        'h-[var(--btn-height-sm)] px-3 text-[var(--text-sm)] font-[var(--font-medium)]',
        'text-[var(--txt-sec)] border-[var(--border)]',
        'hover:bg-[var(--surface-1)] hover:border-[var(--accent)]',
        'active:scale-[.98] rounded-[var(--btn-radius)]',
        'transition-[background,border-color] duration-[var(--duration-normal)]',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
