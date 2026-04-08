import type { Metadata } from 'next';
import './globals.css';
import { ProfileProvider } from '@/context/ProfileContext';
import { LanguageProvider } from '@/context/LanguageContext';
import SocialLinks from '@/components/SocialLinks';
import { ThemeProvider } from '@/components/ThemeProvider';
import SessionTracker from '@/components/SessionTracker';

export const metadata: Metadata = {
  title: 'Ijabiken Moyo | Photography & Fine Art',
  description: 'Visual storytelling across photography and fine art. Two practices. One vision.',
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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <LanguageProvider>
            <ProfileProvider>
              <SessionTracker />
              {children}
              <SocialLinks />
            </ProfileProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
