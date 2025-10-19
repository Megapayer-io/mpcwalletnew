'use client';

import { useState } from 'react';
import { Copy, Download, Check, Eye, EyeOff } from 'lucide-react';

interface SeedBackupProps {
  mnemonic: string;
  onComplete: () => void;
}

export function SeedBackup({ mnemonic, onComplete }: SeedBackupProps) {
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

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
    const content = `EVM Wallet Seed Phrase Backup\n\nIMPORTANT: Keep this safe and never share it with anyone!\n\nYour seed phrase:\n${mnemonic}\n\nGenerated on: ${new Date().toLocaleString()}\n\nThis seed phrase can be used to recover your wallet. Anyone with access to this phrase can control your funds.`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evm-wallet-backup-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          ⚠️ Important Security Warning
        </h3>
        <p className="text-yellow-700 text-sm">
          Your seed phrase is the only way to recover your wallet. Write it down and store it safely.
          Never share it with anyone or store it digitally in an insecure location.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Backup Your Seed Phrase</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your 12-word seed phrase:
          </label>
          <div className="relative">
            <div className="p-4 bg-gray-50 border border-gray-300 rounded-md font-mono text-sm">
              {showMnemonic ? (
                <div className="grid grid-cols-3 gap-2">
                  {mnemonic.split(' ').map((word, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-gray-500 text-xs w-6">{index + 1}.</span>
                      <span className="text-gray-900">{word}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }, (_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-gray-500 text-xs w-6">{index + 1}.</span>
                      <span className="text-gray-400">••••••••</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => setShowMnemonic(!showMnemonic)}
              className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
            >
              {showMnemonic ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex space-x-3 mb-6">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <Download className="h-4 w-4" />
            <span>Download .txt</span>
          </button>
        </div>

        <div className="mb-6">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">
              I have securely backed up my seed phrase and understand that losing it means losing access to my funds forever.
            </span>
          </label>
        </div>

        <button
          onClick={onComplete}
          disabled={!acknowledged}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          I've Backed Up My Seed Phrase
        </button>
      </div>
    </div>
  );
}
