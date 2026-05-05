import type { Metadata } from 'next';
import { Providers } from '@/lib/providers';
import DesktopLayout from '@/components/layout/DesktopLayout';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ettios Desktop',
  description: 'Ettios Desktop Wallet - Secure Multi-Chain Crypto Wallet',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script src="/tauri-preload.js" strategy="beforeInteractive" />
      </head>
      <body className="font-sans megapayer-bg">
        <Providers>
          <DesktopLayout>
            {children}
          </DesktopLayout>
        </Providers>
      </body>
    </html>
  );
}
