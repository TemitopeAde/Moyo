'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

export default function BookingForm() {
    const [formData, setFormData] = useState({ name: '', email: '', service: 'portrait', message: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const { language } = useLanguage();
    const { t } = useTranslate(language);

    const services = [
        { id: 'editorial', label: t('services.editorial') },
        { id: 'portrait', label: t('services.portrait') },
        { id: 'commercial', label: t('services.commercial') },
        { id: 'commission', label: t('services.artCommission') },
    ];



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    service: formData.service,
                    message: formData.message,
                    type: 'Photography Booking (Home)'
                }),
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', service: 'portrait', message: '' });
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <section id="contact" className="py-40 bg-background border-t border-foreground/5">
            <div className="container mx-auto px-6 md:px-12 max-w-6xl">
                <div className="lg:grid grid-cols-2 gap-24 items-start">
                    <div className="mb-20 lg:mb-0 space-y-12">
                        <div className="space-y-4">
                            <span className="text-gold text-[10px] tracking-[0.5em] uppercase block font-medium">
                                {t('booking.collaboration')}
                            </span>
                            <h2 className="text-5xl md:text-7xl font-heading text-foreground leading-tight font-light italic whitespace-pre-line">
                                {t('booking.heading')}
                            </h2>
                        </div>

                        <p className="text-foreground/40 font-body text-lg leading-relaxed max-w-md tracking-wide">
                            {t('booking.description')}
                        </p>

                        <div className="space-y-6 pt-12 border-t border-foreground/5">
                            <div className="space-y-2">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/20">{t('booking.email')}</p>
                                <a href="mailto:studio@ijabikenmoyo.com" className="block text-2xl hover:text-gold transition-colors font-heading text-foreground underline underline-offset-8 decoration-white/10">studio@ijabikenmoyo.com</a>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/20">{t('booking.studio')}</p>
                                <span className="block text-sm text-foreground/40 font-body tracking-widest uppercase">+31 (0) 20 123 4567</span>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                        className="glass p-10 md:p-16 rounded-sm"
                    >
                        <form onSubmit={handleSubmit} className="space-y-12">
                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] uppercase tracking-widest text-foreground/40 block">{t('booking.yourName')}</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        required
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-transparent border-b border-foreground/10 py-3 text-foreground focus:outline-none focus:border-gold transition-colors font-body"
                                    />
                                </div>
                                <div className="space-y-2 group">
                                    <label className="text-[10px] uppercase tracking-widest text-foreground/40 block">{t('booking.emailAddress')}</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        required
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-transparent border-b border-foreground/10 py-3 text-foreground focus:outline-none focus:border-gold transition-colors font-body"
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] uppercase tracking-widest text-foreground/20 block font-medium">{t('booking.inquiryType')}</label>
                                <div className="flex flex-wrap gap-3">
                                    {services.map((service) => (
                                        <button
                                            key={service.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, service: service.id })}
                                            className={`px-6 py-2 border text-[10px] uppercase tracking-widest transition-all duration-500 rounded-full ${formData.service === service.id
                                                ? 'border-gold text-gold bg-gold/5'
                                                : 'border-white/10 text-foreground/40 hover:border-foreground/30 hover:text-foreground'
                                                }`}
                                        >
                                            {service.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 group pt-4">
                                <label className="text-[10px] uppercase tracking-widest text-foreground/40 block">{t('booking.projectBrief')}</label>
                                <textarea
                                    rows={4}
                                    value={formData.message}
                                    required
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-transparent border-b border-white/10 py-3 text-foreground focus:outline-none focus:border-gold transition-colors font-body resize-none"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-5 bg-white text-background text-[10px] tracking-[0.5em] uppercase font-bold hover:bg-gold hover:text-foreground transition-colors duration-500 disabled:opacity-50"
                            >
                                {status === 'loading' ? 'Sending...' : t('booking.sendInquiry')}
                            </button>
                            {status === 'success' && <p className="text-green-500 text-center text-xs tracking-widest uppercase">Message sent successfully.</p>}
                            {status === 'error' && <p className="text-red-500 text-center text-xs tracking-widest uppercase">Failed to send message.</p>}
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
