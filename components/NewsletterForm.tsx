'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

interface NewsletterFormProps {
    profileType: 'photography' | 'art';
}

export default function NewsletterForm({ profileType }: NewsletterFormProps) {
    const { language } = useLanguage();
    const { t } = useTranslate(language);

    const title = profileType === 'photography'
        ? t('newsletter.photography.title')
        : t('newsletter.art.title');

    const description = profileType === 'photography'
        ? t('newsletter.photography.description')
        : t('newsletter.art.description');

    const buttonText = profileType === 'photography'
        ? t('newsletter.photography.button')
        : t('newsletter.art.button');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-xl w-full text-center space-y-12"
        >
            <div className="space-y-4">
                <span className="text-gold text-[10px] tracking-[0.5em] uppercase">{t('newsletter.title')}</span>
                <h2 className="text-4xl md:text-6xl font-heading text-white">{title}</h2>
                <p className="text-white/40 font-body tracking-wide leading-relaxed">
                    {description}
                </p>
            </div>

            <div className="relative group max-w-md mx-auto">
                <input
                    type="email"
                    placeholder={t('newsletter.placeholder')}
                    className="w-full bg-transparent border-b border-white/20 py-4 text-center text-white text-[10px] tracking-[0.3em] font-medium focus:outline-none focus:border-gold transition-colors placeholder:text-white/20"
                />
                <button className="mt-12 w-full bg-white text-black text-[10px] tracking-[0.5em] uppercase py-5 font-bold hover:bg-gold transition-colors duration-500">
                    {buttonText}
                </button>
            </div>

            <p className="text-[10px] text-white/20 tracking-widest uppercase">
                {t('newsletter.privacy')}
            </p>
        </motion.div>
    );
}
