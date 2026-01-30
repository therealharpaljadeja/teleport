import { useTeleport } from '../../context/TeleportContext';

interface ErrorViewProps {
  onRetry: () => void;
  onClose: () => void;
  isCancelled?: boolean;
}

export function ErrorView({ onRetry, onClose, isCancelled = false }: ErrorViewProps) {
  const { state } = useTeleport();

  const errorMessage = state.error?.message || 'Something went wrong';

  if (isCancelled) {
    return (
      <div className="tp-flex tp-flex-col tp-items-center tp-gap-6 tp-py-4">
        <div className="tp-w-16 tp-h-16 tp-rounded-full tp-bg-gray-100 tp-flex tp-items-center tp-justify-center">
          <svg
            className="tp-w-8 tp-h-8 tp-text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <div className="tp-text-center">
          <p className="tp-text-lg tp-font-semibold tp-text-gray-900">Transaction Cancelled</p>
          <p className="tp-text-sm tp-text-gray-500 tp-mt-1">
            You cancelled the transaction in your wallet.
          </p>
        </div>

        <div className="tp-w-full tp-flex tp-flex-col tp-gap-2">
          <button
            onClick={onRetry}
            className="tp-w-full tp-py-3 tp-rounded-lg tp-font-medium tp-bg-monad-purple tp-text-white hover:tp-bg-monad-purple-dark tp-transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={onClose}
            className="tp-w-full tp-py-3 tp-rounded-lg tp-font-medium tp-bg-gray-100 tp-text-gray-700 hover:tp-bg-gray-200 tp-transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tp-flex tp-flex-col tp-items-center tp-gap-6 tp-py-4">
      <div className="tp-w-16 tp-h-16 tp-rounded-full tp-bg-red-100 tp-flex tp-items-center tp-justify-center">
        <svg
          className="tp-w-8 tp-h-8 tp-text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <div className="tp-text-center">
        <p className="tp-text-lg tp-font-semibold tp-text-gray-900">Bridge Failed</p>
        <p className="tp-text-sm tp-text-gray-500 tp-mt-1">{errorMessage}</p>
      </div>

      <div className="tp-w-full tp-flex tp-flex-col tp-gap-2">
        <button
          onClick={onRetry}
          className="tp-w-full tp-py-3 tp-rounded-lg tp-font-medium tp-bg-monad-purple tp-text-white hover:tp-bg-monad-purple-dark tp-transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          className="tp-w-full tp-py-3 tp-rounded-lg tp-font-medium tp-bg-gray-100 tp-text-gray-700 hover:tp-bg-gray-200 tp-transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
