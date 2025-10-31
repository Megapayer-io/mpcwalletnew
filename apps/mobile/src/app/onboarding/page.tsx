'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Beautiful Vector Graphics for Onboarding
const SecureWalletIcon = () => (
  <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="secureGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" stopOpacity="0.3" />
        <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#34D399" stopOpacity="0.3" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background Glow */}
    <circle cx="140" cy="140" r="120" fill="url(#secureGradient)" opacity="0.4" />
    
    {/* Shield Main Body */}
    <motion.path
      d="M140 50 L70 80 L70 140 C70 180 100 220 140 230 C180 220 210 180 210 140 L210 80 Z"
      fill="none"
      stroke="#22E1FF"
      strokeWidth="4"
      filter="url(#glow)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
    
    {/* Shield Inner Pattern */}
    <path d="M140 90 L100 110 L100 140 C100 165 120 185 140 190 C160 185 180 165 180 140 L180 110 Z" 
      fill="rgba(34, 225, 255, 0.1)" stroke="#22E1FF" strokeWidth="2" />
    
    {/* Lock Icon */}
    <motion.rect
      x="115" y="135" width="50" height="40" rx="4"
      fill="none"
      stroke="#7C3AED"
      strokeWidth="3"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
    />
    <motion.path
      d="M130 135 L130 115 C130 100 142 88 140 88 C138 88 150 100 150 115 L150 135"
      fill="none"
      stroke="#7C3AED"
      strokeWidth="3"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    />
    
    {/* Security Particles */}
    {[...Array(8)].map((_, i) => {
      const angle = (i * 45) * Math.PI / 180;
      const radius = 100;
      const x = 140 + Math.cos(angle) * radius;
      const y = 140 + Math.sin(angle) * radius;
      return (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="4"
          fill="#22E1FF"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.7] }}
          transition={{
            delay: 1 + i * 0.1,
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      );
    })}
  </svg>
);

const EvenWalletIcon = () => (
  <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="evmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="50%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <filter id="glowEVM">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background Glow */}
    <circle cx="140" cy="140" r="130" fill="rgba(124, 58, 237, 0.05)" />
    
    {/* Device/Mobile Phone */}
    <motion.rect
      x="80"
      y="80"
      width="120"
      height="160"
      rx="16"
      fill="none"
      stroke="url(#evmGradient)"
      strokeWidth="4"
      filter="url(#glowEVM)"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    />
    
    {/* Screen */}
    <rect x="88" y="100" width="104" height="132" rx="8" fill="rgba(0, 0, 0, 0.3)" />
    
    {/* Lock Icon - Local Storage */}
    <motion.g
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.5, type: "spring" }}
    >
      <circle cx="140" cy="160" r="28" fill="url(#evmGradient)" opacity="0.9" filter="url(#glowEVM)" />
      <rect x="125" y="165" width="30" height="25" rx="4" fill="none" stroke="white" strokeWidth="2.5" />
      <path d="M130 165 L130 155 C130 148 136 142 140 142 C144 142 150 148 150 155 L150 165" 
        fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
    </motion.g>
    
    {/* Keys Symbol */}
    <motion.g
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      <circle cx="120" cy="200" r="8" fill="none" stroke="#22E1FF" strokeWidth="2" />
      <path d="M128 200 L135 200" stroke="#22E1FF" strokeWidth="2" strokeLinecap="round" />
      <circle cx="160" cy="200" r="8" fill="none" stroke="#7C3AED" strokeWidth="2" />
      <path d="M152 200 L145 200" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
    </motion.g>
    
    {/* No Server/Cloud with X */}
    <motion.g
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.9, duration: 0.5 }}
    >
      {/* Cloud */}
      <path d="M180 60 Q190 50 200 50 Q210 50 215 58 Q220 55 225 58 Q230 55 235 60 Q240 65 240 70 Q245 70 245 75 Q240 80 235 75 Q230 80 220 75 Q215 80 205 75 Q200 80 190 75 Q185 80 180 75 Q175 70 180 60 Z"
        fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      {/* X Mark */}
      <path d="M185 65 L200 80 M200 65 L185 80" stroke="#FF7A45" strokeWidth="3" strokeLinecap="round" />
    </motion.g>
    
    {/* EVM Badge */}
    <motion.rect
      x="105"
      y="215"
      width="70"
      height="25"
      rx="12"
      fill="rgba(34, 225, 255, 0.2)"
      stroke="#22E1FF"
      strokeWidth="2"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.1, type: "spring" }}
    />
    <text x="140" y="230" textAnchor="middle" fill="#22E1FF" fontSize="11" fontWeight="bold">EVM</text>
    
    {/* Privacy Shield */}
    <motion.path
      d="M210 220 L235 205 L235 225 Q235 245 210 250 Q185 245 185 225 L185 205 Z"
      fill="none"
      stroke="#34D399"
      strokeWidth="2.5"
      opacity="0.7"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 1.2, duration: 0.8 }}
    />
    
    {/* Floating Privacy Particles */}
    {[...Array(12)].map((_, i) => {
      const angle = (i * 30) * Math.PI / 180;
      const radius = 105;
      const x = 140 + Math.cos(angle) * radius;
      const y = 140 + Math.sin(angle) * radius;
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
            delay: 1.4 + i * 0.1,
            duration: 2.5,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

const CustomNetworksIcon = () => (
  <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="networkGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="100%" stopColor="#4fd1ff" />
      </linearGradient>
      <linearGradient id="networkGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#a78bfa" />
      </linearGradient>
      <linearGradient id="networkGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF7A45" />
        <stop offset="100%" stopColor="#fb923c" />
      </linearGradient>
      <filter id="glowNetwork">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background */}
    <circle cx="140" cy="140" r="130" fill="rgba(124, 58, 237, 0.05)" />
    
    {/* Network Nodes */}
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Node 1 */}
      <circle cx="100" cy="100" r="30" fill="url(#networkGradient1)" opacity="0.8" filter="url(#glowNetwork)" />
      <circle cx="100" cy="100" r="25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <text x="100" y="107" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">EVM</text>
      
      {/* Node 2 */}
      <circle cx="180" cy="100" r="30" fill="url(#networkGradient2)" opacity="0.8" filter="url(#glowNetwork)" />
      <circle cx="180" cy="100" r="25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <text x="180" y="107" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">RPC</text>
      
      {/* Node 3 */}
      <circle cx="140" cy="180" r="30" fill="url(#networkGradient3)" opacity="0.8" filter="url(#glowNetwork)" />
      <circle cx="140" cy="180" r="25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
      <text x="140" y="187" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">L2</text>
    </motion.g>
    
    {/* Connection Lines */}
    <motion.path
      d="M130 100 L150 100"
      stroke="url(#networkGradient1)"
      strokeWidth="3"
      strokeDasharray="4,4"
      fill="none"
      opacity="0.6"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.5, duration: 1 }}
    />
    <motion.path
      d="M120 120 L135 165"
      stroke="url(#networkGradient2)"
      strokeWidth="3"
      strokeDasharray="4,4"
      fill="none"
      opacity="0.6"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.7, duration: 1 }}
    />
    <motion.path
      d="M160 120 L145 165"
      stroke="url(#networkGradient3)"
      strokeWidth="3"
      strokeDasharray="4,4"
      fill="none"
      opacity="0.6"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.9, duration: 1 }}
    />
    
    {/* Custom Network Badges */}
    {[
      { x: 70, y: 140, label: '+', color: '#22E1FF' },
      { x: 210, y: 140, label: '+', color: '#7C3AED' }
    ].map((badge, i) => (
      <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.1 + i * 0.2, type: "spring" }}>
        <rect x={badge.x - 15} y={badge.y - 15} width="30" height="30" rx="6" 
          fill={`rgba(${badge.color === '#22E1FF' ? '34,225,255' : '124,58,237'}, 0.2)`} 
          stroke={badge.color} strokeWidth="2" />
        <text x={badge.x} y={badge.y + 5} textAnchor="middle" fill={badge.color} fontSize="18" fontWeight="bold">{badge.label}</text>
      </motion.g>
    ))}
    
    {/* Floating Particles */}
    {[...Array(15)].map((_, i) => {
      const angle = (i * 24) * Math.PI / 180;
      const radius = 110;
      const x = 140 + Math.cos(angle) * radius;
      const y = 140 + Math.sin(angle) * radius;
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
            delay: 1.3 + i * 0.08,
            duration: 2.5,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

const CustomTokensIcon = () => (
  <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="tokenGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <linearGradient id="tokenGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF7A45" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <filter id="glowToken">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background */}
    <circle cx="140" cy="140" r="130" fill="rgba(255, 122, 69, 0.05)" />
    
    {/* Token Coins */}
    {[
      { x: 100, y: 110, size: 35, gradient: 'tokenGradient1', label: 'ERC20', color: '#22E1FF' },
      { x: 180, y: 110, size: 35, gradient: 'tokenGradient2', label: 'BEP20', color: '#FF7A45' },
      { x: 140, y: 170, size: 35, gradient: 'tokenGradient1', label: 'TRC20', color: '#7C3AED' }
    ].map((token, i) => (
      <motion.g key={i} initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.2, type: "spring" }}>
        <circle cx={token.x} cy={token.y} r={token.size} fill={`url(#${token.gradient})`} opacity="0.9" filter="url(#glowToken)" />
        <circle cx={token.x} cy={token.y} r={token.size - 5} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
        <text x={token.x} y={token.y + 5} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{token.label}</text>
      </motion.g>
    ))}
    
    {/* Plus Icon for Custom */}
    <motion.g
      initial={{ scale: 0, rotate: -90 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
    >
      <circle cx="140" cy="80" r="20" fill="rgba(52, 211, 153, 0.2)" stroke="#34D399" strokeWidth="2.5" />
      <path d="M140 70 L140 90 M130 80 L150 80" stroke="#34D399" strokeWidth="3" strokeLinecap="round" />
    </motion.g>
    
    {/* Connection Lines */}
    <motion.path
      d="M135 110 L145 80"
      stroke="#34D399"
      strokeWidth="2"
      strokeDasharray="3,3"
      fill="none"
      opacity="0.5"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 1.2, duration: 0.8 }}
    />
    <motion.path
      d="M145 110 L135 80"
      stroke="#34D399"
      strokeWidth="2"
      strokeDasharray="3,3"
      fill="none"
      opacity="0.5"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 1.3, duration: 0.8 }}
    />
    
    {/* Floating Currency Symbols */}
    {[
      { x: 70, y: 140, symbol: '$', color: '#22E1FF' },
      { x: 210, y: 140, symbol: '₿', color: '#FF7A45' },
      { x: 140, y: 220, symbol: 'Ξ', color: '#7C3AED' }
    ].map((symbol, i) => (
      <motion.text
        key={i}
        x={symbol.x}
        y={symbol.y}
        textAnchor="middle"
        fill={symbol.color}
        fontSize="24"
        fontWeight="bold"
        opacity="0.7"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.7, scale: 1 }}
        transition={{
          delay: 1.4 + i * 0.15,
          type: "spring"
        }}
      >
        {symbol.symbol}
      </motion.text>
    ))}
    
    {/* Floating Particles */}
    {[...Array(12)].map((_, i) => {
      const angle = (i * 30) * Math.PI / 180;
      const radius = 105;
      const x = 140 + Math.cos(angle) * radius;
      const y = 140 + Math.sin(angle) * radius;
      return (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r="3"
          fill="#FF7A45"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1.2, 0.5]
          }}
          transition={{
            delay: 1.6 + i * 0.1,
            duration: 2.5,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

const NFTsIcon = () => (
  <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="nftGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22E1FF" />
        <stop offset="100%" stopColor="#7C3AED" />
      </linearGradient>
      <linearGradient id="nftGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF7A45" />
        <stop offset="100%" stopColor="#34D399" />
      </linearGradient>
      <filter id="glowNFT">
        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    {/* Background */}
    <circle cx="140" cy="140" r="130" fill="rgba(34, 211, 153, 0.05)" />
    
    {/* NFT Cards */}
    {[
      { x: 90, y: 100, width: 50, height: 65, gradient: 'nftGradient1', pattern: 'diamond' },
      { x: 155, y: 100, width: 50, height: 65, gradient: 'nftGradient2', pattern: 'circle' },
      { x: 122.5, y: 175, width: 50, height: 65, gradient: 'nftGradient1', pattern: 'hexagon' }
    ].map((nft, i) => (
      <motion.g key={i} initial={{ opacity: 0, y: 20, rotate: -5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: 0.3 + i * 0.2, type: "spring" }}>
        {/* Card */}
        <rect x={nft.x} y={nft.y} width={nft.width} height={nft.height} rx="8" 
          fill={`url(#${nft.gradient})`} opacity="0.9" filter="url(#glowNFT)" />
        <rect x={nft.x + 3} y={nft.y + 3} width={nft.width - 6} height={nft.height - 6} rx="5" 
          fill="rgba(0,0,0,0.3)" />
        
        {/* Pattern inside */}
        {nft.pattern === 'diamond' && (
          <path d={`M${nft.x + nft.width/2} ${nft.y + 15} L${nft.x + 15} ${nft.y + nft.height/2} L${nft.x + nft.width/2} ${nft.y + nft.height - 15} L${nft.x + nft.width - 15} ${nft.y + nft.height/2} Z`}
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        )}
        {nft.pattern === 'circle' && (
          <circle cx={nft.x + nft.width/2} cy={nft.y + nft.height/2} r="12" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        )}
        {nft.pattern === 'hexagon' && (
          <path d={`M${nft.x + nft.width/2} ${nft.y + 20} L${nft.x + 20} ${nft.y + 30} L${nft.x + 20} ${nft.y + nft.height - 30} L${nft.x + nft.width/2} ${nft.y + nft.height - 20} L${nft.x + nft.width - 20} ${nft.y + nft.height - 30} L${nft.x + nft.width - 20} ${nft.y + 30} Z`}
            fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        )}
        
        {/* ID Badge */}
        <rect x={nft.x + 5} y={nft.y + nft.height - 15} width={nft.width - 10} height="10" rx="2" fill="rgba(0,0,0,0.5)" />
        <text x={nft.x + nft.width/2} y={nft.y + nft.height - 7} textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">#{i + 1}</text>
      </motion.g>
    ))}
    
    {/* Collection Icon */}
    <motion.g
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
    >
      <rect x="115" y="50" width="50" height="35" rx="6" fill="rgba(124, 58, 237, 0.3)" stroke="#7C3AED" strokeWidth="2" />
      <text x="140" y="72" textAnchor="middle" fill="#7C3AED" fontSize="14" fontWeight="bold">NFT</text>
    </motion.g>
    
    {/* Connection Lines to Collection */}
    {[
      { from: { x: 115, y: 85 }, to: { x: 115, y: 100 } },
      { from: { x: 165, y: 85 }, to: { x: 180, y: 100 } },
      { from: { x: 140, y: 85 }, to: { x: 147.5, y: 175 } }
    ].map((line, i) => (
      <motion.line
        key={i}
        x1={line.from.x}
        y1={line.from.y}
        x2={line.to.x}
        y2={line.to.y}
        stroke="#34D399"
        strokeWidth="2"
        strokeDasharray="3,3"
        opacity="0.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 1.2 + i * 0.1, duration: 0.6 }}
      />
    ))}
    
    {/* Floating Stars */}
    {[...Array(10)].map((_, i) => {
      const angle = (i * 36) * Math.PI / 180;
      const radius = 115;
      const x = 140 + Math.cos(angle) * radius;
      const y = 140 + Math.sin(angle) * radius;
      return (
        <motion.path
          key={i}
          d={`M${x} ${y - 3} L${x - 1} ${y + 1} L${x + 1} ${y + 1} Z M${x - 3} ${y} L${x + 1} ${y - 1} L${x + 1} ${y + 1} Z M${x + 3} ${y} L${x - 1} ${y - 1} L${x - 1} ${y + 1} Z`}
          fill="#34D399"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.2, 0],
            rotate: [0, 180, 360]
          }}
          transition={{
            delay: 1.5 + i * 0.1,
            duration: 3,
            repeat: Infinity
          }}
        />
      );
    })}
  </svg>
);

const onboardingSteps = [
  {
    title: 'Secure & Protected',
    subtitle: 'Your Digital Assets',
    description: 'Advanced encryption and security protocols protect your funds. Your keys, your crypto—fully under your control.',
    icon: SecureWalletIcon,
    gradient: 'from-cyan-400 via-blue-500 to-purple-600'
  },
  {
    title: 'EVM Wallet',
    subtitle: 'Local & Private',
    description: 'A fully EVM-compatible wallet. All your keys and data are stored locally on your device—nothing goes to any server. Complete privacy and control.',
    icon: EvenWalletIcon,
    gradient: 'from-purple-500 via-indigo-500 to-teal-500'
  },
  {
    title: 'Custom Networks',
    subtitle: 'Connect Any Chain',
    description: 'Add and configure custom networks easily. Support for EVM-compatible chains, custom RPC endpoints, and Layer 2 solutions.',
    icon: CustomNetworksIcon,
    gradient: 'from-violet-500 via-purple-500 to-pink-500'
  },
  {
    title: 'Custom Tokens',
    subtitle: 'Full Control',
    description: 'Import any ERC20, BEP20, TRC20, or custom token. Track balances, view details, and manage your entire token portfolio.',
    icon: CustomTokensIcon,
    gradient: 'from-orange-500 via-red-500 to-emerald-500'
  },
  {
    title: 'NFT Collection',
    subtitle: 'Collect & Manage',
    description: 'View, organize, and manage your NFT collection all in one place. Track your digital art, collectibles, and assets.',
    icon: NFTsIcon,
    gradient: 'from-teal-400 via-cyan-500 to-emerald-500'
  }
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('hasSeenOnboarding', 'true');
      router.push('/setup');
    }
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    router.push('/setup');
  };

  const handleDotClick = (index: number) => {
    setCurrentStep(index);
  };

  const currentSlide = onboardingSteps[currentStep];
  const IconComponent = currentSlide.icon;

  return (
    <div className="min-h-screen megapayer-bg flex flex-col relative overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full blur-3xl opacity-20"
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
        <motion.div
          className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full blur-3xl opacity-20"
          style={{
            background: `linear-gradient(135deg, rgba(124,58,237,0.3), rgba(52,211,153,0.2))`
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgb(34,225,255) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Skip Button */}
      <div className="absolute top-8 right-6 z-20">
        <motion.button
          onClick={handleSkip}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2.5 text-sm font-semibold font-heading text-megapayer-muted hover:text-megapayer-text transition-colors 
                     megapayer-panel-soft border border-megapayer-border rounded-xl backdrop-blur-sm"
        >
          Skip
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-8 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-md mx-auto text-center space-y-8"
          >
            {/* Vector Graphics Container */}
            <div className="mb-6 flex items-center justify-center">
              <motion.div
                key={`icon-${currentStep}`}
                initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative"
              >
                {/* Glow Effect Behind Icon */}
                <div className="absolute inset-0 blur-2xl opacity-30"
                  style={{
                    background: currentSlide.gradient.includes('cyan') || currentSlide.gradient.includes('teal')
                      ? 'radial-gradient(circle, rgba(34,225,255,0.4), transparent)'
                      : currentSlide.gradient.includes('purple') || currentSlide.gradient.includes('violet')
                      ? 'radial-gradient(circle, rgba(124,58,237,0.4), transparent)'
                      : 'radial-gradient(circle, rgba(52,211,153,0.4), transparent)'
                  }}
                />
                <div className="relative">
                  <IconComponent />
              </div>
              </motion.div>
            </div>

            {/* Title Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="space-y-3"
            >
              <h1 className="text-4xl font-bold font-heading text-megapayer-text tracking-tight">
                {currentSlide.title}
              </h1>
              <h2 className="text-3xl font-bold font-heading bg-gradient-to-r from-megapayer-teal via-megapayer-violet to-megapayer-emerald 
                            bg-clip-text text-transparent">
                {currentSlide.subtitle}
              </h2>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-lg text-megapayer-muted px-4 leading-relaxed font-body max-w-sm mx-auto"
            >
              {currentSlide.description}
            </motion.p>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-3 pt-4">
              {onboardingSteps.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                  aria-label={`Go to step ${index + 1}`}
                >
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      index === currentStep
                        ? 'w-10 h-2 bg-gradient-to-r from-megapayer-teal via-megapayer-violet to-megapayer-emerald'
                        : 'w-2 h-2 bg-megapayer-muted/40'
                    }`}
                  />
                  {index === currentStep && (
                    <motion.div
                      layoutId="activeDot"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-megapayer-teal via-megapayer-violet to-megapayer-emerald"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA Section */}
      <div className="pb-8 px-6 relative z-10">
        <motion.button
          onClick={handleNext}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full px-6 py-4 megapayer-btn-primary rounded-2xl font-bold font-heading text-base
                     shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
        >
          {/* Button Shine Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {currentStep < onboardingSteps.length - 1 ? (
              <>
                Continue
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              <>
                Get Started
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </span>
        </motion.button>

        {/* Progress Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs font-body text-megapayer-muted">
            Step {currentStep + 1} of {onboardingSteps.length}
          </span>
        </div>
      </div>
    </div>
  );
}
