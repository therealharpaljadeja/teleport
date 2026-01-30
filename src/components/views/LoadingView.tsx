export function LoadingView() {
  return (
    <div className="tp-flex tp-flex-col tp-items-center tp-justify-center tp-py-12">
      <div className="tp-w-10 tp-h-10 tp-border-4 tp-border-gray-200 tp-border-t-monad-purple tp-rounded-full tp-animate-spin" />
      <p className="tp-mt-4 tp-text-gray-600 tp-text-sm">Checking your balances...</p>
    </div>
  );
}
