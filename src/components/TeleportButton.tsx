import { clsx } from 'clsx';
import { TeleportProvider, useTeleport } from '../context/TeleportContext';
import { TeleportDialog } from './TeleportDialog';
import type { TeleportButtonProps } from '../types';

const sizeClasses = {
  sm: 'tp-px-3 tp-py-1.5 tp-text-sm',
  md: 'tp-px-4 tp-py-2 tp-text-base',
  lg: 'tp-px-6 tp-py-3 tp-text-lg',
};

const variantClasses = {
  default: 'tp-bg-monad-purple tp-text-white hover:tp-bg-monad-purple-dark',
  outline: 'tp-border-2 tp-border-monad-purple tp-text-monad-purple hover:tp-bg-purple-50',
  ghost: 'tp-text-monad-purple hover:tp-bg-purple-50',
};

function TeleportButtonInner({
  className,
  variant = 'default',
  size = 'md',
  children,
  onSuccess,
  onError,
  onOpen,
  onClose,
  dialogClassName,
  dialogOverlayClassName,
}: TeleportButtonProps) {
  const { open } = useTeleport();

  const handleClick = () => {
    open();
    onOpen?.();
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={clsx(
          'tp-rounded-lg tp-font-medium tp-transition-colors tp-inline-flex tp-items-center tp-justify-center',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      >
        {children || 'Teleport USDC'}
      </button>
      <TeleportDialog
        className={dialogClassName}
        overlayClassName={dialogOverlayClassName}
        onSuccess={onSuccess}
        onError={onError}
        onClose={onClose}
      />
    </>
  );
}

export function TeleportButton(props: TeleportButtonProps) {
  return (
    <TeleportProvider>
      <TeleportButtonInner {...props} />
    </TeleportProvider>
  );
}
