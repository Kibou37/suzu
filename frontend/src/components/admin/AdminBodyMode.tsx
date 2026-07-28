'use client';

import { useEffect } from 'react';

/** Hide public site chrome while browsing /admin. */
export function AdminBodyMode() {
  useEffect(() => {
    document.body.classList.add('admin-mode');
    return () => {
      document.body.classList.remove('admin-mode');
    };
  }, []);

  return null;
}
