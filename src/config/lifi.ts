import { createConfig, EVM } from '@lifi/sdk';
import type { WalletClient } from 'viem';
import type { Config } from 'wagmi';
import { switchChain as wagmiSwitchChain, getWalletClient as getWagmiWalletClient } from 'wagmi/actions';

let lifiConfigured = false;
let currentWalletClient: WalletClient | undefined = undefined;
let currentWagmiConfig: Config | undefined = undefined;

export interface LifiConfig {
  apiKey?: string;
  integrator?: string;
}

let pendingConfig: LifiConfig = {};

export function configureLifi(config: LifiConfig) {
  pendingConfig = config;
}

export function setLifiWalletClient(walletClient: WalletClient | undefined, wagmiConfig?: Config) {
  currentWalletClient = walletClient;
  if (wagmiConfig) {
    currentWagmiConfig = wagmiConfig;
  }

  // Reconfigure if already initialized to update the wallet client
  if (lifiConfigured) {
    lifiConfigured = false;
    initializeLifi();
  }
}

export function initializeLifi() {
  if (lifiConfigured) return;

  createConfig({
    integrator: pendingConfig.integrator || 'monad-teleport',
    apiKey: pendingConfig.apiKey,
    providers: [
      EVM({
        getWalletClient: async () => {
          if (!currentWalletClient) {
            throw new Error('Wallet client not available');
          }
          return currentWalletClient;
        },
        switchChain: async (chainId: number) => {
          if (!currentWagmiConfig) {
            throw new Error('Wagmi config not available');
          }
          await wagmiSwitchChain(currentWagmiConfig, { chainId });
          // Get the wallet client for the new chain
          const newWalletClient = await getWagmiWalletClient(currentWagmiConfig, { chainId });
          currentWalletClient = newWalletClient;
          return newWalletClient;
        },
      }),
    ],
  });

  lifiConfigured = true;
}

export function ensureLifiInitialized() {
  initializeLifi();
}
