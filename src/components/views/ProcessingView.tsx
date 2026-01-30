import { useTeleport } from '../../context/TeleportContext';
import { getChainById, formatUSDC } from '../../config/chains';

const STEPS = [
  { id: 'approve', label: 'Approve USDC' },
  { id: 'bridge', label: 'Initiate bridge' },
  { id: 'wait', label: 'Waiting for confirmation' },
];

export function ProcessingView() {
  const { state } = useTeleport();
  const sourceChain = state.selectedChainId ? getChainById(state.selectedChainId) : null;

  const currentStep = state.txHash ? 2 : 1;

  return (
    <div className="tp-flex tp-flex-col tp-items-center tp-gap-6 tp-py-4">
      <div className="tp-w-16 tp-h-16 tp-border-4 tp-border-gray-200 tp-border-t-monad-purple tp-rounded-full tp-animate-spin" />

      <div className="tp-text-center">
        <p className="tp-text-lg tp-font-semibold tp-text-gray-900">Bridging in progress</p>
        <p className="tp-text-sm tp-text-gray-500 tp-mt-1">
          {formatUSDC(state.amount)} USDC from {sourceChain?.name} to Monad
        </p>
      </div>

      <div className="tp-w-full tp-space-y-3">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div key={step.id} className="tp-flex tp-items-center tp-gap-3">
              <div
                className={`tp-w-6 tp-h-6 tp-rounded-full tp-flex tp-items-center tp-justify-center tp-text-xs tp-font-medium ${
                  isCompleted
                    ? 'tp-bg-green-500 tp-text-white'
                    : isCurrent
                      ? 'tp-bg-monad-purple tp-text-white'
                      : 'tp-bg-gray-200 tp-text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <svg className="tp-w-3 tp-h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`tp-text-sm ${
                  isCompleted || isCurrent ? 'tp-text-gray-900' : 'tp-text-gray-400'
                }`}
              >
                {step.label}
              </span>
              {isCurrent && (
                <div className="tp-w-3 tp-h-3 tp-border-2 tp-border-monad-purple tp-border-t-transparent tp-rounded-full tp-animate-spin" />
              )}
            </div>
          );
        })}
      </div>

      {state.txHash && (
        <p className="tp-text-xs tp-text-gray-400 tp-text-center">
          Transaction submitted. This may take a few minutes.
        </p>
      )}
    </div>
  );
}
