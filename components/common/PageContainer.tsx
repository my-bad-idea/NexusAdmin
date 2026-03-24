import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  titleExtra?: ReactNode;
  actions?: ReactNode;
  padding?: 'default' | 'none';
  maxWidth?: 'full' | 'xl';
}

export function PageContainer({
  children,
  title,
  subtitle,
  titleExtra,
  actions,
  padding = 'default',
  maxWidth = 'full',
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'flex flex-col min-h-0 flex-1',
        maxWidth === 'xl' && 'max-w-screen-xl mx-auto w-full',
        padding === 'default' && 'px-[var(--page-px)] pt-[var(--page-py)] pb-[var(--space-2xl)]'
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-[10px] gap-2">
          <div className="flex items-center gap-3">
            <div>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-bold)',
                  letterSpacing: '-.3px',
                  color: 'var(--txt)',
                  lineHeight: 'var(--leading-tight)',
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--txt-muted)', marginTop: '2px' }}>
                  {subtitle}
                </p>
              )}
            </div>
            {titleExtra}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
