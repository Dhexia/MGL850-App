// src/contexts/AuthContext.tsx — nonce login body (front patch)
import React, { createContext, useContext, useEffect, useState } from 'react';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { useWallet } from './WalletContext';

const log = (...a: any[]) => console.log('[Auth]', ...a);

export type AuthCtx = {
  jwt?: string;
  address?: string;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);
export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('AuthContext non monté');
  return v;
};

const API = (Constants.expoConfig?.extra as any)?.apiBase as string;

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { address, requestAccounts, getSelectedAddress, personalSign, disconnect } = useWallet();
  const [jwt, setJwt] = useState<string>();

  useEffect(() => {
    (async () => {
      const token = await SecureStore.getItemAsync('jwt');
      if (token) {
        setJwt(token);
        log('restored jwt.len=', token.length);
      }
    })();
  }, []);

  const login = async () => {
    // 1) Demande explicite au wallet → adresse active
    const chosen = (await requestAccounts()) ?? (await getSelectedAddress()) ?? address;
    const addr = chosen?.toLowerCase();
    log('login start, chosen addr=', addr);
    if (!addr) throw new Error('Wallet non connecté');

    // 2) Récupère un nonce (lié à la session, pas à l'adresse côté back)
    const r1 = await fetch(`${API}/auth/nonce?address=${addr}`);
    log('GET /auth/nonce status=', r1.status);
    if (!r1.ok) {
      const body = await r1.text().catch(() => '');
      log('GET /auth/nonce body=', body);
      throw new Error(`Erreur /auth/nonce ${body}`);
    }
    const { nonce } = await r1.json();
    log('nonce=', nonce);

    // 3) Signature des octets du hex "0x..."
    const signature = await personalSign(nonce);
    log('signature.len=', String(signature).length);

    // 4) Login avec { nonce, signature } (on n'envoie plus address)
    const r2 = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nonce, signature }),
    });
    log('POST /auth/login status=', r2.status);
    if (!r2.ok) {
      const body = await r2.text().catch(() => '');
      log('POST /auth/login body=', body);
      throw new Error(`Login échoué ${body}`);
    }
    const { token } = await r2.json();
    log('jwt.len=', token?.length);
    setJwt(token);
    await SecureStore.setItemAsync('jwt', token);
  };

  const logout = async () => {
    log('logout');
    setJwt(undefined);
    await SecureStore.deleteItemAsync('jwt');
    await disconnect();
  };

  return <Ctx.Provider value={{ jwt, address, login, logout }}>{children}</Ctx.Provider>;
};
