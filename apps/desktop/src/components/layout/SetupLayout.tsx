'use client';

import React from 'react';

interface SetupLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const SetupLayout: React.FC<SetupLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center p-4">
      {/* Main Content */}
      <main className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-megapayer-text mb-2 font-heading">{title}</h1>
          {subtitle && (
            <p className="text-base text-megapayer-muted max-w-lg mx-auto">{subtitle}</p>
          )}
        </div>
        <div className="animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
};
