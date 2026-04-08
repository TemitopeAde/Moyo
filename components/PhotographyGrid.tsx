'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useTranslate } from '@/lib/translations';

export default function PhotographyGrid() {
    const { language } = useLanguage();
    const { t } = useTranslate(language);
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/galleries')
            .then(res => res.json())
            .then(data => {
                const normalized =
                    data.galleries?.flatMap((g: any, i: number) =>
                        (g.approved_images || []).map((img: string, idx: number) => ({
                            id: `${g.id}-${idx}`,
                            image: img,
                            title: g.client_name,
                            category: g.slug,
                            span: idx % 5 === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1 md:row-span-1',
                        }))
                    ) || [];
                setItems(normalized);
            })
            .catch(err => console.error('Failed to fetch galleries', err));
    }, []);

    return (
        <section id="photography" className="py-32 bg-background">
            <div className="container mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                    <div className="space-y-4">
                        <span className="text-gold text-[10px] tracking-[0.5em] uppercase block">{t('photography.selectedPortfolio')}</span>
                        <h2 className="text-4xl md:text-6xl font-heading text-foreground font-light">
                            {/* Splitting "Visual Proximity" if needed or just using the full string */}
                            {/* To match design "Visual" normal, "Proximity" italic */}
                            {/* I'll assume the translation key is single string for now or split it manually if I added split keys */}
                            {/* Since I added just `visualProximity`, I will try to split it by space for effect or just render it */}
                            {/* Let's render it simply for now to be safe with translations that might not have spaces or be different order */}
                            <span className="italic">{t('photography.visualProximity')}</span>
                        </h2>
                    </div>
                    <p className="text-foreground/40 text-sm max-w-xs font-body tracking-wide leading-relaxed">
                        {t('photography.gridDescription')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-3 gap-8 md:h-[150vh]">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className={`relative group overflow-hidden bg-surface ${item.span}`}
                        >
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-700 z-10" />
                            <div
                                className="w-full h-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                                style={{ backgroundImage: `url(${item.image})` }}
                            />

                            <div className="absolute bottom-8 left-8 z-20 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <p className="text-[10px] tracking-[0.3em] uppercase text-gold">{item.category}</p>
                                <h3 className="text-xl font-heading text-white">{item.title}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
