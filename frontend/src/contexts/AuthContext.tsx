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
  devLoginWithAccount: (account: TestAccount) => Promise<void>;
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

  // Force de nouveau login à chaque relance d'app pour éviter les tokens expirés
  useEffect(() => {
    (async () => {
      try {
        await SecureStore.deleteItemAsync('jwt');
        setJwt(undefined);
        log('force relogin on boot: cleared stored jwt');
      } catch {}
    })();
  }, []);

  const devLoginWithAccount = async (account: TestAccount) => {
    try {
      log('Dev login with account:', account.name);
      
      const response = await fetch(`${API}/auth/dev-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: account.address }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        log('Dev login failed:', response.status, errorText);
        throw new Error(`Dev login failed: ${errorText}`);
      }
      
      const { token, account: accountInfo } = await response.json();
      log('Dev login successful:', accountInfo);
      
      setMockAddress(account.address);
      setUserRole(accountInfo.role);
      setIsVerified(accountInfo.role === 'certifier');
      setJwt(token);
      
      await SecureStore.setItemAsync('jwt', token);
      await SecureStore.setItemAsync('devAddress', account.address);
      await SecureStore.setItemAsync('devRole', accountInfo.role);
      
      log('Login successful for:', account.name);
    } catch (error) {
      log('Login error:', error);
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

      // Authentification via wallet - pour production
      const r1 = await fetch(`${API}/auth/nonce?address=${addr}`);
      if (!r1.ok) {
        const body = await r1.text().catch(() => '');
        throw new Error(`Erreur /auth/nonce ${body}`);
      }
      const { nonce } = await r1.json();
      
      const signature = await personalSign(nonce);
      
      const r2 = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nonce, signature }),
      });
      if (!r2.ok) {
        const body = await r2.text().catch(() => '');
        throw new Error(`Login échoué ${body}`);
      }
      const { token } = await r2.json();
      setJwt(token);
      await SecureStore.setItemAsync('jwt', token);
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

    // Skip profile fetch in mock mode - data is already set from dev login
    if (isMockMode) {
      log('Skipping profile fetch in dev mode - using dev account data');
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
    await SecureStore.deleteItemAsync('devAddress');
    await SecureStore.deleteItemAsync('devRole');
    if (!isMockMode) {
      await disconnect();
    }
  };

  // Fetch user profile when JWT changes (skip for dev mode)
  useEffect(() => {
    if (jwt && !isMockMode) {
      fetchUserProfile();
    }
  }, [jwt, fetchUserProfile, isMockMode]);

  // Restore dev account data on app start if in dev mode
  useEffect(() => {
    if (isMockMode) {
      (async () => {
        try {
          const storedMockAddress = await SecureStore.getItemAsync('devAddress');
          const storedMockRole = await SecureStore.getItemAsync('devRole');
          const storedJwt = await SecureStore.getItemAsync('jwt');
          
          if (storedMockAddress && storedMockRole && storedJwt) {
            setMockAddress(storedMockAddress);
            setUserRole(storedMockRole as UserRole);
            setIsVerified(storedMockRole === 'certifier');
            setJwt(storedJwt);
            log('Restored dev session:', storedMockAddress, storedMockRole);
          }
        } catch (error) {
          log('Error restoring dev session:', error);
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
        devLoginWithAccount,
        isMockMode
      }}
    >
      {children}
    </Ctx.Provider>
  );
};
