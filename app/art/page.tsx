'use client';

import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import Exhibitions from '@/components/Exhibitions';
import NewsletterForm from '@/components/NewsletterForm';
import Footer from '@/components/Footer';
import { useProfile } from '@/context/ProfileContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import Link from 'next/link';
import GlareHover from '@/components/GlareHover';

export default function FineArtPage() {
    const { setProfile } = useProfile();
    const { language } = useLanguage();
    const { t } = useTranslate(language);

    useEffect(() => {
        setProfile('art');
    }, [setProfile]);

    return (
        <main className="bg-background min-h-screen">
            <Navbar />
            <Hero profileType="art" />

            <AboutSection profileType="art" />

            {/* Works Preview */}
            <section className="border-t border-foreground/5 bg-background py-24 md:py-32 lg:py-40">
                <div className="container mx-auto px-6 md:px-12">
                    <header className="mb-14 flex flex-col items-start justify-between gap-8 md:mb-24 md:flex-row md:items-end">
                        <div className="space-y-4">
                            <span className="text-accent text-[10px] uppercase tracking-[0.32em] md:tracking-[0.5em]">{t('artPage.collection')}</span>
                            <h2 className="text-4xl font-heading italic text-foreground sm:text-5xl md:text-7xl">{t('artPage.selectedWorks')}</h2>
                        </div>
                        <Link href="/art/works" className="group flex items-center gap-4 text-[10px] uppercase tracking-[0.24em] text-foreground/40 transition-colors duration-500 hover:text-foreground md:tracking-[0.4em]">
                            {t('artPage.viewArchive')} <span className="group-hover:translate-x-2 transition-transform rtl:group-hover:-translate-x-2 ">→</span>
                        </Link>
                    </header>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-12">
                        {[1, 2].map((i) => (
                            <GlareHover
                                key={i}
                                width="100%"
                                height="auto"
                                background="var(--color-surface)"
                                borderRadius="2px"
                                borderColor="rgba(255,255,255,0.08)"
                                glareOpacity={0.2}
                                glareAngle={-30}
                                glareSize={180}
                                transitionDuration={760}
                                className="group"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                    <div className="absolute inset-0 z-10 bg-black/20 transition-colors group-hover:bg-black/0" />
                                    <div className="h-full w-full bg-[url('/art_preview.webp')] bg-cover bg-center grayscale transition-all duration-[2s] group-hover:scale-105 group-hover:grayscale-0" />
                                </div>
                            </GlareHover>
                        ))}
                    </div>
                </div>
            </section>

            <Exhibitions />

            {/* CTA Section for Commissions/Shop */}
            <section className="border-y border-foreground/5 bg-foreground/5 py-24 md:py-32 lg:py-40">
                <div className="container mx-auto grid gap-px bg-foreground/10 px-6 md:grid-cols-2 md:px-12">
                    <GlareHover
                        width="100%"
                        height="100%"
                        background="var(--color-background)"
                        borderRadius="0"
                        borderColor="transparent"
                        glareOpacity={0.18}
                        glareAngle={-30}
                        glareSize={170}
                        transitionDuration={760}
                    >
                        <Link href="/art/commissions" className="group flex h-full flex-col items-center justify-center space-y-6 bg-background p-10 text-center transition-colors duration-700 hover:bg-surface sm:p-14 md:space-y-8 lg:p-20">
                            <span className="text-accent text-[10px] uppercase tracking-[0.32em] md:tracking-[0.5em]">{t('artPage.customWork')}</span>
                            <h3 className="text-3xl font-heading italic text-foreground md:text-4xl">{t('artPage.artCommissions')}</h3>
                            <p className="text-foreground/30 text-xs tracking-widest uppercase">{t('artPage.startDialogue')}</p>
                        </Link>
                    </GlareHover>
                    <GlareHover
                        width="100%"
                        height="100%"
                        background="var(--color-background)"
                        borderRadius="0"
                        borderColor="transparent"
                        glareOpacity={0.18}
                        glareAngle={-30}
                        glareSize={170}
                        transitionDuration={760}
                    >
                        <Link href="/art/shop" className="group flex h-full flex-col items-center justify-center space-y-6 bg-background p-10 text-center transition-colors duration-700 hover:bg-surface sm:p-14 md:space-y-8 lg:p-20">
                            <span className="text-accent text-[10px] uppercase tracking-[0.32em] md:tracking-[0.5em]">{t('artPage.editions')}</span>
                            <h3 className="text-3xl font-heading italic text-foreground md:text-4xl">{t('artPage.printShop')}</h3>
                            <p className="text-foreground/30 text-xs tracking-widest uppercase">{t('artPage.exploreReleases')}</p>
                        </Link>
                    </GlareHover>
                </div>
            </section>

            <section className="flex flex-col items-center bg-background py-24 md:py-32 lg:py-40">
                <NewsletterForm profileType="art" />
            </section>

            <Footer />
        </main>
    );
}
