import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
import { brand, dealer } from '@suzuki/shared';
import { AppProviders } from '@/components/providers/AppProviders';
import { AssetPathStyles } from '@/components/layout/AssetPathStyles';
import { Analytics } from '@/components/layout/Analytics';
import { CookieBanner } from '@/components/layout/CookieBanner';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { RecaptchaScript } from '@/components/layout/RecaptchaScript';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { dealerJsonLd, safeJsonLdStringify } from '@/lib/json-ld';
import { absoluteUrl, defaultOpenGraph, defaultTwitter, getSiteUrl } from '@/lib/seo';
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
  // Headline is used in headings only — skip global preload to avoid console warnings.
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${dealer.name} — Official ${brand.name} Dealer`,
    template: `%s | ${dealer.name}`,
  },
  description: `Official ${brand.name} dealer — ${dealer.name}. Browse models, configure your car, book a test drive and service.`,
  alternates: {
    canonical: absoluteUrl('/'),
  },
  openGraph: defaultOpenGraph,
  twitter: defaultTwitter,
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const jsonLd = dealerJsonLd();

  return (
    <html lang="en" className={`h-full ${suzukiPro.variable} ${suzukiHeadline.variable}`}>
      <body className={`${suzukiPro.className} flex min-h-full flex-col antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
        />
        <AppProviders>
          <AssetPathStyles />
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <CookieBanner />
          <RecaptchaScript />
          <Analytics />
          <ChatWidget />
        </AppProviders>
      </body>
    </html>
  );
}
