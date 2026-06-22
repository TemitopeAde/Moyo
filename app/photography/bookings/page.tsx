'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import { useProfile } from '@/context/ProfileContext';

export default function BookingsPage() {
    const { language } = useLanguage();
    const { t } = useTranslate(language);
    const { setProfile } = useProfile();

    // Form state
    const [formData, setFormData] = useState({ name: '', email: '', type: 'Editorial', message: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    useEffect(() => {
        setProfile('photography');
    }, [setProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    service: formData.type, // Mapping type to service for consistency
                    type: 'Booking (Booking Page)'
                }),
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', type: 'Editorial', message: '' });
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
    };

    return (
        <main className="bg-background min-h-screen">
            <Navbar />
            <div className="pt-36 md:pt-52 container mx-auto px-6 md:px-12 pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto space-y-12"
                >
                    <div className="space-y-4 text-center">
                        <span className="text-accent text-[10px] tracking-[0.5em] uppercase">{t('bookingsPage.privateBooking')}</span>
                        <h1 className="text-4xl md:text-6xl font-heading text-foreground">{t('bookingsPage.captureVision')}</h1>
                        <p className="text-foreground/50 font-body">
                            {t('bookingsPage.inquiryDescription')}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 glass p-6 rounded-sm sm:p-10">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-widest text-foreground/40">{t('booking.yourName')}</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="field-frost w-full rounded-md px-4 py-3 text-foreground outline-none transition-colors"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase tracking-widest text-foreground/40">{t('booking.emailAddress')}</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="field-frost w-full rounded-md px-4 py-3 text-foreground outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-widest text-foreground/40">{t('bookingsPage.projectType')}</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="field-frost w-full rounded-md px-4 py-3 text-foreground/70 outline-none transition-colors appearance-none"
                            >
                                <option value="Editorial">{t('categories.editorial')}</option>
                                <option value="Portrait">{t('categories.portrait')}</option>
                                <option value="Commercial">{t('categories.commercial')}</option>
                                <option value="Other">{t('bookingsPage.other')}</option>
                            </select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] uppercase tracking-widest text-foreground/40">{t('bookingsPage.message')}</label>
                            <textarea
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                required
                                className="field-frost w-full rounded-md px-4 py-3 text-foreground outline-none transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full bg-foreground text-background text-[10px] tracking-[0.4em] uppercase py-5 font-bold hover:bg-accent hover:text-background transition-colors disabled:opacity-50"
                        >
                            {status === 'loading' ? 'Sending...' : t('booking.sendInquiry')}
                        </button>
                        {status === 'success' && <p className="text-green-500 text-center text-xs tracking-widest uppercase">Message sent successfully.</p>}
                        {status === 'error' && <p className="text-red-500 text-center text-xs tracking-widest uppercase">Failed to send message.</p>}
                    </form>
                </motion.div>
            </div>
            <Footer />
        </main>
    );
}
