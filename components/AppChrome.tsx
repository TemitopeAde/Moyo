'use client';

import dynamic from 'next/dynamic';
import { ProfileProvider } from '@/context/ProfileContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import ClickSpark from '@/components/ClickSpark';

const SessionTracker = dynamic(() => import('@/components/SessionTracker'), { ssr: false });
const CustomCursor = dynamic(() => import('@/components/CustomCursor'), { ssr: false });
const SocialLinks = dynamic(() => import('@/components/SocialLinks'), { ssr: false });
const EniyanChat = dynamic(() => import('@/components/EniyanChat'), { ssr: false });

export default function AppChrome({ children }: { children: React.ReactNode }) {
  return (
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
  );
}
