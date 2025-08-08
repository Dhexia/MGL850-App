import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { useWallet } from './WalletContext';
import { TestAccount } from '@/lib/test-accounts';
import { PlatformUtils } from '@/lib/platform-utils';

const log = (...a: any[]) => console.log('[Auth]', ...a);

export type UserRole = 'standard_user' | 'certifier';

export type AuthCtx = {
  jwt?: string;
  address?: string;
  userRole?: UserRole;
  isVerified?: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  mockLoginWithAccount: (account: TestAccount) => Promise<void>;
  isMockMode: boolean;
};

const Ctx = createContext<AuthCtx | null>(null);
export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('AuthContext non monté');
  return v;
};

const API = (Constants.expoConfig?.extra as any)?.apiBase as string;

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { address, requestAccounts, getSelectedAddress, disconnect } = useWallet();
  const [jwt, setJwt] = useState<string>();
  const [userRole, setUserRole] = useState<UserRole>('standard_user');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [mockAddress, setMockAddress] = useState<string>();
  // Mock mode: Enable based on platform detection
  const [isMockMode] = useState<boolean>(() => {
    const canMock = PlatformUtils.canUseMockMode;
    log('Mock mode enabled:', canMock, PlatformUtils.getEnvironmentInfo());
    return canMock;
  });

  // IMPORTANT: on n'essaie plus de restaurer un JWT persisté.
  // À chaque relance (nouvelle exécution JS), on efface le token stocké → l'app
  // n'est "connectée" qu'après une nouvelle signature.
  useEffect(() => {
    (async () => {
      try {
        await SecureStore.deleteItemAsync('jwt');
        setJwt(undefined);
        log('force relogin on boot: cleared stored jwt');
      } catch {}
    })();
  }, []);

  const mockLoginWithAccount = async (account: TestAccount) => {
    try {
      log('Mock login with account:', account.name);
      setMockAddress(account.address);
      setUserRole(account.role);
      setIsVerified(account.role === 'certifier');
      
      const fakeToken = `mock.jwt.${account.address}.${Date.now()}`;
      setJwt(fakeToken);
      await SecureStore.setItemAsync('jwt', fakeToken);
      await SecureStore.setItemAsync('mockAddress', account.address);
      await SecureStore.setItemAsync('mockRole', account.role);
      
      log('Mock login successful for:', account.name);
    } catch (error) {
      log('Mock login error:', error);
      throw error;
    }
  };

  const login = async () => {
    try {
      // 1) Demande explicite au wallet → adresse active
      const chosen = (await requestAccounts()) ?? (await getSelectedAddress()) ?? address;
      const addr = chosen?.toLowerCase();
      log('login start, chosen addr=', addr);
      if (!addr) throw new Error('Wallet non connecté');

      // TEMPORARY MOCK - Network issues workaround
      log('MOCK MODE: Bypassing network auth for development');
      const fakeToken = `fake.jwt.token.for.dev.${Date.now()}`;
      log('mock jwt.len=', fakeToken.length);
      setJwt(fakeToken);
      await SecureStore.setItemAsync('jwt', fakeToken);
      return;

      // ORIGINAL AUTH CODE (commented for network issues):
      // 2) Récupère un nonce (hex string) côté back
      // log('About to fetch:', `${API}/auth/nonce?address=${addr}`);
      // const r1 = await fetch(`${API}/auth/nonce?address=${addr}`);
      // log('GET /auth/nonce status=', r1.status);
      // if (!r1.ok) {
      //   const body = await r1.text().catch(() => '');
      //   log('GET /auth/nonce body=', body);
      //   throw new Error(`Erreur /auth/nonce ${body}`);
      // }
      // const { nonce } = await r1.json();
      // log('nonce=', nonce);
      //
      // // 3) Signature des octets du hex fourni (WalletConnect/MetaMask OK)
      // const signature = await personalSign(nonce);
      // log('signature.len=', String(signature).length);
      //
      // // 4) Login — si ton back attend encore { address, signature }, remets l'adresse ici.
      // const r2 = await fetch(`${API}/auth/login`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ nonce, signature }),
      // });
      // log('POST /auth/login status=', r2.status);
      // if (!r2.ok) {
      //   const body = await r2.text().catch(() => '');
      //   log('POST /auth/login body=', body);
      //   throw new Error(`Login échoué ${body}`);
      // }
      // const { token } = await r2.json();
      // log('jwt.len=', token?.length);
      // setJwt(token);
      // await SecureStore.setItemAsync('jwt', token);
    } catch (error) {
      log('Login error:', error);
      throw error;
    }
  };

  const fetchUserProfile = useCallback(async () => {
    if (!jwt) {
      log('No JWT available for profile fetch');
      return;
    }

    // Skip profile fetch in mock mode - data is already set
    if (isMockMode && jwt.startsWith('mock.jwt.')) {
      log('Skipping profile fetch in mock mode - using mock data');
      return;
    }

    try {
      log('Fetching user profile...');
      const response = await fetch(`${API}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        log('Profile fetch failed:', response.status);
        return;
      }

      const profileData = await response.json();
      log('Profile data:', profileData);
      
      setUserRole(profileData.role);
      setIsVerified(profileData.isVerified);
    } catch (error) {
      log('Profile fetch error:', error);
    }
  }, [jwt, isMockMode]);

  const logout = async () => {
    log('logout');
    setJwt(undefined);
    setUserRole('standard_user');
    setIsVerified(false);
    setMockAddress(undefined);
    await SecureStore.deleteItemAsync('jwt');
    await SecureStore.deleteItemAsync('mockAddress');
    await SecureStore.deleteItemAsync('mockRole');
    if (!isMockMode) {
      await disconnect();
    }
  };

  // Fetch user profile when JWT changes
  useEffect(() => {
    if (jwt && jwt !== `fake.jwt.token.for.dev.${Date.now()}`.slice(0, 20)) {
      fetchUserProfile();
    }
  }, [jwt, fetchUserProfile]);

  // Restore mock data on app start if in mock mode
  useEffect(() => {
    if (isMockMode) {
      (async () => {
        try {
          const storedMockAddress = await SecureStore.getItemAsync('mockAddress');
          const storedMockRole = await SecureStore.getItemAsync('mockRole');
          const storedJwt = await SecureStore.getItemAsync('jwt');
          
          if (storedMockAddress && storedMockRole && storedJwt) {
            setMockAddress(storedMockAddress);
            setUserRole(storedMockRole as UserRole);
            setIsVerified(storedMockRole === 'certifier');
            setJwt(storedJwt);
            log('Restored mock session:', storedMockAddress, storedMockRole);
          }
        } catch (error) {
          log('Error restoring mock session:', error);
        }
      })();
    }
  }, [isMockMode]);

  return (
    <Ctx.Provider 
      value={{ 
        jwt, 
        address: isMockMode ? mockAddress : address, 
        userRole, 
        isVerified, 
        login, 
        logout, 
        fetchUserProfile,
        mockLoginWithAccount,
        isMockMode
      }}
    >
      {children}
    </Ctx.Provider>
  );
};
