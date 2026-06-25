'use client';

import React from 'react';
import ProfileToggle from '@/components/ProfileToggle';
import InteractiveImageScene from '@/components/InteractiveImageScene';
import ThreeAtmosphere from '@/components/ThreeAtmosphere';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import Shuffle from '@/components/Shuffle';
import { useSiteSettings } from '@/lib/useSiteSettings';

export default function GlobalEntryPage() {
  const { language } = useLanguage();
  const { t } = useTranslate(language);
  const settings = useSiteSettings();

  return (
    <main className="relative flex min-h-[100svh] w-full flex-col items-center justify-start overflow-hidden bg-background px-5 pb-16 pt-[48svh] text-center selection:bg-accent selection:text-black sm:px-6 sm:pt-[47svh] md:pt-[49svh] lg:pt-[48svh] xl:pt-[47svh]">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <InteractiveImageScene
          imageSrc={settings.entry.desktopImage}
          mobileImageSrc={settings.entry.mobileImage}
          className="z-0 opacity-55 grayscale"
        />
        <ThreeAtmosphere preset="entry" className="z-10 opacity-80 mix-blend-screen" />
        <div className="absolute inset-0 bg-linear-to-b from-background/80 via-background/45 to-background/95 z-20" />
        <div className="absolute inset-0 bg-radial-[at_50%_45%] from-transparent via-background/35 to-background/85 z-20" />
        <div className="cosmic-film-grain pointer-events-none absolute inset-0 z-20" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 flex w-full max-w-5xl flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
          className="flex w-full flex-col items-center space-y-2 text-center sm:space-y-3"
        >
          <Shuffle
            tag="h1"
            text={settings.entry.title}
            duration={0.62}
            stagger={0.045}
            triggerOnce={true}
            triggerOnHover={true}
            respectReducedMotion={true}
            className="w-full max-w-full text-center text-[clamp(1.55rem,6vw,3.1rem)] font-semibold uppercase leading-tight tracking-[0.06em] text-foreground [overflow-wrap:anywhere] sm:tracking-[0.16em] sm:leading-none md:tracking-[0.2em]"
            style={{ fontFamily: 'var(--font-body)' }}
          />

          <p className="mx-auto max-w-3xl text-[9px] uppercase leading-relaxed tracking-[0.14em] text-foreground/60 [overflow-wrap:anywhere] sm:text-[10px] sm:tracking-[0.24em] md:text-xs md:tracking-[0.32em]">
            {settings.entry.tagline}
          </p>

          <div className="mx-auto h-px w-16 bg-accent/50" />
        </motion.div>

        <div className="mt-3 w-full md:mt-4">
          <ProfileToggle />
        </div>
      </div>

      {/* Floating Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-10 text-left hidden md:block"
      >
        <p className="text-[9px] tracking-[0.5em] uppercase text-foreground/20 mb-2 font-medium">{settings.entry.philosophyLabel || t('home.philosophy')}</p>
        <p className="max-w-xs text-[10px] tracking-[0.24em] uppercase text-foreground/40 italic [overflow-wrap:anywhere]">{settings.entry.philosophyText || t('home.philosophyText')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 right-10 text-right hidden md:block"
      >
        <p className="text-[9px] tracking-[0.5em] uppercase text-foreground/20 mb-2 font-medium">{settings.entry.locationLabel || t('home.location')}</p>
        <p className="max-w-xs text-[10px] tracking-[0.24em] uppercase text-foreground/40 [overflow-wrap:anywhere]">{settings.entry.locationText || t('home.locationText')}</p>
      </motion.div>

      {/* Audio/Status Indicator (Faux) */}
      <div className="absolute right-5 top-5 flex items-center gap-3 sm:right-8 sm:top-8 md:right-10 md:top-8">
        <div className="flex gap-1 items-end h-3">
          {[0.4, 0.7, 0.3, 0.9].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: [`${h * 100}%`, `${(1 - h) * 100}%`, `${h * 100}%`] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
              className="w-[1px] bg-foreground/30"
            />
          ))}
        </div>
        <span className="hidden text-[9px] tracking-widest uppercase text-foreground/20 sm:inline">{t('home.studioLive')}</span>
      </div>
    </main>
  );
}
