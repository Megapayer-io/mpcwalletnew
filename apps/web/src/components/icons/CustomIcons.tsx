'use client';

import React from 'react';

// Custom 3D Icons Component
export const CustomIcons = {
  // Eye with 3D effect
  Eye: ({ className = "w-5 h-5", show = true }: { className?: string; show?: boolean }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Eye shadow/background */}
        <ellipse cx="12" cy="12" rx="8" ry="5" fill="currentColor" opacity="0.1" />
        {/* Main eye */}
        <ellipse cx="12" cy="12" rx="8" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Eye pupil */}
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        {/* Eye highlight */}
        <circle cx="13" cy="11" r="0.5" fill="white" opacity="0.8" />
        {/* Eye lashes */}
        <path d="M4 8 Q6 6 8 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M20 8 Q18 6 16 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  ),

  // EyeOff with 3D effect
  EyeOff: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Eye shadow/background */}
        <ellipse cx="12" cy="12" rx="8" ry="5" fill="currentColor" opacity="0.1" />
        {/* Main eye */}
        <ellipse cx="12" cy="12" rx="8" ry="5" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Diagonal line through eye */}
        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        {/* Eye lashes */}
        <path d="M4 8 Q6 6 8 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M20 8 Q18 6 16 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  ),

  // Refresh with 3D effect
  Refresh: ({ className = "w-5 h-5", spinning = false }: { className?: string; spinning?: boolean }) => (
    <div className={`relative ${className} ${spinning ? 'animate-spin' : ''}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Outer ring shadow */}
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
        {/* Main refresh circle */}
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Refresh arrow */}
        <path d="M8 12 L12 8 L16 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 12 L12 16 L8 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Inner highlight */}
        <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  ),

  // Wallet with 3D effect
  Wallet: ({ className = "w-6 h-6" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Wallet shadow */}
        <rect x="3" y="6" width="18" height="12" rx="2" fill="currentColor" opacity="0.1" />
        {/* Main wallet */}
        <rect x="3" y="6" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Wallet fold */}
        <rect x="3" y="6" width="18" height="4" rx="2" fill="currentColor" opacity="0.2" />
        {/* Credit card */}
        <rect x="6" y="9" width="12" height="6" rx="1" fill="currentColor" opacity="0.3" />
        {/* Card chip */}
        <rect x="8" y="11" width="2" height="2" rx="0.5" fill="currentColor" />
        {/* Card lines */}
        <line x1="11" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="0.5" />
        <line x1="11" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="0.5" />
      </svg>
    </div>
  ),

  // Shield with 3D effect
  Shield: ({ className = "w-6 h-6", secured = true }: { className?: string; secured?: boolean }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Shield shadow */}
        <path d="M12 2 L4 6 L4 12 C4 16.5 8 20 12 22 C16 20 20 16.5 20 12 L20 6 L12 2 Z" fill="currentColor" opacity="0.1" />
        {/* Main shield */}
        <path d="M12 2 L4 6 L4 12 C4 16.5 8 20 12 22 C16 20 20 16.5 20 12 L20 6 L12 2 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Shield inner pattern */}
        <path d="M8 10 L10 12 L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {/* Shield highlight */}
        <path d="M12 2 L4 6 L4 8 L12 4 L20 8 L20 6 L12 2 Z" fill="currentColor" opacity="0.2" />
      </svg>
    </div>
  ),

  // Zap/Lightning with 3D effect
  Zap: ({ className = "w-6 h-6" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Lightning shadow */}
        <path d="M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 L13 2 Z" fill="currentColor" opacity="0.1" />
        {/* Main lightning */}
        <path d="M13 2 L3 14 L12 14 L11 22 L21 10 L12 10 L13 2 Z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
        {/* Lightning highlight */}
        <path d="M13 4 L5 14 L12 14 L11 20 L19 10 L12 10 L13 4 Z" fill="white" opacity="0.3" />
      </svg>
    </div>
  ),

  // Clock with 3D effect
  Clock: ({ className = "w-4 h-4" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Clock shadow */}
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
        {/* Main clock */}
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Clock hands */}
        <line x1="12" y1="12" x2="12" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Center dot */}
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        {/* Clock highlight */}
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  ),

  // Send/Arrow with 3D effect
  Send: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Arrow shadow */}
        <path d="M2 12 L22 2 L17 12 L22 22 L2 12 Z" fill="currentColor" opacity="0.1" />
        {/* Main arrow */}
        <path d="M2 12 L22 2 L17 12 L22 22 L2 12 Z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
        {/* Arrow highlight */}
        <path d="M4 12 L20 4 L16 12 L20 20 L4 12 Z" fill="white" opacity="0.3" />
      </svg>
    </div>
  ),

  // Receive/Download with 3D effect
  Download: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Download shadow */}
        <path d="M12 2 L12 16 M6 10 L12 16 L18 10" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="16" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Main download */}
        <path d="M12 2 L12 16 M6 10 L12 16 L18 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="12" y1="16" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Download highlight */}
        <path d="M12 4 L12 14 M8 12 L12 14 L16 12" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      </svg>
    </div>
  ),

  // History with 3D effect
  History: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Clock shadow */}
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
        {/* Main clock */}
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Clock hands */}
        <line x1="12" y1="12" x2="12" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Center dot */}
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        {/* History lines */}
        <path d="M2 2 L6 6 M18 2 L22 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M2 22 L6 18 M18 22 L22 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  ),

  // Globe with 3D effect
  Globe: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Globe shadow */}
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
        {/* Main globe */}
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Globe lines */}
        <path d="M2 12 C2 12 6 8 12 8 C18 8 22 12 22 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M2 12 C2 12 6 16 12 16 C18 16 22 12 22 12" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" />
        {/* Globe highlight */}
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  ),

  // Image/NFT with 3D effect
  Image: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Image shadow */}
        <rect x="3" y="3" width="18" height="18" rx="2" fill="currentColor" opacity="0.1" />
        {/* Main image frame */}
        <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Image content */}
        <rect x="6" y="6" width="12" height="12" rx="1" fill="currentColor" opacity="0.2" />
        {/* Image mountain */}
        <path d="M8 12 L10 8 L12 10 L14 6 L16 12 L16 18 L8 18 Z" fill="currentColor" opacity="0.4" />
        {/* Image sun */}
        <circle cx="16" cy="8" r="2" fill="currentColor" opacity="0.6" />
      </svg>
    </div>
  ),

  // Settings with 3D effect
  Settings: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Gear shadow */}
        <circle cx="12" cy="12" r="8" fill="currentColor" opacity="0.1" />
        {/* Main gear */}
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Gear teeth */}
        <rect x="10" y="2" width="4" height="3" fill="currentColor" />
        <rect x="19" y="10" width="3" height="4" fill="currentColor" />
        <rect x="10" y="19" width="4" height="3" fill="currentColor" />
        <rect x="2" y="10" width="3" height="4" fill="currentColor" />
        {/* Center hole */}
        <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3" />
        {/* Gear highlight */}
        <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  ),

  // User with 3D effect
  User: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* User shadow */}
        <circle cx="12" cy="8" r="5" fill="currentColor" opacity="0.1" />
        <path d="M2 22 C2 17 6 13 12 13 C18 13 22 17 22 22" fill="currentColor" opacity="0.1" />
        {/* Main user */}
        <circle cx="12" cy="8" r="5" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M2 22 C2 17 6 13 12 13 C18 13 22 17 22 22" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* User highlight */}
        <circle cx="12" cy="8" r="3" fill="currentColor" opacity="0.2" />
      </svg>
    </div>
  ),

  // Bell with 3D effect
  Bell: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Bell shadow */}
        <path d="M12 2 C8 2 5 5 5 9 C5 14 3 16 3 18 H21 C21 16 19 14 19 9 C19 5 16 2 12 2 Z" fill="currentColor" opacity="0.1" />
        {/* Main bell */}
        <path d="M12 2 C8 2 5 5 5 9 C5 14 3 16 3 18 H21 C21 16 19 14 19 9 C19 5 16 2 12 2 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Bell clapper */}
        <circle cx="12" cy="20" r="1" fill="currentColor" />
        {/* Bell highlight */}
        <path d="M12 4 C9 4 7 6 7 9 C7 12 6 14 6 16 H18 C18 14 17 12 17 9 C17 6 15 4 12 4 Z" fill="currentColor" opacity="0.2" />
      </svg>
    </div>
  ),

  // TrendingUp with 3D effect
  TrendingUp: ({ className = "w-4 h-4" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Chart shadow */}
        <path d="M3 17 L9 11 L13 15 L21 7" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Main chart */}
        <path d="M3 17 L9 11 L13 15 L21 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Chart points */}
        <circle cx="3" cy="17" r="2" fill="currentColor" />
        <circle cx="9" cy="11" r="2" fill="currentColor" />
        <circle cx="13" cy="15" r="2" fill="currentColor" />
        <circle cx="21" cy="7" r="2" fill="currentColor" />
        {/* Chart highlight */}
        <path d="M3 17 L9 11 L13 15 L21 7" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      </svg>
    </div>
  ),

  // TrendingDown with 3D effect
  TrendingDown: ({ className = "w-4 h-4" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Chart shadow */}
        <path d="M3 7 L9 13 L13 9 L21 17" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Main chart */}
        <path d="M3 7 L9 13 L13 9 L21 17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Chart points */}
        <circle cx="3" cy="7" r="2" fill="currentColor" />
        <circle cx="9" cy="13" r="2" fill="currentColor" />
        <circle cx="13" cy="9" r="2" fill="currentColor" />
        <circle cx="21" cy="17" r="2" fill="currentColor" />
        {/* Chart highlight */}
        <path d="M3 7 L9 13 L13 9 L21 17" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      </svg>
    </div>
  ),

  // Plus with 3D effect
  Plus: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Plus shadow */}
        <rect x="10" y="2" width="4" height="20" fill="currentColor" opacity="0.1" />
        <rect x="2" y="10" width="20" height="4" fill="currentColor" opacity="0.1" />
        {/* Main plus */}
        <rect x="10" y="2" width="4" height="20" fill="currentColor" />
        <rect x="2" y="10" width="20" height="4" fill="currentColor" />
        {/* Plus highlight */}
        <rect x="11" y="3" width="2" height="18" fill="white" opacity="0.3" />
        <rect x="3" y="11" width="18" height="2" fill="white" opacity="0.3" />
      </svg>
    </div>
  ),

  // Star with 3D effect
  Star: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Star shadow */}
        <path d="M12 2 L15 9 L22 9 L17 14 L19 21 L12 17 L5 21 L7 14 L2 9 L9 9 L12 2 Z" fill="currentColor" opacity="0.1" />
        {/* Main star */}
        <path d="M12 2 L15 9 L22 9 L17 14 L19 21 L12 17 L5 21 L7 14 L2 9 L9 9 L12 2 Z" fill="currentColor" stroke="currentColor" strokeWidth="1" />
        {/* Star highlight */}
        <path d="M12 4 L14 9 L18 9 L15 12 L16 17 L12 15 L8 17 L9 12 L6 9 L10 9 L12 4 Z" fill="white" opacity="0.3" />
      </svg>
    </div>
  ),

  // PieChart with 3D effect
  PieChart: ({ className = "w-6 h-6" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Chart shadow */}
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
        {/* Main chart */}
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Chart segments */}
        <path d="M12 2 A10 10 0 0 1 22 12 L12 12 Z" fill="currentColor" opacity="0.3" />
        <path d="M12 2 A10 10 0 0 0 2 12 L12 12 Z" fill="currentColor" opacity="0.2" />
        {/* Chart highlight */}
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  ),

  // BarChart with 3D effect
  BarChart: ({ className = "w-6 h-6" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Chart shadow */}
        <rect x="2" y="4" width="3" height="16" fill="currentColor" opacity="0.1" />
        <rect x="7" y="8" width="3" height="12" fill="currentColor" opacity="0.1" />
        <rect x="12" y="6" width="3" height="14" fill="currentColor" opacity="0.1" />
        <rect x="17" y="10" width="3" height="10" fill="currentColor" opacity="0.1" />
        {/* Main chart */}
        <rect x="2" y="4" width="3" height="16" fill="currentColor" />
        <rect x="7" y="8" width="3" height="12" fill="currentColor" />
        <rect x="12" y="6" width="3" height="14" fill="currentColor" />
        <rect x="17" y="10" width="3" height="10" fill="currentColor" />
        {/* Chart highlight */}
        <rect x="2" y="4" width="1" height="16" fill="white" opacity="0.3" />
        <rect x="7" y="8" width="1" height="12" fill="white" opacity="0.3" />
        <rect x="12" y="6" width="1" height="14" fill="white" opacity="0.3" />
        <rect x="17" y="10" width="1" height="10" fill="white" opacity="0.3" />
      </svg>
    </div>
  ),

  // ExternalLink with 3D effect
  ExternalLink: ({ className = "w-4 h-4" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Link shadow */}
        <path d="M10 6 H6 A2 2 0 0 0 4 8 V18 A2 2 0 0 0 6 20 H16 A2 2 0 0 0 18 18 V14" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2 H20 V8" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 2 L22 8" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Main link */}
        <path d="M10 6 H6 A2 2 0 0 0 4 8 V18 A2 2 0 0 0 6 20 H16 A2 2 0 0 0 18 18 V14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2 H20 V8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 2 L22 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Link highlight */}
        <path d="M10 6 H6 A2 2 0 0 0 4 8 V18 A2 2 0 0 0 6 20 H16 A2 2 0 0 0 18 18 V14" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      </svg>
    </div>
  ),

  // Copy with 3D effect
  Copy: ({ className = "w-4 h-4" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Copy shadow */}
        <rect x="9" y="9" width="13" height="13" rx="2" fill="currentColor" opacity="0.1" />
        <rect x="2" y="2" width="13" height="13" rx="2" fill="currentColor" opacity="0.1" />
        {/* Main copy */}
        <rect x="9" y="9" width="13" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <rect x="2" y="2" width="13" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Copy highlight */}
        <rect x="9" y="9" width="11" height="11" rx="1" fill="currentColor" opacity="0.2" />
        <rect x="2" y="2" width="11" height="11" rx="1" fill="currentColor" opacity="0.2" />
      </svg>
    </div>
  ),

  // CheckCircle with 3D effect
  CheckCircle: ({ className = "w-4 h-4" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Circle shadow */}
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
        {/* Main circle */}
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Check mark */}
        <path d="M9 12 L11 14 L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Circle highlight */}
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  ),

  // AlertTriangle with 3D effect
  AlertTriangle: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Triangle shadow */}
        <path d="M12 2 L22 20 H2 L12 2 Z" fill="currentColor" opacity="0.1" />
        {/* Main triangle */}
        <path d="M12 2 L22 20 H2 L12 2 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Exclamation mark */}
        <line x1="12" y1="8" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1" fill="currentColor" />
        {/* Triangle highlight */}
        <path d="M12 4 L20 18 H4 L12 4 Z" fill="currentColor" opacity="0.2" />
      </svg>
    </div>
  ),

  // Info with 3D effect
  Info: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Circle shadow */}
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
        {/* Main circle */}
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Info mark */}
        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1" fill="currentColor" />
        {/* Circle highlight */}
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  ),

  // ChevronLeft with 3D effect
  ChevronLeft: ({ className = "w-4 h-4" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Chevron shadow */}
        <path d="M15 18 L9 12 L15 6" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Main chevron */}
        <path d="M15 18 L9 12 L15 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Chevron highlight */}
        <path d="M14 18 L10 12 L14 6" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      </svg>
    </div>
  ),

  // ChevronRight with 3D effect
  ChevronRight: ({ className = "w-4 h-4" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Chevron shadow */}
        <path d="M9 18 L15 12 L9 6" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Main chevron */}
        <path d="M9 18 L15 12 L9 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Chevron highlight */}
        <path d="M10 18 L14 12 L10 6" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      </svg>
    </div>
  ),

  // Menu with 3D effect
  Menu: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Menu shadow */}
        <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Main menu */}
        <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Menu highlight */}
        <line x1="3" y1="6" x2="21" y2="6" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        <line x1="3" y1="12" x2="21" y2="12" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        <line x1="3" y1="18" x2="21" y2="18" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      </svg>
    </div>
  ),

  // X with 3D effect
  X: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* X shadow */}
        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Main X */}
        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* X highlight */}
        <line x1="17" y1="7" x2="7" y2="17" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        <line x1="7" y1="7" x2="17" y2="17" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
      </svg>
    </div>
  ),

  // LogOut with 3D effect
  LogOut: ({ className = "w-4 h-4" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Logout shadow */}
        <path d="M9 21 H5 A2 2 0 0 1 3 19 V5 A2 2 0 0 1 5 3 H9" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="16,17 21,12 16,7" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Main logout */}
        <path d="M9 21 H5 A2 2 0 0 1 3 19 V5 A2 2 0 0 1 5 3 H9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="16,17 21,12 16,7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Logout highlight */}
        <path d="M9 21 H5 A2 2 0 0 1 3 19 V5 A2 2 0 0 1 5 3 H9" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      </svg>
    </div>
  ),

  // HelpCircle with 3D effect
  HelpCircle: ({ className = "w-4 h-4" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Circle shadow */}
        <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
        {/* Main circle */}
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Question mark */}
        <path d="M9 9 C9 7 10 6 12 6 C14 6 15 7 15 9 C15 11 12 12 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="17" r="1" fill="currentColor" />
        {/* Circle highlight */}
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  ),

  // Search with 3D effect
  Search: ({ className = "w-4 h-4" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Search shadow */}
        <circle cx="11" cy="11" r="8" fill="currentColor" opacity="0.1" />
        <path d="M21 21 L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Main search */}
        <circle cx="11" cy="11" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M21 21 L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Search highlight */}
        <circle cx="11" cy="11" r="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  ),

  // ArrowUpRight with 3D effect
  ArrowUpRight: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Arrow shadow */}
        <line x1="7" y1="17" x2="17" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="7,7 17,7 17,17" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Main arrow */}
        <line x1="7" y1="17" x2="17" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="7,7 17,7 17,17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Arrow highlight */}
        <line x1="8" y1="16" x2="16" y2="8" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      </svg>
    </div>
  ),

  // Lock with 3D effect
  Lock: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Lock shadow */}
        <rect x="4" y="8" width="16" height="10" rx="2" fill="currentColor" opacity="0.1" />
        <path d="M7 8V6C7 3.79 8.79 2 11 2H13C15.21 2 17 3.79 17 6V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.1" />
        {/* Main lock */}
        <rect x="4" y="8" width="16" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M7 8V6C7 3.79 8.79 2 11 2H13C15.21 2 17 3.79 17 6V8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Lock highlight */}
        <rect x="5" y="9" width="14" height="8" rx="1" fill="currentColor" opacity="0.1" />
        <path d="M8 8V6C8 4.34 9.34 3 11 3H13C14.66 3 16 4.34 16 6V8" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      </svg>
    </div>
  ),

  // ChevronDown with 3D effect
  ChevronDown: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Chevron shadow */}
        <polyline points="6,9 12,15 18,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
        {/* Main chevron */}
        <polyline points="6,9 12,15 18,9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Chevron highlight */}
        <polyline points="7,10 12,14 17,10" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      </svg>
    </div>
  ),

  // ArrowDownLeft with 3D effect
  ArrowDownLeft: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Arrow shadow */}
        <line x1="17" y1="7" x2="7" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="17,17 7,17 7,7" fill="currentColor" opacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Main arrow */}
        <line x1="17" y1="7" x2="7" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="17,17 7,17 7,7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Arrow highlight */}
        <line x1="16" y1="8" x2="8" y2="16" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
      </svg>
    </div>
  ),

  // Trash2 with 3D effect
  Trash2: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Trash shadow */}
        <rect x="6" y="4" width="12" height="16" rx="1" fill="currentColor" opacity="0.1" />
        {/* Main trash can */}
        <rect x="6" y="4" width="12" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Trash lid */}
        <rect x="4" y="2" width="16" height="2" rx="1" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Trash handle */}
        <rect x="10" y="1" width="4" height="1" rx="0.5" fill="currentColor" />
        {/* Trash lines */}
        <line x1="8" y1="8" x2="8" y2="18" stroke="currentColor" strokeWidth="1.5" />
        <line x1="12" y1="8" x2="12" y2="18" stroke="currentColor" strokeWidth="1.5" />
        <line x1="16" y1="8" x2="16" y2="18" stroke="currentColor" strokeWidth="1.5" />
        {/* Trash highlight */}
        <rect x="7" y="5" width="10" height="14" rx="0.5" fill="white" opacity="0.1" />
      </svg>
    </div>
  ),

  // Key with 3D effect
  Key: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Key shadow */}
        <circle cx="12" cy="12" r="12" fill="currentColor" opacity="0.1" />
        {/* Key ring */}
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Key blade */}
        <rect x="15" y="10.5" width="6" height="3" rx="1.5" fill="currentColor" />
        {/* Key teeth */}
        <rect x="18" y="9" width="2" height="1" rx="0.5" fill="currentColor" />
        <rect x="19" y="13" width="2" height="1" rx="0.5" fill="currentColor" />
        {/* Key highlight */}
        <circle cx="12" cy="12" r="2" fill="white" opacity="0.2" />
        <rect x="15.5" y="11" width="5" height="2" rx="1" fill="white" opacity="0.1" />
      </svg>
    </div>
  ),

  // Share2 with 3D effect
  Share2: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Share shadow */}
        <circle cx="18" cy="5" r="3" fill="currentColor" opacity="0.1" />
        <circle cx="6" cy="12" r="3" fill="currentColor" opacity="0.1" />
        <circle cx="18" cy="19" r="3" fill="currentColor" opacity="0.1" />
        {/* Main circles */}
        <circle cx="18" cy="5" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="6" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="18" cy="19" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Connection lines */}
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* Highlights */}
        <circle cx="18" cy="5" r="2" fill="white" opacity="0.2" />
        <circle cx="6" cy="12" r="2" fill="white" opacity="0.2" />
        <circle cx="18" cy="19" r="2" fill="white" opacity="0.2" />
      </svg>
    </div>
  ),

  // QrCode with 3D effect
  QrCode: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* QR shadow */}
        <rect x="3" y="3" width="5" height="5" fill="currentColor" opacity="0.1" />
        <rect x="3" y="16" width="5" height="5" fill="currentColor" opacity="0.1" />
        <rect x="16" y="3" width="5" height="5" fill="currentColor" opacity="0.1" />
        {/* Main QR squares */}
        <rect x="3" y="3" width="5" height="5" fill="currentColor" />
        <rect x="3" y="16" width="5" height="5" fill="currentColor" />
        <rect x="16" y="3" width="5" height="5" fill="currentColor" />
        {/* QR patterns */}
        <rect x="4" y="4" width="1" height="1" fill="white" />
        <rect x="6" y="4" width="1" height="1" fill="white" />
        <rect x="4" y="6" width="1" height="1" fill="white" />
        <rect x="4" y="17" width="1" height="1" fill="white" />
        <rect x="6" y="17" width="1" height="1" fill="white" />
        <rect x="4" y="19" width="1" height="1" fill="white" />
        <rect x="17" y="4" width="1" height="1" fill="white" />
        <rect x="19" y="4" width="1" height="1" fill="white" />
        <rect x="17" y="6" width="1" height="1" fill="white" />
        {/* Connection lines */}
        <line x1="21" y1="16" x2="21" y2="19" stroke="currentColor" strokeWidth="1" />
        <line x1="16" y1="21" x2="19" y2="21" stroke="currentColor" strokeWidth="1" />
        <line x1="12" y1="7" x2="12" y2="10" stroke="currentColor" strokeWidth="1" />
        <line x1="7" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1" />
        <line x1="12" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1" />
        <line x1="12" y1="12" x2="12" y2="15" stroke="currentColor" strokeWidth="1" />
        <line x1="12" y1="12" x2="15" y2="12" stroke="currentColor" strokeWidth="1" />
        <line x1="12" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  ),

  // Mail with 3D effect
  Mail: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Mail shadow */}
        <rect x="2" y="4" width="20" height="16" rx="2" fill="currentColor" opacity="0.1" />
        {/* Main envelope */}
        <rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Mail flap */}
        <path d="M2 7l10 5L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Mail highlight */}
        <rect x="3" y="5" width="18" height="14" rx="1" fill="white" opacity="0.1" />
      </svg>
    </div>
  ),

  // MessageSquare with 3D effect
  MessageSquare: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Message shadow */}
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor" opacity="0.1" />
        {/* Main message bubble */}
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Message highlight */}
        <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7l-4 4V5z" fill="white" opacity="0.1" />
      </svg>
    </div>
  ),

  // Smartphone with 3D effect
  Smartphone: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* Phone shadow */}
        <rect x="5" y="2" width="14" height="20" rx="2" fill="currentColor" opacity="0.1" />
        {/* Main phone body */}
        <rect x="5" y="2" width="14" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        {/* Screen */}
        <rect x="7" y="4" width="10" height="14" rx="1" fill="currentColor" opacity="0.1" />
        {/* Home button */}
        <circle cx="12" cy="19" r="1" fill="currentColor" />
        {/* Phone highlight */}
        <rect x="6" y="3" width="12" height="18" rx="1" fill="white" opacity="0.1" />
      </svg>
    </div>
  ),

  // FileText with 3D effect
  FileText: ({ className = "w-5 h-5" }: { className?: string }) => (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        {/* File shadow */}
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" opacity="0.1" />
        {/* Main file */}
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* File fold */}
        <polyline points="14,2 14,8 20,8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* Text lines */}
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="9" x2="8" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        {/* File highlight */}
        <path d="M7 4h7l6 6v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill="white" opacity="0.1" />
      </svg>
    </div>
  )
};
