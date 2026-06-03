'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

interface NewsletterFormProps {
    profileType: 'photography' | 'art';
}

export default function NewsletterForm({ profileType }: NewsletterFormProps) {
    const { language } = useLanguage();
    const { t } = useTranslate(language);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showToast, setShowToast] = useState(false);

    const title = profileType === 'photography'
        ? t('newsletter.photography.title')
        : t('newsletter.art.title');

    const description = profileType === 'photography'
        ? t('newsletter.photography.description')
        : t('newsletter.art.description');

    const buttonText = profileType === 'photography'
        ? t('newsletter.photography.button')
        : t('newsletter.art.button');

    useEffect(() => {
        if (!showToast) return;
        const timer = window.setTimeout(() => setShowToast(false), 3200);
        return () => window.clearTimeout(timer);
    }, [showToast]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setShowToast(false);
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, listType: profileType }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Unable to subscribe right now.');
            }

            setEmail('');
            setShowToast(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to subscribe right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-xl w-full text-center space-y-12"
        >
            <div className="space-y-4">
                <span className="text-gold text-[10px] tracking-[0.5em] uppercase">{t('newsletter.title')}</span>
                <h2 className="text-4xl md:text-6xl font-heading text-foreground">{title}</h2>
                <p className="text-foreground/40 font-body tracking-wide leading-relaxed">
                    {description}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="relative group max-w-md mx-auto">
                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t('newsletter.placeholder')}
                    className="w-full bg-transparent border-b border-foreground/20 py-4 text-center text-foreground text-[10px] tracking-[0.3em] font-medium focus:outline-none focus:border-gold transition-colors placeholder:text-foreground/20"
                    required
                />
                {error && (
                    <p className="mt-4 text-[10px] text-red-400 tracking-widest uppercase">
                        {error}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-12 w-full bg-foreground text-background text-[10px] tracking-[0.5em] uppercase py-5 font-bold hover:bg-gold transition-colors duration-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? 'Subscribing...' : buttonText}
                </button>
            </form>

            <p className="text-[10px] text-foreground/20 tracking-widest uppercase">
                {t('newsletter.privacy')}
            </p>

            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        role="status"
                        aria-live="polite"
                        className="fixed bottom-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 border border-gold/40 bg-background/95 px-5 py-4 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-gold shadow-2xl backdrop-blur-md md:left-auto md:right-6 md:translate-x-0"
                    >
                        You have been subscribed.
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
