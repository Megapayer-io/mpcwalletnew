'use client';

import { useState, useEffect, useRef } from 'react';
import { useWalletStore } from '@/store/wallet';
import QRCode from 'qrcode';
import { CustomIcons } from './icons/CustomIcons';

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

  // Generate QR code data
  const generateQRData = () => {
    if (amount && parseFloat(amount) > 0) {
      // Generate payment request with amount using the correct decimals for the selected token
      const decimals = 18; // Most tokens use 18 decimals, but this could be made dynamic in the future
      const valueInWei = parseFloat(amount) * Math.pow(10, decimals);
      return `ethereum:${address}?value=${valueInWei}&gas=21000`;
    }
    return address || '';
  };

  // Load current balance
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

  // Load balance on component mount and when network changes
  useEffect(() => {
    loadCurrentBalance();
  }, [address, currentNetwork]);

  // Update selected token when network changes
  useEffect(() => {
    if (currentNetwork?.symbol) {
      setSelectedToken(currentNetwork.symbol);
    }
  }, [currentNetwork]);

  // Load USD balance when balance changes
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

  // Handle price cache refresh
  const handleRefreshPrices = async () => {
    clearPriceCache();
    if (currentBalance && currentNetwork?.symbol) {
      setIsLoadingUsd(true);
      try {
        const usd = await getUsdBalance(currentBalance, currentNetwork.symbol);
        setUsdBalance(usd);
      } catch (error) {
        console.error('Failed to refresh USD balance:', error);
        setUsdBalance('Price unavailable');
      } finally {
        setIsLoadingUsd(false);
      }
    }
  };

  // Generate QR code
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

  // Copy address to clipboard
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

  // Copy payment request to clipboard
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

  // Download QR code as image
  const handleDownloadQR = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = `wallet-address-qr-${Date.now()}.png`;
      link.href = qrCodeDataUrl;
      link.click();
    }
  };

  // Share options
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
      <div className="megapayer-panel rounded-2xl shadow-megapayer border border-megapayer-border p-8 text-center">
        <CustomIcons.AlertTriangle className="h-12 w-12 text-megapayer-muted mx-auto mb-4" />
        <p className="text-megapayer-muted">No wallet address available</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Code Section */}
        <div className="megapayer-panel rounded-2xl shadow-megapayer border border-megapayer-border p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-megapayer-teal to-megapayer-emerald rounded-xl flex items-center justify-center shadow-lg">
                <CustomIcons.QrCode className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-megapayer-text font-heading">QR Code</h2>
                <p className="text-megapayer-muted">Scan to send funds</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowQR(!showQR)}
                className="p-3 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-105"
                title={showQR ? 'Hide QR Code' : 'Show QR Code'}
              >
                {showQR ? <CustomIcons.EyeOff className="h-5 w-5" /> : <CustomIcons.Eye className="h-5 w-5" />}
              </button>
              <button
                onClick={handleDownloadQR}
                className="p-3 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-xl transition-all duration-300 hover:scale-105"
                title="Download QR Code"
              >
                <CustomIcons.Download className="h-5 w-5" />
              </button>
            </div>
          </div>

          {showQR && (
            <div className="text-center">
              <div 
                ref={qrRef}
                className="inline-block p-4 megapayer-panel-soft border-2 border-megapayer-border rounded-2xl max-w-full"
              >
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="Wallet QR Code" 
                    className="rounded-xl max-w-full h-auto"
                    style={{ width: Math.min(qrSize, 300), height: Math.min(qrSize, 300) }}
                  />
                ) : (
                  <div className="w-48 h-48 megapayer-panel-soft rounded-xl flex items-center justify-center">
                    <CustomIcons.Refresh className="h-12 w-12 text-megapayer-muted animate-spin" />
                  </div>
                )}
              </div>
              
              <p className="text-sm text-megapayer-muted mt-4 px-2">
                Scan this QR code to send {selectedToken} to your wallet
              </p>
              {amount && parseFloat(amount) > 0 && (
                <p className="text-xs text-megapayer-teal mt-2 font-semibold">
                  Amount: {amount} {selectedToken}
                </p>
              )}
            </div>
          )}

          {/* QR Size Controls */}
          <div className="mt-6">
            <label className="block text-sm font-semibold text-megapayer-text mb-3">
              QR Code Size
            </label>
            <div className="flex space-x-3">
              {[128, 256, 512].map((size) => (
                <button
                  key={size}
                  onClick={() => setQrSize(size)}
                  className={`px-4 py-2 text-sm rounded-xl transition-all duration-200 font-medium ${
                    qrSize === size
                      ? 'megapayer-btn-primary'
                      : 'megapayer-panel-soft text-megapayer-text hover:bg-megapayer-panel'
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Address & Amount Section */}
        <div className="megapayer-panel rounded-2xl shadow-megapayer border border-megapayer-border p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-megapayer-violet to-megapayer-accent rounded-xl flex items-center justify-center shadow-lg">
              <CustomIcons.Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-megapayer-text font-heading">Wallet Address</h2>
              <p className="text-megapayer-muted">Your receiving address</p>
            </div>
          </div>
          
          {/* Address Display */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-megapayer-text mb-3">
              Your {currentNetwork?.name} Address
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1 p-4 megapayer-panel-soft border border-megapayer-border rounded-xl overflow-hidden">
                <p className="font-mono text-sm break-all text-megapayer-text leading-relaxed word-break-all">{address}</p>
              </div>
              <button
                onClick={handleCopyAddress}
                className="p-4 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel rounded-xl transition-all duration-300 hover:scale-105 flex-shrink-0"
                title="Copy address"
              >
                {copied ? (
                  <CustomIcons.CheckCircle className="h-5 w-5 text-megapayer-emerald" />
                ) : (
                  <CustomIcons.Copy className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-megapayer-text mb-3">
              Request Amount (Optional)
            </label>
            <div className="flex space-x-3">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-4 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-megapayer-text placeholder-megapayer-muted"
                placeholder="0.0"
                step="any"
                min="0"
              />
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="px-4 py-3 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-megapayer-text"
              >
                <option value={currentNetwork?.symbol || 'ETH'}>{currentNetwork?.symbol || 'ETH'}</option>
              </select>
            </div>
            {amount && parseFloat(amount) > 0 && (
              <p className="text-sm text-megapayer-teal mt-2 font-medium">
                Payment request: {amount} {selectedToken}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleCopyPaymentRequest}
              className="w-full megapayer-btn-primary py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-3"
            >
              <CustomIcons.Copy className="h-5 w-5" />
              <span>Copy Payment Request</span>
            </button>
            
            <button
              onClick={() => setShowShareModal(true)}
              className="w-full bg-gradient-to-r from-megapayer-emerald to-megapayer-teal text-white py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-3"
            >
              <CustomIcons.Share2 className="h-5 w-5" />
              <span>Share Address</span>
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-megapayer-accent/20 via-megapayer-violet/10 to-megapayer-teal/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="megapayer-panel rounded-3xl shadow-2xl max-w-md w-full p-8 relative border border-megapayer-border/50 backdrop-blur-xl bg-white/95 overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-megapayer-accent/10 to-megapayer-violet/5 rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-gradient-to-br from-megapayer-teal/10 to-megapayer-emerald/5 rounded-full"></div>
            
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-megapayer-panel-soft text-megapayer-muted hover:text-megapayer-text transition-all duration-200 z-10"
            >
              <CustomIcons.X className="h-5 w-5" />
            </button>

            <div className="text-center mb-6 relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-megapayer-emerald via-megapayer-teal to-megapayer-violet rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CustomIcons.Share2 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-megapayer-text font-heading">Share Your Address</h3>
              <p className="text-megapayer-muted">Choose how to share your wallet address</p>
            </div>

            <div className="space-y-3 relative z-10">
              {shareOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={option.action}
                  className="w-full flex items-center space-x-4 p-4 megapayer-panel-soft hover:bg-megapayer-panel rounded-xl transition-all duration-200 hover:scale-[1.02] text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-megapayer-teal to-megapayer-emerald rounded-xl flex items-center justify-center">
                    <option.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-megapayer-text font-medium">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
