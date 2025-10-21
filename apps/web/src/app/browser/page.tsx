'use client';

import React from 'react';
import { Web3Browser } from '@/components/Web3Browser';

export default function BrowserPage() {
  return (
    <div className="min-h-screen">
      <Web3Browser className="h-screen" />
    </div>
  );
}