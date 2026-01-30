import { useState, useEffect, type ChangeEvent } from 'react';
import { clsx } from 'clsx';
import { useTeleport } from '../../context/TeleportContext';
import { useBridgeQuote } from '../../hooks/useBridgeQuote';
import { getChainById, formatTokenAmount } from '../../config/chains';

const PRESET_PERCENTAGES = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: 'Max', value: 1 },
];

export function AmountInputView() {
  const { state, setAmount, setQuote, setView, setError } = useTeleport();
  const { fetchQuote, isLoading: isQuoteLoading } = useBridgeQuote();
  const [inputValue, setInputValue] = useState(state.amount || '');

  const selectedBalance = state.balances.find(
    (b) => b.chainId === state.selectedChainId && b.asset === state.selectedAsset
  );
  const maxAmount = selectedBalance ? parseFloat(selectedBalance.balanceFormatted) : 0;
  const sourceChain = state.selectedChainId ? getChainById(state.selectedChainId) : null;
  const assetSymbol = selectedBalance?.symbol || state.selectedAsset || 'USDC';
  const assetDecimals = selectedBalance?.decimals || 6;
  const displayDecimals = assetDecimals === 18 ? 6 : 2;

  const handlePresetClick = (percentage: number) => {
    const amount = (maxAmount * percentage).toFixed(displayDecimals);
    setInputValue(amount);
    setAmount(amount);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setInputValue(value);
      setAmount(value);
    }
  };

  const handleContinue = async () => {
    const amount = parseFloat(inputValue);
    if (isNaN(amount) || amount <= 0) {
      setError(new Error('Please enter a valid amount'));
      return;
    }
    if (amount > maxAmount) {
      setError(new Error('Amount exceeds available balance'));
      return;
    }

    if (!state.selectedChainId || !selectedBalance) return;

    const quote = await fetchQuote(
      state.selectedChainId,
      inputValue,
      selectedBalance.tokenAddress,
      selectedBalance.decimals
    );
    if (quote) {
      setQuote(quote);
      setView('confirm');
    }
  };

  const handleBack = () => {
    setView('balances');
  };

  const isValidAmount =
    inputValue !== '' &&
    !isNaN(parseFloat(inputValue)) &&
    parseFloat(inputValue) > 0 &&
    parseFloat(inputValue) <= maxAmount;

  useEffect(() => {
    if (state.amount && state.amount !== inputValue) {
      setInputValue(state.amount);
    }
  }, [state.amount]);

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

      <div className="tp-text-center">
        <p className="tp-text-sm tp-text-gray-500">From {sourceChain?.name}</p>
        <p className="tp-text-sm tp-text-gray-400">
          Available: {formatTokenAmount(maxAmount.toString(), displayDecimals)} {assetSymbol}
        </p>
      </div>

      <div className="tp-relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={displayDecimals === 6 ? '0.000000' : '0.00'}
          className="tp-w-full tp-text-center tp-text-3xl tp-font-bold tp-py-4 tp-border tp-border-gray-200 tp-rounded-lg focus:tp-outline-none focus:tp-border-monad-purple focus:tp-ring-1 focus:tp-ring-monad-purple"
        />
        <span className="tp-absolute tp-right-4 tp-top-1/2 tp--translate-y-1/2 tp-text-gray-400 tp-text-lg">
          {assetSymbol}
        </span>
      </div>

      <div className="tp-flex tp-gap-2">
        {PRESET_PERCENTAGES.map(({ label, value }) => (
          <button
            key={label}
            onClick={() => handlePresetClick(value)}
            className="tp-flex-1 tp-py-2 tp-text-sm tp-font-medium tp-text-gray-600 tp-bg-gray-100 tp-rounded-lg hover:tp-bg-gray-200 tp-transition-colors"
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={handleContinue}
        disabled={!isValidAmount || isQuoteLoading}
        className={clsx(
          'tp-w-full tp-py-3 tp-rounded-lg tp-font-medium tp-transition-colors',
          isValidAmount && !isQuoteLoading
            ? 'tp-bg-monad-purple tp-text-white hover:tp-bg-monad-purple-dark'
            : 'tp-bg-gray-100 tp-text-gray-400 tp-cursor-not-allowed'
        )}
      >
        {isQuoteLoading ? (
          <span className="tp-flex tp-items-center tp-justify-center tp-gap-2">
            <div className="tp-w-4 tp-h-4 tp-border-2 tp-border-white tp-border-t-transparent tp-rounded-full tp-animate-spin" />
            Getting quote...
          </span>
        ) : (
          'Continue'
        )}
      </button>
    </div>
  );
}
