'use client';

import React, { useState, useEffect } from 'react';

interface SecuritySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SecuritySettings({ isOpen, onClose }: SecuritySettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [showPinForm, setShowPinForm] = useState(false);
  const [showChangePinForm, setShowChangePinForm] = useState(false);
  const [isPinSet, setIsPinSet] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkPinStatus();
    }
  }, [isOpen]);

  const checkPinStatus = () => {
    const pinHash = localStorage.getItem('mpc-wallet-pin-hash');
    setIsPinSet(!!pinHash);
  };

  const handleSetPin = async () => {
    if (newPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }

    if (newPin.length < 4 || newPin.length > 8) {
      setPinError('PIN must be 4-8 digits');
      return;
    }

    if (!/^\d+$/.test(newPin)) {
      setPinError('PIN must contain only digits');
      return;
    }

    setIsLoading(true);
    setPinError('');
    
    try {
      const hash = await hashPin(newPin);
      localStorage.setItem('mpc-wallet-pin-hash', hash);
      setPinSuccess('PIN set successfully!');
      setNewPin('');
      setConfirmPin('');
      setShowPinForm(false);
      setIsPinSet(true);
    } catch (error) {
      setPinError('Failed to set PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePin = async () => {
    if (newPin !== confirmPin) {
      setPinError('New PINs do not match');
      return;
    }

    if (newPin.length < 4 || newPin.length > 8) {
      setPinError('PIN must be 4-8 digits');
      return;
    }

    if (!/^\d+$/.test(newPin)) {
      setPinError('PIN must contain only digits');
      return;
    }

    setIsLoading(true);
    setPinError('');
    
    try {
      const storedHash = localStorage.getItem('mpc-wallet-pin-hash');
      if (!storedHash) {
        setPinError('No PIN is currently set');
        return;
      }

      const currentHash = await hashPin(pin);
      if (currentHash !== storedHash) {
        setPinError('Current PIN is incorrect');
        return;
      }

      const newHash = await hashPin(newPin);
      localStorage.setItem('mpc-wallet-pin-hash', newHash);
      setPinSuccess('PIN changed successfully!');
      setPin('');
      setNewPin('');
      setConfirmPin('');
      setShowChangePinForm(false);
    } catch (error) {
      setPinError('Failed to change PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const hashPin = async (pinValue: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(pinValue);
    const salt = encoder.encode('mpc-wallet-pin-salt');
    
    const key = await crypto.subtle.importKey(
      'raw',
      data,
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    );

    const hashArray = Array.from(new Uint8Array(derivedBits));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const detectPlatform = (): string => {
    if (typeof window === 'undefined') return 'unknown';
    
    if ((window as any).chrome?.runtime?.id) {
      return 'Chrome Extension';
    }
    
    const userAgent = navigator.userAgent.toLowerCase();
    if (/android/.test(userAgent)) return 'Android Mobile';
    if (/iphone|ipad|ipod/.test(userAgent)) return 'iOS Mobile';
    
    return 'Web Browser';
  };

  const getBiometricCapabilities = (): string[] => {
    const platform = detectPlatform();
    
    if (platform === 'Chrome Extension' || platform === 'Web Browser') {
      return ['Hardware Security Keys'];
    } else if (platform.includes('Mobile')) {
      return ['Fingerprint', 'Face ID'];
    }
    
    return [];
  };

  const isBiometricSupported = (): boolean => {
    const platform = detectPlatform();
    return platform === 'Web Browser' && window.PublicKeyCredential !== undefined;
  };

  const getSecurityRecommendations = (): string[] => {
    const platform = detectPlatform();
    const recommendations = ['Set a strong PIN for wallet access'];
    
    if (platform === 'Web Browser') {
      recommendations.push(
        'Use hardware security keys for enhanced security',
        'Clear browser data regularly'
      );
    } else if (platform === 'Chrome Extension') {
      recommendations.push('Use hardware security keys for enhanced security');
    }
    
    return recommendations;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        <div className="space-y-6">
          {/* Biometric Authentication */}
          {isBiometricSupported() && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Biometric Authentication</h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <strong>Status:</strong> Available
                </p>
                <div>
                  <strong className="text-gray-600">Available Methods:</strong>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {getBiometricCapabilities().map((capability) => (
                      <span
                        key={capability}
                        className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PIN Authentication */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">PIN Authentication</h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                <strong>Status:</strong> {isPinSet ? 'Set' : 'Not Set'}
              </p>
              
              {!isPinSet && !showPinForm && (
                <button
                  onClick={() => setShowPinForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Set PIN
                </button>
              )}

              {isPinSet && !showChangePinForm && (
                <button
                  onClick={() => setShowChangePinForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Change PIN
                </button>
              )}

              {/* Set PIN Form */}
              {showPinForm && (
                <div className="mt-4 p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Set New PIN</h4>
                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="Enter PIN (4-8 digits)"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={8}
                    />
                    <input
                      type="password"
                      placeholder="Confirm PIN"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={8}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSetPin}
                        disabled={isLoading || !newPin || !confirmPin}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Set PIN
                      </button>
                      <button
                        onClick={() => {
                          setShowPinForm(false);
                          setNewPin('');
                          setConfirmPin('');
                          setPinError('');
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Change PIN Form */}
              {showChangePinForm && (
                <div className="mt-4 p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Change PIN</h4>
                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="Current PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={8}
                    />
                    <input
                      type="password"
                      placeholder="New PIN (4-8 digits)"
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={8}
                    />
                    <input
                      type="password"
                      placeholder="Confirm New PIN"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value)}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={8}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleChangePin}
                        disabled={isLoading || !pin || !newPin || !confirmPin}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Change PIN
                      </button>
                      <button
                        onClick={() => {
                          setShowChangePinForm(false);
                          setPin('');
                          setNewPin('');
                          setConfirmPin('');
                          setPinError('');
                        }}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Recommendations */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Recommendations</h3>
            <ul className="space-y-1">
              {getSecurityRecommendations().map((recommendation, index) => (
                <li key={index} className="text-gray-600 flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>

          {/* Error/Success Messages */}
          {pinError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {pinError}
            </div>
          )}
          {pinSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {pinSuccess}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}