import { useState, useCallback } from 'react';
import { getQuote } from '@lifi/sdk';
import { useAccount } from 'wagmi';
import { MONAD_CHAIN_ID, MONAD_MON_ADDRESS, parseTokenAmount } from '../config/chains';
import { ensureLifiInitialized } from '../config/lifi';
import type { BridgeQuote } from '../types';

interface UseBridgeQuoteResult {
  quote: BridgeQuote | null;
  isLoading: boolean;
  error: Error | null;
  fetchQuote: (fromChainId: number, amount: string, fromToken: `0x${string}`, fromDecimals: number) => Promise<BridgeQuote | null>;
  clearQuote: () => void;
}

export function useBridgeQuote(): UseBridgeQuoteResult {
  const { address } = useAccount();
  const [quote, setQuote] = useState<BridgeQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchQuote = useCallback(
    async (fromChainId: number, amount: string, fromToken: `0x${string}`, fromDecimals: number): Promise<BridgeQuote | null> => {
      if (!address) {
        setError(new Error('Wallet not connected'));
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        ensureLifiInitialized();

        const amountInSmallestUnit = parseTokenAmount(amount, fromDecimals).toString();

        const result = await getQuote({
          fromChain: fromChainId,
          toChain: MONAD_CHAIN_ID,
          fromToken,
          toToken: MONAD_MON_ADDRESS,
          fromAmount: amountInSmallestUnit,
          fromAddress: address,
          toAddress: address,
        });

        const bridgeQuote: BridgeQuote = {
          fromChainId,
          toChainId: MONAD_CHAIN_ID,
          fromAmount: amount,
          toAmount: result.estimate.toAmount,
          toAmountMin: result.estimate.toAmountMin,
          estimatedGas: result.estimate.gasCosts?.[0]?.amount || '0',
          estimatedTime: result.estimate.executionDuration,
          toolName: result.toolDetails.name,
          route: result,
        };

        setQuote(bridgeQuote);
        return bridgeQuote;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch quote');
        setError(error);
        setQuote(null);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [address]
  );

  const clearQuote = useCallback(() => {
    setQuote(null);
    setError(null);
  }, []);

  return {
    quote,
    isLoading,
    error,
    fetchQuote,
    clearQuote,
  };
}
