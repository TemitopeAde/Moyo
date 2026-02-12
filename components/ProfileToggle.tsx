'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/context/ProfileContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

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
        <div className="flex flex-col items-center gap-8 animate-fade-in" style={{ animationDelay: '1s' }}>
            <div className="flex bg-foreground/5 border border-foreground/10 rounded-full p-1 backdrop-blur-md relative group isolate">
                <button
                    onClick={() => handleSelect('photography')}
                    className={`relative z-10 px-8 py-3 rounded-full text-sm tracking-[0.2em] uppercase transition-all duration-500 ${profile === 'photography'
                        ? 'bg-foreground text-background font-medium shadow-lg'
                        : 'text-foreground/60 hover:text-foreground hover:bg-foreground/10'
                        }`}
                >
                    {t('common.photography')}
                </button>

                <button
                    onClick={() => handleSelect('art')}
                    className={`relative z-10 px-8 py-3 rounded-full text-sm tracking-[0.2em] uppercase transition-all duration-500 ${profile === 'art'
                        ? 'bg-foreground text-background font-medium shadow-lg'
                        : 'text-foreground/60 hover:text-foreground hover:bg-foreground/10'
                        }`}
                >
                    {t('common.fineArt')}
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
