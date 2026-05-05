import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import { Providers } from '@/lib/providers';
import { MobileWarning } from '@/components/MobileWarning';
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
  title: 'Ettios',
  description: 'Privacy-Centric Smart Wallet - Professional Web3 Portfolio Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${sora.variable} font-sans megapayer-bg`}>
        <Providers>
          <div className="min-h-screen">
            {children}
          </div>
        </Providers>
        <MobileWarning />
      </body>
    </html>
  );
}
