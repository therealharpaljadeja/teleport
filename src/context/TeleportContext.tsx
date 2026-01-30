import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { TeleportState, TeleportContextValue, DialogView, BridgeQuote, TokenBalance } from '../types';

const initialState: TeleportState = {
  view: 'loading',
  selectedChainId: null,
  amount: '',
  quote: null,
  txHash: null,
  error: null,
  balances: [],
};

const TeleportContext = createContext<TeleportContextValue | null>(null);

export function TeleportProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<TeleportState>(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
    setState({ ...initialState, view: 'loading' });
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setView = useCallback((view: DialogView) => {
    setState((prev) => ({ ...prev, view }));
  }, []);

  const selectChain = useCallback((chainId: number) => {
    setState((prev) => ({ ...prev, selectedChainId: chainId }));
  }, []);

  const setAmount = useCallback((amount: string) => {
    setState((prev) => ({ ...prev, amount }));
  }, []);

  const setQuote = useCallback((quote: BridgeQuote | null) => {
    setState((prev) => ({ ...prev, quote }));
  }, []);

  const setTxHash = useCallback((txHash: string) => {
    setState((prev) => ({ ...prev, txHash }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState((prev) => ({ ...prev, error }));
  }, []);

  const setBalances = useCallback((balances: TokenBalance[]) => {
    setState((prev) => ({ ...prev, balances }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const value = useMemo<TeleportContextValue>(
    () => ({
      state,
      isOpen,
      open,
      close,
      setView,
      selectChain,
      setAmount,
      setQuote,
      setTxHash,
      setError,
      setBalances,
      reset,
    }),
    [state, isOpen, open, close, setView, selectChain, setAmount, setQuote, setTxHash, setError, setBalances, reset]
  );

  return <TeleportContext.Provider value={value}>{children}</TeleportContext.Provider>;
}

export function useTeleport(): TeleportContextValue {
  const context = useContext(TeleportContext);
  if (!context) {
    throw new Error('useTeleport must be used within a TeleportProvider');
  }
  return context;
}
