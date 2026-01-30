# monad-teleport

A React component for bridging USDC from other chains (Ethereum, Optimism, Arbitrum, Base) to Monad mainnet using Li.fi SDK.

## Installation

```bash
npm install monad-teleport
```

### Peer Dependencies

This package requires the following peer dependencies:

```bash
npm install react react-dom wagmi viem
```

## Configuration

### Li.fi API Key (Optional but Recommended)

The package uses [Li.fi](https://li.fi/) for cross-chain bridging. While it works without an API key, you should register for one for production use to get higher rate limits.

1. Register at [Li.fi](https://li.fi/) to get an API key
2. Configure it before rendering the TeleportButton:

```tsx
import { configureLifi } from 'monad-teleport';

// Call this once at app startup (e.g., in your main.tsx or App.tsx)
configureLifi({
  apiKey: 'your-lifi-api-key', // Optional: for higher rate limits
  integrator: 'your-app-name', // Optional: defaults to 'monad-teleport'
});
```

## Usage

### Basic Usage

```tsx
import { TeleportButton } from 'monad-teleport';
import 'monad-teleport/styles.css';

function App() {
  return (
    <TeleportButton
      onSuccess={(txHash, amount) => {
        console.log(`Bridged ${amount} USDC! Transaction: ${txHash}`);
      }}
      onError={(error) => {
        console.error('Bridge failed:', error);
      }}
    >
      Get USDC on Monad
    </TeleportButton>
  );
}
```

### With Custom Styling

```tsx
import { TeleportButton } from 'monad-teleport';
import 'monad-teleport/styles.css';

function App() {
  return (
    <TeleportButton
      className="bg-purple-600 hover:bg-purple-700"
      variant="outline"
      size="lg"
      dialogClassName="max-w-lg"
    >
      Bridge USDC
    </TeleportButton>
  );
}
```

### With wagmi Configuration

Make sure your app is wrapped with wagmi's `WagmiProvider`:

```tsx
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, optimism, arbitrum, base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeleportButton } from 'monad-teleport';
import 'monad-teleport/styles.css';

const config = createConfig({
  chains: [mainnet, optimism, arbitrum, base],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
});

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <TeleportButton />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

## Props

### TeleportButton

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes for the button |
| `variant` | `'default' \| 'outline' \| 'ghost'` | `'default'` | Button style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `children` | `React.ReactNode` | `'Teleport USDC'` | Button content |
| `onSuccess` | `(txHash: string, amount: string) => void` | - | Called when bridge succeeds |
| `onError` | `(error: Error) => void` | - | Called when bridge fails |
| `onOpen` | `() => void` | - | Called when dialog opens |
| `onClose` | `() => void` | - | Called when dialog closes |
| `dialogClassName` | `string` | - | Additional CSS classes for the dialog |
| `dialogOverlayClassName` | `string` | - | Additional CSS classes for the overlay |

## Supported Chains

### Source Chains (where your USDC is)

| Chain | Chain ID | USDC Address |
|-------|----------|--------------|
| Ethereum | 1 | 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 |
| Optimism | 10 | 0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85 |
| Arbitrum | 42161 | 0xaf88d065e77c8cC2239327C5EDb3A432268e5831 |
| Base | 8453 | 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 |

### Destination Chain

| Chain | Chain ID | USDC Address |
|-------|----------|--------------|
| Monad | 143 | 0x754704Bc059F8C67012fEd69BC8A327a5aafb603 |

## Exports

### Components
- `TeleportButton` - Main button component with built-in dialog
- `TeleportDialog` - Dialog component (for custom implementations)
- `TeleportProvider` - Context provider (for custom implementations)

### Hooks
- `useTokenBalances` - Fetch USDC balances across supported chains
- `useBridgeQuote` - Get a quote for bridging
- `useBridgeTransaction` - Execute a bridge transaction
- `useTeleport` - Access teleport context state

### Config
- `configureLifi` - Configure Li.fi SDK with API key
- `MONAD_CHAIN_ID` - Monad chain ID (143)
- `MONAD_USDC_ADDRESS` - USDC address on Monad
- `SOURCE_CHAINS` - Array of supported source chains
- `getChainById` - Get chain config by ID
- `getExplorerTxUrl` - Get explorer URL for a transaction
- `formatUSDC` - Format USDC amounts

## License

MIT
