'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { getStorageItem, setStorageItem } from '@/lib/browserStorage';

export type LanguageCode = 'EN' | 'FR' | 'ES' | 'DE' | 'PT' | 'AR' | 'ZH' | 'YO' | 'IG' | 'HA';
const LANGUAGE_CODES: LanguageCode[] = ['EN', 'FR', 'ES', 'DE', 'PT', 'AR', 'ZH', 'YO', 'IG', 'HA'];

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<LanguageCode>(() => {
        if (typeof window === 'undefined') return 'EN';
        const saved = getStorageItem('local', 'moyo_lang');
        return LANGUAGE_CODES.includes(saved as LanguageCode) ? (saved as LanguageCode) : 'EN';
    });

    useEffect(() => {
        document.documentElement.dir = language === 'AR' ? 'rtl' : 'ltr';
        document.documentElement.lang = language.toLowerCase();
    }, [language]);

    const handleSetLanguage = (lang: LanguageCode) => {
        setLanguage(lang);
        setStorageItem('local', 'moyo_lang', lang);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
