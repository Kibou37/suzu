import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { brand, dealer } from '@suzuki/shared';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${dealer.name} — Official ${brand.name} Dealer`,
    template: `%s | ${dealer.name}`,
  },
  description: `Official ${brand.name} dealer — ${dealer.name}. Browse models, configure your car, book a test drive and service.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
