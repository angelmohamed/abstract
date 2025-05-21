// app/providers.js
'use client';

import React from 'react';
import { WalletProvider } from './walletconnect/walletContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children }) {
  return (
    <WalletProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WalletProvider>
  );
}
