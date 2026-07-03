'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import { motion } from 'framer-motion';

export default function ProfileToggle() {
    const { profile, setProfile } = useProfile();
    const { language } = useLanguage();
    const { t } = useTranslate(language);
    const router = useRouter();

    const handleSelect = (choice: 'photography' | 'art') => {
        setProfile(choice);
        router.push(`/${choice}`);
    };

    const optionBaseClass = 'group relative z-10 flex min-h-[160px] flex-col justify-between overflow-hidden rounded-[6px] border border-foreground/10 px-5 py-5 text-left transition-colors duration-500 sm:min-h-[240px] sm:px-7 sm:py-7 md:min-h-[320px] lg:min-h-[360px]';
    const inactiveClass = 'text-foreground hover:border-foreground/30 hover:bg-foreground/[0.04]';
    const activeClass = 'border-foreground/40 text-background';

    return (
        <div className="flex w-full flex-col items-stretch gap-5 animate-fade-in sm:gap-6" style={{ animationDelay: '1s' }}>
            <div className="entry-selector-frost relative isolate grid w-full grid-cols-2 gap-1 rounded-full p-1.5 group md:hidden">
                <button
                    onClick={() => handleSelect('photography')}
                    aria-pressed={profile === 'photography'}
                    className={`relative z-10 flex min-h-12 items-center justify-center rounded-full px-3 text-center text-[10px] font-medium uppercase tracking-[0.14em] transition-colors duration-500 sm:min-h-14 sm:px-6 sm:text-xs sm:tracking-[0.22em] ${profile === 'photography'
                            ? 'text-background'
                            : 'text-foreground/65 hover:text-foreground'
                        }`}
                >
                    {t('common.photography')}
                    {profile === 'photography' && (
                        <motion.div
                            layoutId="mobileToggleKnob"
                            className="absolute inset-0 bg-foreground rounded-full -z-10 shadow-lg"
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                    )}
                </button>

                <button
                    onClick={() => handleSelect('art')}
                    aria-pressed={profile === 'art'}
                    className={`relative z-10 flex min-h-12 items-center justify-center rounded-full px-3 text-center text-[10px] font-medium uppercase tracking-[0.14em] transition-colors duration-500 sm:min-h-14 sm:px-6 sm:text-xs sm:tracking-[0.22em] ${profile === 'art'
                            ? 'text-background'
                            : 'text-foreground/65 hover:text-foreground'
                        }`}
                >
                    {t('common.fineArt')}
                    {profile === 'art' && (
                        <motion.div
                            layoutId="mobileToggleKnob"
                            className="absolute inset-0 bg-foreground rounded-full -z-10 shadow-lg"
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                    )}
                </button>
            </div>

            <div className="entry-selector-frost relative isolate hidden w-full grid-cols-2 gap-2 rounded-[8px] p-2 group md:grid">

                <button
                    onClick={() => handleSelect('photography')}
                    aria-pressed={profile === 'photography'}
                    className={`${optionBaseClass} ${profile === 'photography'
                            ? activeClass
                            : inactiveClass
                        }`}
                >
                    <span className="flex w-full items-start justify-between gap-4">
                        <span className="text-[9px] font-medium uppercase leading-relaxed tracking-[0.32em] text-accent sm:text-[10px]">
                            01 / Studio
                        </span>
                        <span className="h-px w-12 bg-current opacity-30 transition-opacity duration-500 group-hover:opacity-70" />
                    </span>
                    <span className="max-w-[8ch] text-4xl font-light uppercase leading-[0.9] tracking-normal sm:text-7xl md:text-8xl">
                        {t('common.photography')}
                    </span>
                    <span className="flex items-center justify-between gap-4 border-t border-current/15 pt-4 text-[10px] font-medium uppercase tracking-[0.28em] sm:text-xs">
                        <span>Enter</span>
                        <span aria-hidden="true" className="text-accent transition-transform duration-500 group-hover:translate-x-1">
                            &rarr;
                        </span>
                    </span>
                    {profile === 'photography' && (
                        <motion.div
                            layoutId="toggleKnob"
                            className="absolute inset-0 bg-foreground -z-10 shadow-lg"
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                    )}
                </button>

                <button
                    onClick={() => handleSelect('art')}
                    aria-pressed={profile === 'art'}
                    className={`${optionBaseClass} ${profile === 'art'
                            ? activeClass
                            : inactiveClass
                        }`}
                >
                    <span className="flex w-full items-start justify-between gap-4">
                        <span className="text-[9px] font-medium uppercase leading-relaxed tracking-[0.32em] text-accent sm:text-[10px]">
                            02 / Collection
                        </span>
                        <span className="h-px w-12 bg-current opacity-30 transition-opacity duration-500 group-hover:opacity-70" />
                    </span>
                    <span className="max-w-[8ch] text-4xl font-light uppercase leading-[0.9] tracking-normal sm:text-7xl md:text-8xl">
                        {t('common.fineArt')}
                    </span>
                    <span className="flex items-center justify-between gap-4 border-t border-current/15 pt-4 text-[10px] font-medium uppercase tracking-[0.28em] sm:text-xs">
                        <span>Enter</span>
                        <span aria-hidden="true" className="text-accent transition-transform duration-500 group-hover:translate-x-1">
                            &rarr;
                        </span>
                    </span>
                    {profile === 'art' && (
                        <motion.div
                            layoutId="toggleKnob"
                            className="absolute inset-0 bg-foreground -z-10 shadow-lg"
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                    )}
                </button>
            </div>

            {!profile && (
                <div className="max-w-md">
                    <p className="text-[10px] uppercase tracking-[0.32em] text-foreground/45 animate-pulse">
                        {t('common.chooseExperience')}
                    </p>
                </div>
            )}
        </div>
    );
}
