'use client';

import { useEffect, useState } from 'react';

export function useAuthToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('psiflow_access_token'));
  }, []);

  return token;
}
