'use client';

import { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, Check, AlertTriangle } from 'lucide-react';

export function SecuritySettings() {
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPinSet, setIsPinSet] = useState(false);
  const [showPinForm, setShowPinForm] = useState(false);
  const [showChangePinForm, setShowChangePinForm] = useState(false);

  useEffect(() => {
    checkPinStatus();
  }, []);

  const checkPinStatus = async () => {
    try {
      const result = await chrome.storage.local.get(['pinHash']);
      setIsPinSet(!!result.pinHash);
    } catch (error) {
      console.error('Failed to check PIN status:', error);
    }
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
      await chrome.storage.local.set({ pinHash: hash });
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
      const result = await chrome.storage.local.get(['pinHash']);
      if (!result.pinHash) {
        setPinError('No PIN is currently set');
        return;
      }

      const currentHash = await hashPin(pin);
      if (currentHash !== result.pinHash) {
        setPinError('Current PIN is incorrect');
        return;
      }

      const newHash = await hashPin(newPin);
      await chrome.storage.local.set({ pinHash: newHash });
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
    
    return 'Web Browser';
  };

  const getBiometricCapabilities = (): string[] => {
    const platform = detectPlatform();
    
    if (platform === 'Chrome Extension') {
      return ['Hardware Security Keys'];
    }
    
    return [];
  };

  const isBiometricSupported = (): boolean => {
    const platform = detectPlatform();
    return platform === 'Chrome Extension' && window.PublicKeyCredential !== undefined;
  };

  const getSecurityRecommendations = (): string[] => {
    const platform = detectPlatform();
    const recommendations = ['Set a strong PIN for wallet access'];
    
    if (platform === 'Chrome Extension') {
      recommendations.push(
        'Use hardware security keys for enhanced security',
        'Keep your extension updated',
        'Never share your private keys or seed phrases'
      );
    }
    
    return recommendations;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>

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
                    type={showNewPin ? 'text' : 'password'}
                    placeholder="Enter PIN (4-8 digits)"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={8}
                  />
                  <input
                    type={showConfirmPin ? 'text' : 'password'}
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
                    type={showPin ? 'text' : 'password'}
                    placeholder="Current PIN"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={8}
                  />
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    placeholder="New PIN (4-8 digits)"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={8}
                  />
                  <input
                    type={showConfirmPin ? 'text' : 'password'}
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
  );
}
