'use client';

import { useState, useEffect } from 'react';
import { CustomIcons } from './icons/CustomIcons';
import { SeedPhraseQuiz } from './SeedPhraseQuiz';

interface SeedBackupProps {
  mnemonic: string;
  onComplete: () => void;
}

export function SeedBackup({ mnemonic, onComplete }: SeedBackupProps) {
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStep(1);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy mnemonic:', error);
    }
  };

  const handleDownload = () => {
    const content = `Megapayer Wallet Seed Phrase Backup\n\nIMPORTANT: Keep this safe and never share it with anyone!\n\nYour seed phrase:\n${mnemonic}\n\nGenerated on: ${new Date().toLocaleString()}\n\nThis seed phrase can be used to recover your wallet. Anyone with access to this phrase can control your funds.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `megapayer-wallet-backup-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBackupComplete = () => {
    setShowQuiz(true);
  };

  const handleQuizComplete = () => {
    onComplete();
  };

  const handleBackToBackup = () => {
    setShowQuiz(false);
  };

  const words = mnemonic.split(' ');

  // Show quiz if user has completed backup
  if (showQuiz) {
    return (
      <SeedPhraseQuiz 
        mnemonic={mnemonic} 
        onComplete={handleQuizComplete}
        onBack={handleBackToBackup}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Security Warning */}
      <div className={`megapayer-panel-soft border border-yellow-400/30 rounded-2xl p-8 mb-8 shadow-megapayer transition-all duration-1000 delay-600 ${animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <CustomIcons.AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-megapayer-text mb-3 font-heading">Critical Security Warning</h3>
            <div className="text-megapayer-muted space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Your seed phrase is the <strong className="text-megapayer-text">only way</strong> to recover your wallet</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Write it down on paper and store it in a <strong className="text-megapayer-text">safe place</strong></p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                <p><strong className="text-red-500">Never</strong> share it with anyone or store it digitally</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seed Phrase Display */}
      <div className={`megapayer-panel rounded-2xl shadow-megapayer border border-megapayer-border p-8 mb-8 transition-all duration-1000 delay-800 ${animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-megapayer-text mb-2 font-heading">Your Recovery Seed Phrase</h3>
          <p className="text-megapayer-muted">24 words that give you complete control over your wallet</p>
        </div>

        <div className="relative">
          <div className="megapayer-panel-soft border border-megapayer-border rounded-xl p-6 font-mono">
            {showMnemonic ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {words.map((word, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-gradient-to-r from-megapayer-teal/10 to-megapayer-violet/10 border border-megapayer-teal/20 hover:shadow-md transition-all duration-200">
                    <span className="text-megapayer-teal text-xs font-bold w-6 text-center">{index + 1}</span>
                    <span className="text-megapayer-text font-medium">{word}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 24 }, (_, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-megapayer-panel border border-megapayer-border">
                    <span className="text-megapayer-muted text-xs font-bold w-6 text-center">{index + 1}</span>
                    <span className="text-megapayer-muted font-medium">••••••••</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setShowMnemonic(!showMnemonic)}
            className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-br from-megapayer-teal to-megapayer-violet rounded-xl flex items-center justify-center text-white hover:shadow-lg transition-all duration-200 hover:scale-105"
          >
            {showMnemonic ? (
              <CustomIcons.EyeOff className="w-5 h-5" />
            ) : (
              <CustomIcons.Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center space-x-3 megapayer-btn-primary py-4 px-6 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
          >
            {copied ? (
              <>
                <CustomIcons.CheckCircle className="w-5 h-5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <CustomIcons.Copy className="w-5 h-5" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center space-x-3 megapayer-panel-soft text-megapayer-text py-4 px-6 rounded-xl font-semibold border border-megapayer-border hover:bg-megapayer-panel transition-all duration-200 hover:scale-[1.02]"
          >
            <CustomIcons.Download className="w-5 h-5" />
            <span>Download Backup</span>
          </button>
        </div>
      </div>

      {/* Confirmation Section */}
      <div className={`megapayer-panel-soft border border-megapayer-border rounded-2xl p-8 shadow-megapayer transition-all duration-1000 delay-1000 ${animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-megapayer-text mb-2 font-heading">Final Confirmation</h3>
          <p className="text-megapayer-muted">Please confirm that you have securely backed up your seed phrase</p>
        </div>

        <div className="flex items-start space-x-4 mb-6">
          <div className="flex-shrink-0 mt-1">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="w-5 h-5 text-megapayer-teal focus:ring-megapayer-teal border-megapayer-border rounded"
            />
          </div>
          <div className="text-megapayer-muted">
            <p className="font-semibold text-megapayer-text mb-2">I understand and confirm that:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-megapayer-teal rounded-full mt-2 flex-shrink-0"></div>
                <span>I have written down my seed phrase on paper</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-megapayer-teal rounded-full mt-2 flex-shrink-0"></div>
                <span>I have stored it in a safe and secure location</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-megapayer-teal rounded-full mt-2 flex-shrink-0"></div>
                <span>I understand that losing this phrase means losing access to my funds forever</span>
              </li>
              <li className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-megapayer-teal rounded-full mt-2 flex-shrink-0"></div>
                <span>I will never share this phrase with anyone</span>
              </li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleBackupComplete}
          disabled={!acknowledged}
          className="w-full megapayer-btn-primary py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <CustomIcons.CheckCircle className="w-5 h-5" />
          <span>I've Securely Backed Up My Seed Phrase</span>
        </button>
      </div>
    </div>
  );
}
