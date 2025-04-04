'use client';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { createConfig, WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

const projectId = 'YOUR_PROJECT_ID';
const queryClient = new QueryClient();

const { connectors } = getDefaultWallets({
  appName: 'Block-A-Tick',
  projectId,
});

// Define all supported chains
const supportedChains = [
  mainnet,
  sepolia,
  {
    id: 31337,
    name: 'Localhost',
    network: 'localhost',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: {
      default: { http: ['http://127.0.0.1:8545'] },
    },
    blockExplorers: {
      default: { name: 'Local', url: '' },
    },
    testnet: true,
  }
];

const config = createConfig({
  chains: supportedChains,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [31337]: http(),
  },
  connectors,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider chains={supportedChains}>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}