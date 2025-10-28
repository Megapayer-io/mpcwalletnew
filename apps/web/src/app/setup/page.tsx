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
      <SetupLayout title="Backup Your Wallet" subtitle="Your seed phrase is the master key to your wallet. Write it down carefully and store it safely.">
        <SeedBackup mnemonic={mnemonic} onComplete={handleBackupComplete} />
      </SetupLayout>
    );
  }

  if (step === 'password') {
    return (
      <SetupLayout title="Set Password" subtitle="Create a strong password to secure your wallet">
        <div className="max-w-2xl mx-auto">
          <div className="megapayer-panel rounded-2xl shadow-megapayer border border-megapayer-border p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-megapayer-teal to-megapayer-violet rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CustomIcons.Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-megapayer-text mb-3 font-heading">Set Password</h2>
              <p className="text-megapayer-muted text-lg">
                Create a strong password to encrypt your wallet. This password will be required to unlock your wallet.
              </p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-megapayer-text mb-3">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    className={`w-full px-4 py-4 pr-12 megapayer-panel-soft border rounded-xl focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-megapayer-text placeholder-megapayer-muted transition-all duration-200 ${
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
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-megapayer-muted hover:text-megapayer-text transition-colors duration-200"
                  >
                    {showPassword ? <CustomIcons.EyeOff className="w-5 h-5" /> : <CustomIcons.Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-megapayer-text mb-3">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-4 pr-12 megapayer-panel-soft border border-megapayer-border rounded-xl focus:ring-2 focus:ring-megapayer-teal focus:border-transparent text-megapayer-text placeholder-megapayer-muted transition-all duration-200"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-megapayer-muted hover:text-megapayer-text transition-colors duration-200"
                  >
                    {showConfirmPassword ? <CustomIcons.EyeOff className="w-5 h-5" /> : <CustomIcons.Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="megapayer-panel-soft border border-megapayer-teal/20 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <CustomIcons.AlertTriangle className="w-6 h-6 text-megapayer-teal mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-megapayer-text mb-3">Password Requirements</h3>
                    <ul className="text-sm space-y-2">
                      <li className={`flex items-center space-x-2 ${
                        password.length >= 12 ? 'text-megapayer-emerald' : 'text-megapayer-muted'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          password.length >= 12 ? 'bg-megapayer-emerald' : 'bg-megapayer-muted'
                        }`}></div>
                        <span>At least 12 characters long</span>
                      </li>
                      <li className={`flex items-center space-x-2 ${
                        /[A-Z]/.test(password) ? 'text-megapayer-emerald' : 'text-megapayer-muted'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          /[A-Z]/.test(password) ? 'bg-megapayer-emerald' : 'bg-megapayer-muted'
                        }`}></div>
                        <span>At least one uppercase letter</span>
                      </li>
                      <li className={`flex items-center space-x-2 ${
                        /[a-z]/.test(password) ? 'text-megapayer-emerald' : 'text-megapayer-muted'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          /[a-z]/.test(password) ? 'bg-megapayer-emerald' : 'bg-megapayer-muted'
                        }`}></div>
                        <span>At least one lowercase letter</span>
                      </li>
                      <li className={`flex items-center space-x-2 ${
                        /\d/.test(password) ? 'text-megapayer-emerald' : 'text-megapayer-muted'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          /\d/.test(password) ? 'bg-megapayer-emerald' : 'bg-megapayer-muted'
                        }`}></div>
                        <span>At least one number</span>
                      </li>
                      <li className={`flex items-center space-x-2 ${
                        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'text-megapayer-emerald' : 'text-megapayer-muted'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? 'bg-megapayer-emerald' : 'bg-megapayer-muted'
                        }`}></div>
                        <span>At least one special character</span>
                      </li>
                      <li className={`flex items-center space-x-2 ${
                        !/(.)\1{2,}/.test(password) && password.length > 0 ? 'text-megapayer-emerald' : 'text-megapayer-muted'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          !/(.)\1{2,}/.test(password) && password.length > 0 ? 'bg-megapayer-emerald' : 'bg-megapayer-muted'
                        }`}></div>
                        <span>No repeated characters</span>
                      </li>
                      <li className={`flex items-center space-x-2 ${
                        !/123|abc|qwe|asd|zxc/i.test(password) && password.length > 0 ? 'text-megapayer-emerald' : 'text-megapayer-muted'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
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
                className="w-full megapayer-btn-primary py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
    <SetupLayout title="Welcome to Megapayer" subtitle="Create a new wallet or import an existing one">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="w-32 h-32 bg-gradient-to-br from-megapayer-teal via-megapayer-violet to-megapayer-accent rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-float">
          <CustomIcons.Wallet className="w-16 h-16 text-white" />
        </div>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-megapayer-text mb-6 font-heading">Your Gateway to Web3</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {/* Create New Wallet */}
        <div className="megapayer-panel rounded-3xl shadow-megapayer border border-megapayer-border p-10 hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] group relative overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-megapayer-emerald/10 to-megapayer-teal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="text-center relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-megapayer-emerald to-megapayer-teal rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <CustomIcons.Plus className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-megapayer-text mb-4 font-heading">Create New Wallet</h2>
            <p className="text-megapayer-muted text-lg mb-8 leading-relaxed">
              Generate a new wallet with a unique seed phrase. Make sure to backup your seed phrase securely.
            </p>
            
            {/* Features list */}
            <div className="text-left mb-8 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-megapayer-emerald to-megapayer-teal rounded-full"></div>
                <span className="text-sm text-megapayer-muted">Generate unique 24-word seed phrase</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-megapayer-emerald to-megapayer-teal rounded-full"></div>
                <span className="text-sm text-megapayer-muted">Full control over your private keys</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-megapayer-emerald to-megapayer-teal rounded-full"></div>
                <span className="text-sm text-megapayer-muted">Multi-network support</span>
              </div>
            </div>
            
            <button
              onClick={handleCreateWallet}
              disabled={isCreatingWallet}
              className="w-full megapayer-btn-primary py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg group-hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
        <div className="megapayer-panel rounded-3xl shadow-megapayer border border-megapayer-border p-10 hover:shadow-2xl transition-all duration-300 hover:scale-[1.03] group relative overflow-hidden">
          {/* Background gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-megapayer-violet/10 to-megapayer-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="text-center relative z-10">
            <div className="w-20 h-20 bg-gradient-to-br from-megapayer-violet to-megapayer-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
              <CustomIcons.Download className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-megapayer-text mb-4 font-heading">Import Existing Wallet</h2>
            <p className="text-megapayer-muted text-lg mb-8 leading-relaxed">
              Import your existing wallet using your 12 or 24-word seed phrase.
            </p>
            
            {/* Features list */}
            <div className="text-left mb-8 space-y-3">
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
                className="w-full megapayer-btn-primary py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg group-hover:shadow-xl"
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

      {/* Security Notice */}
      <div className="mt-20 max-w-5xl mx-auto">
        <div className="megapayer-panel-soft border border-megapayer-border rounded-3xl p-10 shadow-megapayer relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-4 left-4 w-8 h-8 border-2 border-megapayer-teal rounded-full"></div>
            <div className="absolute top-8 right-8 w-6 h-6 border-2 border-megapayer-violet rounded-full"></div>
            <div className="absolute bottom-6 left-8 w-4 h-4 border-2 border-megapayer-accent rounded-full"></div>
            <div className="absolute bottom-4 right-4 w-10 h-10 border-2 border-megapayer-emerald rounded-full"></div>
          </div>
          
          <div className="flex items-start space-x-4 relative z-10">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <CustomIcons.AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-megapayer-text mb-4 font-heading">Security Notice</h3>
              <div className="text-megapayer-muted space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-megapayer-teal to-megapayer-violet rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-megapayer-text">Never share your seed phrase:</p>
                    <p>Anyone with access to your seed phrase can control your wallet and steal your funds.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-megapayer-teal to-megapayer-violet rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-megapayer-text">Store it securely:</p>
                    <p>Write it down on paper and store it in a safe place. Never store it digitally or share it online.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gradient-to-r from-megapayer-teal to-megapayer-violet rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="font-semibold text-megapayer-text">Verify your backup:</p>
                    <p>Make sure you can restore your wallet using your seed phrase before deleting any backups.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SetupLayout>
  );
}