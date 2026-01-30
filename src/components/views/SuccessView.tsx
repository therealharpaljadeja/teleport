import { useTeleport } from '../../context/TeleportContext';
import { getChainById, getExplorerTxUrl, formatUSDC } from '../../config/chains';

interface SuccessViewProps {
  onClose: () => void;
}

export function SuccessView({ onClose }: SuccessViewProps) {
  const { state } = useTeleport();
  const sourceChain = state.selectedChainId ? getChainById(state.selectedChainId) : null;

  const explorerUrl = state.txHash && state.selectedChainId
    ? getExplorerTxUrl(state.selectedChainId, state.txHash)
    : null;

  return (
    <div className="tp-flex tp-flex-col tp-items-center tp-gap-6 tp-py-4">
      <div className="tp-w-16 tp-h-16 tp-rounded-full tp-bg-green-100 tp-flex tp-items-center tp-justify-center">
        <svg
          className="tp-w-8 tp-h-8 tp-text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>

      <div className="tp-text-center">
        <p className="tp-text-lg tp-font-semibold tp-text-gray-900">Bridge Successful!</p>
        <p className="tp-text-sm tp-text-gray-500 tp-mt-1">
          {formatUSDC(state.amount)} USDC bridged from {sourceChain?.name} to Monad
        </p>
      </div>

      {explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tp-text-sm tp-text-monad-purple hover:tp-underline tp-flex tp-items-center tp-gap-1"
        >
          View on Explorer
          <svg className="tp-w-4 tp-h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      )}

      <button
        onClick={onClose}
        className="tp-w-full tp-py-3 tp-rounded-lg tp-font-medium tp-bg-monad-purple tp-text-white hover:tp-bg-monad-purple-dark tp-transition-colors"
      >
        Done
      </button>
    </div>
  );
}
