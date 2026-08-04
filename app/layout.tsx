import type { Metadata } from 'next';
import { defaultDescription, defaultOgImage, siteName, siteUrl } from '@/lib/seo';
import './globals.css';
import { ProfileProvider } from '@/context/ProfileContext';
import { LanguageProvider } from '@/context/LanguageContext';
import SocialLinks from '@/components/SocialLinks';
import { ThemeProvider } from '@/components/ThemeProvider';
import SessionTracker from '@/components/SessionTracker';
import CustomCursor from '@/components/CustomCursor';
import ClickSpark from '@/components/ClickSpark';
import EniyanChat from '@/components/EniyanChat';
import { JsonLd, createRootJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  title: {
    default: `${siteName} | Photography & Fine Art`,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${siteName} | Photography & Fine Art`,
    description: defaultDescription,
    url: '/',
    siteName,
    images: [
      {
        url: defaultOgImage,
        width: 2560,
        height: 1707,
        alt: siteName,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} | Photography & Fine Art`,
    description: defaultDescription,
    images: [defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className="font-body antialiased bg-background text-foreground selection:bg-accent selection:text-background"
      >
        <JsonLd data={createRootJsonLd()} />
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          enableSystem={false}
          storageKey="moyo-theme"
          disableTransitionOnChange
        >
          <LanguageProvider>
            <ProfileProvider>
              <SessionTracker />
              <CustomCursor />
              <ClickSpark
                sparkColor="#920110"
                sparkSize={12}
                sparkRadius={22}
                sparkCount={8}
                duration={460}
                extraScale={1.1}
              >
                {children}
                <SocialLinks />
                <EniyanChat />
              </ClickSpark>
            </ProfileProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
