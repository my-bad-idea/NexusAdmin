import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, resolveLocale } from '@/lib/locale';

const intlMiddleware = createMiddleware({
  locales: [...SUPPORTED_LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'never',
  localeDetection: true,
});

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip static files, api routes, Next internals
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/mockServiceWorker') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Detect locale from cookie first, then browser/system language.
  const locale = resolveLocale(
    req.cookies.get('NEXT_LOCALE')?.value,
    req.headers.get('accept-language')
  );

  // Check auth cookie
  const token = req.cookies.get('nexus-token')?.value;
  const isAuthPage = pathname === '/login' || pathname.startsWith('/login');

  // Redirect to login if not authenticated
  const isProtected = !pathname.startsWith('/login') && !pathname.startsWith('/403');

  if (!token && isProtected && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const response = intlMiddleware(req);

  // Pass locale to root layout via request header.
  response.headers.set('x-middleware-request-x-locale', locale);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|mockServiceWorker).*)'],
};
