import { Suspense } from 'react';
import { UserList } from '@/features/users/UserList';

export default function UsersPage() {
  return (
    <Suspense>
      <UserList />
    </Suspense>
  );
}
