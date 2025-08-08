import { useEffect } from 'react';
import Constants from 'expo-constants';
import { configureApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function InitApi() {
  const { jwt, logout } = useAuth();
  const base = (Constants.expoConfig?.extra as any)?.apiBase;

  useEffect(() => {
    console.log('[InitApi] mount base=', base);
  }, []);

  useEffect(() => {
    console.log('[InitApi] configureApi jwt.len=', jwt ? jwt.length : 0);
    configureApi({
      getToken: () => jwt,
      onUnauthorized: () => {
        console.log('[InitApi] onUnauthorized → logout');
        logout();
      },
    });
  }, [jwt, logout]);

  return null;
}
