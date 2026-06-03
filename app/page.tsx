'use client';

import React from 'react';
import ProfileToggle from '@/components/ProfileToggle';
import InteractiveImageScene from '@/components/InteractiveImageScene';
import ThreeAtmosphere from '@/components/ThreeAtmosphere';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

export default function GlobalEntryPage() {
  const { language } = useLanguage();
  const { t } = useTranslate(language);

  return (
    <main className="h-screen w-full relative bg-background overflow-hidden flex flex-col items-center justify-center text-center px-6 selection:bg-gold selection:text-black">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <InteractiveImageScene
          imageSrc="/IMG_8476.jpg.jpeg"
          className="z-0 opacity-75 grayscale"
        />
        <ThreeAtmosphere preset="entry" className="z-10 opacity-80 mix-blend-screen" />
        <div className="absolute inset-0 bg-linear-to-b from-background/75 via-background/35 to-background/95 z-20" />
        <div className="absolute inset-0 bg-radial-[at_50%_45%] from-transparent via-background/20 to-background/80 z-20" />
        <div className="cosmic-film-grain pointer-events-none absolute inset-0 z-20" />
      </div>

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
          className="space-y-10 mb-20"
        >
          <h1 className="text-6xl md:text-9xl font-heading text-foreground leading-none tracking-tight">
            Ijabiken <span className="italic block font-light mt-2">Moyo</span>
          </h1>

          <div className="h-px w-24 bg-gold/50 mx-auto" />

          <p className="text-sm md:text-lg text-foreground/50 font-body tracking-[0.3em] uppercase max-w-2xl mx-auto leading-loose">
            {t('home.tagline_part1')} <br className="hidden md:block" />
            <span className="text-foreground">{t('common.photography')}</span> {t('home.tagline_part2')} <span className="text-foreground">{t('common.fineArt')}</span>.
          </p>
        </motion.div>

        <ProfileToggle />
      </div>

      {/* Floating Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-12 left-12 text-left hidden md:block"
      >
        <p className="text-[9px] tracking-[0.5em] uppercase text-foreground/20 mb-2 font-medium">{t('home.philosophy')}</p>
        <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/40 italic">{t('home.philosophyText')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-12 right-12 text-right hidden md:block"
      >
        <p className="text-[9px] tracking-[0.5em] uppercase text-foreground/20 mb-2 font-medium">{t('home.location')}</p>
        <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/40">{t('home.locationText')}</p>
      </motion.div>

      {/* Audio/Status Indicator (Faux) */}
      <div className="absolute top-12 right-12 flex items-center gap-3">
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
        <span className="text-[9px] tracking-widest uppercase text-foreground/20">{t('home.studioLive')}</span>
      </div>
    </main>
  );
}
