'use client';

import React from 'react';

interface SetupLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const SetupLayout: React.FC<SetupLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-megapayer-text mb-4 font-heading">{title}</h1>
          {subtitle && (
            <p className="text-lg text-megapayer-muted max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>
        <div className="animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
};
