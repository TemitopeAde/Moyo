'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useProfile } from '@/context/ProfileContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import GlareHover from '@/components/GlareHover';

type Artwork = {
    id: number;
    title: string;
    price: string | number;
    image: string;
    category: string;
    is_available: boolean;
};

export default function WorksPage() {
    const { setProfile } = useProfile();
    const { language } = useLanguage();
    const { t, translateText } = useTranslate(language);
    const [works, setWorks] = useState<Artwork[]>([]);

    useEffect(() => {
        setProfile('art');
        fetch('/api/artworks')
            .then(res => res.json())
            .then((data: { artworks?: Artwork[] }) => setWorks(data.artworks || []))
            .catch(err => console.error('Failed to fetch works', err));
    }, [setProfile]);

    return (
        <main className="bg-background min-h-screen">
            <Navbar />

            <div className="pt-36 md:pt-52 pb-20 container mx-auto px-6 md:px-12">
                <header className="mb-24 space-y-4">
                    <span className="text-accent text-[10px] tracking-[0.5em] uppercase">{t('artPage.collection')}</span>
                    <h1 className="text-5xl md:text-7xl font-heading text-white italic">{t('artPage.selectedWorks')}</h1>
                    <p className="text-white/40 max-w-lg font-body text-sm leading-relaxed pt-4">
                        {t('worksPage.archiveDescription')}
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
                            <GlareHover
                                width="100%"
                                height="auto"
                                background="transparent"
                                borderRadius="2px"
                                borderColor="rgba(255,255,255,0.08)"
                                glareOpacity={0.2}
                                glareAngle={-30}
                                glareSize={180}
                                transitionDuration={760}
                            >
                                <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900">
                                    <div className="absolute inset-0 z-10 bg-black/20 transition-colors group-hover:bg-black/0" />
                                    <div
                                        className="h-full w-full bg-cover bg-center grayscale transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                                        style={{ backgroundImage: `url(${work.image})` }}
                                    />
                                </div>

                                <div className="space-y-1 px-4 py-5">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <h3 className="text-xl font-heading text-white transition-colors duration-300 group-hover:text-accent">{translateText(work.title)}</h3>
                                        <span className="text-[10px] tracking-widest text-white/40">${work.price}</span>
                                    </div>
                                    <div className="flex items-baseline justify-between gap-3">
                                        <p className="text-[10px] uppercase tracking-widest text-white/60">{translateText(work.category)}</p>
                                        <p className="text-right text-[10px] uppercase tracking-widest text-white/30">
                                            {work.is_available ? t('ui.available') : t('ui.soldOut')}
                                        </p>
                                    </div>
                                </div>
                            </GlareHover>
                        </motion.div>
                    ))}
                </div>
            </div>

            <Footer />
        </main>
    );
}
