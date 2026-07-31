'use client';

import { useEffect, useState } from 'react';

/**
 * `undefined` = ainda não checou o localStorage (evita flash de redirect
 * antes da hidratação); `null` = checou e não há sessão; `string` = token.
 */
export function useAuthToken(): string | null | undefined {
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    setToken(localStorage.getItem('mentis_access_token'));
  }, []);

  return token;
}
