import { Button } from '@/components/ui/button';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';

type ButtonBaseProps = React.ComponentPropsWithoutRef<'button'> & VariantProps<typeof buttonVariants>;

export function GhostButton({ children, className, ...props }: Omit<ButtonBaseProps, 'variant'>) {
  return (
    <Button
      variant="ghost"
      className={cn(
        'h-[var(--btn-height-sm)] px-3 text-[var(--text-sm)] font-[var(--font-medium)]',
        'text-[var(--btn-ghost-text)] hover:text-[var(--btn-ghost-text-hover)]',
        'hover:bg-[var(--btn-ghost-bg-hover)] active:bg-[var(--btn-ghost-bg-active)]',
        'active:scale-[.98] rounded-[var(--btn-radius)] border border-[var(--border)]',
        'transition-[background,color] duration-[var(--duration-normal)]',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
