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
import { motion } from 'framer-motion';
import Link from 'next/link';

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
            <section className="py-40 bg-background border-t border-foreground/5">
                <div className="container mx-auto px-6 md:px-12">
                    <header className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                        <div className="space-y-4">
                            <span className="text-gold text-[10px] tracking-[0.5em] uppercase">{t('artPage.collection')}</span>
                            <h2 className="text-5xl md:text-7xl font-heading text-foreground italic">{t('artPage.selectedWorks')}</h2>
                        </div>
                        <Link href="/art/works" className="group flex items-center gap-4 text-[10px] tracking-[0.4em] uppercase text-foreground/40 hover:text-foreground transition-colors duration-500">
                            {t('artPage.viewArchive')} <span className="group-hover:translate-x-2 transition-transform rtl:group-hover:-translate-x-2 ">→</span>
                        </Link>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {[1, 2].map((i) => (
                            <div key={i} className="aspect-[4/3] bg-surface border border-foreground/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
                                <div className="w-full h-full bg-[url('/art_preview.webp')] bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-[2s] group-hover:scale-105" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Exhibitions />

            {/* CTA Section for Commissions/Shop */}
            <section className="py-40 bg-foreground/5 border-y border-foreground/5">
                <div className="container mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-px bg-foreground/10">
                    <Link href="/art/commissions" className="bg-background group p-20 flex flex-col items-center justify-center text-center space-y-8 hover:bg-surface transition-colors duration-700">
                        <span className="text-gold text-[10px] tracking-[0.5em] uppercase">{t('artPage.customWork')}</span>
                        <h3 className="text-4xl font-heading text-foreground italic">{t('artPage.artCommissions')}</h3>
                        <p className="text-foreground/30 text-xs tracking-widest uppercase">{t('artPage.startDialogue')}</p>
                    </Link>
                    <Link href="/art/shop" className="bg-background group p-20 flex flex-col items-center justify-center text-center space-y-8 hover:bg-surface transition-colors duration-700">
                        <span className="text-gold text-[10px] tracking-[0.5em] uppercase">{t('artPage.editions')}</span>
                        <h3 className="text-4xl font-heading text-foreground italic">{t('artPage.printShop')}</h3>
                        <p className="text-foreground/30 text-xs tracking-widest uppercase">{t('artPage.exploreReleases')}</p>
                    </Link>
                </div>
            </section>

            <section className="py-40 bg-background flex flex-col items-center">
                <NewsletterForm profileType="art" />
            </section>

            <Footer />
        </main>
    );
}
