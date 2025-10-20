'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  EyeOff,
  Lock,
  Clock,
  ExternalLink
} from 'lucide-react';
import { securityAuditLogger, sessionManager } from '@evm-wallet/sdk';

interface SecureTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: {
    type: 'send' | 'transfer' | 'contract';
    to: string;
    amount?: string;
    token?: string;
    gasEstimate?: string;
    data?: string;
  };
  isLoading?: boolean;
}

export default function SecureTransactionModal({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  isLoading = false
}: SecureTransactionModalProps) {
  const [step, setStep] = useState<'review' | 'confirm' | 'processing'>('review');
  const [showDetails, setShowDetails] = useState(false);
  const [password, setPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [securityChecks, setSecurityChecks] = useState({
    sessionValid: false,
    addressValid: false,
    amountValid: false,
    gasEstimateValid: false
  });

  useEffect(() => {
    if (isOpen) {
      setStep('review');
      setPassword('');
      setIsPasswordValid(false);
      performSecurityChecks();
    }
  }, [isOpen, transaction]);

  const performSecurityChecks = () => {
    const checks = {
      sessionValid: sessionManager.isSessionValid(),
      addressValid: /^0x[a-fA-F0-9]{40}$/.test(transaction.to),
      amountValid: transaction.amount ? parseFloat(transaction.amount) > 0 : true,
      gasEstimateValid: transaction.gasEstimate ? parseFloat(transaction.gasEstimate) > 0 : true
    };
    setSecurityChecks(checks);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // In a real implementation, you would verify the password against the stored hash
    setIsPasswordValid(value.length >= 8);
  };

  const handleConfirm = () => {
    if (step === 'review') {
      setStep('confirm');
    } else if (step === 'confirm' && isPasswordValid) {
      setStep('processing');
      securityAuditLogger.logEvent('transaction_confirmed', 'high', `Transaction to ${transaction.to}`);
      onConfirm();
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getTransactionTypeIcon = () => {
    switch (transaction.type) {
      case 'send': return '💸';
      case 'transfer': return '🔄';
      case 'contract': return '📄';
      default: return '💰';
    }
  };

  const getTransactionTypeLabel = () => {
    switch (transaction.type) {
      case 'send': return 'Send Transaction';
      case 'transfer': return 'Token Transfer';
      case 'contract': return 'Contract Interaction';
      default: return 'Transaction';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {step === 'review' && 'Review Transaction'}
                {step === 'confirm' && 'Confirm Transaction'}
                {step === 'processing' && 'Processing...'}
              </h2>
              <p className="text-sm text-gray-600">
                {step === 'review' && 'Verify transaction details'}
                {step === 'confirm' && 'Enter password to confirm'}
                {step === 'processing' && 'Please wait while we process your transaction'}
              </p>
            </div>
          </div>
          {step !== 'processing' && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Review Step */}
          {step === 'review' && (
            <div className="space-y-6">
              {/* Transaction Type */}
              <div className="text-center">
                <div className="text-4xl mb-2">{getTransactionTypeIcon()}</div>
                <h3 className="text-lg font-semibold text-gray-900">{getTransactionTypeLabel()}</h3>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">To:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">{formatAddress(transaction.to)}</span>
                    <button
                      onClick={() => window.open(`https://etherscan.io/address/${transaction.to}`, '_blank')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {transaction.amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-semibold">
                      {transaction.amount} {transaction.token || 'ETH'}
                    </span>
                  </div>
                )}

                {transaction.gasEstimate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gas Estimate:</span>
                    <span className="font-mono text-sm">{transaction.gasEstimate} Gwei</span>
                  </div>
                )}
              </div>

              {/* Security Checks */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Security Checks</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {securityChecks.sessionValid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Valid session</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {securityChecks.addressValid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Valid recipient address</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {securityChecks.amountValid ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">Valid amount</span>
                  </div>
                </div>
              </div>

              {/* Advanced Details */}
              <div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span>{showDetails ? 'Hide' : 'Show'} Advanced Details</span>
                </button>
                
                {showDetails && (
                  <div className="mt-3 bg-gray-50 rounded-lg p-3">
                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-gray-600">Transaction Type:</span>
                        <span className="ml-2 font-mono">{transaction.type}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Full Address:</span>
                        <div className="font-mono break-all">{transaction.to}</div>
                      </div>
                      {transaction.data && (
                        <div>
                          <span className="text-gray-600">Data:</span>
                          <div className="font-mono break-all">{transaction.data}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Confirm Step */}
          {step === 'confirm' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Transaction</h3>
                <p className="text-gray-600 text-sm">
                  Enter your password to confirm this transaction
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-900">Security Notice</h4>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  This transaction will be signed and broadcast to the blockchain. 
                  Make sure all details are correct before proceeding.
                </p>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Transaction</h3>
              <p className="text-gray-600 text-sm">
                Please wait while we process your transaction...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-lg">
          {step === 'review' && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!Object.values(securityChecks).every(check => check)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <button
                onClick={() => setStep('review')}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={!isPasswordValid}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Confirm Transaction
              </button>
            </>
          )}

          {step === 'processing' && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Processing...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
