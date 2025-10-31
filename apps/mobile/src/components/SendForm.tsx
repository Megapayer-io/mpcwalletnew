'use client';

import { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/wallet';
import { CustomIcons } from './icons/CustomIcons';
import { PinProtection } from './PinProtection';
import { generateFallbackIcon } from '@/lib/tokenIconService';
import { motion, AnimatePresence } from 'framer-motion';
import { startScanner, parseWalletAddress, parsePaymentRequest } from '@/lib/qrScanner';

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

  useEffect(() => {
    loadBalance();
  }, [selectedToken]);

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
        const balance = await getBalance();
        setCurrentBalance(balance);
      } else {
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

    if (!formData.to || !formData.amount) {
      return;
    }

    if (parseFloat(formData.amount) > parseFloat(currentBalance)) {
      return;
    }

    if (selectedToken.address === '') {
      setPendingTransaction({
        type: 'eth',
        params: {
          to: formData.to,
          valueEth: formData.amount
        }
      });
    } else {
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
    <div className="space-y-4 pb-4">
      {/* Token Selection Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="megapayer-panel rounded-2xl border border-megapayer-border p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold font-heading text-megapayer-text">Select Token</h3>
          <motion.button
            onClick={loadCustomTokens}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-colors"
            title="Refresh token list"
          >
            <CustomIcons.Refresh className="h-4 w-4" />
          </motion.button>
        </div>
        
        <div className="relative">
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full megapayer-panel-soft border border-megapayer-border rounded-xl px-4 py-3 cursor-pointer flex items-center gap-3 active:scale-95 transition-all"
          >
            {/* Token Logo */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              {selectedToken?.address === '' ? (
                nativeTokenLogo ? (
                  <img
                    src={nativeTokenLogo}
                    alt={`${currentNetwork?.symbol} logo`}
                    className="w-10 h-10 rounded-xl"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = generateFallbackIcon(currentNetwork?.symbol || 'ETH', 56);
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#22E1FF] to-[#7C3AED] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                    {currentNetwork?.symbol?.charAt(0) || 'E'}
                  </div>
                )
              ) : (
                <img
                  src={(selectedToken as any).logoUrl || generateFallbackIcon(selectedToken.symbol, 56)}
                  alt={`${selectedToken.symbol} logo`}
                  className="w-10 h-10 rounded-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = generateFallbackIcon(selectedToken.symbol, 56);
                  }}
                />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold font-heading text-megapayer-text truncate">
                {selectedToken?.symbol || currentNetwork?.symbol || 'ETH'}
              </p>
              <p className="text-xs font-body text-megapayer-muted truncate">
                {selectedToken?.name || currentNetwork?.name || 'Ethereum'} {selectedToken?.address === '' ? '(Native)' : ''}
              </p>
            </div>
            
            <CustomIcons.ChevronDown className={`h-5 w-5 text-megapayer-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {/* Token Dropdown */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 megapayer-panel border border-megapayer-border rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto"
              >
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
                  className="flex items-center gap-3 p-3 hover:bg-megapayer-panel-soft cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {nativeTokenLogo ? (
                      <img
                        src={nativeTokenLogo}
                        alt={`${currentNetwork?.symbol} logo`}
                        className="w-10 h-10 rounded-xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = generateFallbackIcon(currentNetwork?.symbol || 'ETH', 56);
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-[#22E1FF] to-[#7C3AED] rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {currentNetwork?.symbol?.charAt(0) || 'E'}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold font-heading text-megapayer-text">
                      {currentNetwork?.symbol || 'ETH'} - {currentNetwork?.name || 'Ethereum'} (Native)
                    </p>
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
                    className="flex items-center gap-3 p-3 hover:bg-megapayer-panel-soft cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={(token as any).logoUrl || generateFallbackIcon(token.symbol, 56)}
                        alt={`${token.symbol} logo`}
                        className="w-10 h-10 rounded-xl"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = generateFallbackIcon(token.symbol, 56);
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold font-heading text-megapayer-text">
                        {token.symbol} - {token.name || 'Custom Token'}
                      </p>
                    </div>
                  </div>
                ))}
                
                {customTokens.length === 0 && (
                  <div className="p-4 text-center">
                    <p className="text-xs font-body text-megapayer-muted">
                      No custom tokens. Add them in Tokens page.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="megapayer-panel rounded-2xl border border-megapayer-border p-5 bg-gradient-to-br from-megapayer-panel to-megapayer-panel-soft"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold font-heading text-megapayer-muted uppercase tracking-wide">Available Balance</h3>
          <motion.button
            type="button"
            onClick={loadBalance}
            disabled={isLoadingBalance}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-colors disabled:opacity-50"
            title="Refresh balance"
          >
            <CustomIcons.Refresh className={`h-4 w-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
        <div className="mb-2">
          <p className="text-3xl font-bold font-heading text-megapayer-text">
            {isLoadingBalance ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-megapayer-teal border-t-transparent rounded-full animate-spin"></span>
                <span>Loading...</span>
              </span>
            ) : (
              `${parseFloat(currentBalance).toFixed(6)} ${selectedToken.symbol}`
            )}
          </p>
          {currentBalance && !isLoadingBalance && (
            <p className="text-sm font-body text-megapayer-muted mt-1">
              {isLoadingUsd ? (
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 border-2 border-megapayer-muted border-t-transparent rounded-full animate-spin"></span>
                  <span>Loading USD...</span>
                </span>
              ) : (
                `≈ $${usdBalance} USD`
              )}
            </p>
          )}
        </div>
      </motion.div>

      {/* Send Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipient Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="megapayer-panel rounded-2xl border border-megapayer-border p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <label htmlFor="to" className="block text-sm font-bold font-heading text-megapayer-text">
              Recipient Address
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              id="to"
              name="to"
              value={formData.to}
              onChange={handleInputChange}
              className="w-full px-4 py-3.5 pr-14 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal focus:border-transparent font-mono text-sm text-megapayer-text placeholder-megapayer-muted"
              placeholder="0x... or scan QR code"
              required
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <motion.button
                type="button"
                onClick={async () => {
                  try {
                    const result = await startScanner();
                    if (result.success && result.text) {
                      // Parse payment request or address
                      const paymentRequest = parsePaymentRequest(result.text);
                      if (paymentRequest) {
                        setFormData(prev => ({
                          ...prev,
                          to: paymentRequest.address,
                          amount: paymentRequest.amount || prev.amount
                        }));
                      } else {
                        // Try plain address
                        const address = parseWalletAddress(result.text);
                        if (address) {
                          setFormData(prev => ({
                            ...prev,
                            to: address
                          }));
                        }
                      }
                    }
                  } catch (error) {
                    console.error('QR scan error:', error);
                  }
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-megapayer-muted hover:text-megapayer-teal hover:bg-megapayer-panel rounded-lg transition-colors"
                title="Scan QR code"
              >
                <CustomIcons.QrCode className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Amount */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="megapayer-panel rounded-2xl border border-megapayer-border p-4"
        >
          <label htmlFor="amount" className="block text-sm font-bold font-heading text-megapayer-text mb-3">
            Amount
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="w-full px-4 py-3.5 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-lg font-bold font-heading text-megapayer-text placeholder-megapayer-muted"
            placeholder="0.0"
            step="any"
            min="0"
            max={currentBalance}
            required
          />
          
          {formData.amount && parseFloat(formData.amount) > parseFloat(currentBalance) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mt-3 p-3 megapayer-panel-soft border border-red-400/30 rounded-xl"
            >
              <CustomIcons.AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 font-medium">Amount exceeds available balance</p>
            </motion.div>
          )}
          
          {/* Percentage Buttons */}
          <div className="mt-4">
            <p className="text-xs font-body text-megapayer-muted mb-3">Quick select:</p>
            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 75, 100].map((percent) => (
                <motion.button
                  key={percent}
                  type="button"
                  onClick={() => handlePercentageClick(percent)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-2.5 text-xs font-semibold font-heading rounded-xl transition-all ${
                    percent === 100
                      ? 'megapayer-btn-primary'
                      : 'megapayer-panel-soft text-megapayer-text border border-megapayer-border'
                  }`}
                >
                  {percent === 100 ? 'MAX' : `${percent}%`}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="megapayer-panel-soft border border-red-400/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <CustomIcons.AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Display */}
        <AnimatePresence>
          {txHash && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="megapayer-panel-soft border border-[#34D39930] rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-[#34D399] rounded-full"></div>
                  <p className="text-sm text-[#34D399] font-semibold font-heading">Transaction sent successfully!</p>
                </div>
                {getExplorerUrl(txHash) && (
                  <motion.a
                    href={getExplorerUrl(txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 text-xs text-[#34D399] hover:text-[#34D399] transition-colors"
                  >
                    <span>View</span>
                    <CustomIcons.ExternalLink className="h-3 w-3" />
                  </motion.a>
                )}
              </div>
              <p className="text-xs text-megapayer-muted font-mono break-all">{txHash}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Send Button */}
        <motion.button
          type="submit"
          disabled={isLoading || !formData.to || !formData.amount || parseFloat(formData.amount) > parseFloat(currentBalance) || parseFloat(formData.amount) <= 0}
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
          className="w-full megapayer-btn-primary py-4 rounded-2xl text-base font-bold font-heading transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <CustomIcons.Send className="w-5 h-5" />
              <span>Send Transaction</span>
            </>
          )}
        </motion.button>
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
