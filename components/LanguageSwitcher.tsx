'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage, LanguageCode } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

const languages: { code: LanguageCode, name: string }[] = [
    { code: 'EN', name: 'English' },
    { code: 'FR', name: 'French' },
    { code: 'ES', name: 'Spanish' },
    { code: 'DE', name: 'German' },
    { code: 'PT', name: 'Portuguese' },
    { code: 'AR', name: 'Arabic' },
    { code: 'ZH', name: 'Mandarin' },
    { code: 'YO', name: 'Yoruba' },
    { code: 'IG', name: 'Igbo' },
    { code: 'HA', name: 'Hausa' },
];

export default function LanguageSwitcher({ className }: { className?: string }) {
    const { language, setLanguage } = useLanguage();
    const { translateText } = useTranslate(language);
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative font-body">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md border border-transparent px-3 text-[10px] uppercase tracking-[0.2em] text-foreground/60 transition-colors hover:border-foreground/10 hover:bg-white/10 hover:text-foreground",
                    className
                )}
            >
                {language}
                <span className={cn("transition-transform duration-300", isOpen && "rotate-180")}>↓</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-[70]"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full right-0 z-[90] mt-2 flex max-h-[70vh] min-w-[190px] flex-col gap-1 overflow-y-auto rounded-md border border-foreground/15 bg-background/92 px-3 py-4 shadow-[0_24px_90px_rgba(0,0,0,0.72)] backdrop-blur-3xl backdrop-saturate-150">
                        {languages.map((lang) => (
                            <button
                                type="button"
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "rounded-sm px-4 py-3 text-left text-[10px] uppercase tracking-widest transition-colors",
                                    language === lang.code
                                        ? "bg-foreground/12 text-accent shadow-inner shadow-white/5"
                                        : "text-foreground/62 hover:bg-foreground/8 hover:text-foreground"
                                )}
                            >
                                {translateText(lang.name)}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
