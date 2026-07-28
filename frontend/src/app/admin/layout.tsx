import type { ReactNode } from 'react';
import { AdminAuthProvider } from '@/components/admin/AdminAuthContext';
import { AdminBodyMode } from '@/components/admin/AdminBodyMode';

export const metadata = { title: 'Admin' };

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminBodyMode />
      {children}
    </AdminAuthProvider>
  );
}
