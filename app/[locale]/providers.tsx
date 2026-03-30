'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
          },
        },
      })
  );

  // In dev, delay rendering until MSW service worker is ready so that
  // TanStack Query's first requests are intercepted (not sent to the real server).
  const [mswReady, setMswReady] = useState(process.env.NODE_ENV === 'production');

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      import('@/mocks')
        .then(({ initMocks }) => initMocks())
        .then(() => setMswReady(true))
        .catch(console.error);
    }
  }, []);

  if (!mswReady) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </QueryClientProvider>
  );
}
