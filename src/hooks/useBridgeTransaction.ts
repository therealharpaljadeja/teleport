import { useState, useCallback } from 'react';
import { executeRoute, getStatus, convertQuoteToRoute } from '@lifi/sdk';
import type { Route } from '@lifi/types';
import { useAccount, useWalletClient, useConfig } from 'wagmi';
import { ensureLifiInitialized, setLifiWalletClient } from '../config/lifi';
import type { BridgeQuote, BridgeTransaction } from '../types';

type TransactionStatus = 'idle' | 'approving' | 'bridging' | 'waiting' | 'success' | 'failed' | 'cancelled';

function getFullErrorString(err: unknown): string {
  if (!err) return '';

  let fullString = '';

  // Get the main error message
  if (err instanceof Error) {
    fullString += err.message + ' ';

    // Check for cause (nested error)
    const errorWithCause = err as Error & { cause?: unknown; details?: string; shortMessage?: string };
    if (errorWithCause.cause) {
      fullString += getFullErrorString(errorWithCause.cause) + ' ';
    }
    if (errorWithCause.details) {
      fullString += errorWithCause.details + ' ';
    }
    if (errorWithCause.shortMessage) {
      fullString += errorWithCause.shortMessage + ' ';
    }
  }

  // Also convert to string in case there's additional info
  fullString += String(err);

  return fullString;
}

function parseError(err: unknown): { message: string; isCancelled: boolean } {
  const errorString = getFullErrorString(err).toLowerCase();

  // Check for user rejection/cancellation
  if (
    errorString.includes('user cancelled') ||
    errorString.includes('user rejected') ||
    errorString.includes('user denied') ||
    errorString.includes('rejected the request') ||
    errorString.includes('user refused') ||
    errorString.includes('action_rejected') ||
    errorString.includes('user declined') ||
    errorString.includes('cancelled the request')
  ) {
    return { message: 'Transaction cancelled by user', isCancelled: true };
  }

  // Check for insufficient funds
  if (
    errorString.includes('insufficient funds') ||
    errorString.includes('insufficient balance')
  ) {
    return { message: 'Insufficient funds for this transaction', isCancelled: false };
  }

  // Check for network errors
  if (
    errorString.includes('network') ||
    errorString.includes('connection') ||
    errorString.includes('timeout')
  ) {
    return { message: 'Network error. Please check your connection and try again.', isCancelled: false };
  }

  // Check for slippage/price errors
  if (
    errorString.includes('slippage') ||
    errorString.includes('price changed')
  ) {
    return { message: 'Price changed during transaction. Please try again.', isCancelled: false };
  }

  // Default error message
  return { message: 'Transaction failed. Please try again.', isCancelled: false };
}

interface UseBridgeTransactionResult {
  transaction: BridgeTransaction | null;
  status: TransactionStatus;
  isLoading: boolean;
  error: Error | null;
  executeBridge: (quote: BridgeQuote) => Promise<string | null>;
  reset: () => void;
}

export function useBridgeTransaction(): UseBridgeTransactionResult {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const wagmiConfig = useConfig();
  const [transaction, setTransaction] = useState<BridgeTransaction | null>(null);
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const executeBridge = useCallback(
    async (quote: BridgeQuote): Promise<string | null> => {
      if (!address || !walletClient) {
        setError(new Error('Wallet not connected'));
        return null;
      }

      setIsLoading(true);
      setError(null);
      setStatus('approving');

      try {
        // Set wallet client and wagmi config for Li.fi SDK before initializing
        setLifiWalletClient(walletClient, wagmiConfig);
        ensureLifiInitialized();

        // Convert quote to route format for executeRoute
        const route = convertQuoteToRoute(quote.route as Parameters<typeof convertQuoteToRoute>[0]);

        let txHash: string | null = null;

        await executeRoute(route as Route, {
          updateRouteHook: (updatedRoute) => {
            console.log('Route update:', JSON.stringify(updatedRoute, null, 2));
            console.log('Steps:', JSON.stringify(updatedRoute.steps, null, 2));
            const step = updatedRoute.steps?.[0];
            if (step) {
              const execution = step.execution;
              console.log('Exdcution:', JSON.stringify(execution, null, 2));
              if (execution) {
                if (execution.status === 'PENDING') {
                  setStatus('bridging');
                }
                if (execution.process) {
                  const txProcess = execution.process.find((p) => p.txHash);
                  if (txProcess?.txHash) {
                    txHash = txProcess.txHash;
                    setTransaction({
                      hash: txProcess.txHash,
                      status: 'pending',
                      fromChainId: quote.fromChainId,
                      toChainId: quote.toChainId,
                      amount: quote.fromAmount,
                    });
                  }
                }
              }
            }
          },
          acceptExchangeRateUpdateHook: async () => true,
        });

        if (txHash) {
          setStatus('waiting');

          let attempts = 0;
          const maxAttempts = 120;

          while (attempts < maxAttempts) {
            try {
              const statusResult = await getStatus({
                txHash,
                fromChain: quote.fromChainId,
                toChain: quote.toChainId,
              });

              console.log('Bridge status:', statusResult.status);

              if (statusResult.status === 'DONE') {
                setStatus('success');
                setTransaction((prev) =>
                  prev ? { ...prev, status: 'success' } : null
                );
                break;
              } else if (statusResult.status === 'FAILED') {
                throw new Error('Bridge transaction failed');
              }
            } catch {
              // Status check failed, continue polling
            }

            await new Promise((resolve) => setTimeout(resolve, 5000));
            attempts++;
          }

          if (attempts >= maxAttempts) {
            setStatus('success');
          }
        }

        return txHash;
      } catch (err) {
        console.error('Bridge error:', err);
        const { message, isCancelled } = parseError(err);
        setError(new Error(message));
        setStatus(isCancelled ? 'cancelled' : 'failed');
        setTransaction((prev) => (prev ? { ...prev, status: 'failed' } : null));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [address, walletClient, wagmiConfig]
  );

  const reset = useCallback(() => {
    setTransaction(null);
    setStatus('idle');
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    transaction,
    status,
    isLoading,
    error,
    executeBridge,
    reset,
  };
}
