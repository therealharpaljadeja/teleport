import { useState, useCallback, useEffect } from 'react';
import { getWalletBalances } from '@lifi/sdk';
import { useAccount } from 'wagmi';
import { SOURCE_CHAINS } from '../config/chains';
import { ensureLifiInitialized } from '../config/lifi';
import type { TokenBalance } from '../types';

interface UseTokenBalancesResult {
  balances: TokenBalance[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTokenBalances(): UseTokenBalancesResult {
  const { address } = useAccount();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalances = useCallback(async () => {
    if (!address) {
      setBalances([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      ensureLifiInitialized();

      const result = await getWalletBalances(address);

      const formattedBalances: TokenBalance[] = [];

      for (const chain of SOURCE_CHAINS) {
        const chainTokens = result[chain.id] || [];

        for (const token of chain.tokens) {
          const matchedToken = chainTokens.find(
            (t) => t.address.toLowerCase() === token.address.toLowerCase()
          );

          const balance = matchedToken?.amount?.toString() || '0';
          const balanceNum = parseFloat(balance) / Math.pow(10, token.decimals);

          formattedBalances.push({
            chainId: chain.id,
            chainName: chain.name,
            balance,
            balanceFormatted: balanceNum.toFixed(token.decimals === 18 ? 6 : 2),
            tokenAddress: token.address,
            asset: token.asset,
            decimals: token.decimals,
            symbol: token.symbol,
          });
        }
      }

      setBalances(formattedBalances);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch balances');
      setError(error);
      setBalances([]);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    balances,
    isLoading,
    error,
    refetch: fetchBalances,
  };
}
