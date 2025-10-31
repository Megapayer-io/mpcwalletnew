'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CustomIcons } from '@/components/icons/CustomIcons';
import { motion } from 'framer-motion';

// Beautiful SVG Graphics
const SeedPhraseIcon = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="seedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <filter id="glowSeed">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background */}
    <circle cx="100" cy="100" r="90" fill="rgba(124, 58, 237, 0.05)" />
    
    {/* Seed Card */}
    <motion.rect
      x="30"
      y="50"
      width="140"
      height="100"
      rx="12"
      fill="none"
      stroke="url(#seedGradient)"
      strokeWidth="3"
      filter="url(#glowSeed)"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    />
    
    {/* Words Lines */}
    {[0, 1, 2, 3].map((i) => (
      <motion.line
        key={i}
        x1="45"
        y1={65 + i * 22}
        x2="155"
        y2={65 + i * 22}
        stroke="#22E1FF"
        strokeWidth="2"
        strokeDasharray="3,3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
      />
    ))}
    
    {/* Number Badges */}
    {[0, 1, 2].map((i) => (
      <motion.circle
        key={i}
        cx={35}
        cy={65 + i * 22}
        r="8"
        fill="rgba(34, 225, 255, 0.2)"
        stroke="#22E1FF"
        strokeWidth="1.5"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
      />
    ))}
    
    {/* Shield Protection */}
    <motion.path
      d="M100 160 L70 175 L70 185 Q70 195 100 200 Q130 195 130 185 L130 175 Z"
      fill="none"
      stroke="#34D399"
      strokeWidth="3"
      opacity="0.8"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.8, duration: 0.8 }}
    />
    
    {/* Security Particles */}
    {[...Array(8)].map((_, i) => {
      const angle = (i * 45) * Math.PI / 180;
      const radius = 75;
      const x = 100 + Math.cos(angle) * radius;
      const y = 100 + Math.sin(angle) * radius;
      return (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="2.5"
          fill="#7C3AED"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5]
          }}
          transition={{
            delay: 1 + i * 0.1,
            duration: 2,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

export default function BackupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mnemonic = searchParams.get('mnemonic') || '';
  
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [step, setStep] = useState<'display' | 'confirm'>('display');
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [error, setError] = useState('');
  const [selectedWord, setSelectedWord] = useState<string>('');

  const words = useMemo(() => mnemonic.split(' ').filter(w => w.trim()), [mnemonic]);
  
  const quizIndices = useMemo(() => {
    if (!words.length) return [];
    const indices: number[] = [];
    while (indices.length < 3) {
      const randomIndex = Math.floor(Math.random() * words.length);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    return indices.sort((a, b) => a - b);
  }, [words.length]);

  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  useEffect(() => {
    if (!mnemonic || words.length === 0) {
      router.push('/setup');
      return;
    }
    setError('');
    setSelectedWord('');
  }, [mnemonic, words.length, currentQuizIndex, router]);

  const handleReveal = () => {
    setShowSeedPhrase(true);
  };

  const handleNext = () => {
    setStep('confirm');
    setCurrentQuizIndex(0);
    setCorrectAnswers(0);
    setError('');
    setSelectedWord('');
  };

  const currentQuizOptions = useMemo(() => {
    if (step !== 'confirm' || quizIndices.length === 0 || currentQuizIndex >= quizIndices.length) {
      return [];
    }

    const targetIndex = quizIndices[currentQuizIndex];
    const targetWord = words[targetIndex];
    const otherWords = words.filter((_, i) => i !== targetIndex);
    const randomWords = otherWords.sort(() => Math.random() - 0.5).slice(0, 5);
    const allOptions = [...randomWords, targetWord].sort(() => Math.random() - 0.5);
    
    return allOptions;
  }, [step, quizIndices, currentQuizIndex, words]);

  const handleWordSelect = (word: string) => {
    if (currentQuizIndex >= quizIndices.length) return;

    setSelectedWord(word);
    const targetIndex = quizIndices[currentQuizIndex];
    const targetWord = words[targetIndex];

    if (word === targetWord) {
      setError('');
      setCorrectAnswers(prev => prev + 1);
      
      setTimeout(() => {
        if (currentQuizIndex < quizIndices.length - 1) {
          setCurrentQuizIndex(prev => prev + 1);
          setSelectedWord('');
        } else {
          router.push(`/setup/password?mnemonic=${encodeURIComponent(mnemonic)}`);
        }
      }, 300);
    } else {
      setError('Incorrect word. Please try again.');
      setTimeout(() => {
        setSelectedWord('');
        setError('');
      }, 2000);
    }
  };

  if (step === 'confirm' && quizIndices.length > 0 && currentQuizIndex < quizIndices.length) {
    const targetIndex = quizIndices[currentQuizIndex];
    
    return (
      <div className="min-h-screen megapayer-bg flex flex-col relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-10"
            style={{
              background: `linear-gradient(135deg, rgba(34,225,255,0.3), rgba(124,58,237,0.2))`
            }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Header */}
        <div className="px-5 pt-6 pb-4 relative z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setStep('display')}
              className="p-2 text-megapayer-muted hover:text-megapayer-text transition-colors"
            >
              <CustomIcons.ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex gap-1">
                {[0, 1, 2].map((index) => (
                  <div
                    key={index}
                    className={`flex-1 h-1 rounded-full transition-colors ${
                      index <= currentQuizIndex
                        ? 'bg-megapayer-teal'
                        : 'bg-megapayer-muted/40'
                    }`}
                  />
                ))}
              </div>
            </div>
            <span className="text-sm font-body text-megapayer-muted">
              {currentQuizIndex + 1}/3
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="px-5 pb-6 relative z-10">
          <h1 className="text-3xl font-bold font-heading text-megapayer-text mb-2">
            Confirm Seed Phrase
          </h1>
          <p className="text-sm font-body text-megapayer-muted">
            Select word #{targetIndex + 1} from your seed phrase
          </p>
        </div>

        {/* Quiz Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 relative z-10">
          <div className="w-full max-w-sm space-y-8">
            {/* Word Number Display */}
            <div className="text-center">
              <motion.div
                key={targetIndex}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-6xl font-bold bg-gradient-to-r from-megapayer-teal via-megapayer-violet to-megapayer-emerald bg-clip-text text-transparent mb-4"
              >
                {targetIndex + 1}
              </motion.div>
              <p className="text-sm font-body text-megapayer-muted">
                What is word #{targetIndex + 1} in your seed phrase?
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 megapayer-panel-soft border border-red-500/50 rounded-xl"
              >
                <p className="text-sm font-body text-red-400 text-center">{error}</p>
              </motion.div>
            )}

            {/* Word Selection Grid */}
            <div className="grid grid-cols-3 gap-3">
              {currentQuizOptions.map((word, index) => {
                const isSelected = selectedWord === word;
                const isCorrect = word === words[targetIndex] && isSelected;
                const isIncorrect = word !== words[targetIndex] && isSelected;
                
                return (
                  <motion.button
                    key={`${word}-${index}`}
                    onClick={() => handleWordSelect(word)}
                    disabled={!!selectedWord}
                    whileHover={{ scale: isSelected ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      px-4 py-3 rounded-xl text-sm font-semibold font-heading transition-all
                      border-2
                      ${isSelected
                        ? isCorrect
                          ? 'bg-megapayer-emerald/20 border-megapayer-emerald text-megapayer-emerald'
                          : 'bg-red-500/20 border-red-500 text-red-400'
                        : 'megapayer-panel-soft border-megapayer-border text-megapayer-text hover:border-megapayer-teal'
                      }
                      disabled:opacity-60 disabled:cursor-not-allowed
                    `}
                  >
                    {word}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Display step
  return (
    <div className="min-h-screen megapayer-bg flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-10"
          style={{
            background: `linear-gradient(135deg, rgba(34,225,255,0.3), rgba(124,58,237,0.2))`
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Header */}
      <div className="px-5 pt-6 pb-4 relative z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 text-megapayer-muted hover:text-megapayer-text transition-colors"
          >
            <CustomIcons.ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex gap-1">
              <div className="flex-1 h-1 rounded-full bg-megapayer-teal"></div>
              <div className="flex-1 h-1 rounded-full bg-megapayer-muted/40"></div>
              <div className="flex-1 h-1 rounded-full bg-megapayer-muted/40"></div>
            </div>
          </div>
          <span className="text-sm font-body text-megapayer-muted">1/3</span>
        </div>
      </div>

      {/* Title */}
      <div className="px-5 pb-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-4"
        >
          <div className="flex-shrink-0">
            <SeedPhraseIcon />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-heading text-megapayer-text mb-2">
              Write Down Your Seed Phrase
            </h1>
            <p className="text-sm font-body text-megapayer-muted">
              Write it down on paper and keep it in a safe place. You'll be asked to verify 3 words.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Seed Phrase Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 relative z-10">
        <div className="w-full max-w-md">
          {!showSeedPhrase ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="megapayer-panel-soft border-2 border-megapayer-border rounded-2xl p-8 text-center"
            >
              <CustomIcons.EyeOff className="w-16 h-16 text-megapayer-muted mx-auto mb-4" />
              <p className="text-lg font-semibold font-heading text-megapayer-text mb-3">
                Tap to reveal your seed phrase
              </p>
              <p className="text-sm font-body text-megapayer-muted mb-6">
                Make sure no one is watching your screen.
              </p>
              <motion.button
                onClick={handleReveal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 megapayer-panel border border-megapayer-border rounded-xl text-megapayer-text font-semibold font-heading flex items-center gap-2 mx-auto hover:bg-megapayer-panel transition-colors"
              >
                <CustomIcons.Eye className="w-5 h-5" />
                <span>View</span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="megapayer-panel border-2 border-megapayer-border rounded-2xl p-6"
            >
              <div className="grid grid-cols-2 gap-3">
                {words.map((word, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-4 py-3 megapayer-panel-soft rounded-xl text-left"
                  >
                    <span className="text-xs text-megapayer-muted mr-2 font-body">
                      {index + 1}.
                    </span>
                    <span className="text-sm font-semibold font-heading text-megapayer-text">
                      {word}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Next Button */}
      {showSeedPhrase && (
        <div className="px-5 pb-6 relative z-10">
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 megapayer-btn-primary rounded-xl font-bold font-heading shadow-megapayer transition-all duration-300"
          >
            Continue
          </motion.button>
        </div>
      )}
    </div>
  );
}
