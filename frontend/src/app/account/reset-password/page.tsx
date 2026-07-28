import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/account/ResetPasswordForm';

export const metadata = { title: 'Reset password' };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="account-panel__empty">Loading…</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
