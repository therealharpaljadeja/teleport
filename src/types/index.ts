export type SourceAsset = 'USDC' | 'ETH';

export interface SourceToken {
  asset: SourceAsset;
  address: `0x${string}`;
  decimals: number;
  symbol: string;
}

export interface ChainConfig {
  id: number;
  name: string;
  tokens: SourceToken[];
  icon?: string;
  explorerUrl: string;
}

export interface TokenBalance {
  chainId: number;
  chainName: string;
  balance: string;
  balanceFormatted: string;
  tokenAddress: `0x${string}`;
  asset: SourceAsset;
  decimals: number;
  symbol: string;
}

export interface BridgeQuote {
  fromChainId: number;
  toChainId: number;
  fromAmount: string;
  toAmount: string;
  toAmountMin: string;
  estimatedGas: string;
  estimatedTime: number;
  toolName: string;
  route: unknown;
}

export interface BridgeTransaction {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  fromChainId: number;
  toChainId: number;
  amount: string;
}

export type DialogView =
  | 'loading'
  | 'balances'
  | 'amount'
  | 'confirm'
  | 'processing'
  | 'success'
  | 'error'
  | 'cancelled';

export interface TeleportState {
  view: DialogView;
  selectedChainId: number | null;
  selectedAsset: SourceAsset | null;
  amount: string;
  quote: BridgeQuote | null;
  txHash: string | null;
  error: Error | null;
  balances: TokenBalance[];
}

export interface TeleportButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children?: import('react').ReactNode;
  onSuccess?: (txHash: string, amount: string) => void;
  onError?: (error: Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
  dialogClassName?: string;
  dialogOverlayClassName?: string;
}

export interface TeleportContextValue {
  state: TeleportState;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setView: (view: DialogView) => void;
  selectChain: (chainId: number) => void;
  selectAsset: (asset: SourceAsset) => void;
  setAmount: (amount: string) => void;
  setQuote: (quote: BridgeQuote | null) => void;
  setTxHash: (hash: string) => void;
  setError: (error: Error | null) => void;
  setBalances: (balances: TokenBalance[]) => void;
  reset: () => void;
}
