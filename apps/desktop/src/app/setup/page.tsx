'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWalletStore } from '@/store/wallet';
import { SetupLayout } from '@/components/layout/SetupLayout';
import { SeedBackup } from '@/components/SeedBackup';
import { CustomIcons } from '@/components/icons/CustomIcons';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<'choose' | 'backup' | 'password'>('choose');
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [importMnemonic, setImportMnemonic] = useState('');
  const [isImportMode, setIsImportMode] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  
  const { createWallet, importWallet, isInitialized, hasWallet, saveKeystore } = useWalletStore();

  // Password validation function
  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    
    if (pwd.length < 12) {
      errors.push('At least 12 characters long');
    }
    
    if (!/[A-Z]/.test(pwd)) {
      errors.push('At least one uppercase letter');
    }
    
    if (!/[a-z]/.test(pwd)) {
      errors.push('At least one lowercase letter');
    }
    
    if (!/\d/.test(pwd)) {
      errors.push('At least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
      errors.push('At least one special character');
    }
    
    // Check for common patterns
    if (/(.)\1{2,}/.test(pwd)) {
      errors.push('No repeated characters (e.g., "aaa")');
    }
    
    if (/123|abc|qwe|asd|zxc/i.test(pwd)) {
      errors.push('No sequential patterns (e.g., "123", "abc")');
    }
    
    // Check for common words
    const commonWords = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'hello'];
    if (commonWords.some(word => pwd.toLowerCase().includes(word))) {
      errors.push('No common words');
    }
    
    return errors;
  };

  // Handle password change with validation
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const errors = validatePassword(value);
    setPasswordErrors(errors);
  };

  useEffect(() => {
    // Only redirect if we're not in the middle of setup process AND not creating wallet
    if (isInitialized && hasWallet && step === 'choose' && !isCreatingWallet) {
      router.push('/');
    }
  }, [isInitialized, hasWallet, step, isCreatingWallet, router]);

  const handleCreateWallet = async () => {
    setIsCreatingWallet(true);
    try {
      const result = await createWallet();
      setMnemonic(result.mnemonic);
      setStep('backup');
    } catch (error) {
      console.error('Failed to create wallet:', error);
      alert('Failed to create wallet. Please try again.');
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleImportWallet = async () => {
    if (!importMnemonic.trim()) {
      alert('Please enter a valid seed phrase');
      return;
    }

    try {
      await importWallet(importMnemonic.trim());
      setStep('password');
    } catch (error) {
      console.error('Failed to import wallet:', error);
      alert('Invalid seed phrase. Please check and try again.');
    }
  };

  const handleBackupComplete = () => {
    setStep('password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Check if password meets all requirements
    const errors = validatePassword(password);
    if (errors.length > 0) {
      alert(`Password requirements not met:\n${errors.join('\n')}`);
      return;
    }

    try {
      // Save the keystore with the password
      await saveKeystore(mnemonic, password);
      
      // Now redirect to dashboard
      router.push('/');
    } catch (error) {
      console.error('Failed to set password:', error);
      alert('Failed to save wallet. Please try again.');
    }
  };

  if (step === 'backup') {
    return (
      <SetupLayout title="Backup Your Wallet">
        <SeedBackup mnemonic={mnemonic} onComplete={handleBackupComplete} />
      </SetupLayout>
    );
  }

  if (step === 'password') {
    return (
      <SetupLayout title="Set Password">
        <div className="max-w-3xl mx-auto">
          <div className="megapayer-panel rounded-xl shadow-md border border-megapayer-border p-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-megapayer-teal to-megapayer-violet rounded-lg flex items-center justify-center mx-auto mb-3 shadow-md">
                <CustomIcons.Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-megapayer-text mb-2 font-heading">Set Password</h2>
              <p className="text-megapayer-muted text-sm">
                Create a strong password to encrypt your wallet. This password will be required to unlock your wallet.
              </p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-megapayer-text mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className={`w-full px-3 py-2 pr-10 megapayer-panel-soft border rounded-lg focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-megapayer-text placeholder-megapayer-muted transition-all duration-200 ${
                      passwordErrors.length > 0 && password.length > 0 
                        ? 'border-red-400 focus:ring-red-400' 
                        : 'border-megapayer-border'
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-megapayer-muted hover:text-megapayer-text transition-colors duration-200"
                  >
                    {showPassword ? <CustomIcons.EyeOff className="w-4 h-4" /> : <CustomIcons.Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-megapayer-text mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 megapayer-panel-soft border border-megapayer-border rounded-lg focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-megapayer-text placeholder-megapayer-muted transition-all duration-200"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-megapayer-muted hover:text-megapayer-text transition-colors duration-200"
                  >
                    {showConfirmPassword ? <CustomIcons.EyeOff className="w-4 h-4" /> : <CustomIcons.Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="megapayer-panel-soft border border-megapayer-teal/20 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <CustomIcons.AlertTriangle className="w-4 h-4 text-megapayer-teal mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-xs font-semibold text-megapayer-text mb-2">Password Requirements</h3>
                    <ul className="text-xs space-y-1">
                      <li className={`flex items-center space-x-2 ${
                        password.length >= 12 ? 'text-megapayer-emerald' : 'text-megapayer-muted'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          password.length >= 12 ? 'bg-megapayer-emerald' : 'bg-megapayer-muted'
                        }`}></div>
                        <span>At least 12 characters long</span>
                      </li>
                      <li className={`flex items-center space-x-2 ${
                        /[A-Z]/.test(password) ? 'text-megapayer-emerald' : 'text-megapayer-muted'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          /[A-Z]/.test(password) ? 'bg-megapayer-emerald' : 'bg-megapayer-muted'
                        }`}></div>
                        <span>At least one uppercase letter</span>
                      </li>
                      <li className={`flex items-center space-x-2 ${
                        /[a-z]/.test(password) ? 'text-megapayer-emerald' : 'text-megapayer-muted'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          /[a-z]/.test(password) ? 'bg-megapayer-emerald' : 'bg-megapayer-muted'
                        }`}></div>
                        <span>At least one lowercase letter</span>
                      </li>
                      <li className={`flex items-center space-x-2 ${
                        /\d/.test(password) ? 'text-megapayer-emerald' : 'text-megapayer-muted'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          /\d/.test(password) ? 'bg-megapayer-emerald' : 'bg-megapayer-muted'
                        }`}></div>
                        <span>At least one number</span>
                      </li>
                      <li className={`flex items-center space-x-2 ${
                        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-megapayer-emerald' : 'text-megapayer-muted'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'bg-megapayer-emerald' : 'bg-megapayer-muted'
                        }`}></div>
                        <span>At least one special character</span>
                      </li>
                      <li className={`flex items-center space-x-2 ${
                        !/(.)\1{2,}/.test(password) && password.length > 0 ? 'text-megapayer-emerald' : 'text-megapayer-muted'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          !/(.)\1{2,}/.test(password) && password.length > 0 ? 'bg-megapayer-emerald' : 'bg-megapayer-muted'
                        }`}></div>
                        <span>No repeated characters</span>
                      </li>
                      <li className={`flex items-center space-x-2 ${
                        !/123|abc|qwe|asd|zxc/i.test(password) && password.length > 0 ? 'text-megapayer-emerald' : 'text-megapayer-muted'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          !/123|abc|qwe|asd|zxc/i.test(password) && password.length > 0 ? 'bg-megapayer-emerald' : 'bg-megapayer-muted'
                        }`}></div>
                        <span>No sequential patterns</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordErrors.length > 0 || password !== confirmPassword || password.length === 0}
                className="w-full megapayer-btn-primary py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Complete Setup
              </button>
            </form>
          </div>
        </div>
      </SetupLayout>
    );
  }

  return (
    <SetupLayout title="Welcome to Megapayer">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {/* Create New Wallet */}
        <div className="megapayer-panel rounded-xl shadow-md border border-megapayer-border p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-megapayer-emerald/10 to-megapayer-teal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="text-center relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-megapayer-emerald to-megapayer-teal rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <CustomIcons.Plus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-megapayer-text mb-3 font-heading">Create New Wallet</h2>
            <p className="text-megapayer-muted text-base mb-4 leading-relaxed">
              Generate a new wallet with a unique seed phrase. Make sure to backup your seed phrase securely.
            </p>
            
            {/* Features list */}
            <div className="text-left mb-4 space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-megapayer-emerald to-megapayer-teal rounded-full"></div>
                <span className="text-sm text-megapayer-muted">Generate unique 24-word seed phrase</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-megapayer-emerald to-megapayer-teal rounded-full"></div>
                <span className="text-sm text-megapayer-muted">Full control over your private keys</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-megapayer-emerald to-megapayer-teal rounded-full"></div>
                <span className="text-sm text-megapayer-muted">Multi-network support</span>
              </div>
            </div>
            
            <button
              onClick={handleCreateWallet}
              disabled={isCreatingWallet}
              className="w-full megapayer-btn-primary py-3 px-6 rounded-lg text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group-hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isCreatingWallet ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Wallet...</span>
                </>
              ) : (
                <>
                  <CustomIcons.Plus className="w-5 h-5" />
                  <span>Create New Wallet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Import Existing Wallet */}
        <div className="megapayer-panel rounded-xl shadow-md border border-megapayer-border p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-megapayer-violet/10 to-megapayer-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="text-center relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-megapayer-violet to-megapayer-accent rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <CustomIcons.Download className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-megapayer-text mb-3 font-heading">Import Existing Wallet</h2>
            <p className="text-megapayer-muted text-base mb-4 leading-relaxed">
              Import your existing wallet using your 12 or 24-word seed phrase.
            </p>
            
            {/* Features list */}
            <div className="text-left mb-4 space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-megapayer-violet to-megapayer-accent rounded-full"></div>
                <span className="text-sm text-megapayer-muted">Support for 12 or 24-word phrases</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-megapayer-violet to-megapayer-accent rounded-full"></div>
                <span className="text-sm text-megapayer-muted">Restore from any compatible wallet</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-megapayer-violet to-megapayer-accent rounded-full"></div>
                <span className="text-sm text-megapayer-muted">Keep your existing addresses</span>
              </div>
            </div>
            
            {!isImportMode ? (
              <button
                onClick={() => setIsImportMode(true)}
                className="w-full megapayer-btn-primary py-3 px-6 rounded-lg text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group-hover:shadow-xl"
              >
                Import Wallet
              </button>
            ) : (
              <div className="space-y-6">
                <div className="text-left">
                  <label className="block text-sm font-semibold text-megapayer-text mb-3">
                    Seed Phrase
                  </label>
                  <textarea
                    value={importMnemonic}
                    onChange={(e) => setImportMnemonic(e.target.value)}
                    placeholder="Enter your seed phrase (12 or 24 words separated by spaces)"
                    className="w-full px-4 py-4 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-violet focus:border-transparent resize-none text-megapayer-text placeholder-megapayer-muted transition-all duration-200"
                    rows={4}
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setIsImportMode(false);
                      setImportMnemonic('');
                    }}
                    className="flex-1 megapayer-panel-soft text-megapayer-muted py-3 px-4 rounded-xl hover:bg-megapayer-panel transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportWallet}
                    className="flex-1 megapayer-btn-primary py-3 px-4 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02]"
                  >
                    Import
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </SetupLayout>
  );
}