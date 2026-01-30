import { clsx } from 'clsx';
import { useTeleport } from '../../context/TeleportContext';
import { formatUSDC, CHAIN_LOGOS } from '../../config/chains';
import type { TokenBalance } from '../../types';

interface ChainCardProps {
  balance: TokenBalance;
  onSelect: () => void;
  disabled: boolean;
}

function ChainCard({ balance, onSelect, disabled }: ChainCardProps) {
  const hasBalance = parseFloat(balance.balance) > 0;

  return (
    <button
      onClick={onSelect}
      disabled={disabled || !hasBalance}
      className={clsx(
        'tp-w-full tp-flex tp-items-center tp-justify-between tp-p-4 tp-rounded-lg tp-border tp-transition-all',
        hasBalance
          ? 'tp-border-gray-200 hover:tp-border-monad-purple hover:tp-bg-purple-50 tp-cursor-pointer'
          : 'tp-border-gray-100 tp-bg-gray-50 tp-cursor-not-allowed tp-opacity-60'
      )}
    >
      <div className="tp-flex tp-items-center tp-gap-3">
        {CHAIN_LOGOS[balance.chainId] ? (
          <img
            src={CHAIN_LOGOS[balance.chainId]}
            alt={balance.chainName}
            className="tp-w-8 tp-h-8 tp-rounded-full"
          />
        ) : (
          <div className="tp-w-8 tp-h-8 tp-rounded-full tp-bg-gray-100 tp-flex tp-items-center tp-justify-center tp-text-xs tp-font-medium">
            {balance.chainName.charAt(0)}
          </div>
        )}
        <span className="tp-font-medium tp-text-gray-900">{balance.chainName}</span>
      </div>
      <div className="tp-text-right">
        <span className={clsx('tp-font-mono', hasBalance ? 'tp-text-gray-900' : 'tp-text-gray-400')}>
          {formatUSDC(balance.balanceFormatted)} USDC
        </span>
      </div>
    </button>
  );
}

export function BalanceSelectView() {
  const { state, selectChain, setView } = useTeleport();

  const handleSelectChain = (chainId: number) => {
    selectChain(chainId);
    setView('amount');
  };

  const totalBalance = state.balances.reduce(
    (sum, b) => sum + parseFloat(b.balanceFormatted),
    0
  );

  return (
    <div className="tp-flex tp-flex-col tp-gap-4">
      <div className="tp-text-center tp-pb-2">
        <p className="tp-text-sm tp-text-gray-500">Total USDC across chains</p>
        <p className="tp-text-2xl tp-font-bold tp-text-gray-900">
          ${formatUSDC(totalBalance.toString())}
        </p>
      </div>

      <div className="tp-border-t tp-border-gray-100 tp-pt-4">
        <p className="tp-text-sm tp-font-medium tp-text-gray-700 tp-mb-3">
          Select source chain
        </p>
        <div className="tp-flex tp-flex-col tp-gap-2">
          {state.balances
            .filter((balance) => parseFloat(balance.balance) > 0)
            .map((balance) => (
              <ChainCard
                key={balance.chainId}
                balance={balance}
                onSelect={() => handleSelectChain(balance.chainId)}
                disabled={false}
              />
            ))}
        </div>
      </div>

      {totalBalance === 0 && (
        <p className="tp-text-center tp-text-sm tp-text-gray-500 tp-mt-2">
          No USDC found on supported chains
        </p>
      )}
    </div>
  );
}
