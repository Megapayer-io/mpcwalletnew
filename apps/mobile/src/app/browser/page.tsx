'use client';

import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Web3Browser } from '@/components/Web3Browser';

export default function BrowserPage() {
  return (
    <Layout title="DApp Browser" subtitle="Explore and interact with Web3 applications">
      <div className="h-[calc(100vh-200px)]">
        <Web3Browser className="h-full" />
      </div>
    </Layout>
  );
}