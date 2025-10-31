import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import { Providers } from '@/lib/providers';
import DesktopLayout from '@/components/layout/DesktopLayout';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter'
});

const sora = Sora({ 
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-sora'
});

export const metadata: Metadata = {
  title: 'Megapayer Desktop',
  description: 'Megapayer Desktop Wallet - Secure Multi-Chain Crypto Wallet',
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
      <body className={`${inter.variable} ${sora.variable} font-sans megapayer-bg`}>
        <Providers>
          <DesktopLayout>
            {children}
          </DesktopLayout>
        </Providers>
      </body>
    </html>
  );
}
