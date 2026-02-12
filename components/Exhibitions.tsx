'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

const events = [
    { year: '2026', title: 'Presence in Absence', venue: 'Galería de Arte', city: 'Madrid' },
    { year: '2025', title: 'Ancestral Form', venue: 'Stellar Space', city: 'London' },
    { year: '2024', title: 'Quiet Tension', venue: 'MOMA P1', city: 'New York' },
    { year: '2023', title: 'Inherited Memory', venue: 'The Archive', city: 'Paris' },
];

export default function Exhibitions() {
    const { language } = useLanguage();
    const { t } = useTranslate(language);

    return (
        <section id="exhibitions" className="py-40 bg-background">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row gap-20">
                    {/* Header */}
                    <div className="md:w-1/3 space-y-6">
                        <span className="text-gold text-[10px] tracking-[0.5em] uppercase block">{t('exhibitions.timeline')}</span>
                        <h2 className="text-4xl md:text-6xl font-heading text-white font-light">
                            {/* Splitting for style if possible, or just rendering */}
                            <span className="italic">{t('exhibitions.selectedExhibitions')}</span>
                        </h2>
                        <p className="text-white/40 text-sm max-w-xs font-body tracking-wide leading-relaxed">
                            {t('exhibitions.chronology')}
                        </p>
                    </div>

                    {/* List */}
                    <div className="md:w-2/3 space-y-px bg-white/5 border border-white/5">
                        {events.map((event, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className="group relative flex items-center justify-between p-10 hover:bg-white/5 transition-all duration-500 cursor-default border-b border-white/5 last:border-0"
                            >
                                <div className="flex gap-12 items-baseline">
                                    <span className="text-sm font-heading text-white/20 group-hover:text-gold transition-colors duration-500">
                                        {event.year}
                                    </span>
                                    <div className="space-y-1">
                                        <h3 className="text-xl md:text-2xl font-heading text-white group-hover:italic transition-all duration-500">
                                            {event.title}
                                        </h3>
                                        <p className="text-[10px] tracking-widest text-white/30 uppercase">
                                            {event.venue} — {event.city}
                                        </p>
                                    </div>
                                </div>

                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden md:block">
                                    <span className="text-[10px] tracking-[0.3em] font-medium text-white uppercase border-b border-white pb-1">
                                        {t('exhibitions.details')}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
