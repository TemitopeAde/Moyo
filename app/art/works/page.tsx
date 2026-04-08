'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useProfile } from '@/context/ProfileContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

export default function WorksPage() {
    const { setProfile } = useProfile();
    const { language } = useLanguage();
    const { t } = useTranslate(language);
    const [works, setWorks] = useState<any[]>([]);

    useEffect(() => {
        setProfile('art');
        fetch('/api/artworks')
            .then(res => res.json())
            .then(data => setWorks(data.artworks || []))
            .catch(err => console.error('Failed to fetch works', err));
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
                                    <span className="text-[10px] text-white/40 tracking-widest">${work.price}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <p className="text-[10px] text-white/60 uppercase tracking-widest">{work.category}</p>
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest text-right">
                                        {work.is_available ? 'Available' : 'Sold Out'}
                                    </p>
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
