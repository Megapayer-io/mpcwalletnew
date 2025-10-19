'use client';

import { useState, useEffect, useRef } from 'react';
import { useWalletStore } from '@/store/wallet';
import QRCode from 'qrcode';
import { 
  Copy, 
  Download, 
  Share2, 
  QrCode, 
  Check, 
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Mail,
  MessageSquare,
  Link as LinkIcon
} from 'lucide-react';

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
      icon: LinkIcon,
      action: () => {
        const shareText = `Send me ${selectedToken} to: ${address}`;
        navigator.clipboard.writeText(shareText);
        setShowShareModal(false);
      }
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => {
        const subject = `Payment Request - ${selectedToken}`;
        const body = `Please send ${amount || 'any amount'} ${selectedToken} to:\n\n${address}\n\nNetwork: ${currentNetwork?.name}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        setShowShareModal(false);
      }
    },
    {
      name: 'SMS',
      icon: MessageSquare,
      action: () => {
        const message = `Send me ${amount || 'any amount'} ${selectedToken} to: ${address}`;
        window.open(`sms:?body=${encodeURIComponent(message)}`);
        setShowShareModal(false);
      }
    },
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      action: () => {
        const message = `Send me ${amount || 'any amount'} ${selectedToken} to: ${address}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
        setShowShareModal(false);
      }
    }
  ];


  if (!address) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No wallet address available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* QR Code Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">QR Code</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title={showQR ? 'Hide QR Code' : 'Show QR Code'}
            >
              {showQR ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={handleDownloadQR}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Download QR Code"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {showQR && (
          <div className="text-center">
            <div 
              ref={qrRef}
              className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg"
            >
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="Wallet QR Code" 
                  className="rounded-lg"
                  style={{ width: qrSize, height: qrSize }}
                />
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="h-16 w-16 text-gray-400 animate-spin" />
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mt-4">
              Scan this QR code to send {selectedToken} to your wallet
            </p>
            {amount && parseFloat(amount) > 0 && (
              <p className="text-xs text-blue-600 mt-2">
                Amount: {amount} {selectedToken}
              </p>
            )}
          </div>
        )}

        {/* QR Size Controls */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            QR Code Size
          </label>
          <div className="flex space-x-2">
            {[128, 256, 512].map((size) => (
              <button
                key={size}
                onClick={() => setQrSize(size)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  qrSize === size
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Address & Amount Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Wallet Address</h2>
        
        {/* Current Balance */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Current Balance</h3>
              <p className="text-2xl font-bold text-gray-900">
                {isLoadingBalance ? (
                  <span className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </span>
                ) : (
                  `${parseFloat(currentBalance).toFixed(6)} ${currentNetwork?.symbol || 'ETH'}`
                )}
              </p>
               {currentBalance && !isLoadingBalance && (
                 <div className="flex items-center space-x-2">
                   <p className="text-sm text-gray-600">
                     {isLoadingUsd ? (
                       <span className="flex items-center space-x-1">
                         <RefreshCw className="h-3 w-3 animate-spin" />
                         <span>Loading USD...</span>
                       </span>
                     ) : usdBalance === 'Price unavailable' ? (
                       <span className="text-red-500">Price unavailable</span>
                     ) : (
                       `$${usdBalance} USD`
                     )}
                   </p>
                   <button
                     onClick={handleRefreshPrices}
                     disabled={isLoadingUsd}
                     className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
                     title="Refresh USD price"
                   >
                     <RefreshCw className={`h-3 w-3 ${isLoadingUsd ? 'animate-spin' : ''}`} />
                   </button>
                 </div>
               )}
            </div>
            <button
              onClick={loadCurrentBalance}
              disabled={isLoadingBalance}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
              title="Refresh balance"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>


        {/* Address Display */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your {currentNetwork?.name} Address
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="font-mono text-sm break-all">{address}</p>
            </div>
            <button
              onClick={handleCopyAddress}
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Copy address"
            >
              {copied ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Request Amount (Optional)
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.0"
              step="any"
              min="0"
            />
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={currentNetwork?.symbol || 'ETH'}>{currentNetwork?.symbol || 'ETH'}</option>
            </select>
          </div>
          {amount && parseFloat(amount) > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Payment request: {amount} {selectedToken}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleCopyPaymentRequest}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <Copy className="h-4 w-4" />
            <span>Copy Payment Request</span>
          </button>
          
          <button
            onClick={() => setShowShareModal(true)}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span>Share Address</span>
          </button>
        </div>
      </div>


      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Address</h3>
            <div className="space-y-3">
              {shareOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={option.action}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-md transition-colors"
                >
                  <option.icon className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-900">{option.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowShareModal(false)}
              className="w-full mt-4 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
