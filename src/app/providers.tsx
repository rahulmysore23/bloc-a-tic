'use client';

import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { createConfig, WagmiProvider } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';

// Get your project ID from https://cloud.walletconnect.com/
// This is required for WalletConnect integration
const projectId = 'YOUR_PROJECT_ID';
const queryClient = new QueryClient();

const { connectors } = getDefaultWallets({
  appName: 'Block-A-Tick',
  projectId,
});

// Create a function to get the current chain configuration
const getChainConfig = () => {
  // Get the current chain ID from MetaMask
  const chainId = typeof window !== 'undefined' 
    ? parseInt(window.ethereum?.networkVersion || '1')
    : 1;

  // Create a custom chain configuration for local networks
  if (chainId === 31337) { // Hardhat local network
    return {
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
    };
  }

  // Return the appropriate chain configuration
  switch (chainId) {
    case 1:
      return mainnet;
    case 11155111:
      return sepolia;
    default:
      // For any other network, create a custom configuration
      return {
        id: chainId,
        name: `Chain ${chainId}`,
        network: `chain-${chainId}`,
        nativeCurrency: {
          name: 'Ether',
          symbol: 'ETH',
          decimals: 18,
        },
        rpcUrls: {
          default: { http: [`https://rpc.ankr.com/eth/${chainId}`] },
        },
        blockExplorers: {
          default: { name: 'Unknown', url: '' },
        },
        testnet: chainId !== 1,
      };
  }
};

const config = createConfig({
  chains: [getChainConfig()],
  transports: {
    [getChainConfig().id]: http(),
  },
  connectors,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
} 