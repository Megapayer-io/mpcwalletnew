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
  const [qrSize, setQrSize] = useState(128);
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
      <div className="megapayer-panel rounded-lg shadow-md border border-megapayer-border p-3 text-center">
        <CustomIcons.AlertTriangle className="h-8 w-8 text-megapayer-muted mx-auto mb-2" />
        <p className="text-sm text-megapayer-muted">No wallet address available</p>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* QR Code Section */}
        <div className="megapayer-panel rounded-lg shadow-md border border-megapayer-border p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-megapayer-teal to-megapayer-emerald rounded-lg flex items-center justify-center shadow-md">
                <CustomIcons.QrCode className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-megapayer-text font-heading">QR Code</h2>
                <p className="text-xs text-megapayer-muted">Scan to send funds</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setShowQR(!showQR)}
                className="p-1.5 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-all duration-300"
                title={showQR ? 'Hide QR Code' : 'Show QR Code'}
              >
                {showQR ? <CustomIcons.EyeOff className="h-3.5 w-3.5" /> : <CustomIcons.Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={handleDownloadQR}
                className="p-1.5 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel-soft rounded-lg transition-all duration-300"
                title="Download QR Code"
              >
                <CustomIcons.Download className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {showQR && (
            <div className="text-center">
              <div 
                ref={qrRef}
                className="inline-block p-2 megapayer-panel-soft border border-megapayer-border rounded-lg max-w-full"
              >
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="Wallet QR Code" 
                    className="rounded-lg max-w-full h-auto"
                    style={{ width: Math.min(qrSize, 200), height: Math.min(qrSize, 200) }}
                  />
                ) : (
                  <div className="w-24 h-24 megapayer-panel-soft rounded-lg flex items-center justify-center">
                    <CustomIcons.Refresh className="h-6 w-6 text-megapayer-muted animate-spin" />
                  </div>
                )}
              </div>
              
              <p className="text-xs text-megapayer-muted mt-2 px-2">
                Scan this QR code to send {selectedToken} to your wallet
              </p>
              {amount && parseFloat(amount) > 0 && (
                <p className="text-xs text-megapayer-teal mt-1 font-semibold">
                  Amount: {amount} {selectedToken}
                </p>
              )}
            </div>
          )}

          {/* QR Size Controls */}
          <div className="mt-2">
            <label className="block text-xs font-semibold text-megapayer-text mb-1.5">
              QR Code Size
            </label>
            <div className="flex space-x-2">
              {[128, 256].map((size) => (
                <button
                  key={size}
                  onClick={() => setQrSize(size)}
                  className={`px-2 py-1 text-xs rounded-lg transition-all duration-200 font-medium ${
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
        <div className="megapayer-panel rounded-lg shadow-md border border-megapayer-border p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-megapayer-violet to-megapayer-accent rounded-lg flex items-center justify-center shadow-md">
              <CustomIcons.Wallet className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-megapayer-text font-heading">Wallet Address</h2>
              <p className="text-xs text-megapayer-muted">Your receiving address</p>
            </div>
          </div>
          
          {/* Address Display */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-megapayer-text mb-1.5">
              Your {currentNetwork?.name} Address
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-2 megapayer-panel-soft border border-megapayer-border rounded-lg overflow-hidden">
                <p className="font-mono text-xs break-all text-megapayer-text leading-relaxed word-break-all">{address}</p>
              </div>
              <button
                onClick={handleCopyAddress}
                className="p-2 text-megapayer-muted hover:text-megapayer-text hover:bg-megapayer-panel rounded-lg transition-all duration-300 flex-shrink-0"
                title="Copy address"
              >
                {copied ? (
                  <CustomIcons.CheckCircle className="h-4 w-4 text-megapayer-emerald" />
                ) : (
                  <CustomIcons.Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-megapayer-text mb-1.5">
              Request Amount (Optional)
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 px-3 py-2 megapayer-panel-soft border border-megapayer-border rounded-lg focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-xs text-megapayer-text placeholder-megapayer-muted"
                placeholder="0.0"
                step="any"
                min="0"
              />
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="px-3 py-2 megapayer-panel-soft border border-megapayer-border rounded-lg focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-xs text-megapayer-text"
              >
                <option value={currentNetwork?.symbol || 'ETH'}>{currentNetwork?.symbol || 'ETH'}</option>
              </select>
            </div>
            {amount && parseFloat(amount) > 0 && (
              <p className="text-xs text-megapayer-teal mt-1 font-medium">
                Payment request: {amount} {selectedToken}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleCopyPaymentRequest}
              className="w-full megapayer-btn-primary py-2 px-4 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-md flex items-center justify-center space-x-2"
            >
              <CustomIcons.Copy className="h-3.5 w-3.5" />
              <span>Copy Payment Request</span>
            </button>
            
            <button
              onClick={() => setShowShareModal(true)}
              className="w-full bg-gradient-to-r from-megapayer-emerald to-megapayer-teal text-white py-2 px-4 rounded-lg text-xs font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-md flex items-center justify-center space-x-2"
            >
              <CustomIcons.Share2 className="h-3.5 w-3.5" />
              <span>Share Address</span>
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-gradient-to-br from-megapayer-accent/20 via-megapayer-violet/10 to-megapayer-teal/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="megapayer-panel rounded-xl shadow-xl max-w-sm w-full p-4 relative border border-megapayer-border/50 backdrop-blur-xl bg-white/95 overflow-hidden">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-megapayer-panel-soft text-megapayer-muted hover:text-megapayer-text transition-all duration-200 z-10"
            >
              <CustomIcons.X className="h-4 w-4" />
            </button>

            <div className="text-center mb-4 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-megapayer-emerald via-megapayer-teal to-megapayer-violet rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md">
                <CustomIcons.Share2 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-bold text-megapayer-text font-heading">Share Your Address</h3>
              <p className="text-xs text-megapayer-muted">Choose how to share your wallet address</p>
            </div>

            <div className="space-y-2 relative z-10">
              {shareOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={option.action}
                  className="w-full flex items-center space-x-2 p-2 megapayer-panel-soft hover:bg-megapayer-panel rounded-lg transition-all duration-200 hover:scale-[1.02] text-left"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-megapayer-teal to-megapayer-emerald rounded-lg flex items-center justify-center">
                    <option.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-megapayer-text font-medium">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
