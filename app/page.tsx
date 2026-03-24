import { redirect } from 'next/navigation';

// Redirect root to login
export default function RootPage() {
  redirect('/login');
}
