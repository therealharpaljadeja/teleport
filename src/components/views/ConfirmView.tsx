import { clsx } from 'clsx';
import { useTeleport } from '../../context/TeleportContext';
import { useBridgeTransaction } from '../../hooks/useBridgeTransaction';
import { getChainById, formatUSDC, USDC_DECIMALS, CHAIN_LOGOS, MONAD_CHAIN_ID } from '../../config/chains';

export function ConfirmView() {
  const { state, setView, setTxHash, setError } = useTeleport();
  const { executeBridge, isLoading, status, error } = useBridgeTransaction();

  const sourceChain = state.selectedChainId ? getChainById(state.selectedChainId) : null;
  const quote = state.quote;

  if (!quote || !sourceChain) {
    return null;
  }

  const receivedAmount = parseFloat(quote.toAmountMin) / Math.pow(10, USDC_DECIMALS);
  const estimatedMinutes = Math.ceil(quote.estimatedTime / 60);

  const handleConfirm = async () => {
    setView('processing');
    const txHash = await executeBridge(quote);
    if (txHash) {
      setTxHash(txHash);
      setView('success');
    } else {
      // Get the error from the hook
      setError(error || new Error('Transaction failed'));
      // Check if it was cancelled
      if (status === 'cancelled') {
        setView('cancelled');
      } else {
        setView('error');
      }
    }
  };

  const handleBack = () => {
    setView('amount');
  };

  return (
    <div className="tp-flex tp-flex-col tp-gap-4">
      <button
        onClick={handleBack}
        className="tp-flex tp-items-center tp-gap-1 tp-text-sm tp-text-gray-500 hover:tp-text-gray-700 tp-self-start"
      >
        <svg className="tp-w-4 tp-h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="tp-text-center tp-py-2">
        <p className="tp-text-sm tp-text-gray-500">You're bridging</p>
        <p className="tp-text-3xl tp-font-bold tp-text-gray-900">
          {formatUSDC(quote.fromAmount)} USDC
        </p>
      </div>

      <div className="tp-flex tp-items-center tp-justify-center tp-gap-2 tp-py-2">
        <div className="tp-text-center">
          {sourceChain.icon ? (
            <img src={sourceChain.icon} alt={sourceChain.name} className="tp-w-10 tp-h-10 tp-mx-auto tp-rounded-full" />
          ) : (
            <div className="tp-w-10 tp-h-10 tp-mx-auto tp-rounded-full tp-bg-gray-100 tp-flex tp-items-center tp-justify-center tp-text-sm tp-font-medium">
              {sourceChain.name.charAt(0)}
            </div>
          )}
          <p className="tp-text-xs tp-text-gray-500 tp-mt-1">{sourceChain.name}</p>
        </div>
        <svg className="tp-w-6 tp-h-6 tp-text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        <div className="tp-text-center">
          {CHAIN_LOGOS[MONAD_CHAIN_ID] ? (
            <img src={CHAIN_LOGOS[MONAD_CHAIN_ID]} alt="Monad" className="tp-w-10 tp-h-10 tp-mx-auto tp-rounded-full" />
          ) : (
            <div className="tp-w-10 tp-h-10 tp-mx-auto tp-rounded-full tp-bg-monad-purple tp-flex tp-items-center tp-justify-center tp-text-sm tp-font-medium tp-text-white">
              M
            </div>
          )}
          <p className="tp-text-xs tp-text-gray-500 tp-mt-1">Monad</p>
        </div>
      </div>

      <div className="tp-bg-gray-50 tp-rounded-lg tp-p-4 tp-space-y-3">
        <div className="tp-flex tp-justify-between tp-text-sm">
          <span className="tp-text-gray-500">You receive (min)</span>
          <span className="tp-font-medium tp-text-gray-900">
            {formatUSDC(receivedAmount.toString())} USDC
          </span>
        </div>
        <div className="tp-flex tp-justify-between tp-text-sm">
          <span className="tp-text-gray-500">Estimated time</span>
          <span className="tp-font-medium tp-text-gray-900">~{estimatedMinutes} min</span>
        </div>
        <div className="tp-flex tp-justify-between tp-text-sm">
          <span className="tp-text-gray-500">Bridge</span>
          <span className="tp-font-medium tp-text-gray-900">{quote.toolName}</span>
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={isLoading}
        className={clsx(
          'tp-w-full tp-py-3 tp-rounded-lg tp-font-medium tp-transition-colors',
          !isLoading
            ? 'tp-bg-monad-purple tp-text-white hover:tp-bg-monad-purple-dark'
            : 'tp-bg-gray-100 tp-text-gray-400 tp-cursor-not-allowed'
        )}
      >
        {isLoading ? 'Confirming...' : 'Confirm Bridge'}
      </button>

      <p className="tp-text-xs tp-text-center tp-text-gray-400">
        By confirming, you agree to the bridge transaction
      </p>
    </div>
  );
}
