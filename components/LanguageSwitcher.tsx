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
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "field-frost inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md px-3 text-[10px] uppercase tracking-[0.2em] text-foreground/60 transition-colors hover:text-foreground",
                    className
                )}
            >
                {language}
                <span className={cn("transition-transform duration-300", isOpen && "rotate-180")}>↓</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full right-0 mt-2 max-h-[70vh] min-w-[160px] overflow-y-auto glass rounded-md py-4 px-2 z-50 flex flex-col gap-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "text-left px-4 py-3 text-[10px] tracking-widest uppercase transition-colors rounded-sm",
                                    language === lang.code ? "field-frost text-accent" : "text-foreground/45 hover:text-foreground hover:bg-foreground/5"
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
