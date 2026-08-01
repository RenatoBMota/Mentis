'use client';

import { useRouter } from 'next/navigation';

export function useLogout() {
  const router = useRouter();

  return function logout() {
    localStorage.removeItem('mentis_access_token');
    router.push('/login');
  };
}
