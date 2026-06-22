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

    return (
        <div className="flex w-full flex-col items-center gap-5 animate-fade-in sm:gap-6" style={{ animationDelay: '1s' }}>
            <div className="glass relative isolate grid w-full max-w-[460px] grid-cols-2 gap-1 rounded-full p-1.5 shadow-[0_24px_80px_rgba(0,0,0,0.18)] group">

                <button
                    onClick={() => handleSelect('photography')}
                    aria-pressed={profile === 'photography'}
                    className={`relative z-10 flex min-h-12 items-center justify-center rounded-full px-3 text-center text-[10px] uppercase tracking-[0.14em] transition-colors duration-500 sm:min-h-14 sm:px-6 sm:text-xs sm:tracking-[0.22em] ${profile === 'photography'
                            ? 'text-background font-medium'
                            : 'text-foreground/60 hover:text-foreground'
                        }`}
                >
                    {t('common.photography')}
                    {profile === 'photography' && (
                        <motion.div
                            layoutId="toggleKnob"
                            className="absolute inset-0 bg-foreground rounded-full -z-10 shadow-lg"
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                    )}
                </button>

                <button
                    onClick={() => handleSelect('art')}
                    aria-pressed={profile === 'art'}
                    className={`relative z-10 flex min-h-12 items-center justify-center rounded-full px-3 text-center text-[10px] uppercase tracking-[0.14em] transition-colors duration-500 sm:min-h-14 sm:px-6 sm:text-xs sm:tracking-[0.22em] ${profile === 'art'
                            ? 'text-background font-medium'
                            : 'text-foreground/60 hover:text-foreground'
                        }`}
                >
                    {t('common.fineArt')}
                    {profile === 'art' && (
                        <motion.div
                            layoutId="toggleKnob"
                            className="absolute inset-0 bg-foreground rounded-full -z-10 shadow-lg"
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                    )}
                </button>
            </div>

            {!profile && (
                <div className="text-center max-w-md">
                    <p className="text-foreground/40 text-xs tracking-widest uppercase mb-4 animate-pulse">
                        {t('common.chooseExperience')}
                    </p>
                </div>
            )}
        </div>
    );
}
