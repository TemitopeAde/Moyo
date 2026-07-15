'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
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
    image: string;
    category: string;
    year?: string;
    medium?: string;
    dimensions?: string;
    description?: string;
    is_featured?: boolean;
};

export default function WorksPage() {
    const { setProfile } = useProfile();
    const { language } = useLanguage();
    const { t, translateText } = useTranslate(language);
    const [works, setWorks] = useState<Artwork[]>([]);
    const archiveGridClass = works.length <= 2
        ? 'mx-auto grid max-w-[920px] grid-cols-1 gap-14'
        : 'grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3';

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

            <div className="container mx-auto px-5 pb-24 pt-32 sm:px-6 md:px-12 md:pb-32 md:pt-48">
                <header className="mx-auto mb-16 max-w-3xl space-y-5 text-center md:mb-24">
                    <span className="text-accent text-[10px] tracking-[0.5em] uppercase">{t('artPage.collection')}</span>
                    <h1 className="text-4xl md:text-6xl font-heading text-white italic">{t('artPage.selectedWorks')}</h1>
                    <p className="mx-auto max-w-xl text-sm leading-relaxed text-white/40 md:text-base">
                        {t('worksPage.archiveDescription')}
                    </p>
                </header>

                <div className={archiveGridClass}>
                    {works.map((work, index) => (
                        <motion.div
                            key={work.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`group min-w-0 ${works.length > 2 && (work.is_featured || index === 0) ? 'md:col-span-2 xl:col-span-2' : ''}`}
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
                                <figure className="min-w-0">
                                    <div className="relative flex min-h-[54svh] items-center justify-center overflow-hidden border border-white/10 bg-[#050505] p-3 sm:p-5 md:min-h-[64svh]">
                                        <Image
                                            src={work.image}
                                            alt={translateText(work.title)}
                                            fill
                                            sizes={works.length <= 2 ? '(min-width: 768px) 920px, 100vw' : '(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw'}
                                            unoptimized
                                            className="object-contain p-3 transition duration-700 group-hover:scale-[1.015] sm:p-5"
                                            loading={index === 0 ? 'eager' : 'lazy'}
                                        />
                                        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/[0.035]" />
                                    </div>

                                    <figcaption
                                        className={`mt-5 flex min-w-0 flex-col gap-2 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between ${
                                            works.length <= 2 ? 'px-0 md:px-2' : ''
                                        }`}
                                    >
                                        <div className="min-w-0 space-y-2">
                                            <h3 className="font-heading text-2xl italic leading-tight text-white transition-colors duration-300 group-hover:text-accent md:text-3xl">
                                                {translateText(work.title)}
                                            </h3>
                                            {(work.medium || work.dimensions || work.description) && (
                                                <div className="max-w-2xl space-y-2">
                                                    {(work.medium || work.dimensions) && (
                                                        <p className="text-xs leading-relaxed text-white/45">
                                                            {[work.medium, work.dimensions].filter(Boolean).map((value) => translateText(value || '')).join(' / ')}
                                                        </p>
                                                    )}
                                                    {work.description && (
                                                        <p className="text-sm leading-relaxed text-white/50">
                                                            {translateText(work.description)}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="shrink-0 space-y-1 text-left sm:text-right">
                                            <p className="text-[10px] uppercase tracking-[0.28em] text-white/38">
                                                {translateText(work.category)}
                                            </p>
                                            {work.year && (
                                                <p className="text-[10px] uppercase tracking-[0.28em] text-white/28">
                                                    {translateText(work.year)}
                                                </p>
                                            )}
                                        </div>
                                    </figcaption>
                                </figure>
                            </GlareHover>
                        </motion.div>
                    ))}
                </div>

                {!works.length && (
                    <div className="mx-auto max-w-xl border border-white/10 px-6 py-20 text-center text-[10px] uppercase tracking-[0.28em] text-white/35">
                        Archive works will appear here.
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
