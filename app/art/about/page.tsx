'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import GlareHover from '@/components/GlareHover';

export default function ArtAboutPage() {
    const { language } = useLanguage();
    const { t } = useTranslate(language);
    const bioParagraphs = [
        t('about.art.text1'),
        t('about.art.text2'),
        t('about.art.text3'),
    ];

    return (
        <main className="bg-background min-h-screen">
            <Navbar />
            <div className="container mx-auto px-6 pb-24 pt-36 md:px-12 md:pb-32 md:pt-52">
                <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
                    <div className="space-y-10 lg:col-span-7 lg:space-y-16">
                        <header className="space-y-6">
                            <span className="text-accent text-[10px] uppercase tracking-[0.32em] md:tracking-[0.5em]">{t('profilePage.biography')}</span>
                            <h1 className="text-5xl font-heading italic text-white md:text-6xl">{t('profilePage.artist')}</h1>
                        </header>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 1.5 }}
                            className="max-w-2xl space-y-8 text-base leading-relaxed text-white/60 md:space-y-12 md:text-xl"
                        >
                            {bioParagraphs.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </motion.div>

                        <div className="grid grid-cols-1 gap-10 border-t border-white/5 pt-10 sm:grid-cols-3 md:gap-16 md:pt-12">
                            <div className="space-y-4">
                                <span className="text-[10px] tracking-[0.4em] uppercase text-accent">{t('profilePage.focus')}</span>
                                <p className="text-[10px] tracking-widest text-white/40 uppercase leading-relaxed whitespace-pre-line">{t('profilePage.focusItems')}</p>
                            </div>
                            <div className="space-y-4">
                                <span className="text-[10px] tracking-[0.4em] uppercase text-accent">{t('profilePage.mediums')}</span>
                                <p className="text-[10px] tracking-widest text-white/40 uppercase leading-relaxed whitespace-pre-line">{t('profilePage.mediumsItems')}</p>
                            </div>
                            <div className="space-y-4">
                                <span className="text-[10px] tracking-[0.4em] uppercase text-accent">{t('profilePage.base')}</span>
                                <p className="text-[10px] tracking-widest text-white/40 uppercase leading-relaxed whitespace-pre-line">{t('profilePage.baseItems')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8 lg:col-span-5 lg:space-y-12">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 2, ease: "easeOut" }}
                        >
                            <GlareHover
                                width="100%"
                                height="auto"
                                background="#111"
                                borderRadius="2px"
                                borderColor="rgba(255,255,255,0.08)"
                                glareOpacity={0.2}
                                glareAngle={-30}
                                glareSize={180}
                                transitionDuration={760}
                            >
                                <div
                                    className="aspect-[3/4] overflow-hidden bg-neutral-900 bg-cover bg-center bg-no-repeat"
                                    style={{ backgroundImage: "url('/profile-portrait.jpg')" }}
                                />
                            </GlareHover>
                        </motion.div>
                        <div className="space-y-2">
                            <p className="text-[10px] tracking-[0.5em] uppercase text-white/20">{t('profilePage.studioPortrait')}</p>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
