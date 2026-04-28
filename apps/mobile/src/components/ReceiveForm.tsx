'use client';

import { useState, useEffect, useRef } from 'react';
import { useWalletStore } from '@/store/wallet';
import QRCode from 'qrcode';
import { CustomIcons } from './icons/CustomIcons';
import { motion, AnimatePresence } from 'framer-motion';

interface ReceiveFormProps {
  customAmount?: string;
  customToken?: string;
}

export function ReceiveForm({ customAmount, customToken }: ReceiveFormProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(true);
  const [qrSize, setQrSize] = useState(256);
  const [amount, setAmount] = useState(customAmount || '');
  const [selectedToken, setSelectedToken] = useState(customToken || 'ETH');
  const [showShareModal, setShowShareModal] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [currentBalance, setCurrentBalance] = useState<string>('0');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [usdBalance, setUsdBalance] = useState<string>('0.00');
  const [isLoadingUsd, setIsLoadingUsd] = useState(false);
  
  const { address, currentNetwork, getBalance, getUsdBalance, clearPriceCache } = useWalletStore();
  const qrRef = useRef<HTMLDivElement>(null);

  const generateQRData = () => {
    if (amount && parseFloat(amount) > 0) {
      const decimals = 18;
      const valueInWei = parseFloat(amount) * Math.pow(10, decimals);
      return `ethereum:${address}?value=${valueInWei}&gas=21000`;
    }
    return address || '';
  };

  const loadCurrentBalance = async () => {
    if (address) {
      setIsLoadingBalance(true);
      try {
        const balance = await getBalance();
        setCurrentBalance(balance);
      } catch (error) {
        console.error('Failed to load balance:', error);
        setCurrentBalance('0');
      } finally {
        setIsLoadingBalance(false);
      }
    }
  };

  useEffect(() => {
    loadCurrentBalance();
  }, [address, currentNetwork]);

  useEffect(() => {
    if (currentNetwork?.symbol) {
      setSelectedToken(currentNetwork.symbol);
    }
  }, [currentNetwork]);

  useEffect(() => {
    const loadUsdBalance = async () => {
      if (currentBalance && currentNetwork?.symbol) {
        setIsLoadingUsd(true);
        try {
          const usd = await getUsdBalance(currentBalance, currentNetwork.symbol);
          setUsdBalance(usd);
        } catch (error) {
          console.error('Failed to load USD balance:', error);
          setUsdBalance('Price unavailable');
        } finally {
          setIsLoadingUsd(false);
        }
      }
    };

    loadUsdBalance();
  }, [currentBalance, currentNetwork?.symbol, getUsdBalance]);

  useEffect(() => {
    const generateQR = async () => {
      const data = generateQRData();
      if (data) {
        try {
          const url = await QRCode.toDataURL(data, {
            width: qrSize,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
          setQrCodeDataUrl(url);
        } catch (error) {
          console.error('Failed to generate QR code:', error);
        }
      }
    };

    generateQR();
  }, [address, amount, qrSize]);

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const handleCopyPaymentRequest = async () => {
    const paymentRequest = generateQRData();
    try {
      await navigator.clipboard.writeText(paymentRequest);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy payment request:', error);
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = `wallet-address-qr-${Date.now()}.png`;
      link.href = qrCodeDataUrl;
      link.click();
    }
  };

  const shareOptions = [
    {
      name: 'Copy Link',
      icon: CustomIcons.Copy,
      action: () => {
        const shareText = `Send me ${selectedToken} to: ${address}`;
        navigator.clipboard.writeText(shareText);
        setShowShareModal(false);
      }
    },
    {
      name: 'Email',
      icon: CustomIcons.Mail,
      action: () => {
        const subject = `Payment Request - ${selectedToken}`;
        const body = `Please send ${amount || 'any amount'} ${selectedToken} to:\n\n${address}\n\nNetwork: ${currentNetwork?.name}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        setShowShareModal(false);
      }
    },
    {
      name: 'SMS',
      icon: CustomIcons.MessageSquare,
      action: () => {
        const message = `Send me ${amount || 'any amount'} ${selectedToken} to: ${address}`;
        window.open(`sms:?body=${encodeURIComponent(message)}`);
        setShowShareModal(false);
      }
    },
    {
      name: 'WhatsApp',
      icon: CustomIcons.MessageSquare,
      action: () => {
        const message = `Send me ${amount || 'any amount'} ${selectedToken} to: ${address}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
        setShowShareModal(false);
      }
    }
  ];

  if (!address) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-megapayer-panel-soft rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CustomIcons.AlertTriangle className="w-10 h-10 text-megapayer-muted" />
          </div>
          <h3 className="text-base font-bold font-heading text-megapayer-text mb-2">No Wallet Address</h3>
          <p className="text-sm font-body text-megapayer-muted">Please unlock your wallet first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="megapayer-panel rounded-2xl border border-megapayer-border p-5 bg-gradient-to-br from-megapayer-panel to-megapayer-panel-soft"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold font-heading text-megapayer-muted uppercase tracking-wide">Your Balance</h3>
          <motion.button
            type="button"
            onClick={loadCurrentBalance}
            disabled={isLoadingBalance}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-colors disabled:opacity-50"
            title="Refresh balance"
          >
            <CustomIcons.Refresh className={`h-4 w-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
        <div>
          <p className="text-3xl font-bold font-heading text-megapayer-text">
            {isLoadingBalance ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-megapayer-teal border-t-transparent rounded-full animate-spin"></span>
                <span>Loading...</span>
              </span>
            ) : (
              `${parseFloat(currentBalance).toFixed(6)} ${currentNetwork?.symbol || 'ETH'}`
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

      {/* QR Code Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="megapayer-panel rounded-2xl border border-megapayer-border p-5"
      >
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#34D39915] flex items-center justify-center">
              <CustomIcons.QrCode className="w-5 h-5 text-[#34D399]" />
              </div>
              <div>
              <h3 className="text-sm font-bold font-heading text-megapayer-text">QR Code</h3>
              <p className="text-xs font-body text-megapayer-muted">Scan to send funds</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
                onClick={() => setShowQR(!showQR)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-colors"
                title={showQR ? 'Hide QR Code' : 'Show QR Code'}
              >
              {showQR ? <CustomIcons.EyeOff className="h-4 w-4" /> : <CustomIcons.Eye className="h-4 w-4" />}
            </motion.button>
            <motion.button
                onClick={handleDownloadQR}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-colors"
                title="Download QR Code"
              >
              <CustomIcons.Download className="h-4 w-4" />
            </motion.button>
            </div>
          </div>

          {showQR && (
            <div className="text-center">
              <div 
                ref={qrRef}
              className="inline-block p-4 megapayer-panel-soft border-2 border-megapayer-border rounded-2xl mb-3"
              >
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="Wallet QR Code" 
                    className="rounded-xl max-w-full h-auto"
                  style={{ width: Math.min(qrSize, 280), height: Math.min(qrSize, 280) }}
                  />
                ) : (
                <div className="w-64 h-64 megapayer-panel-soft rounded-xl flex items-center justify-center">
                  <CustomIcons.Refresh className="h-10 w-10 text-megapayer-muted animate-spin" />
                  </div>
                )}
              </div>
              
            <p className="text-xs font-body text-megapayer-muted mb-1">
                Scan this QR code to send {selectedToken} to your wallet
              </p>
              {amount && parseFloat(amount) > 0 && (
              <p className="text-xs text-[#34D399] font-semibold font-heading">
                  Amount: {amount} {selectedToken}
                </p>
              )}
            </div>
          )}
      </motion.div>

      {/* Address Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="megapayer-panel rounded-2xl border border-megapayer-border p-4"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#7C3AED15] flex items-center justify-center">
            <CustomIcons.Wallet className="w-5 h-5 text-[#7C3AED]" />
            </div>
          <div>
            <h3 className="text-sm font-bold font-heading text-megapayer-text">Wallet Address</h3>
            <p className="text-xs font-body text-megapayer-muted">Your receiving address</p>
          </div>
        </div>

        <div className="megapayer-panel-soft border border-megapayer-border rounded-xl p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-mono font-body text-megapayer-text break-all flex-1">{address}</p>
            <motion.button
                onClick={handleCopyAddress}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 text-megapayer-muted hover:text-[#34D399] hover:bg-megapayer-panel rounded-lg transition-colors flex-shrink-0"
                title="Copy address"
              >
                {copied ? (
                <CustomIcons.CheckCircle className="h-4 w-4 text-[#34D399]" />
                ) : (
                <CustomIcons.Copy className="h-4 w-4" />
                )}
            </motion.button>
            </div>
          </div>

          {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-xs font-bold font-heading text-megapayer-text mb-2">
              Request Amount (Optional)
            </label>
          <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-3 py-2.5 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-sm text-megapayer-text placeholder-megapayer-muted"
                placeholder="0.0"
                step="any"
                min="0"
              />
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
              className="px-3 py-2.5 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-sm font-semibold font-heading text-megapayer-text"
              >
                <option value={currentNetwork?.symbol || 'ETH'}>{currentNetwork?.symbol || 'ETH'}</option>
              </select>
            </div>
            {amount && parseFloat(amount) > 0 && (
            <p className="text-xs text-megapayer-teal font-semibold font-heading mt-2">
                Payment request: {amount} {selectedToken}
              </p>
            )}
          </div>

          {/* Action Buttons */}
        <div className="space-y-2">
          <motion.button
              onClick={handleCopyPaymentRequest}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full megapayer-btn-primary py-3.5 rounded-xl text-sm font-bold font-heading flex items-center justify-center gap-2"
            >
            <CustomIcons.Copy className="w-4 h-4" />
            Copy Payment Request
          </motion.button>
            
          <motion.button
              onClick={() => setShowShareModal(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full megapayer-panel-soft border border-megapayer-border py-3.5 rounded-xl text-sm font-bold font-heading text-megapayer-text flex items-center justify-center gap-2"
            >
            <CustomIcons.Share2 className="w-4 h-4" />
            Share Address
          </motion.button>
        </div>
      </motion.div>

      {/* Share Modal - Mobile Friendly Bottom Sheet */}
      <AnimatePresence>
      {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 megapayer-panel rounded-t-3xl border-t border-megapayer-border overflow-hidden"
              style={{ 
                height: 'auto',
                maxHeight: '70vh',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Drag Handle */}
              <div className="pt-3 pb-1 flex justify-center flex-shrink-0">
                <div className="w-12 h-1.5 bg-megapayer-muted/30 rounded-full"></div>
              </div>

              {/* Header */}
              <div className="px-5 py-4 flex items-center justify-between border-b border-megapayer-border flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34D399] to-[#22E1FF] flex items-center justify-center">
                    <CustomIcons.Share2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-heading text-megapayer-text">Share Address</h3>
                    <p className="text-xs font-body text-megapayer-muted">Choose how to share</p>
                  </div>
            </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 hover:bg-megapayer-panel-soft rounded-lg transition-colors"
                >
                  <CustomIcons.X className="w-5 h-5 text-megapayer-muted" />
                </button>
              </div>

              {/* Share Options */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2" style={{ minHeight: 0 }}>
                {shareOptions.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={option.action}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 p-4 megapayer-panel-soft hover:bg-megapayer-panel rounded-xl transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#34D399] to-[#22E1FF] flex items-center justify-center flex-shrink-0">
                      <option.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-sm font-semibold font-heading text-megapayer-text">{option.name}</span>
                  </motion.button>
              ))}
            </div>
            </motion.div>
          </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
