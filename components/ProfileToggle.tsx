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
        <div className="flex w-full flex-col items-stretch gap-3 animate-fade-in" style={{ animationDelay: '1s' }}>
            <div className="entry-selector-frost relative isolate grid w-full grid-cols-2 gap-1 rounded-full p-1.5 group">
                <button
                    onClick={() => handleSelect('photography')}
                    aria-pressed={profile === 'photography'}
                    className={`relative z-10 flex min-h-11 items-center justify-center rounded-full px-3 text-center text-[9px] font-semibold uppercase tracking-[0.16em] transition-colors duration-500 sm:min-h-12 sm:px-5 sm:text-[10px] sm:tracking-[0.22em] ${profile === 'photography'
                            ? 'text-[color:var(--entry-card)]'
                            : 'text-[color:var(--entry-control-text)] hover:text-[color:var(--entry-text)]'
                        }`}
                >
                    {t('common.photography')}
                    {profile === 'photography' && (
                        <motion.div
                            layoutId="mobileToggleKnob"
                            className="absolute inset-0 rounded-full bg-[color:var(--entry-text)] -z-10 shadow-lg"
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                    )}
                </button>

                <button
                    onClick={() => handleSelect('art')}
                    aria-pressed={profile === 'art'}
                    className={`relative z-10 flex min-h-11 items-center justify-center rounded-full px-3 text-center text-[9px] font-semibold uppercase tracking-[0.16em] transition-colors duration-500 sm:min-h-12 sm:px-5 sm:text-[10px] sm:tracking-[0.22em] ${profile === 'art'
                            ? 'text-[color:var(--entry-card)]'
                            : 'text-[color:var(--entry-control-text)] hover:text-[color:var(--entry-text)]'
                        }`}
                >
                    {t('common.fineArt')}
                    {profile === 'art' && (
                        <motion.div
                            layoutId="mobileToggleKnob"
                            className="absolute inset-0 rounded-full bg-[color:var(--entry-text)] -z-10 shadow-lg"
                            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                        />
                    )}
                </button>
            </div>

            {!profile && (
                <div className="text-right">
                    <p className="text-[8px] uppercase tracking-[0.32em] text-[color:var(--entry-muted)] animate-pulse sm:text-[9px]">
                        {t('common.chooseExperience')}
                    </p>
                </div>
            )}
        </div>
    );
}
