'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useProfile } from '@/context/ProfileContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

const works = [
    { id: 1, title: 'Form No. 1', year: '2025', medium: 'Oil on Canvas', size: '120x150cm', image: '/art_1.webp' },
    { id: 2, title: 'Void Study', year: '2024', medium: 'Mixed Media', size: '100x100cm', image: '/art_2.webp' },
    { id: 3, title: 'Ancestral II', year: '2024', medium: 'Charcoal & Ink', size: '80x120cm', image: '/art_3.webp' },
    { id: 4, title: 'Presence', year: '2023', medium: 'Digital Print', size: 'Limited Ed. of 5', image: '/art_4.webp' },
    { id: 5, title: 'Structure V', year: '2023', medium: 'Sculpture', size: 'Bronze', image: '/art_5.webp' },
    { id: 6, title: 'Echo', year: '2022', medium: 'Acrylic', size: '150x200cm', image: '/art_6.webp' },
];

export default function WorksPage() {
    const { setProfile } = useProfile();
    const { language } = useLanguage();
    const { t } = useTranslate(language);

    useEffect(() => {
        setProfile('art');
    }, [setProfile]);

    return (
        <main className="bg-background min-h-screen">
            <Navbar />

            <div className="pt-40 pb-20 container mx-auto px-6 md:px-12">
                <header className="mb-24 space-y-4">
                    <span className="text-gold text-[10px] tracking-[0.5em] uppercase">{t('artPage.collection')}</span>
                    <h1 className="text-5xl md:text-7xl font-heading text-white italic">{t('artPage.selectedWorks')}</h1>
                    <p className="text-white/40 max-w-lg font-body text-sm leading-relaxed pt-4">
                        A comprehensive archive of works exploring themes of memory, identity, and the metaphysical.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                    {works.map((work, index) => (
                        <motion.div
                            key={work.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group cursor-pointer"
                        >
                            <div className="aspect-[3/4] bg-neutral-900 border border-white/5 relative overflow-hidden mb-6">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
                                <div
                                    className="w-full h-full bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${work.image})` }}
                                />
                            </div>

                            <div className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-xl font-heading text-white group-hover:text-gold transition-colors duration-300">{work.title}</h3>
                                    <span className="text-[10px] text-white/40 tracking-widest">{work.year}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <p className="text-[10px] text-white/60 uppercase tracking-widest">{work.medium}</p>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest text-right">{work.size}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <Footer />
        </main>
    );
}
