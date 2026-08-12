'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import ProfileToggle from '@/components/ProfileToggle';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import { useSiteSettings } from '@/lib/useSiteSettings';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';
import Shuffle from '@/components/Shuffle';
import Image from 'next/image';
import SeoImage from '@/components/SeoImage';

const InteractiveImageScene = dynamic(() => import('@/components/InteractiveImageScene'), { ssr: false });
const ThreeAtmosphere = dynamic(() => import('@/components/ThreeAtmosphere'), { ssr: false });

export default function GlobalEntryPage() {
  const { language } = useLanguage();
  const { t, translateText } = useTranslate(language);
  const settings = useSiteSettings();
  const [showDecorativeEffects, setShowDecorativeEffects] = React.useState(false);
  const entryTitle = translateText(settings.entry.title || 'Ijabiken Moyo');
  const entryTagline = translateText(settings.entry.tagline || t('home.tagline'));
  const philosophyLabel = translateText(settings.entry.philosophyLabel || t('home.philosophy'));
  const philosophyText = translateText(settings.entry.philosophyText || t('home.philosophyText'));
  const locationLabel = translateText(settings.entry.locationLabel || t('home.location'));
  const locationText = translateText(settings.entry.locationText || t('home.locationText'));
  const titleWords = entryTitle.trim().split(/\s+/).filter(Boolean);
  const titleFirstLine = titleWords.length > 1 ? titleWords.slice(0, -1).join(' ') : entryTitle;
  const titleSecondLine = titleWords.length > 1 ? titleWords[titleWords.length - 1] : '';

  React.useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timeout = window.setTimeout(() => setShowDecorativeEffects(!reducedMotion), reducedMotion ? 0 : 450);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <main className="entry-experience relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-4 py-8 text-left selection:bg-accent selection:text-black sm:px-6 md:px-8">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {showDecorativeEffects && (
          <>
            <InteractiveImageScene
              imageSrc={settings.entry.desktopImage}
              mobileImageSrc={settings.entry.mobileImage}
              className="z-0 opacity-35 grayscale"
            />
            <ThreeAtmosphere preset="entry" className="z-10 opacity-80 mix-blend-screen" />
          </>
        )}
        <div className="entry-bg-wash absolute inset-0 z-20" />
        <div className="entry-bg-radial absolute inset-0 z-20" />
        <div className="cosmic-film-grain pointer-events-none absolute inset-0 z-20" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 flex w-full max-w-none flex-col items-center gap-4 sm:gap-5">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1] }}
          className="grid w-full max-w-[min(96vw,1720px)] grid-cols-3 items-end gap-4 px-1 text-[8px] uppercase tracking-[0.24em] text-[color:var(--entry-muted)] sm:text-[9px] sm:tracking-[0.32em]"
        >
          <span>Portfolio / 2026</span>
          <span className="truncate text-center text-[color:var(--entry-soft)]">{entryTagline}</span>
          <span className="text-right">{locationText}</span>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, scale: 0.96, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
          className="entry-selector-frost relative mx-auto h-[72svh] min-h-[560px] w-full max-w-[430px] overflow-hidden rounded-[8px] border-[color:var(--entry-border)] bg-[color:var(--entry-card)] shadow-[0_28px_120px_var(--entry-shadow)] sm:h-[78svh] sm:max-h-[920px] sm:min-h-[620px] sm:w-[min(96vw,1720px)] sm:max-w-none"
        >
          <SeoImage
            src={settings.entry.desktopImage}
            alt={`${entryTitle} portfolio entry image`}
            fill
            sizes="(min-width: 640px) 96vw, 430px"
            preload
            className="object-cover opacity-[0.78] grayscale"
          />
          <div className="entry-image-side-wash absolute inset-0" />
          <div className="entry-image-bottom-wash absolute inset-0" />
          <div className="absolute inset-x-0 top-0 h-px bg-[color:var(--entry-rule)]" />
          <div className="absolute left-[19%] top-0 hidden h-5 w-px bg-[color:var(--entry-rule-soft)] sm:block" />
          <div className="absolute bottom-0 left-[19%] top-[94px] hidden w-px bg-[color:var(--entry-rule-soft)] sm:block" />
          <div className="absolute right-[13%] top-0 hidden h-5 w-px bg-[color:var(--entry-rule-soft)] sm:block" />
          <div className="absolute bottom-[calc(9%+96px)] right-[13%] top-[88px] hidden w-px bg-[color:var(--entry-rule-soft)] sm:block" />
          <div className="absolute bottom-0 right-[13%] hidden h-[calc(9%-12px)] w-px bg-[color:var(--entry-rule-soft)] sm:block" />

          <div className="absolute left-5 right-5 top-5 flex items-center justify-between text-[color:var(--entry-text)] sm:left-7 sm:right-7 sm:top-6">
            <div className="flex items-center gap-3">
              <span className="relative block size-9">
                <Image
                  src="/brand/moyo-logo-red.png"
                  alt="Ijabiken Moyo"
                  fill
                  sizes="36px"
                  className="object-contain"
                  loading="eager"
                  fetchPriority="low"
                />
              </span>
              <span className="hidden text-[8px] uppercase tracking-[0.38em] text-[color:var(--entry-muted)] sm:block">Home</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <LanguageSwitcher className="h-9 rounded-full border-[color:var(--entry-control-border)] px-3 text-[9px] text-[color:var(--entry-control-text)] hover:border-[color:var(--entry-control-hover)] hover:bg-[color:var(--entry-control-bg)] hover:text-[color:var(--entry-text)]" />
              <ThemeToggle className="h-9 w-9 rounded-full border-[color:var(--entry-control-border)] text-[color:var(--entry-control-text)] hover:border-[color:var(--entry-control-hover)] hover:bg-[color:var(--entry-control-bg)] [&_svg]:h-4 [&_svg]:w-4 [&_svg]:text-[color:var(--entry-control-text)] group-hover:[&_svg]:text-accent" />
              <span className="ml-1 hidden items-center gap-4 text-[8px] uppercase tracking-[0.32em] text-[color:var(--entry-soft)] sm:flex">
                <span>Menu</span>
                <span className="grid gap-1" aria-hidden="true">
                  <span className="block h-px w-4 bg-[color:var(--entry-text)] opacity-70" />
                  <span className="block h-px w-4 bg-[color:var(--entry-text)] opacity-70" />
                </span>
              </span>
            </div>
          </div>

          <div className="absolute left-5 top-[32%] max-w-[70%] text-[8px] uppercase tracking-[0.28em] text-[color:var(--entry-muted)] sm:left-[4.5%] sm:top-[40%]">
            {philosophyText}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36, duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
            className="absolute bottom-[25%] left-5 max-w-[86%] text-[color:var(--entry-title)] sm:bottom-[10%] sm:left-[4.5%] sm:max-w-[54%]"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <Shuffle
              tag="span"
              text={titleFirstLine}
              duration={0.62}
              stagger={0.045}
              triggerOnce={true}
              triggerOnHover={true}
              respectReducedMotion={true}
              wrap={false}
              textAlign="left"
              className="block whitespace-nowrap text-[clamp(3.2rem,15vw,5.6rem)] font-light uppercase leading-[0.84] tracking-normal sm:text-[clamp(5.2rem,8.5vw,10.25rem)]"
            />
            {titleSecondLine && (
              <Shuffle
                tag="span"
                text={titleSecondLine}
                duration={0.62}
                stagger={0.045}
                triggerOnce={true}
                triggerOnHover={true}
                respectReducedMotion={true}
                wrap={false}
                textAlign="left"
                className="block whitespace-nowrap text-[clamp(3.2rem,15vw,5.6rem)] font-light uppercase leading-[0.84] tracking-normal sm:text-[clamp(5.2rem,8.5vw,10.25rem)]"
              />
            )}
          </motion.div>

          <div className="absolute bottom-6 left-5 right-5 sm:bottom-[9%] sm:left-auto sm:right-[5%] sm:w-[min(40vw,620px)]">
            <div className="mb-2 flex items-center justify-between text-[8px] uppercase tracking-[0.28em] text-[color:var(--entry-muted)] sm:mb-3 sm:text-[9px]">
              <span>Projects</span>
              <span className="h-px w-16 bg-[color:var(--entry-rule)]" />
            </div>
            <ProfileToggle />
          </div>
        </motion.section>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.8 }}
          className="grid w-full max-w-[420px] grid-cols-3 items-center gap-6 px-8 sm:max-w-[760px]"
        >
          <span className="h-3 bg-[color:var(--entry-rule-soft)]" />
          <span className="h-3 bg-[color:var(--entry-rule-soft)]" />
          <span className="h-3 bg-[color:var(--entry-rule-soft)]" />
        </motion.div>
      </div>

      {/* Floating Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-10 text-left hidden lg:block"
      >
        <p className="text-[9px] tracking-[0.5em] uppercase text-[color:var(--entry-faint)] mb-2 font-medium">{philosophyLabel}</p>
        <p className="max-w-xs text-[10px] tracking-[0.24em] uppercase text-[color:var(--entry-muted)] italic [overflow-wrap:anywhere]">{philosophyText}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 right-10 text-right hidden lg:block"
      >
        <p className="text-[9px] tracking-[0.5em] uppercase text-[color:var(--entry-faint)] mb-2 font-medium">{locationLabel}</p>
        <p className="max-w-xs text-[10px] tracking-[0.24em] uppercase text-[color:var(--entry-muted)] [overflow-wrap:anywhere]">{locationText}</p>
      </motion.div>

      {/* Audio/Status Indicator (Faux) */}
      <div className="absolute right-5 top-5 flex items-center gap-3 sm:right-8 sm:top-8 md:right-10 md:top-8">
        <div className="flex gap-1 items-end h-3">
          {[0.4, 0.7, 0.3, 0.9].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: [`${h * 100}%`, `${(1 - h) * 100}%`, `${h * 100}%`] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
              className="w-[1px] bg-[color:var(--entry-muted)]"
            />
          ))}
        </div>
        <span className="hidden text-[9px] tracking-widest uppercase text-[color:var(--entry-faint)] sm:inline">{t('home.studioLive')}</span>
      </div>
    </main>
  );
}
