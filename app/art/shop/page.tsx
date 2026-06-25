'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';
import GlareHover from '@/components/GlareHover';

const items = [
    { id: 1, name: "Presence (Limited Edition)", price: "€450.00", categoryKey: "handFinishedPrint", image: "/shop_1.webp" },
    { id: 2, name: "The Quiet Archive", price: "€120.00", categoryKey: "monograph", image: "/shop_2.webp" },
    { id: 3, name: "Identity Fragment III", price: "€2,800.00", categoryKey: "originalWork", image: "/shop_3.webp" },
    { id: 4, name: "Memory Study #4", price: "€650.00", categoryKey: "framedEdition", image: "/shop_4.webp" },
];

export default function ArtShopPage() {
    const { language } = useLanguage();
    const { t, translateText } = useTranslate(language);

    return (
        <main className="bg-background min-h-screen">
            <Navbar />
            <div className="pt-36 md:pt-52 container mx-auto px-6 md:px-12 pb-32">
                <header className="mb-24 flex flex-col md:flex-row justify-between items-end gap-8">
                    <div className="space-y-4">
                        <span className="text-accent text-[10px] tracking-[0.5em] uppercase">{t('artShopPage.editions')}</span>
                        <h1 className="text-4xl md:text-5xl font-heading text-white italic leading-tight">{t('artShopPage.title')}</h1>
                    </div>
                    <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase max-w-[200px] border-l border-white/10 pl-6 pb-2">
                        {t('artShopPage.shipping')}
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className="group space-y-6"
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
                                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
                                    <div className="absolute inset-x-0 bottom-0 z-20 translate-y-0 bg-white py-6 text-center transition-transform duration-500 md:translate-y-full md:group-hover:translate-y-0">
                                        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-black">{t('artShopPage.addToCollection')}</span>
                                    </div>
                                    <div
                                        className="h-full w-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                                        style={{ backgroundImage: `url(${item.image})` }}
                                    />
                                </div>

                                <div className="space-y-1 px-4 py-5">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <h3 className="text-sm font-heading text-white transition-colors group-hover:text-accent">{translateText(item.name)}</h3>
                                        <span className="text-[10px] text-white/40">{item.price}</span>
                                    </div>
                                    <p className="font-body text-[10px] uppercase tracking-[0.2em] text-white/20">{t(`artShopPage.${item.categoryKey}`)}</p>
                                </div>
                            </GlareHover>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-40 text-center py-20 border-t border-white/5">
                    <p className="text-white/20 text-xs tracking-[0.4em] uppercase">{t('artShopPage.privateViewings')}</p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
