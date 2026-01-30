import { useEffect, useRef, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { useTeleport } from '../context/TeleportContext';
import { useTokenBalances } from '../hooks/useTokenBalances';
import { LoadingView } from './views/LoadingView';
import { BalanceSelectView } from './views/BalanceSelectView';
import { AmountInputView } from './views/AmountInputView';
import { ConfirmView } from './views/ConfirmView';
import { ProcessingView } from './views/ProcessingView';
import { SuccessView } from './views/SuccessView';
import { ErrorView } from './views/ErrorView';

interface TeleportDialogProps {
  className?: string;
  overlayClassName?: string;
  onSuccess?: (txHash: string, amount: string) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export function TeleportDialog({
  className,
  overlayClassName,
  onSuccess,
  onError,
  onClose,
}: TeleportDialogProps) {
  const { state, isOpen, close, setView, setBalances, setError, reset } = useTeleport();
  const { balances, isLoading: isLoadingBalances, error: balanceError, refetch } = useTokenBalances();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Refetch balances every time the dialog opens
  useEffect(() => {
    if (isOpen) {
      refetch();
    }
  }, [isOpen, refetch]);

  useEffect(() => {
    if (isOpen && isLoadingBalances) {
      setView('loading');
    } else if (isOpen && balances.length > 0) {
      setBalances(balances);
      if (state.view === 'loading') {
        setView('balances');
      }
    } else if (isOpen && balanceError) {
      setError(balanceError);
      setView('error');
    }
  }, [isOpen, isLoadingBalances, balances, balanceError, setView, setBalances, setError, state.view]);

  useEffect(() => {
    if (state.view === 'success' && state.txHash && onSuccess) {
      onSuccess(state.txHash, state.amount);
    }
    if (state.view === 'error' && state.error && onError) {
      onError(state.error);
    }
  }, [state.view, state.txHash, state.amount, state.error, onSuccess, onError]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    close();
    reset();
    onClose?.();
  };

  const handleRetry = () => {
    setError(null);
    // Go back to confirm view to retry the transaction
    setView('confirm');
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const renderView = () => {
    switch (state.view) {
      case 'loading':
        return <LoadingView />;
      case 'balances':
        return <BalanceSelectView />;
      case 'amount':
        return <AmountInputView />;
      case 'confirm':
        return <ConfirmView />;
      case 'processing':
        return <ProcessingView />;
      case 'success':
        return <SuccessView onClose={handleClose} />;
      case 'cancelled':
        return <ErrorView onRetry={handleRetry} onClose={handleClose} isCancelled />;
      case 'error':
        return <ErrorView onRetry={handleRetry} onClose={handleClose} />;
      default:
        return <LoadingView />;
    }
  };

  const getTitle = () => {
    switch (state.view) {
      case 'loading':
        return 'Teleport';
      case 'balances':
        return 'Select Chain';
      case 'amount':
        return 'Enter Amount';
      case 'confirm':
        return 'Confirm Bridge';
      case 'processing':
        return 'Processing';
      case 'success':
        return 'Success';
      case 'cancelled':
        return 'Cancelled';
      case 'error':
        return 'Error';
      default:
        return 'Teleport';
    }
  };

  return createPortal(
    <div
      className={clsx(
        'tp-fixed tp-inset-0 tp-z-50 tp-flex tp-items-center tp-justify-center tp-bg-black/50 tp-animate-fade-in',
        overlayClassName
      )}
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className={clsx(
          'tp-bg-white tp-rounded-2xl tp-shadow-xl tp-w-full tp-max-w-md tp-mx-4 tp-animate-slide-up',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="teleport-dialog-title"
      >
        <div className="tp-flex tp-items-center tp-justify-between tp-px-6 tp-py-4 tp-border-b tp-border-gray-100">
          <h2 id="teleport-dialog-title" className="tp-text-lg tp-font-semibold tp-text-gray-900">
            {getTitle()}
          </h2>
          <button
            onClick={handleClose}
            className="tp-p-1 tp-rounded-lg tp-text-gray-400 hover:tp-text-gray-600 hover:tp-bg-gray-100 tp-transition-colors"
            aria-label="Close dialog"
          >
            <svg className="tp-w-5 tp-h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="tp-px-6 tp-py-4">{renderView()}</div>
      </div>
    </div>,
    document.body
  );
}
