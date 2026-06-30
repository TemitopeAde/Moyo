import type { Metadata } from 'next';
import './globals.css';
import { ProfileProvider } from '@/context/ProfileContext';
import { LanguageProvider } from '@/context/LanguageContext';
import SocialLinks from '@/components/SocialLinks';
import { ThemeProvider } from '@/components/ThemeProvider';
import SessionTracker from '@/components/SessionTracker';
import CustomCursor from '@/components/CustomCursor';
import ClickSpark from '@/components/ClickSpark';
import EniyanChat from '@/components/EniyanChat';

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
