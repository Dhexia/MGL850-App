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

  const logout = async () => {
    log('logout');
    setJwt(undefined);
    await SecureStore.deleteItemAsync('jwt');
    await disconnect();
  };

  return <Ctx.Provider value={{ jwt, address, login, logout }}>{children}</Ctx.Provider>;
};
