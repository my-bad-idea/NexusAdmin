import { redirect } from 'next/navigation';

// Redirect /[locale] to /dashboard
export default async function LocaleRootPage() {
  redirect('/dashboard');
}
