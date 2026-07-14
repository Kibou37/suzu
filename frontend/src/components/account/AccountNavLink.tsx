'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';

type AccountNavLinkProps = {
  className?: string;
  label: string;
  onClick?: () => void;
};

export function AccountNavLink({ className, label, onClick }: AccountNavLinkProps) {
  const { user, loading } = useAuth();
  const href = !loading && user ? '/account' : '/account/login';

  return (
    <Link href={href} className={className} onClick={onClick}>
      {label}
    </Link>
  );
}
