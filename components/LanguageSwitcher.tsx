'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage, LanguageCode } from '@/context/LanguageContext';

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
                    <div className="absolute top-full right-0 z-[90] mt-2 flex max-h-[70vh] min-w-[160px] flex-col gap-1 overflow-y-auto glass px-2 py-4">
                        {languages.map((lang) => (
                            <button
                                type="button"
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "text-left px-4 py-3 text-[10px] tracking-widest uppercase transition-colors rounded-sm",
                                    language === lang.code ? "bg-white/10 text-accent" : "text-white/40 hover:text-white hover:bg-white/5"
                                )}
                            >
                                {lang.name}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
