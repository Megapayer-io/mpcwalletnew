'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from './icons/CustomIcons';
import { PinProtection } from './PinProtection';
import { generateFallbackIcon } from '@/lib/tokenIconService';

interface Token {
  address: string;
  symbol: string;
  decimals: number;
  name?: string;
}

interface SendFormProps {
  selectedToken: Token;
  onTokenChange: (token: Token) => void;
  customTokens: Token[];
  nativeTokenLogo: string | null;
  currentNetwork: any;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  loadCustomTokens: () => void;
}

export function SendForm({ 
  selectedToken, 
  onTokenChange, 
  customTokens, 
  nativeTokenLogo, 
  currentNetwork, 
  isDropdownOpen, 
  setIsDropdownOpen, 
  loadCustomTokens 
}: SendFormProps) {
  const [formData, setFormData] = useState({
    to: '',
    amount: ''
  });
  const [txHash, setTxHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [usdBalance, setUsdBalance] = useState<string>('0.00');
  const [isLoadingUsd, setIsLoadingUsd] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<{
    type: 'eth' | 'erc20';
    params: any;
  } | null>(null);
  
  const { sendEth, sendErc20, getBalance, getTokenBalance, getUsdBalance, error, clearError } = useWalletStore();

  // Load balance when selected token changes
  useEffect(() => {
    loadBalance();
  }, [selectedToken]);

  // Load USD balance when balance changes
  useEffect(() => {
    const loadUsdBalance = async () => {
      if (currentBalance && selectedToken.symbol) {
        setIsLoadingUsd(true);
        try {
          const usd = await getUsdBalance(currentBalance, selectedToken.symbol);
          setUsdBalance(usd);
        } catch (error) {
          console.error('Failed to load USD balance:', error);
          setUsdBalance('0.00');
        } finally {
          setIsLoadingUsd(false);
        }
      }
    };

    loadUsdBalance();
  }, [currentBalance, selectedToken.symbol, getUsdBalance]);

  const loadBalance = async () => {
    setIsLoadingBalance(true);
    try {
      if (selectedToken.address === '') {
        // Native token
        const balance = await getBalance();
        setCurrentBalance(balance);
      } else {
        // ERC-20 token
        const balance = await getTokenBalance({
          tokenAddress: selectedToken.address,
          decimals: selectedToken.decimals
        });
        setCurrentBalance(balance);
      }
    } catch (error) {
      console.error('Failed to load balance:', error);
      setCurrentBalance('0');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handlePercentageClick = (percentage: number) => {
    const balance = parseFloat(currentBalance);
    if (balance > 0) {
      const amount = (balance * percentage / 100).toString();
      setFormData(prev => ({
        ...prev,
        amount: amount
      }));
      clearError();
      setTxHash('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearError();
    setTxHash('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setTxHash('');

    // Validate form data
    if (!formData.to || !formData.amount) {
      return;
    }

    if (parseFloat(formData.amount) > parseFloat(currentBalance)) {
      return;
    }

    // Store the transaction parameters and show password modal
      if (selectedToken.address === '') {
        // Native token
      setPendingTransaction({
        type: 'eth',
        params: {
          to: formData.to,
          valueEth: formData.amount
        }
        });
      } else {
        // ERC-20 token
      setPendingTransaction({
        type: 'erc20',
        params: {
          tokenAddress: selectedToken.address,
          to: formData.to,
          amount: formData.amount,
          decimals: selectedToken.decimals
        }
      });
    }

    setShowPasswordModal(true);
  };

  const handlePasswordSuccess = async () => {
    if (!pendingTransaction) return;

    setIsLoading(true);
    setShowPasswordModal(false);

    try {
      let hash: string;

      if (pendingTransaction.type === 'eth') {
        hash = await sendEth(pendingTransaction.params);
      } else {
        hash = await sendErc20(pendingTransaction.params);
      }

      setTxHash(hash);
      setFormData({
        to: '',
        amount: ''
      });
      // Reload balance after successful transaction
      loadBalance();
    } catch (error) {
      // Error is handled by the store
    } finally {
      setIsLoading(false);
      setPendingTransaction(null);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordModal(false);
    setPendingTransaction(null);
  };

  const getExplorerUrl = (hash: string) => {
    if (!currentNetwork?.blockExplorer) return undefined;
    return `${currentNetwork.blockExplorer}/tx/${hash}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Left Column */}
      <div className="space-y-3">
        {/* Token Selection */}
        <div className="megapayer-panel p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-megapayer-teal to-megapayer-emerald rounded-lg flex items-center justify-center shadow-md">
                <CustomIcons.Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-megapayer-text font-heading">Select Token</h2>
                <p className="text-xs text-megapayer-muted">Choose the token you want to send</p>
              </div>
            </div>
            <button
              onClick={loadCustomTokens}
              className="p-2 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-all duration-300"
              title="Refresh token list"
            >
              <CustomIcons.Refresh className="h-4 w-4" />
            </button>
          </div>
        
        <div className="relative">
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-megapayer-panel-soft border border-megapayer-border rounded-lg px-3 py-2 pr-10 text-megapayer-text focus:outline-none focus:ring-2 focus:ring-megapayer-teal/50 focus:border-megapayer-teal/50 transition-all duration-300 hover:bg-megapayer-panel cursor-pointer flex items-center gap-2"
          >
            {/* Native Token Logo */}
            {selectedToken?.address === '' && (
              <div className="w-6 h-6 rounded flex items-center justify-center shadow-sm">
                {nativeTokenLogo ? (
                  <img
                    src={nativeTokenLogo}
                    alt={`${currentNetwork?.symbol} logo`}
                    className="w-6 h-6 rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = generateFallbackIcon(currentNetwork?.symbol || 'ETH', 56);
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">
                    {currentNetwork?.symbol?.charAt(0) || 'E'}
                  </div>
                )}
              </div>
            )}
            
            {/* Custom Token Logo */}
            {selectedToken?.address !== '' && selectedToken && (
              <div className="w-6 h-6 rounded flex items-center justify-center shadow-sm">
                <img
                  src={(selectedToken as any).logoUrl || generateFallbackIcon(selectedToken.symbol, 56)}
                  alt={`${selectedToken.symbol} logo`}
                  className="w-6 h-6 rounded"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = generateFallbackIcon(selectedToken.symbol, 56);
                  }}
                />
              </div>
            )}
            
            <div className="flex-1">
              <div className="font-semibold text-sm">
                {selectedToken?.symbol || currentNetwork?.symbol || 'ETH'} - {selectedToken?.name || currentNetwork?.name || 'Ethereum'} {selectedToken?.address === '' ? '(Native)' : ''}
              </div>
            </div>
            
            <CustomIcons.ChevronDown className="h-4 w-4 text-megapayer-muted" />
          </div>
          
          {/* Custom Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-megapayer-panel border border-megapayer-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
              {/* Native Token Option */}
              <div
                onClick={() => {
                  onTokenChange({
                    address: '',
                    symbol: currentNetwork?.symbol || 'ETH',
                    decimals: 18,
                    name: currentNetwork?.name || 'Ethereum'
                  });
                  setIsDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-2 hover:bg-megapayer-panel-soft cursor-pointer transition-colors"
              >
              <div className="w-6 h-6 rounded flex items-center justify-center shadow-sm">
                {nativeTokenLogo ? (
                  <img
                    src={nativeTokenLogo}
                    alt={`${currentNetwork?.symbol} logo`}
                    className="w-6 h-6 rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = generateFallbackIcon(currentNetwork?.symbol || 'ETH', 56);
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">
                    {currentNetwork?.symbol?.charAt(0) || 'E'}
                  </div>
                )}
              </div>
              <div>
                <div className="font-semibold text-sm text-megapayer-text">
                  {currentNetwork?.symbol || 'ETH'} - {currentNetwork?.name || 'Ethereum'} (Native)
                </div>
              </div>
            </div>
            
            {/* Custom Token Options */}
            {customTokens.map((token) => (
              <div
                key={`${token.address}-${token.symbol}`}
                onClick={() => {
                  onTokenChange(token);
                  setIsDropdownOpen(false);
                }}
                className="flex items-center gap-2 p-2 hover:bg-megapayer-panel-soft cursor-pointer transition-colors"
              >
                <div className="w-6 h-6 rounded flex items-center justify-center shadow-sm">
                  <img
                    src={(token as any).logoUrl || generateFallbackIcon(token.symbol, 56)}
                    alt={`${token.symbol} logo`}
                    className="w-6 h-6 rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = generateFallbackIcon(token.symbol, 56);
                    }}
                  />
                </div>
                <div>
                  <div className="font-semibold text-sm text-megapayer-text">
                    {token.symbol} - {token.name || 'Custom Token'}
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
        
        {customTokens.length === 0 && (
          <div className="mt-2 p-2 megapayer-panel-soft rounded-lg border border-megapayer-border-soft">
            <div className="flex items-center gap-2">
              <CustomIcons.AlertTriangle className="w-4 h-4 text-megapayer-muted" />
              <p className="text-xs text-megapayer-muted">
                No custom tokens added yet. Go to Dashboard to add custom tokens.
              </p>
            </div>
          </div>
        )}
      </div>
        
        {/* Current Balance Display */}
        <div className="megapayer-panel rounded-xl shadow-md border border-megapayer-border p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-megapayer-text mb-1">Current Balance</h3>
              <p className="text-lg font-bold text-megapayer-text mb-0.5">
                {isLoadingBalance ? (
                  <span className="flex items-center space-x-1">
                    <CustomIcons.Refresh className="h-3 w-3 animate-spin" />
                    <span className="text-sm">Loading...</span>
                  </span>
                ) : (
                  `${parseFloat(currentBalance).toFixed(6)} ${selectedToken.symbol}`
                )}
              </p>
              {currentBalance && !isLoadingBalance && (
                <p className="text-xs text-megapayer-muted">
                  {isLoadingUsd ? (
                    <span className="flex items-center space-x-1">
                      <CustomIcons.Refresh className="h-3 w-3 animate-spin" />
                      <span>Loading USD...</span>
                    </span>
                  ) : (
                    `$${usdBalance} USD`
                  )}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={loadBalance}
              disabled={isLoadingBalance}
              className="p-2 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-all duration-300 disabled:opacity-50"
              title="Refresh balance"
            >
              <CustomIcons.Refresh className={`h-3 w-3 ${isLoadingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Recipient Address */}
        <div className="megapayer-panel rounded-xl shadow-md border border-megapayer-border p-3">
          <label htmlFor="to" className="block text-xs font-semibold text-megapayer-text mb-1">
            Recipient Address *
          </label>
          <input
            type="text"
            id="to"
            name="to"
            value={formData.to}
            onChange={handleInputChange}
            className="w-full px-3 py-2 megapayer-panel-soft border border-megapayer-border rounded-lg focus:ring-2 focus:ring-megapayer-teal focus:border-transparent font-mono text-xs text-megapayer-text placeholder-megapayer-muted"
            placeholder="0x..."
            required
          />
        </div>

        {/* Amount */}
        <div className="megapayer-panel rounded-xl shadow-md border border-megapayer-border p-3">
          <label htmlFor="amount" className="block text-xs font-semibold text-megapayer-text mb-1">
            Amount *
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="w-full px-3 py-2 megapayer-panel-soft border border-megapayer-border rounded-lg focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-megapayer-text placeholder-megapayer-muted"
            placeholder="0.0"
            step="any"
            min="0"
            max={currentBalance}
            required
          />
          <p className="text-xs text-megapayer-muted mt-1">
            {selectedToken.symbol} amount
          </p>
          {formData.amount && parseFloat(formData.amount) > parseFloat(currentBalance) && (
            <div className="flex items-center gap-1.5 mt-1.5 p-2 megapayer-panel-soft border border-red-400/30 rounded-lg">
              <CustomIcons.AlertTriangle className="h-3 w-3 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">Amount exceeds available balance</p>
            </div>
          )}
          
          {/* Percentage Buttons */}
          <div className="mt-2">
            <p className="text-xs text-megapayer-muted mb-1.5">Quick select:</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handlePercentageClick(25)}
                className="px-3 py-1.5 text-xs megapayer-panel-soft text-megapayer-text rounded-lg hover:bg-megapayer-panel transition-all duration-200 font-medium"
              >
                25%
              </button>
              <button
                type="button"
                onClick={() => handlePercentageClick(50)}
                className="px-3 py-1.5 text-xs megapayer-panel-soft text-megapayer-text rounded-lg hover:bg-megapayer-panel transition-all duration-200 font-medium"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => handlePercentageClick(75)}
                className="px-3 py-1.5 text-xs megapayer-panel-soft text-megapayer-text rounded-lg hover:bg-megapayer-panel transition-all duration-200 font-medium"
              >
                75%
              </button>
              <button
                type="button"
                onClick={() => handlePercentageClick(100)}
                className="px-3 py-1.5 text-xs megapayer-btn-primary rounded-lg transition-all duration-200 font-medium hover:scale-105"
              >
                MAX
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="megapayer-panel-soft border border-red-400/30 rounded-lg p-2">
            <div className="flex items-center gap-2">
              <CustomIcons.AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Success Display */}
        {txHash && (
          <div className="megapayer-panel-soft border border-megapayer-emerald/30 rounded-lg p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-megapayer-emerald rounded-full"></div>
                <p className="text-xs text-megapayer-emerald font-medium">Transaction sent successfully!</p>
              </div>
              {getExplorerUrl(txHash) && (
                <a
                  href={getExplorerUrl(txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-megapayer-emerald hover:text-megapayer-teal transition-colors duration-200"
                >
                  <span>View on Explorer</span>
                  <CustomIcons.ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <p className="text-xs text-megapayer-muted mt-1 font-mono">{txHash}</p>
          </div>
        )}

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !formData.to || !formData.amount || parseFloat(formData.amount) > parseFloat(currentBalance)}
          className="w-full megapayer-btn-primary py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <CustomIcons.Send className="w-4 h-4" />
          <span>{isLoading ? 'Sending...' : 'Send Transaction'}</span>
        </button>
      </form>

      {/* Password Protection Modal */}
      <PinProtection
        isOpen={showPasswordModal}
        onClose={handlePasswordCancel}
        onSuccess={handlePasswordSuccess}
        title="Confirm Transaction"
        description="Enter your wallet password to confirm this transaction"
      />
    </div>
  );
}
