'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

export default function BookingForm() {
    const [formData, setFormData] = useState({ name: '', email: '', service: 'portrait', message: '' });
    const { language } = useLanguage();
    const { t } = useTranslate(language);

    const services = [
        { id: 'editorial', label: t('services.editorial') },
        { id: 'portrait', label: t('services.portrait') },
        { id: 'commercial', label: t('services.commercial') },
        { id: 'commission', label: t('services.artCommission') },
    ];

    return (
        <section id="contact" className="py-40 bg-background border-t border-white/5">
            <div className="container mx-auto px-6 md:px-12 max-w-6xl">
                <div className="lg:grid grid-cols-2 gap-24 items-start">
                    <div className="mb-20 lg:mb-0 space-y-12">
                        <div className="space-y-4">
                            <span className="text-gold text-[10px] tracking-[0.5em] uppercase block font-medium">
                                {t('booking.collaboration')}
                            </span>
                            <h2 className="text-5xl md:text-7xl font-heading text-white leading-tight font-light italic whitespace-pre-line">
                                {t('booking.heading')}
                            </h2>
                        </div>

                        <p className="text-white/40 font-body text-lg leading-relaxed max-w-md tracking-wide">
                            {t('booking.description')}
                        </p>

                        <div className="space-y-6 pt-12 border-t border-white/5">
                            <div className="space-y-2">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-white/20">{t('booking.email')}</p>
                                <a href="mailto:studio@ijabikenmoyo.com" className="block text-2xl hover:text-gold transition-colors font-heading text-white underline underline-offset-8 decoration-white/10">studio@ijabikenmoyo.com</a>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-white/20">{t('booking.studio')}</p>
                                <span className="block text-sm text-white/40 font-body tracking-widest uppercase">+31 (0) 20 123 4567</span>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                        className="glass p-10 md:p-16 rounded-sm"
                    >
                        <form className="space-y-12">
                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 block">{t('booking.yourName')}</label>
                                    <input
                                        type="text"
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-gold transition-colors font-body"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[10px] uppercase tracking-widest text-white/40 block">{t('booking.emailAddress')}</label>
                                    <input
                                        type="email"
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-gold transition-colors font-body"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] uppercase tracking-widest text-white/20 block font-medium">{t('booking.inquiryType')}</label>
                                <div className="flex flex-wrap gap-3">
                                    {services.map((service) => (
                                        <button
                                            key={service.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, service: service.id })}
                                            className={`px-6 py-2 border text-[10px] uppercase tracking-widest transition-all duration-500 rounded-full ${formData.service === service.id
                                                ? 'border-gold text-gold bg-gold/5'
                                                : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white'
                                                }`}
                                        >
                                            {service.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 group pt-4">
                                <label className="text-[10px] uppercase tracking-widest text-white/40 block">{t('booking.projectBrief')}</label>
                                <textarea
                                    rows={4}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-gold transition-colors font-body resize-none"
                                />
                            </div>

                            <button type="submit" className="w-full py-5 bg-white text-black text-[10px] tracking-[0.5em] uppercase font-bold hover:bg-gold transition-colors duration-500">
                                {t('booking.sendInquiry')}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
