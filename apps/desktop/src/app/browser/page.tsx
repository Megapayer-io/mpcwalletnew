'use client';

import React from 'react';
import { Web3Browser } from '@/components/Web3Browser';

export default function BrowserPage() {
  return (
      <div className="h-[calc(100vh-200px)]">
        <Web3Browser className="h-full" />
      </div>
  );
}