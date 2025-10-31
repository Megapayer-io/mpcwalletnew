'use client';

import { useState, useEffect } from 'react';
import { CustomIcons } from './icons/CustomIcons';

interface SeedPhraseQuizProps {
  mnemonic: string;
  onComplete: () => void;
  onBack: () => void;
}

export function SeedPhraseQuiz({ mnemonic, onComplete, onBack }: SeedPhraseQuizProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [correctAnswers, setCorrectAnswers] = useState<number[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  const words = mnemonic.split(' ');
  const totalSteps = 3; // Quiz 3 random words

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStep(1);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Generate random positions to quiz
    const positions = Array.from({ length: words.length }, (_, i) => i)
      .sort(() => Math.random() - 0.5)
      .slice(0, totalSteps);
    
    setCorrectAnswers(positions);
    
    // Create shuffled word list (excluding the words we're quizzing)
    const quizWords = positions.map(pos => words[pos]);
    const otherWords = words.filter((_, index) => !positions.includes(index));
    const shuffled = [...quizWords, ...otherWords].sort(() => Math.random() - 0.5);
    
    setShuffledWords(shuffled);
  }, [mnemonic]);

  const handleWordSelect = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
      setSelectedWords([]);
      
      // Regenerate shuffled words for next step
      const remainingPositions = correctAnswers.slice(currentStep + 1);
      const quizWords = remainingPositions.map(pos => words[pos]);
      const otherWords = words.filter((_, index) => !remainingPositions.includes(index));
      const shuffled = [...quizWords, ...otherWords].sort(() => Math.random() - 0.5);
      
      setShuffledWords(shuffled);
    } else {
      setIsCompleted(true);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const getCurrentWordPosition = () => {
    return correctAnswers[currentStep] + 1; // 1-indexed for display
  };

  const getCurrentCorrectWord = () => {
    return words[correctAnswers[currentStep]];
  };

  const isAnswerCorrect = () => {
    return selectedWords.length === 1 && selectedWords[0] === getCurrentCorrectWord();
  };

  const getProgressPercentage = () => {
    return ((currentStep + 1) / totalSteps) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <div className={`w-24 h-24 bg-gradient-to-br from-megapayer-teal via-megapayer-violet to-megapayer-accent rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transition-all duration-1000 ${animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
          <CustomIcons.CheckCircle className="w-12 h-12 text-white" />
        </div>
        <h2 className={`text-4xl font-bold text-megapayer-text mb-4 font-heading transition-all duration-1000 delay-200 ${animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          Verify Your Backup
        </h2>
        <p className={`text-lg text-megapayer-muted max-w-2xl mx-auto transition-all duration-1000 delay-400 ${animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          Let's make sure you've written down your seed phrase correctly. We'll ask you to select a few words.
        </p>
      </div>

      {/* Progress Bar */}
      <div className={`megapayer-panel-soft rounded-2xl p-6 mb-8 shadow-megapayer transition-all duration-1000 delay-600 ${animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-megapayer-text">Progress</h3>
          <span className="text-megapayer-muted font-medium">
            {currentStep + 1} of {totalSteps}
          </span>
        </div>
        <div className="w-full bg-megapayer-panel rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-megapayer-teal to-megapayer-violet h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
      </div>

      {!isCompleted ? (
        <>
          {/* Quiz Question */}
          <div className={`megapayer-panel rounded-2xl shadow-megapayer border border-megapayer-border p-8 mb-8 transition-all duration-1000 delay-800 ${animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-megapayer-emerald to-megapayer-teal rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">{getCurrentWordPosition()}</span>
              </div>
              <h3 className="text-2xl font-bold text-megapayer-text mb-3 font-heading">
                Select Word #{getCurrentWordPosition()}
              </h3>
              <p className="text-megapayer-muted">
                Choose the correct word from the list below
              </p>
            </div>

            {/* Word Selection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {shuffledWords.map((word, index) => {
                const isSelected = selectedWords.includes(word);
                const isCorrect = word === getCurrentCorrectWord();
                
                return (
                  <button
                    key={`${word}-${index}`}
                    onClick={() => handleWordSelect(word)}
                    className={`p-4 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? isCorrect
                          ? 'bg-gradient-to-r from-megapayer-emerald to-megapayer-teal text-white shadow-lg'
                          : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                        : 'megapayer-panel-soft text-megapayer-text hover:bg-megapayer-panel border border-megapayer-border'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {selectedWords.length > 0 && (
              <div className="text-center mb-6">
                {isAnswerCorrect() ? (
                  <div className="flex items-center justify-center gap-3 text-megapayer-emerald">
                    <CustomIcons.CheckCircle className="w-6 h-6" />
                    <span className="text-lg font-semibold">Correct! Well done!</span>
                  </div>
                ) : selectedWords.length === 1 ? (
                  <div className="flex items-center justify-center gap-3 text-red-500">
                    <CustomIcons.AlertTriangle className="w-6 h-6" />
                    <span className="text-lg font-semibold">Incorrect. Please try again.</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3 text-megapayer-muted">
                    <CustomIcons.AlertTriangle className="w-6 h-6" />
                    <span className="text-lg font-semibold">Please select only one word.</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={onBack}
                className="flex-1 px-6 py-3 megapayer-panel-soft text-megapayer-muted rounded-xl hover:bg-megapayer-panel transition-all duration-200 font-semibold"
              >
                Back to Backup
              </button>
              <button
                onClick={handleNext}
                disabled={!isAnswerCorrect()}
                className="flex-1 megapayer-btn-primary py-3 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
              >
                {currentStep < totalSteps - 1 ? 'Next Word' : 'Complete Quiz'}
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Completion Screen */
        <div className={`megapayer-panel rounded-2xl shadow-megapayer border border-megapayer-border p-8 text-center transition-all duration-1000 ${animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="w-20 h-20 bg-gradient-to-br from-megapayer-emerald to-megapayer-teal rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CustomIcons.CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h3 className="text-3xl font-bold text-megapayer-text mb-4 font-heading">
            Quiz Completed! 🎉
          </h3>
          
          <p className="text-lg text-megapayer-muted mb-8">
            Excellent! You've successfully verified your seed phrase backup. Your wallet is now secure and ready to use.
          </p>

          <div className="megapayer-panel-soft rounded-xl p-6 mb-8">
            <h4 className="font-semibold text-megapayer-text mb-3">What you've accomplished:</h4>
            <div className="space-y-2 text-sm text-megapayer-muted">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-megapayer-emerald rounded-full"></div>
                <span>Written down your 24-word seed phrase</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-megapayer-emerald rounded-full"></div>
                <span>Verified your backup by completing the quiz</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-megapayer-emerald rounded-full"></div>
                <span>Secured your wallet with proper backup</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="w-full megapayer-btn-primary py-4 px-6 rounded-xl text-lg font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
          >
            Continue to Password Setup
          </button>
        </div>
      )}
    </div>
  );
}
