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
];

export default function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative font-body">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[10px] tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors py-2 flex items-center gap-2"
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
                    <div className="absolute top-full right-0 mt-2 min-w-[140px] glass py-4 px-2 z-50 flex flex-col gap-1">
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => {
                                    setLanguage(lang.code);
                                    setIsOpen(false);
                                }}
                                className={cn(
                                    "text-left px-4 py-3 text-[10px] tracking-widest uppercase transition-colors rounded-sm",
                                    language === lang.code ? "bg-white/10 text-gold" : "text-white/40 hover:text-white hover:bg-white/5"
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
