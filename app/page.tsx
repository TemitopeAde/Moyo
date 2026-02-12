'use client';

import React from 'react';
import ProfileToggle from '@/components/ProfileToggle';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

export default function GlobalEntryPage() {
  const { language } = useLanguage();
  const { t } = useTranslate(language);

  return (
    <main className="h-screen w-full relative bg-[#050505] overflow-hidden flex flex-col items-center justify-center text-center px-6 selection:bg-gold selection:text-black">
      {/* Cinematic Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/40 to-black/90 z-10" />
        <div
          className="w-full h-full bg-[url('https://images.unsplash.com/photo-1493397212122-2b85def82c2b?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center animate-slow-pan grayscale opacity-40"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.19, 1, 0.22, 1] }}
          className="space-y-10 mb-20"
        >
          <h1 className="text-6xl md:text-9xl font-heading text-white leading-none tracking-tight">
            Ijabiken <span className="italic block font-light mt-2">Moyo</span>
          </h1>

          <div className="h-px w-24 bg-gold/50 mx-auto" />

          <p className="text-sm md:text-lg text-white/50 font-body tracking-[0.3em] uppercase max-w-2xl mx-auto leading-loose">
            {t('home.tagline_part1')} <br className="hidden md:block" />
            <span className="text-white">{t('common.photography')}</span> {t('home.tagline_part2')} <span className="text-white">{t('common.fineArt')}</span>.
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
        <p className="text-[9px] tracking-[0.5em] uppercase text-white/20 mb-2 font-medium">{t('home.philosophy')}</p>
        <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 italic">{t('home.philosophyText')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-12 right-12 text-right hidden md:block"
      >
        <p className="text-[9px] tracking-[0.5em] uppercase text-white/20 mb-2 font-medium">{t('home.location')}</p>
        <p className="text-[10px] tracking-[0.3em] uppercase text-white/40">{t('home.locationText')}</p>
      </motion.div>

      {/* Audio/Status Indicator (Faux) */}
      <div className="absolute top-12 right-12 flex items-center gap-3">
        <div className="flex gap-1 items-end h-3">
          {[0.4, 0.7, 0.3, 0.9].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: [`${h * 100}%`, `${(1 - h) * 100}%`, `${h * 100}%`] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }}
              className="w-[1px] bg-white/30"
            />
          ))}
        </div>
        <span className="text-[9px] tracking-widest uppercase text-white/20">{t('home.studioLive')}</span>
      </div>
    </main>
  );
}
