import type { ChainConfig } from '../types';

export const MONAD_CHAIN_ID = 143;
export const MONAD_USDC_ADDRESS = '0x754704Bc059F8C67012fEd69BC8A327a5aafb603' as const;

export const CHAIN_LOGOS: Record<number, string> = {
  1: 'https://avatars.githubusercontent.com/u/6250754?s=280&v=4',
  10: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7-ZKP09oTXTRGK9LPEwhIdGru7WjuE6qZKg&s',
  42161: 'https://avatars.githubusercontent.com/u/119917794?s=280&v=4',
  8453: 'https://avatars.githubusercontent.com/u/108554348?s=280&v=4',
  [MONAD_CHAIN_ID]: 'https://avatars.githubusercontent.com/u/99830870?s=200&v=4',
};

export const SOURCE_CHAINS: ChainConfig[] = [
  {
    id: 1,
    name: 'Ethereum',
    usdcAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    icon: CHAIN_LOGOS[1],
    explorerUrl: 'https://etherscan.io',
  },
  {
    id: 10,
    name: 'Optimism',
    usdcAddress: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
    icon: CHAIN_LOGOS[10],
    explorerUrl: 'https://optimistic.etherscan.io',
  },
  {
    id: 42161,
    name: 'Arbitrum',
    usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    icon: CHAIN_LOGOS[42161],
    explorerUrl: 'https://arbiscan.io',
  },
  {
    id: 8453,
    name: 'Base',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    icon: CHAIN_LOGOS[8453],
    explorerUrl: 'https://basescan.org',
  },
];

export const USDC_DECIMALS = 6;

export function getChainById(chainId: number): ChainConfig | undefined {
  return SOURCE_CHAINS.find((chain) => chain.id === chainId);
}

export function getExplorerTxUrl(chainId: number, txHash: string): string {
  const chain = getChainById(chainId);
  if (!chain) {
    return `https://etherscan.io/tx/${txHash}`;
  }
  return `${chain.explorerUrl}/tx/${txHash}`;
}

export function formatUSDC(amount: string, decimals: number = 2): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function parseUSDCAmount(amount: string): bigint {
  const cleaned = amount.replace(/,/g, '');
  const parts = cleaned.split('.');
  const wholePart = parts[0] || '0';
  let decimalPart = parts[1] || '';

  decimalPart = decimalPart.padEnd(USDC_DECIMALS, '0').slice(0, USDC_DECIMALS);

  return BigInt(wholePart + decimalPart);
}

export function formatUSDCFromBigInt(amount: bigint): string {
  const str = amount.toString().padStart(USDC_DECIMALS + 1, '0');
  const wholePart = str.slice(0, -USDC_DECIMALS) || '0';
  const decimalPart = str.slice(-USDC_DECIMALS);
  return `${wholePart}.${decimalPart}`;
}
