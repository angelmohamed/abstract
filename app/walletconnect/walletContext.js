"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  WagmiProvider,
  createConfig,
  http,
  useAccount,
  useConnect,
  useDisconnect,
} from 'wagmi';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { metaMask, walletConnect } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import config from "../config/config"

const queryClient = new QueryClient();

const walletconfig = createConfig({
  autoConnect: true,
  chains: [polygon, polygonAmoy],
  transports: {
    [polygon.id]: http('https://polygon-mainnet.g.alchemy.com/v2/demo'),
    [polygonAmoy.id]: http('https://polygon-amoy.drpc.org'),
  },
  connectors: [
    metaMask({ chains: [polygon, polygonAmoy] }),
    walletConnect({
      projectId: 'cb89ebb21cdccb2e1b591e189e27706a',
      chains: [config?.chainId],
      showQrModal: true,
    }),
  ],
});

const WalletContext = createContext({
  address: null,
  isConnected: false,
  connectors: [],
  connectWallet: () => {},
  disconnectWallet: () => {},
});

export const WalletProvider = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <WagmiProvider config={walletconfig}>
      <QueryClientProvider client={queryClient}>
        {isMounted && <WalletProviderInner>{children}</WalletProviderInner>}
      </QueryClientProvider>
    </WagmiProvider>
  );
};

const WalletProviderInner = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const value = {
    address,
    isConnected,
    connectors,
    connectWallet: (connector) => connect({ connector }),
    disconnectWallet: disconnect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  // console.log(context,"contextcontextcontextcontext")
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }

  return context;
};