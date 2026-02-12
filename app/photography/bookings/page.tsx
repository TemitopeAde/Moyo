'use client';

import React, { useEffect } from 'react';
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

    useEffect(() => {
        setProfile('photography');
    }, [setProfile]);

    return (
        <main className="bg-background min-h-screen">
            <Navbar />
            <div className="pt-40 container mx-auto px-6 md:px-12 pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto space-y-12"
                >
                    <div className="space-y-4 text-center">
                        <span className="text-gold text-[10px] tracking-[0.5em] uppercase">{t('bookingsPage.privateBooking')}</span>
                        <h1 className="text-4xl md:text-6xl font-heading text-white">{t('bookingsPage.captureVision')}</h1>
                        <p className="text-white/50 font-body">
                            {t('bookingsPage.inquiryDescription')}
                        </p>
                    </div>

                    <form className="space-y-8 glass p-10 rounded-sm">
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40">{t('booking.yourName')}</label>
                                <input type="text" className="w-full bg-white/5 border-b border-white/10 py-3 text-white focus:outline-none focus:border-gold transition-colors" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-white/40">{t('booking.emailAddress')}</label>
                                <input type="email" className="w-full bg-white/5 border-b border-white/10 py-3 text-white focus:outline-none focus:border-gold transition-colors" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/40">{t('bookingsPage.projectType')}</label>
                            <select className="w-full bg-white/5 border-b border-white/10 py-3 text-white/60 focus:outline-none focus:border-gold transition-colors appearance-none">
                                <option>{t('bookingsPage.selectType')}</option>
                                <option>{t('categories.editorial')}</option>
                                <option>{t('categories.portrait')}</option>
                                <option>{t('categories.commercial')}</option>
                                <option>{t('bookingsPage.other')}</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-white/40">{t('bookingsPage.message')}</label>
                            <textarea rows={4} className="w-full bg-white/5 border-b border-white/10 py-3 text-white focus:outline-none focus:border-gold transition-colors" />
                        </div>

                        <button className="w-full bg-white text-black text-[10px] tracking-[0.4em] uppercase py-5 font-bold hover:bg-gold transition-colors">
                            {t('booking.sendInquiry')}
                        </button>
                    </form>
                </motion.div>
            </div>
            <Footer />
        </main>
    );
}
