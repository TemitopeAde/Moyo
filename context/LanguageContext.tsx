'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type LanguageCode = 'EN' | 'FR' | 'ES' | 'DE' | 'PT' | 'AR';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<LanguageCode>('EN');

    // Persist language choice
    useEffect(() => {
        const saved = localStorage.getItem('moyo_lang') as LanguageCode;
        if (saved) setLanguage(saved);
    }, []);

    const handleSetLanguage = (lang: LanguageCode) => {
        setLanguage(lang);
        localStorage.setItem('moyo_lang', lang);
        document.documentElement.dir = lang === 'AR' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang.toLowerCase();
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
