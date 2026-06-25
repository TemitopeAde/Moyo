'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import GlareHover from '@/components/GlareHover';

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
        } catch {
            setStatus('error');
        }
    };

    return (
        <section id="contact" className="border-t border-foreground/5 bg-background py-24 md:py-32 lg:py-40">
            <div className="container mx-auto px-6 md:px-12 max-w-6xl">
                <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
                    <div className="space-y-8 lg:space-y-12">
                        <div className="space-y-4">
                            <span className="block text-[10px] font-medium uppercase tracking-[0.3em] text-accent md:tracking-[0.5em]">
                                {t('booking.collaboration')}
                            </span>
                            <h2 className="text-3xl font-heading font-light italic leading-tight text-foreground sm:text-4xl md:text-5xl">
                                {t('booking.heading')}
                            </h2>
                        </div>

                        <p className="max-w-md text-base leading-relaxed tracking-wide text-foreground/40 md:text-lg">
                            {t('booking.description')}
                        </p>

                        <div className="space-y-6 border-t border-foreground/5 pt-8 md:pt-12">
                            <div className="space-y-2">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/20">{t('booking.email')}</p>
                                <a href="mailto:ijabikenm@gmail.com" className="block break-words font-heading text-xl text-foreground underline decoration-white/10 underline-offset-8 transition-colors hover:text-accent sm:text-2xl">ijabikenm@gmail.com</a>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-foreground/20">{t('booking.studio')}</p>
                                <span className="block text-sm text-foreground/40 font-body tracking-widest uppercase">+2348148192201</span>
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1 }}
                        className="rounded-sm"
                    >
                        <GlareHover
                            width="100%"
                            height="auto"
                            background="var(--glass-bg)"
                            borderRadius="2px"
                            borderColor="var(--glass-border)"
                            glareOpacity={0.16}
                            glareAngle={-30}
                            glareSize={170}
                            transitionDuration={780}
                            className="glass"
                            contentClassName="p-6 sm:p-8 md:p-12 lg:p-16"
                        >
                            <form onSubmit={handleSubmit} className="space-y-9 md:space-y-12">
                                <div className="grid gap-8 md:grid-cols-2 md:gap-12">
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] uppercase tracking-widest text-foreground/40 block">{t('booking.yourName')}</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            required
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-transparent border-b border-foreground/10 py-3 text-foreground focus:outline-none focus:border-accent transition-colors font-body"
                                        />
                                    </div>
                                    <div className="space-y-2 group">
                                        <label className="text-[10px] uppercase tracking-widest text-foreground/40 block">{t('booking.emailAddress')}</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            required
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-transparent border-b border-foreground/10 py-3 text-foreground focus:outline-none focus:border-accent transition-colors font-body"
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
                                                className={`px-4 py-2 border text-[10px] uppercase tracking-widest transition-all duration-500 rounded-full sm:px-6 ${formData.service === service.id
                                                    ? 'border-accent text-accent bg-accent/5'
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
                                        className="w-full bg-transparent border-b border-white/10 py-3 text-foreground focus:outline-none focus:border-accent transition-colors font-body resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-white px-4 py-5 text-[10px] font-bold uppercase tracking-[0.28em] text-background transition-colors duration-500 hover:bg-accent hover:text-background disabled:opacity-50 sm:tracking-[0.5em]"
                                >
                                    {status === 'loading' ? t('ui.sending') : t('booking.sendInquiry')}
                                </button>
                                {status === 'success' && <p className="text-green-500 text-center text-xs tracking-widest uppercase">{t('ui.messageSent')}</p>}
                                {status === 'error' && <p className="text-red-500 text-center text-xs tracking-widest uppercase">{t('ui.messageFailed')}</p>}
                            </form>
                        </GlareHover>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
