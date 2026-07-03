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
  const { t, translateText } = useTranslate(language);
  const settings = useSiteSettings();
  const entryTitle = translateText(settings.entry.title || 'Ijabiken Moyo');
  const entryTagline = translateText(settings.entry.tagline || t('home.tagline'));
  const philosophyLabel = translateText(settings.entry.philosophyLabel || t('home.philosophy'));
  const philosophyText = translateText(settings.entry.philosophyText || t('home.philosophyText'));
  const locationLabel = translateText(settings.entry.locationLabel || t('home.location'));
  const locationText = translateText(settings.entry.locationText || t('home.locationText'));

  return (
    <main className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-background px-4 py-8 text-left selection:bg-accent selection:text-black sm:px-6 md:px-8">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <InteractiveImageScene
          imageSrc={settings.entry.desktopImage}
          mobileImageSrc={settings.entry.mobileImage}
          className="z-0 opacity-55 grayscale"
        />
        <ThreeAtmosphere preset="entry" className="z-10 opacity-80 mix-blend-screen" />
        <div className="absolute inset-0 bg-linear-to-b from-background/70 via-background/30 to-background/95 z-20" />
        <div className="absolute inset-0 bg-radial-[at_50%_45%] from-transparent via-background/25 to-background/82 z-20" />
        <div className="absolute inset-y-0 left-[8vw] z-20 hidden w-px bg-foreground/10 md:block" />
        <div className="absolute inset-y-0 left-[28vw] z-20 hidden w-px bg-foreground/10 md:block" />
        <div className="absolute inset-y-0 right-[8vw] z-20 hidden w-px bg-foreground/10 md:block" />
        <div className="absolute inset-x-0 top-[18svh] z-20 h-px bg-foreground/10" />
        <div className="absolute inset-x-0 bottom-[14svh] z-20 h-px bg-foreground/10" />
        <div className="cosmic-film-grain pointer-events-none absolute inset-0 z-20" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 flex w-full max-w-7xl flex-col items-stretch gap-6 sm:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
          className="flex w-full flex-col items-start space-y-2 sm:space-y-3"
        >
          <Shuffle
            tag="h1"
            text={entryTitle}
            duration={0.62}
            stagger={0.045}
            triggerOnce={true}
            triggerOnHover={true}
            respectReducedMotion={true}
            className="w-full max-w-4xl text-4xl font-semibold uppercase leading-none tracking-[0.04em] text-foreground [overflow-wrap:anywhere] sm:text-6xl sm:tracking-[0.12em] md:text-7xl"
            style={{ fontFamily: 'var(--font-body)' }}
          />

          <p className="max-w-xl text-[9px] uppercase leading-relaxed tracking-[0.14em] text-foreground/60 [overflow-wrap:anywhere] sm:text-[10px] sm:tracking-[0.24em] md:text-xs md:tracking-[0.32em]">
            {entryTagline}
          </p>

          <div className="h-px w-20 bg-accent/60" />
        </motion.div>

        <div className="w-full">
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
        <p className="text-[9px] tracking-[0.5em] uppercase text-foreground/20 mb-2 font-medium">{philosophyLabel}</p>
        <p className="max-w-xs text-[10px] tracking-[0.24em] uppercase text-foreground/40 italic [overflow-wrap:anywhere]">{philosophyText}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 right-10 text-right hidden md:block"
      >
        <p className="text-[9px] tracking-[0.5em] uppercase text-foreground/20 mb-2 font-medium">{locationLabel}</p>
        <p className="max-w-xs text-[10px] tracking-[0.24em] uppercase text-foreground/40 [overflow-wrap:anywhere]">{locationText}</p>
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
