// src/contexts/WalletContext.tsx — with debug logs v2
import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  useCallback,
  useRef,
  PropsWithChildren,
} from 'react';
import Constants from 'expo-constants';
import {
  WalletConnectModal,
  useWalletConnectModal,
} from '@walletconnect/modal-react-native';

// Simple logger
const log = (...a: any[]) => console.log('[Wallet]', ...a);

export type WalletCtx = {
  address?: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  personalSign: (message: string) => Promise<string>;
  isConnected: boolean;
  waitForSession: () => Promise<void>;
  getFreshAddress: () => string | undefined;
  getSelectedAddress: () => Promise<string | undefined>;
  requestAccounts: () => Promise<string | undefined>;
  ecRecover: (message: string, signature: string) => Promise<string | undefined>; // debug helper
};

const Ctx = createContext<WalletCtx | null>(null);
export const useWallet = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('WalletProvider non monté');
  return v;
};

// Config via expo.extra
const EX = (Constants.expoConfig?.extra ?? {}) as {
  wcProjectId?: string;
  chainId?: number;
  appUrl?: string;
  appName?: string;
};
const PROJECT_ID = EX.wcProjectId ?? '';
const CHAIN_DEC = EX.chainId ?? 11155111; // Sepolia par défaut
const CHAIN_NS = `eip155:${CHAIN_DEC}`;

function addrFromSessionAccount(account?: string): string | undefined {
  if (!account) return;
  const parts = account.split(':');
  return parts[2]?.toLowerCase();
}
function addrFromEvent(account?: string): string | undefined {
  return account?.toLowerCase();
}

export const WalletProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const { open, provider, isConnected, close } = useWalletConnectModal();
  const [address, setAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    log('mount provider=', Boolean(provider), 'projectId=', PROJECT_ID, 'chain=', CHAIN_DEC);
  }, []);

  // Promesse résolue quand la session est prête (évite les courses)
  const readyResolveRef = useRef<(() => void) | null>(null);
  const readyPromiseRef = useRef<Promise<void> | null>(null);
  const resetReadyPromise = useCallback(() => {
    readyPromiseRef.current = new Promise<void>((resolve) => {
      readyResolveRef.current = resolve;
    });
    log('reset ready promise');
  }, []);
  useEffect(() => { resetReadyPromise(); }, [resetReadyPromise]);

  // Mise à jour depuis la session WC
  const updateFromSession = useCallback(() => {
    const acc = provider?.session?.namespaces?.eip155?.accounts?.[0];
    const addr = addrFromSessionAccount(acc);
    log('updateFromSession acc=', acc, 'addr=', addr);
    setAddress(addr);
    if (provider?.session?.topic && addr && readyResolveRef.current) {
      readyResolveRef.current();
      readyResolveRef.current = null;
      log('session ready resolved');
    }
  }, [provider?.session?.topic]);

  // Events EIP-1193
  useEffect(() => {
    if (!provider) return;

    const onConnect = () => { log('event connect'); updateFromSession(); };
    const onAccountsChanged = (accounts: string[]) => {
      const addr = addrFromEvent(accounts?.[0]);
      log('event accountsChanged', accounts, '->', addr);
      setAddress(addr);
      if (provider.session?.topic && addr && readyResolveRef.current) {
        readyResolveRef.current();
        readyResolveRef.current = null;
        log('session ready resolved after accountsChanged');
      }
    };
    const onChainChanged = (chainId: string | number) => {
      log('event chainChanged', chainId);
    };
    const onDisconnect = () => {
      log('event disconnect');
      setAddress(undefined);
      resetReadyPromise();
    };

    provider.on?.('connect', onConnect);
    provider.on?.('accountsChanged', onAccountsChanged);
    provider.on?.('chainChanged', onChainChanged);
    provider.on?.('disconnect', onDisconnect);

    if (provider.session?.topic) updateFromSession();

    return () => {
      provider.off?.('connect', onConnect);
      provider.off?.('accountsChanged', onAccountsChanged);
      provider.off?.('chainChanged', onChainChanged);
      provider.off?.('disconnect', onDisconnect);
    };
  }, [provider, updateFromSession, resetReadyPromise]);

  // Attend la session prête
  const waitForSession = useCallback(async () => {
    const hasSession = Boolean(provider?.session?.topic) && Boolean(provider?.session?.namespaces?.eip155?.accounts?.length);
    if (hasSession || address) { log('waitForSession: already ready', { hasSession, address }); return; }
    if (readyPromiseRef.current) {
      log('waitForSession: awaiting readyPromise');
      await readyPromiseRef.current;
    }
  }, [provider?.session?.topic, address]);

  const getFreshAddress = useCallback(() => {
    const acc = provider?.session?.namespaces?.eip155?.accounts?.[0];
    const addr = addrFromSessionAccount(acc);
    log('getFreshAddress ->', addr);
    return addr;
  }, [provider?.session?.topic]);

  const getSelectedAddress = useCallback(async () => {
    if (!provider) return undefined;
    try {
      const accs = (await provider.request({ method: 'eth_accounts' })) as string[];
      log('eth_accounts ->', accs);
      if (Array.isArray(accs) && accs.length > 0) return (accs[0] || '').toLowerCase();
    } catch (e) {
      log('eth_accounts error', e);
    }
    const fallback = getFreshAddress();
    log('getSelectedAddress fallback ->', fallback);
    return fallback;
  }, [provider, getFreshAddress]);

  const requestAccounts = useCallback(async () => {
    if (!provider) return undefined;
    await waitForSession();
    try {
      const accs = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
      const selected = (accs?.[0] || '').toLowerCase();
      log('eth_requestAccounts ->', accs, 'selected=', selected);
      if (selected) setAddress(selected);
      return selected || undefined;
    } catch (e) {
      log('eth_requestAccounts error', e);
      return undefined;
    }
  }, [provider, waitForSession]);

  // Debug helper: récupère l'adresse qui a produit la signature
  const ecRecover = useCallback(async (message: string, signature: string) => {
    if (!provider) return undefined;
    try {
      const recovered = (await provider.request({
        method: 'personal_ecRecover',
        params: [message, signature],
      })) as string;
      log('personal_ecRecover ->', recovered?.toLowerCase());
      return recovered?.toLowerCase();
    } catch (e) {
      log('personal_ecRecover error', e);
      return undefined;
    }
  }, [provider]);

  const connect = useCallback(async () => {
    if (provider?.session) {
      log('connect: disconnect previous session');
      await provider.disconnect();
      resetReadyPromise();
    }
    log('connect: open modal…');
    await open();
    await waitForSession();
    log('connect: session ready, addr=', getFreshAddress());
  }, [open, provider, waitForSession, resetReadyPromise, getFreshAddress]);

  const disconnect = useCallback(async () => {
    try {
      if (provider && isConnected) {
        log('disconnect: provider.disconnect');
        await provider.disconnect();
      }
    } finally {
      setAddress(undefined);
      resetReadyPromise();
      log('disconnect: close modal');
      await close();
    }
  }, [provider, isConnected, close, resetReadyPromise]);

  const personalSign = useCallback(
    async (message: string) => {
      if (!provider) throw new Error('Provider WalletConnect indisponible');
      await waitForSession();
      const from = await getSelectedAddress();
      log('personalSign from=', from, 'msg.len=', String(message).length);
      if (!from) throw new Error('Aucune adresse connectée');
      const sig = await provider.request({ method: 'personal_sign', params: [message, from] });
      log('personalSign -> sig.len=', String(sig).length);
      return sig as string;
    },
    [provider, waitForSession, getSelectedAddress]
  );

  const value = useMemo(
    () => ({ address, connect, disconnect, personalSign, isConnected, waitForSession, getFreshAddress, getSelectedAddress, requestAccounts, ecRecover }),
    [address, connect, disconnect, personalSign, isConnected, waitForSession, getFreshAddress, getSelectedAddress, requestAccounts, ecRecover]
  );

  return (
    <>
      <WalletConnectModal
        projectId={PROJECT_ID}
        providerMetadata={{
          name: EX.appName ?? 'BoatChain',
          description: 'Ventes et certificats de bateaux',
          url: EX.appUrl ?? 'https://boatchain.dev',
          icons: ['https://avatars.githubusercontent.com/u/37784886'],
          redirect: { native: 'boatchain://', universal: EX.appUrl ?? 'https://boatchain.dev' },
        }}
        sessionParams={{
          namespaces: {
            eip155: {
              chains: [CHAIN_NS],
              methods: ['personal_sign', 'eth_sendTransaction', 'eth_signTypedData', 'eth_signTypedData_v4'],
              events: ['accountsChanged', 'chainChanged'],
            },
          },
        }}
      />
      <Ctx.Provider value={value}>{children}</Ctx.Provider>
    </>
  );
};
