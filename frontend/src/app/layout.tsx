import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import { brand, dealer } from '@suzuki/shared';
import { AssetPathStyles } from '@/components/layout/AssetPathStyles';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { RecaptchaScript } from '@/components/layout/RecaptchaScript';
import './globals.css';

const suzukiPro = localFont({
  src: [
    {
      path: '../../public/fonts/SuzukiPRORegular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/SuzukiPROBold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-suzuki-pro',
  display: 'swap',
});

const suzukiHeadline = localFont({
  src: '../../public/fonts/SuzukiPROHeadline.woff2',
  weight: '400',
  style: 'normal',
  variable: '--font-suzuki-headline',
  display: 'swap',
});

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
    <html lang="en" className={`h-full ${suzukiPro.variable} ${suzukiHeadline.variable}`}>
      <body className="flex min-h-full flex-col antialiased">
        <AssetPathStyles />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
        <RecaptchaScript />
      </body>
    </html>
  );
}
