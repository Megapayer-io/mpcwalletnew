'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Beautiful SVG Graphic for Success Page
const SuccessIcon = () => (
  <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34D399" />
        <stop offset="50%" stopColor="#22E1FF" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <filter id="glowSuccess">
        <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background Glow */}
    <circle cx="140" cy="140" r="130" fill="rgba(52, 211, 153, 0.1)" />
    
    {/* Success Circle */}
    <motion.circle
      cx="140"
      cy="140"
      r="70"
      fill="none"
      stroke="url(#successGradient)"
      strokeWidth="6"
      filter="url(#glowSuccess)"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
    />
    
    {/* Inner Circle */}
    <circle cx="140" cy="140" r="60" fill="rgba(52, 211, 153, 0.1)" />
    
    {/* Checkmark */}
    <motion.path
      d="M100 140 L125 165 L180 100"
      fill="none"
      stroke="url(#successGradient)"
      strokeWidth="8"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#glowSuccess)"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
    />
    
    {/* Floating Particles */}
    {[...Array(12)].map((_, i) => {
      const angle = (i * 30) * Math.PI / 180;
      const radius = 100;
      const x = 140 + Math.cos(angle) * radius;
      const y = 140 + Math.sin(angle) * radius;
      return (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="4"
          fill="#34D399"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            delay: 1.2 + i * 0.1,
            duration: 2,
            repeat: Infinity
          }}
        />
      );
    })}
    
    {/* Sparkles */}
    {[
      { x: 80, y: 80, angle: 45 },
      { x: 200, y: 80, angle: 135 },
      { x: 80, y: 200, angle: 225 },
      { x: 200, y: 200, angle: 315 }
    ].map((star, i) => (
      <motion.g
        key={i}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 + i * 0.2, type: "spring" }}
      >
        <path
          d={`M${star.x} ${star.y} L${star.x - 5} ${star.y - 5} M${star.x} ${star.y} L${star.x + 5} ${star.y - 5} M${star.x} ${star.y} L${star.x - 5} ${star.y + 5} M${star.x} ${star.y} L${star.x + 5} ${star.y + 5}`}
          stroke="#22E1FF"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </motion.g>
    ))}
  </svg>
);

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen megapayer-bg flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-20"
          style={{
            background: `linear-gradient(135deg, rgba(52,211,153,0.3), rgba(34,225,255,0.2))`
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
          <div className="flex-1">
            <div className="flex gap-1">
              <div className="flex-1 h-1 rounded-full bg-megapayer-teal"></div>
              <div className="flex-1 h-1 rounded-full bg-megapayer-teal"></div>
              <div className="flex-1 h-1 rounded-full bg-megapayer-teal"></div>
            </div>
          </div>
          <span className="text-sm font-body text-megapayer-muted">3/3</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="text-center max-w-md"
        >
          {/* Success Icon */}
          <div className="mb-8 flex justify-center">
            <SuccessIcon />
          </div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-bold font-heading bg-gradient-to-r from-megapayer-emerald via-megapayer-teal to-megapayer-violet bg-clip-text text-transparent mb-4"
          >
            Success!
          </motion.h1>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-4 text-left mb-8"
          >
            <p className="text-lg font-body text-megapayer-text">
              You've successfully protected your wallet. Remember to keep your seed phrase safe—it's your responsibility!
            </p>
            <p className="text-sm font-body text-megapayer-muted">
              This wallet cannot recover your wallet should you lose it. You can find your seed phrase in Settings &gt; Security &amp; Privacy.
            </p>
          </motion.div>

          {/* Next Button */}
          <motion.button
            onClick={() => router.push('/')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 megapayer-btn-primary rounded-2xl font-bold font-heading shadow-megapayer transition-all duration-300"
          >
            Get Started
          </motion.button>
          
          {/* Auto-redirect notice */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xs font-body text-megapayer-muted mt-4"
          >
            Redirecting automatically in 3 seconds...
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
