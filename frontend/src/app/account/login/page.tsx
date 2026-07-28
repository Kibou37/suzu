import { Suspense } from 'react';
import { AccountLoginForm } from '@/components/account/AccountLoginForm';

export const metadata = { title: 'Sign in' };

export default function AccountLoginPage() {
  return (
    <Suspense fallback={null}>
      <AccountLoginForm />
    </Suspense>
  );
}
